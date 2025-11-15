// Firebase 의존성 제거 (데모 모드 지원)
// import { db, OPENAI_API_KEY } from './config.js';
// import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';

// 데모 모드용 설정
const OPENAI_API_KEY = window.ENV?.OPENAI_API_KEY || 'your_openai_api_key_here';

// 로컬 응답 데이터
const LOCAL_RESPONSES = {
  greetings: [
    '안녕! 오늘도 만나서 반가워! 😊',
    '안녕하세요! 좋은 하루 보내고 있어요? 🌟',
    '왔구나! 기다렸어! 🌟',
    '어서와! 오늘은 어때? 💖',
    '반가워! 오늘도 좋은 하루 보냈어? ✨',
    '오랜만이야! 보고 싶었어! 🤗',
    '하이! 기분은 어때? 😄',
    '안녕하세요! 오늘 하루 어떠셨어요? 💕',
    '반갑습니다! 오늘도 힘내요! ✨',
    '안녕하세요! 함께 있어서 좋아요! 🌈'
  ],
  
  emotionResponses: {
    기쁨: [
      '오늘 기분 좋아 보여! 나도 기뻐! 😄',
      '행복한 하루였구나! 나도 행복해! 💕',
      '웃는 모습 보기 좋아! 계속 웃어줘! 😊',
      '좋은 일이 있었나 봐! 나한테도 얘기해줘! ✨',
      '너의 행복이 나한테도 전해져! 🌈'
    ],
    슬픔: [
      '힘들었구나... 괜찮아, 내가 있잖아. 😢',
      '슬플 때는 나한테 얘기해. 언제든지! 💙',
      '울고 싶으면 울어도 돼. 나는 항상 여기 있어. 🤗',
      '힘든 일이 있었구나. 같이 이겨내자. 💪',
      '괜찮아, 다 잘 될 거야. 내가 옆에 있을게. ✨'
    ],
    분노: [
      '화가 났구나. 충분히 그럴 수 있어. 😤',
      '짜증나는 일이 있었나 봐. 나한테 털어놔. 💢',
      '깊게 숨 쉬어봐. 같이 진정하자. 🌬️',
      '화날 만한 일이었어. 이해해. 😔',
      '스트레스 풀고 싶으면 게임 해볼래? 🎮'
    ],
    두려움: [
      '무서운 일이 있었구나. 내가 옆에 있을게. 😰',
      '걱정하지 마. 다 잘 될 거야. 💙',
      '불안할 때는 나를 봐. 내가 힘이 되어줄게. 🤝',
      '괜찮아, 너는 할 수 있어. 나는 너를 믿어. ✨',
      '두려워하지 마. 내가 함께할게. 🌟'
    ],
    놀람: [
      '무슨 일이 있었어? 궁금해! 😲',
      '놀라운 일이 있었구나! 👀',
      '헐! 나도 깜짝 놀랐어! 😮',
      '예상치 못한 일이었나 봐! 💫',
      '어떤 일이었는지 더 얘기해줘! 🎉'
    ],
    혐오: [
      '기분이 별로구나. 이해해. 😖',
      '싫은 일은 빨리 잊자! 💨',
      '나쁜 기억은 날려버리자! 🌬️',
      '그런 일은 신경 쓰지 마. 🙅',
      '더 좋은 일이 있을 거야! ✨'
    ]
  },
  
  randomChats: [
    '오늘 날씨 좋지? ☀️',
    '게임 한 판 할래? 🎮',
    '같이 있으니까 좋아! 💖',
    '너는 내 최고의 친구야! 🌟',
    '오늘 하루도 고생했어! 👏',
    '쉬고 싶을 땐 쉬어도 돼! 😴',
    '무리하지 마! 💪',
    '물 한 잔 마실래? 💧',
    '스트레칭 한번 해봐! 🤸',
    '심호흡 한번 해보자! 🌬️'
  ],
  
  encouragement: [
    '너라면 할 수 있어! 💪',
    '힘내! 나는 너를 믿어! ✨',
    '포기하지 마! 조금만 더! 🔥',
    '넌 충분히 잘하고 있어! 👍',
    '완벽하지 않아도 괜찮아! 💖',
    '오늘도 최선을 다한 너, 멋져! 🌟',
    '작은 진전도 진전이야! 🎉',
    '천천히 가도 괜찮아! 🐢',
    '실수해도 괜찮아. 다시 하면 돼! 💫',
    '너는 소중한 사람이야! 💝'
  ],
  
  evolutionMentions: [
    '뭔가 변화가 느껴져...! ✨',
    '우와! 나 변했어! 너 덕분이야! 🎉',
    '이게 나야? 신기해! 😮',
    '더 멋진 모습으로 변할 수 있을 것 같아! 🌟',
    '너와 함께라서 이렇게 성장할 수 있었어! 💖'
  ]
};

