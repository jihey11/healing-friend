// Firebase 의존성 제거 (데모 모드 지원)
// import { db, OPENAI_API_KEY } from './config.js';
// import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';

// 데모 모드용 설정
const OPENAI_API_KEY = window.ENV?.OPENAI_API_KEY || 'your_openai_api_key_here';

// 로컬 응답 데이터
const LOCAL_RESPONSES = {
  greetings: [
    '안녕! 오늘도 만나서 반가워! 😊',
    '왔구나! 기다렸어! 🌟',
    '어서와! 오늘은 어때? 💖',
    '반가워! 오늘도 좋은 하루 보냈어? ✨',
    '오랜만이야! 보고 싶었어! 🤗'
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

class ChatBot {
  constructor(uid, characterData) {
    this.uid = uid;
    this.characterData = characterData;
    this.conversationHistory = [];
    this.lastDiaryEmotion = null;
    this.isProcessing = false;
    this.autoGreetingInterval = null;
  }

  // 로컬 응답 선택
  selectLocalResponse(context = {}) {
    try {
      const { lastDiary, evolutionStage, justEvolved } = context;
      
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

  randomFrom(array) {
    if (!array || array.length === 0) {
      return '알 수 없는 오류가 발생했어요. 😅';
    }
    return array[Math.floor(Math.random() * array.length)];
  }

  // GPT 응답 (백엔드 API 사용)
  async getGPTResponse(userMessage, context = {}) {
    try {
      // 백엔드 API URL 가져오기
      const API_URL = window.ENV?.API_URL || 'http://localhost:3000';
      
      // 메시지 준비
      const messages = [
        ...this.conversationHistory.slice(-4), // 최근 4개 대화만
        { role: 'user', content: userMessage }
      ];

      // 백엔드 API 호출
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages,
          characterLevel: this.characterData?.level || 1,
          characterStage: this.characterData?.evolutionStage || 0
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.message) {
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }
      
      const reply = data.message.trim();
      
      if (!reply) {
        throw new Error('빈 응답을 받았습니다.');
      }
      
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
      console.error('GPT 응답 실패:', error);
      return null;
    }
  }

  // 메시지 처리
  async processMessage(userMessage, context = {}) {
    try {
      if (this.isProcessing) {
        return {
          response: '잠깐만, 이전 메시지를 처리하고 있어... 😅',
          source: 'local-fallback'
        };
      }

      this.isProcessing = true;
      const messageLength = userMessage.trim().length;
      
      // 50자 미만: 로컬 응답
      if (messageLength < 50) {
        const response = this.selectLocalResponse(context);
        return {
          response,
          source: 'local'
        };
      }

      // 50자 이상: GPT 시도 → 실패 시 로컬
      const gptResponse = await this.getGPTResponse(userMessage, context);

      if (gptResponse) {
        return {
          response: gptResponse,
          source: 'gpt'
        };
      } else {
        const fallbackResponse = this.selectLocalResponse(context);
        return {
          response: fallbackResponse,
          source: 'local-fallback'
        };
      }
    } catch (error) {
      console.error('메시지 처리 오류:', error);
      return {
        response: '미안해, 잠깐 문제가 있었어. 다시 말해줄래? 😅',
        source: 'error'
      };
    } finally {
      this.isProcessing = false;
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

        // 로딩 제거
        removeTypingIndicator(loadingId);

        // 봇 메시지 표시 (타이핑 효과)
        await addMessageWithTyping(result.response, 'bot');

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

// 이전 메시지 로드
async function loadPreviousMessages() {
  try {
    // 이 함수는 필요에 따라 구현
    // 현재는 setupChatUI에서 chatBot.loadConversationHistory()로 처리
  } catch (error) {
    console.error('이전 메시지 로드 실패:', error);
  }
}

// ========== 홈 화면 채팅 ==========

// 홈 화면 채팅 초기화
function setupHomeChatUI(uid, characterData) {
  const input = document.getElementById('home-chat-input');
  const sendButton = document.getElementById('home-chat-send');
  const messagesContainer = document.getElementById('home-chat-messages');

  if (!input || !sendButton || !messagesContainer) {
    console.warn('홈 채팅 UI 요소를 찾을 수 없습니다.');
    return;
  }

  // ChatBot 인스턴스 생성
  const chatBot = new ChatBot(uid, characterData);
  
  // 대화 히스토리 로드
  chatBot.loadConversationHistory();

  // 메시지 전송 함수
  async function sendHomeMessage() {
    const message = input.value.trim();
    if (!message || chatBot.isProcessing) return;

    chatBot.isProcessing = true;
    input.value = '';
    sendButton.disabled = true;

    // 사용자 메시지 추가
    addHomeMessage(message, 'user');

    // 타이핑 인디케이터 표시
    const typingId = showHomeTypingIndicator();

    try {
      // AI 응답 받기
      const response = await chatBot.sendMessage(message);

      // 타이핑 인디케이터 제거
      removeHomeTypingIndicator(typingId);

      // AI 응답 추가
      await addHomeMessageWithTyping(response, 'bot');

      // 메시지 저장
      await saveMessage(uid, message, response);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      removeHomeTypingIndicator(typingId);
      addHomeMessage('미안해, 지금은 답할 수 없어. 잠시 후 다시 시도해줘! 😅', 'bot');
    } finally {
      chatBot.isProcessing = false;
      sendButton.disabled = false;
    }
  }

  // 이벤트 리스너
  sendButton.addEventListener('click', sendHomeMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendHomeMessage();
    }
  });

  console.log('홈 채팅 UI 설정 완료');
}

// 홈 화면 메시지 추가
function addHomeMessage(text, sender) {
  const messagesContainer = document.getElementById('home-chat-messages');
  if (!messagesContainer) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}`;
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;

  messageDiv.appendChild(bubble);
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 홈 화면 타이핑 효과 메시지
async function addHomeMessageWithTyping(text, sender) {
  const messagesContainer = document.getElementById('home-chat-messages');
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
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

// 홈 화면 타이핑 인디케이터
function showHomeTypingIndicator() {
  const id = `home-typing-${Date.now()}`;
  const messagesContainer = document.getElementById('home-chat-messages');
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

// 홈 화면 타이핑 인디케이터 제거
function removeHomeTypingIndicator(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

// 전역으로 export
window.setupHomeChatUI = setupHomeChatUI;

// Named export 추가
export { setupHomeChatUI };

export default ChatBot;
