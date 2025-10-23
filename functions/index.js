/**
 * Healing Friend - Backend Functions
 * OpenAI API 호출을 안전하게 처리하는 서버리스 함수들
 */

const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {setGlobalOptions} = require('firebase-functions/v2');
const admin = require('firebase-admin');

// Firebase Admin 초기화
admin.initializeApp();

// 전역 옵션 설정 (서울 리전)
setGlobalOptions({
  region: 'asia-northeast3', // 서울
  maxInstances: 10
});

// OpenAI 클라이언트 초기화
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * 채팅 함수 - AI와 대화
 */
exports.chat = onCall(async (request) => {
  // 인증 확인
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const {messages, characterLevel, characterStage} = request.data;

  // 입력 검증
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new HttpsError('invalid-argument', '메시지가 필요합니다.');
  }

  try {
    // 캐릭터 레벨에 따른 시스템 프롬프트 조정
    const systemPrompt = getSystemPrompt(characterLevel, characterStage);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {role: 'system', content: systemPrompt},
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      success: true,
      message: response.choices[0].message.content,
      usage: response.usage
    };
  } catch (error) {
    console.error('Chat error:', error);
    throw new HttpsError('internal', 'AI 응답 생성 중 오류가 발생했습니다.');
  }
});

/**
 * 일기 감정 분석 함수
 */
exports.analyzeDiaryEmotion = onCall(async (request) => {
  // 인증 확인
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const {diaryText} = request.data;

  // 입력 검증
  if (!diaryText || typeof diaryText !== 'string' || diaryText.trim().length === 0) {
    throw new HttpsError('invalid-argument', '일기 내용이 필요합니다.');
  }

  // 글자 수 제한 (너무 긴 경우 방지)
  if (diaryText.length > 5000) {
    throw new HttpsError('invalid-argument', '일기 내용이 너무 깁니다. (최대 5000자)');
  }

  try {
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
    
    // JSON 파싱 시도
    let emotions;
    try {
      emotions = JSON.parse(result);
    } catch (parseError) {
      // JSON 추출 시도 (코드 블록이 포함된 경우)
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

    // 합계 검증 (약간의 오차 허용)
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

    return {
      success: true,
      emotions: emotions,
      usage: response.usage
    };
  } catch (error) {
    console.error('Emotion analysis error:', error);
    throw new HttpsError('internal', '감정 분석 중 오류가 발생했습니다.');
  }
});

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

/**
 * 사용량 모니터링 함수 (선택적)
 */
exports.logUsage = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const {functionName, tokens} = request.data;
  const userId = request.auth.uid;

  try {
    // Firestore에 사용 기록 저장
    await admin.firestore().collection('usage_logs').add({
      userId: userId,
      functionName: functionName,
      tokens: tokens,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return {success: true};
  } catch (error) {
    console.error('Usage logging error:', error);
    // 로깅 실패는 중요하지 않으므로 무시
    return {success: false};
  }
});