//AI 사용 (104~112)
class ChatBot {
  constructor(uid, characterData) {
    this.uid = uid;
    this.characterData = characterData;
    this.conversationHistory = [];
    this.lastDiaryEmotion = null;
    this.isProcessing = false;
    this.autoGreetingInterval = null;
  }

  // 인사말인지 확인
  isGreeting(message) {
    const greetingKeywords = [
      '안녕', '안녕하세요', '안녕하셔요', '안뇽', '안뇽하세요',
      '하이', '하이요', '하이하이', '헬로', '헬로우', '헬로오',
      '반가워', '반갑다', '반갑습니다', '반가워요',
      '좋은 아침', '좋은 점심', '좋은 저녁',
      '굿모닝', '굿애프터눈', '굿이브닝',
      '인사', '인사해', '인사드려요'
    ];
    
    const normalizedMessage = message.trim().toLowerCase();
    return greetingKeywords.some(keyword => normalizedMessage.includes(keyword));
  }

  // 로컬 응답 선택
  selectLocalResponse(userMessage = '', context = {}) {
    try {
      const { lastDiary, evolutionStage, justEvolved } = context;
      
      // 사용자가 인사를 했다면 인사로 응답
      if (userMessage && this.isGreeting(userMessage)) {
        return this.randomFrom(LOCAL_RESPONSES.greetings);
      }
      
      //AI 사용 (141~151)
      // 진화 직후라면
      if (justEvolved) {
        return this.randomFrom(LOCAL_RESPONSES.evolutionMentions);
      }
      
      // 최근 일기가 있다면 감정에 맞는 응답
      if (lastDiary && lastDiary.selectedEmotion) {
        const emotion = lastDiary.selectedEmotion;
        if (LOCAL_RESPONSES.emotionResponses[emotion]) {
          return this.randomFrom(LOCAL_RESPONSES.emotionResponses[emotion]);
        }
      }
      
      // 랜덤 응답 (인사 30%, 격려 30%, 일상 40%)
      const rand = Math.random();
      if (rand < 0.3) {
        return this.randomFrom(LOCAL_RESPONSES.greetings);
      } else if (rand < 0.6) {
        return this.randomFrom(LOCAL_RESPONSES.encouragement);
      } else {
        return this.randomFrom(LOCAL_RESPONSES.randomChats);
      }
    } catch (error) {
      console.error('로컬 응답 선택 오류:', error);
      return '미안해, 잠깐 문제가 있었어. 다시 말해줄래? 😅';
    }
  }


  //AI 사용 (170~356)
  randomFrom(array) {
    if (!array || array.length === 0) {
      return '알 수 없는 오류가 발생했어요. 😅';
    }
    return array[Math.floor(Math.random() * array.length)];
  }

