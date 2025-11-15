//AI 사용
import { CHAT_CONFIG, API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from './constants.js';
import { selectContextualResponse, randomFrom, LOCAL_RESPONSES } from './chat-responses.js';

// ==================== ChatBot 클래스 ====================

export class ChatBot {
  constructor(uid, characterData) {
    this.uid = uid;
    this.characterData = characterData;
    this.conversationHistory = [];
    this.isProcessing = false;
    this.autoGreetingInterval = null;
  }

  /**
   * 메시지 처리 (메인 로직)
   * @param {string} userMessage - 사용자 메시지
   * @param {Object} context - 컨텍스트 정보 (일기, 진화 상태 등)
   * @returns {Promise<Object>} 응답 객체 {response, source}
   */
  async processMessage(userMessage, context = {}) {
    try {
      // 중복 처리 방지
      if (this.isProcessing) {
        return {
          response: '잠깐만, 이전 메시지를 처리하고 있어... 😅',
          source: 'local-fallback'
        };
      }

      this.isProcessing = true;
      const messageLength = userMessage.trim().length;
      
      // 짧은 메시지: 로컬 응답
      if (messageLength < CHAT_CONFIG.gptThreshold) {
        const response = selectContextualResponse(context);
        return { response, source: 'local' };
      }

      // 긴 메시지: GPT 시도 → 실패 시 로컬
      const gptResponse = await this.getGPTResponse(userMessage);

      if (gptResponse) {
        return { response: gptResponse, source: 'gpt' };
      } else {
        const fallbackResponse = selectContextualResponse(context);
        return { response: fallbackResponse, source: 'local-fallback' };
      }
    } catch (error) {
      console.error('메시지 처리 오류:', error);
      return {
        response: randomFrom(LOCAL_RESPONSES.fallbacks),
        source: 'error'
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * GPT API 응답 받기
   * @param {string} userMessage - 사용자 메시지
   * @returns {Promise<string|null>} GPT 응답 또는 null (실패 시)
   */
  async getGPTResponse(userMessage) {
    try {
      const API_URL = API_CONFIG.getApiUrl();
      
      // 최근 대화 이력 포함
      const messages = [
        ...this.conversationHistory.slice(-CHAT_CONFIG.contextMessageCount),
        { role: 'user', content: userMessage }
      ];

      // API 호출
      const response = await fetch(`${API_URL}${API_CONFIG.endpoints.chat}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      
      // 대화 이력 업데이트
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: reply }
      );
      
      // 이력 길이 제한
      if (this.conversationHistory.length > CHAT_CONFIG.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(-CHAT_CONFIG.maxHistoryLength);
      }
      
      return reply;
    } catch (error) {
      console.error('GPT 응답 실패:', error);
      return null;
    }
  }

  /**
   * 자동 인사 메시지 가져오기
   * @returns {string} 자동 인사
   */
  getAutoGreeting() {
    return randomFrom(LOCAL_RESPONSES.autoGreetings);
  }

  /**
   * 대화 이력 로드 (로컬 스토리지)
   */
  async loadConversationHistory() {
    try {
      if (!this.uid) {
        console.warn('사용자 ID가 없습니다.');
        return;
      }

      const savedHistory = localStorage.getItem(STORAGE_KEYS.chatHistory(this.uid));
      if (savedHistory) {
        this.conversationHistory = JSON.parse(savedHistory);
        console.log(`대화 이력 로드: ${this.conversationHistory.length}개`);
      }
    } catch (error) {
      console.error('대화 이력 로드 실패:', error);
    }
  }

  /**
   * 대화 이력 저장 (로컬 스토리지)
   * @param {string} userMessage - 사용자 메시지
   * @param {string} botResponse - 봇 응답
   */
  async saveConversation(userMessage, botResponse) {
    try {
      if (!this.uid) return;

      // 최근 대화만 저장 (최대 20개)
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: botResponse }
      );
      
      const recentHistory = this.conversationHistory.slice(-20);
      localStorage.setItem(
        STORAGE_KEYS.chatHistory(this.uid),
        JSON.stringify(recentHistory)
      );
      
      console.log('대화 저장 완료');
    } catch (error) {
      console.error('대화 저장 실패:', error);
    }
  }

  /**
   * 자동 인사 시작 (주기적)
   * @param {Function} onGreeting - 인사 콜백 함수
   */
  startAutoGreeting(onGreeting) {
    if (this.autoGreetingInterval) {
      clearInterval(this.autoGreetingInterval);
    }
    
    this.autoGreetingInterval = setInterval(() => {
      const greeting = this.getAutoGreeting();
      if (onGreeting) {
        onGreeting(greeting);
      }
    }, CHAT_CONFIG.autoGreetingInterval);
  }

  /**
   * 자동 인사 중지
   */
  stopAutoGreeting() {
    if (this.autoGreetingInterval) {
      clearInterval(this.autoGreetingInterval);
      this.autoGreetingInterval = null;
    }
  }
}

// ==================== ChatUI 클래스 ====================
/**
 * 채팅 UI 관리
 * - 메시지 표시
 * - 타이핑 효과
 * - 로딩 인디케이터
 */
export class ChatUI {
  constructor(messagesContainerId) {
    this.messagesContainer = document.getElementById(messagesContainerId);
    if (!this.messagesContainer) {
      throw new Error(`메시지 컨테이너를 찾을 수 없습니다: ${messagesContainerId}`);
    }
  }

  /**
   * 메시지 추가
   * @param {string} text - 메시지 텍스트
   * @param {string} sender - 'user' 또는 'bot'
   */
  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    
    messageDiv.appendChild(bubble);
    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  /**
   * 타이핑 효과로 메시지 추가
   * @param {string} text - 메시지 텍스트
   * @param {string} sender - 'user' 또는 'bot'
   * @param {number} speed - 타이핑 속도 (ms)
   */
  async addMessageWithTyping(text, sender, speed = 20) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    messageDiv.appendChild(bubble);
    this.messagesContainer.appendChild(messageDiv);

    // 타이핑 효과
    let currentText = '';
    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      bubble.textContent = currentText;
      this.scrollToBottom();
      await new Promise(resolve => setTimeout(resolve, speed));
    }
  }

  /**
   * 타이핑 인디케이터 표시
   * @returns {string} 인디케이터 ID
   */
  showTypingIndicator() {
    const id = `typing-${Date.now()}`;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot';
    messageDiv.id = id;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble typing';
    bubble.innerHTML = '<span></span><span></span><span></span>';
    
    messageDiv.appendChild(bubble);
    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
    
    return id;
  }

  /**
   * 타이핑 인디케이터 제거
   * @param {string} id - 인디케이터 ID
   */
  removeTypingIndicator(id) {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  }

  /**
   * 스크롤을 맨 아래로
   */
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * 모든 메시지 지우기
   */
  clearMessages() {
    this.messagesContainer.innerHTML = '';
  }
}

// ==================== 채팅 UI 설정 함수 ====================

/**
 * 홈 화면 채팅 UI 설정
 * @param {string} uid - 사용자 ID
 * @param {Object} characterData - 캐릭터 데이터
 * @returns {ChatBot} ChatBot 인스턴스
 */
export function setupHomeChatUI(uid, characterData) {
  try {
    const chatUI = new ChatUI('home-chat-messages');
    const chatBot = new ChatBot(uid, characterData);
    
    const input = document.getElementById('home-chat-input');
    const sendButton = document.getElementById('home-chat-send');

    if (!input || !sendButton) {
      throw new Error('입력 요소를 찾을 수 없습니다.');
    }

    // 대화 이력 로드
    chatBot.loadConversationHistory();

    // 메시지 전송 함수
    async function sendMessage() {
      const message = input.value.trim();
      if (!message || chatBot.isProcessing) return;
      
      // 최소 길이 체크 (10자 이상)
      if (message.length < 10) {
        chatUI.addMessage('메시지는 최소 10자 이상 입력해주세요. 😊', 'bot');
        return;
      }

      chatBot.isProcessing = true;
      input.value = '';
      sendButton.disabled = true;

      // 사용자 메시지 표시
      chatUI.addMessage(message, 'user');

      // 타이핑 인디케이터 표시
      const typingId = chatUI.showTypingIndicator();

      try {
        // AI 응답 받기
        const result = await chatBot.processMessage(message);

        // 타이핑 인디케이터 제거
        chatUI.removeTypingIndicator(typingId);

        // AI 응답 표시 (타이핑 효과)
        await chatUI.addMessageWithTyping(result.response, 'bot');

        // 대화 저장
        await chatBot.saveConversation(message, result.response);
      } catch (error) {
        console.error('메시지 전송 실패:', error);
        chatUI.removeTypingIndicator(typingId);
        chatUI.addMessage(ERROR_MESSAGES.chatFailed, 'bot');
      } finally {
        chatBot.isProcessing = false;
        sendButton.disabled = false;
      }
    }

    // 이벤트 리스너
    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    console.log('홈 채팅 UI 설정 완료');
    return chatBot;
  } catch (error) {
    console.error('홈 채팅 UI 설정 실패:', error);
    return null;
  }
}

/**
 * 일반 채팅 UI 설정 (별도 채팅 페이지용)
 * @param {string} uid - 사용자 ID
 * @param {Object} character - 캐릭터 객체
 * @param {Object} lastDiary - 최근 일기
 * @returns {ChatBot} ChatBot 인스턴스
 */
export function setupChatUI(uid, character, lastDiary = null) {
  try {
    const chatUI = new ChatUI('chat-messages');
    const chatBot = new ChatBot(uid, character);
    
    const input = document.getElementById('chat-input');
    const sendButton = document.getElementById('chat-send');

    if (!input || !sendButton) {
      throw new Error('입력 요소를 찾을 수 없습니다.');
    }

    // 대화 이력 로드
    chatBot.loadConversationHistory();

    // 초기 인사
    chatUI.addMessage('안녕! 무슨 일이든 나한테 얘기해줘! 😊', 'bot');

    // 메시지 전송 함수
    async function sendMessage() {
      const message = input.value.trim();
      if (!message || chatBot.isProcessing) return;
      
      // 최소 길이 체크 (10자 이상)
      if (message.length < 10) {
        chatUI.addMessage('메시지는 최소 10자 이상 입력해주세요. 😊', 'bot');
        return;
      }

      chatBot.isProcessing = true;
      input.value = '';
      sendButton.disabled = true;

      chatUI.addMessage(message, 'user');
      const typingId = chatUI.showTypingIndicator();

      try {
        const context = {
          lastDiary: lastDiary,
          evolutionStage: character.evolutionStage,
          justEvolved: false
        };

        const result = await chatBot.processMessage(message, context);
        chatUI.removeTypingIndicator(typingId);
        await chatUI.addMessageWithTyping(result.response, 'bot');
        await chatBot.saveConversation(message, result.response);
      } catch (error) {
        console.error('메시지 전송 실패:', error);
        chatUI.removeTypingIndicator(typingId);
        chatUI.addMessage(ERROR_MESSAGES.chatFailed, 'bot');
      } finally {
        chatBot.isProcessing = false;
        sendButton.disabled = false;
      }
    }

    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    // 자동 인사 시작
    chatBot.startAutoGreeting((greeting) => {
      chatUI.addMessage(greeting, 'bot');
    });

    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', () => {
      chatBot.stopAutoGreeting();
    });

    console.log('채팅 UI 설정 완료');
    return chatBot;
  } catch (error) {
    console.error('채팅 UI 설정 실패:', error);
    return null;
  }
}

// ==================== 전역 export ====================
window.setupHomeChatUI = setupHomeChatUI;
window.setupChatUI = setupChatUI;
window.ChatBot = ChatBot;
window.ChatUI = ChatUI;

export { setupHomeChatUI, setupChatUI };
export default ChatBot;


