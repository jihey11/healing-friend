import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';

// 환경 변수 로드
dotenv.config();

// Express 앱 초기화
const app = express();
const PORT = process.env.PORT || 3000;

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 미들웨어 설정
app.use(helmet()); // 보안 헤더
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate Limiting (DDoS 방지)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.'
});
app.use('/api/', limiter);

// 헬스 체크
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Healing Friend API Server',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ==================== API 엔드포인트 ====================

/**
 * POST /api/chat
 * AI 채팅 API
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, characterLevel, characterStage } = req.body;

    // 입력 검증
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: '메시지가 필요합니다.'
      });
    }

    // 시스템 프롬프트 생성
    const systemPrompt = getSystemPrompt(characterLevel || 1, characterStage || 0);

    // OpenAI API 호출
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const reply = response.choices[0].message.content;

    res.json({
      success: true,
      message: reply,
      usage: response.usage
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      success: false,
      error: 'AI 응답 생성 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * POST /api/analyze
 * 일기 감정 분석 API
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { diaryText } = req.body;

    // 입력 검증
    if (!diaryText || typeof diaryText !== 'string' || diaryText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '일기 내용이 필요합니다.'
      });
    }

    // 글자 수 제한
    if (diaryText.length > 5000) {
      return res.status(400).json({
        success: false,
        error: '일기 내용이 너무 깁니다. (최대 5000자)'
      });
    }

    // OpenAI API 호출
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 감정 분석 전문가입니다. 주어진 일기를 분석하여 6가지 기본 감정(기쁨, 슬픔, 분노, 두려움, 놀람, 혐오)의 비율을 정확히 판단하세요.

중요:
- 각 감정은 0-100 사이의 정수로 표현
- 모든 감정의 합은 반드시 100이어야 함
- 가장 두드러진 감정에 높은 점수 부여
- 미묘한 감정도 놓치지 말 것

반드시 다음 JSON 형식으로만 응답하세요:
{
  "기쁨": 숫자,
  "슬픔": 숫자,
  "분노": 숫자,
  "두려움": 숫자,
  "놀람": 숫자,
  "혐오": 숫자
}`
        },
        {
          role: 'user',
          content: `다음 일기의 감정을 분석해주세요:\n\n${diaryText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const result = response.choices[0].message.content;
    
    // JSON 파싱
    let emotions;
    try {
      emotions = JSON.parse(result);
    } catch (parseError) {
      // JSON 추출 시도
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        emotions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response');
      }
    }

    // 감정 데이터 검증
    const requiredEmotions = ['기쁨', '슬픔', '분노', '두려움', '놀람', '혐오'];
    for (const emotion of requiredEmotions) {
      if (typeof emotions[emotion] !== 'number' || emotions[emotion] < 0) {
        throw new Error(`Invalid emotion value for ${emotion}`);
      }
    }

    // 합계 검증 및 정규화
    const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 100) > 5) {
      // 합계가 100이 아니면 정규화
      const factor = 100 / total;
      for (const key in emotions) {
        emotions[key] = Math.round(emotions[key] * factor);
      }
      
      // 반올림 오차 조정
      const newTotal = Object.values(emotions).reduce((sum, val) => sum + val, 0);
      if (newTotal !== 100) {
        const diff = 100 - newTotal;
        const maxEmotion = Object.keys(emotions).reduce((a, b) => 
          emotions[a] > emotions[b] ? a : b
        );
        emotions[maxEmotion] += diff;
      }
    }

    res.json({
      success: true,
      emotions: emotions,
      usage: response.usage
    });
  } catch (error) {
    console.error('Analyze API Error:', error);
    res.status(500).json({
      success: false,
      error: '감정 분석 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// ==================== 헬퍼 함수 ====================

/**
 * 캐릭터 레벨에 따른 시스템 프롬프트 생성
 */
function getSystemPrompt(level, stage) {
  const basePrompt = `당신은 사용자의 감정을 돌보는 친구입니다. 따뜻하고 공감적인 대화를 나누세요.

중요한 규칙:
- 항상 한국어로 답변
- 2-3문장으로 간결하게 답변
- 사용자의 감정에 공감하고 위로
- 긍정적이고 희망적인 메시지 전달
- 전문적인 상담이 필요한 경우 적절히 안내`;

  // 레벨에 따른 캐릭터 성격 변화
  if (level < 5) {
    return basePrompt + '\n\n당신은 아직 어린 친구입니다. 순수하고 호기심 많은 말투로 대화하세요.';
  } else if (level < 10) {
    return basePrompt + '\n\n당신은 점점 성장하고 있습니다. 좀 더 성숙하고 이해심 깊은 대화를 나누세요.';
  } else {
    return basePrompt + '\n\n당신은 성장한 친구입니다. 깊이 있는 공감과 지혜로운 조언을 제공하세요.';
  }
}

// ==================== 에러 처리 ====================

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '요청하신 API를 찾을 수 없습니다.'
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: '서버 오류가 발생했습니다.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== 서버 시작 ====================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
});