  // GPT 응답
  async getGPTResponse(userMessage, context = {}) {
    try {
      // 백엔드 API URL 가져오기
      let API_URL = window.ENV?.API_URL || 'http://localhost:3000';
      
      // https:// 프로토콜 자동 추가 (도메인만 입력한 경우)
      if (API_URL && !API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
        API_URL = `https://${API_URL}`;
        console.warn('⚠️ API_URL에 프로토콜이 없어서 https://를 추가했습니다:', API_URL);
      }
      
      // 배포 환경에서 localhost 체크
      if (API_URL === 'http://localhost:3000' || API_URL.includes('localhost')) {
        console.error('❌ API_URL이 localhost로 설정되어 있습니다!');
        console.error('❌ Netlify 환경 변수 API_URL을 설정하고 재배포하세요.');
        throw new Error('API URL이 설정되지 않았습니다.');
      }

      console.log('🔍 API 호출 시작:', {
        API_URL,
        windowENV: window.ENV,
        messageLength: userMessage.length
      });

      // 타임아웃 설정 (30초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // 백엔드 API 호출
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            ...this.conversationHistory.slice(-4), // 최근 4개 대화만
            { role: 'user', content: userMessage }
          ],
          characterLevel: this.characterData?.level || 1,
          characterStage: this.characterData?.evolutionStage || 0
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API 오류: ${response.status} - ${errorData.error || '알 수 없는 오류'}`);
      }
      
      const data = await response.json();
      
      // 디버깅: 응답 데이터 로그
      console.log('📥 API 응답 받음:', {
        success: data.success,
        hasMessage: !!data.message,
        messageLength: data.message?.length,
        messagePreview: data.message?.substring(0, 50),
        fullData: data
      });
      
      if (!data.success || !data.message) {
        console.error('❌ 잘못된 응답 형식:', data);
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }
      
      const reply = data.message.trim();
      
      if (!reply) {
        console.error('❌ 빈 응답 받음:', data);
        throw new Error('빈 응답을 받았습니다.');
      }
      
      console.log('✅ AI 응답 처리 완료:', {
        replyLength: reply.length,
        replyPreview: reply.substring(0, 100)
      });
      
      // 대화 이력에 추가
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: reply }
      );
      
      // 최대 10개까지만 유지
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }
      
      return reply;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ API 요청 타임아웃 (30초 초과)');
        throw new Error('요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.');
      } else if (error.message === 'Failed to fetch' || error.message.includes('network')) {
        console.error('❌ API 서버에 연결할 수 없습니다.');
        console.error('❌ API_URL:', window.ENV?.API_URL);
        throw new Error('서버에 연결할 수 없습니다. API URL을 확인해주세요.');
      } else {
        console.error('❌ GPT 응답 실패:', error);
      }
      throw error;
    }
  }

  // 메시지 처리
  async processMessage(userMessage, context = {}) {
    // 이미 처리 중이면 강제 리셋 후 재시도 (타임아웃 보호)
    if (this.isProcessing) {
      console.warn('⚠️ 이미 처리 중인 메시지가 있습니다. isProcessing 강제 리셋...');
      this.isProcessing = false; // 강제 리셋
      // 1초 대기 후 재시도
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.isProcessing = true;
    console.log('🔄 메시지 처리 시작:', { messageLength: userMessage.trim().length });
    
    // 타임아웃 보호: 60초 후 자동 리셋
    const timeoutId = setTimeout(() => {
      if (this.isProcessing) {
        console.error('⚠️ 타임아웃: isProcessing이 60초 동안 true 상태입니다. 강제 리셋합니다.');
        this.isProcessing = false;
      }
    }, 60000);

    try {
      const messageLength = userMessage.trim().length;
      
      // 10자 미만: 로컬 응답
      if (messageLength < 10) {
        console.log('📝 로컬 응답 사용 (10자 미만)');
        const response = this.selectLocalResponse(userMessage, context);
        return {
          response,
          source: 'local'
        };
      }

      // 10자 이상: GPT 시도 → 실패 시 로컬
      console.log('🤖 GPT API 호출 시작...');
      const gptResponse = await this.getGPTResponse(userMessage, context);

      if (gptResponse) {
        console.log('✅ GPT 응답 받음:', gptResponse.substring(0, 50));
        return {
          response: gptResponse,
          source: 'gpt'
        };
      } else {
        console.warn('⚠️ GPT 응답 실패, 로컬 응답 사용');
        const fallbackResponse = this.selectLocalResponse(userMessage, context);
        return {
          response: fallbackResponse,
          source: 'local-fallback'
        };
      }
    } catch (error) {
      console.error('❌ 메시지 처리 오류:', error);
      console.error('❌ 에러 상세:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      // 에러 발생 시에도 인사말이면 인사로 응답
      const errorResponse = this.selectLocalResponse(userMessage, context);
      return {
        response: errorResponse,
        source: 'error-fallback'
      };
    } finally {
      clearTimeout(timeoutId);
      this.isProcessing = false;
      console.log('✅ 메시지 처리 완료, isProcessing 리셋');
    }
  }

  // 자동 인사 (30분마다)
  getAutoGreeting() {
    const greetings = [
      '오늘은 어때? 😊',
      '뭐 하고 있어? 💭',
      '심심한데 얘기할래? 💬',
      '오늘 기분은 어때? 💖',
      '나랑 놀자! 🎮'
    ];
    return this.randomFrom(greetings);
  }

  // 대화 이력 로드
  async loadConversationHistory() {
    try {
      if (!this.uid) {
        console.warn('사용자 ID가 없습니다.');
        return;
      }

      // 데모 모드에서는 로컬 스토리지에서 대화 이력 로드
      if (this.uid.startsWith('demo_')) {
        const savedHistory = localStorage.getItem(`chatHistory_${this.uid}`);
        if (savedHistory) {
          this.conversationHistory = JSON.parse(savedHistory);
          console.log('로컬 스토리지에서 대화 이력 로드:', this.conversationHistory.length, '개');
        } else {
          this.conversationHistory = [];
          console.log('대화 이력이 없습니다.');
        }
        return;
      }

      // Firebase 모드 (추후 구현)
      console.log('Firebase 모드는 아직 구현되지 않았습니다.');
      this.conversationHistory = [];
    } catch (error) {
      console.error('대화 이력 로드 실패:', error);
    }
  }

  // 자동 인사 시작
  startAutoGreeting() {
    if (this.autoGreetingInterval) {
      clearInterval(this.autoGreetingInterval);
    }
    
    this.autoGreetingInterval = setInterval(() => {
      const greeting = this.getAutoGreeting();
      this.showAutoGreeting(greeting);
    }, 30 * 60 * 1000); // 30분
  }

  // 자동 인사 중지
  stopAutoGreeting() {
    if (this.autoGreetingInterval) {
      clearInterval(this.autoGreetingInterval);
      this.autoGreetingInterval = null;
    }
  }

  // 자동 인사 표시
  showAutoGreeting(greeting) {
    // 채팅 메시지에 추가
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
      this.addMessageToUI(greeting, 'bot');
    }
    
    // 말풍선에도 표시
    const bubble = document.getElementById('speech-bubble');
    const text = document.getElementById('speech-text');
    if (bubble && text) {
      text.textContent = greeting;
      bubble.classList.remove('hidden');
      
      setTimeout(() => {
        bubble.classList.add('hidden');
      }, 3000);
    }
  }

  // UI에 메시지 추가 (내부 메서드)
  addMessageToUI(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);

    // 스크롤 하단으로
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// 채팅 UI 설정
export function setupChatUI(uid, character, lastDiary = null) {
  try {
    const chatBot = new ChatBot(uid, character);
    const messagesContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    if (!messagesContainer || !chatInput || !sendBtn) {
      console.error('필수 DOM 요소를 찾을 수 없습니다.');
      return null;
    }

    // 초기 인사
    addMessage('안녕! 무슨 일이든 나한테 얘기해줘! 😊', 'bot');

    // 메시지 전송
    async function sendMessage() {
      const message = chatInput.value.trim();
      if (!message) return;
      
      // 최소 길이 체크 (10자 이상)
      if (message.length < 10) {
        addMessage('메시지는 최소 10자 이상 입력해주세요. 😊', 'bot');
        return;
      }

      // 사용자 메시지 표시
      addMessage(message, 'user');
      chatInput.value = '';

      // 로딩 표시
      const loadingId = showTypingIndicator();

      try {
        // 봇 응답
        const context = {
          lastDiary: lastDiary,
          evolutionStage: character.evolutionStage,
          justEvolved: false // 필요시 진화 상태 확인
        };

        const result = await chatBot.processMessage(message, context);

        // 디버깅: 처리 결과 로그
        console.log('📤 processMessage 결과:', {
          hasResponse: !!result.response,
          responseLength: result.response?.length,
          responsePreview: result.response?.substring(0, 100),
          source: result.source,
          fullResult: result
        });

        // 로딩 제거
        removeTypingIndicator(loadingId);

        // 봇 메시지 표시 (타이핑 효과)
        if (result.response) {
          console.log('📝 UI에 메시지 표시 시작:', result.response.substring(0, 50));
          await addMessageWithTyping(result.response, 'bot');
        } else {
          console.error('❌ 응답이 없습니다!');
          addMessage('미안해, 응답을 받지 못했어. 다시 시도해줄래? 😅', 'bot');
        }

        // 캐릭터 모션 트리거
        triggerCharacterMotion(result.response);

        // Firestore에 대화 저장
        await saveMessage(uid, message, result.response);
      } catch (error) {
        console.error('메시지 전송 오류:', error);
        removeTypingIndicator(loadingId);
        addMessage('미안해, 잠깐 문제가 있었어. 다시 시도해줄래? 😅', 'bot');
      }
    }

    // 이벤트 리스너 등록
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    // 대화 이력 로드
    chatBot.loadConversationHistory();

    // 자동 인사 시작
    chatBot.startAutoGreeting();

    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', () => {
      chatBot.stopAutoGreeting();
    });

    return chatBot;
  } catch (error) {
    console.error('채팅 UI 설정 오류:', error);
    return null;
  }
}

// 메시지 추가 함수
function addMessage(text, sender) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}`;
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;

  messageDiv.appendChild(bubble);
  messagesContainer.appendChild(messageDiv);

  // 스크롤 하단으로
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 타이핑 효과로 메시지 추가
async function addMessageWithTyping(text, sender) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}`;
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  messageDiv.appendChild(bubble);
  messagesContainer.appendChild(messageDiv);

  // 타이핑 효과
  let currentText = '';
  for (let i = 0; i < text.length; i++) {
    currentText += text[i];
    bubble.textContent = currentText;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // 20ms 간격 (조절 가능)
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

// 타이핑 인디케이터 표시
function showTypingIndicator() {
  const id = `typing-${Date.now()}`;
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return id;

  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message bot';
  messageDiv.id = id;
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble typing';
  bubble.innerHTML = '<span></span><span></span><span></span>';

  messageDiv.appendChild(bubble);
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  return id;
}

// 타이핑 인디케이터 제거
function removeTypingIndicator(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

// 메시지 저장
async function saveMessage(uid, userMessage, botResponse) {
  try {
    if (!uid) {
      console.warn('사용자 ID가 없습니다.');
      return;
    }

    // 데모 모드에서는 로컬 스토리지에 저장
    if (uid.startsWith('demo_')) {
      const chatKey = `chatHistory_${uid}`;
      const existingHistory = JSON.parse(localStorage.getItem(chatKey) || '[]');
      
      // 새 메시지 추가
      existingHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: botResponse }
      );
      
      // 최근 20개만 유지
      const recentHistory = existingHistory.slice(-20);
      localStorage.setItem(chatKey, JSON.stringify(recentHistory));
      
      console.log('로컬 스토리지에 대화 저장 완료');
      return;
    }

    // Firebase 모드 (추후 구현)
    console.log('Firebase 모드는 아직 구현되지 않았습니다.');
  } catch (error) {
    console.error('대화 저장 실패:', error);
  }
}

// 캐릭터 모션 트리거
function triggerCharacterMotion(response) {
  try {
    // 전역 캐릭터 객체에 접근
    if (window.character && window.character.setMotionState) {
      // 응답 내용에 따른 모션 결정
      const happyKeywords = ['기뻐', '행복', '좋아', '웃', '즐거', '신나', '😊', '😄', '😁', '🎉', '✨', '💖'];
      const sadKeywords = ['슬퍼', '우울', '힘들', '괜찮', '위로', '😢', '😭', '💙'];
      const excitedKeywords = ['놀라', '와', '대단', '멋져', '😲', '😮', '🎊', '🌟'];
      const angryKeywords = ['화나', '짜증', '스트레스', '😤', '😡', '💢'];
      
      const responseText = response.toLowerCase();
      
      if (happyKeywords.some(keyword => responseText.includes(keyword))) {
        window.character.setMotionState('happy', 2000);
      } else if (sadKeywords.some(keyword => responseText.includes(keyword))) {
        window.character.setMotionState('sad', 2000);
      } else if (excitedKeywords.some(keyword => responseText.includes(keyword))) {
        window.character.setMotionState('excited', 2000);
      } else if (angryKeywords.some(keyword => responseText.includes(keyword))) {
        window.character.setMotionState('angry', 2000);
      } else {
        // 기본적으로 약간의 기쁨 모션
        window.character.setMotionState('happy', 1000);
      }
    }
  } catch (error) {
    console.error('캐릭터 모션 트리거 실패:', error);
  }
}

// 이전 메시지 로드
async function loadPreviousMessages() {
  try {
    // 이 함수는 필요에 따라 구현
    // 현재는 setupChatUI에서 chatBot.loadConversationHistory()로 처리
  } catch (error) {
    console.error('이전 메시지 로드 실패:', error);
  }
}

export default ChatBot;
