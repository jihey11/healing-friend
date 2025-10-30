/**
 * Simple Chat - GPT API만 사용하는 간단한 채팅 시스템
 * Railway 백엔드를 통해 OpenAI GPT API 호출
 */

class SimpleChat {
  constructor() {
    this.conversationHistory = [];
    this.isProcessing = false;
  }

  /**
   * GPT API를 통해 응답 받기
   * @param {string} userMessage - 사용자 메시지
   * @param {object} options - 추가 옵션 (캐릭터 레벨 등)
   * @returns {Promise<string>} - AI 응답
   */
  async sendMessage(userMessage, options = {}) {
    try {
      // Railway 백엔드 API URL
      const API_URL = window.ENV?.API_URL || 'http://localhost:3000';
      
      // 최근 대화 이력 포함 (최대 6개)
      const messages = [
        ...this.conversationHistory.slice(-6),
        { role: 'user', content: userMessage }
      ];

      // API 요청
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages,
          characterLevel: options.characterLevel || 1,
          characterStage: options.characterStage || 0
        })
      });

      // 응답 확인
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();

      // 응답 검증
      if (!data.success || !data.message) {
        throw new Error('잘못된 응답 형식');
      }

      const aiResponse = data.message.trim();

      // 대화 이력에 추가
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      );

      // 이력이 너무 길면 오래된 것 삭제 (최대 12개 = 6턴)
      if (this.conversationHistory.length > 12) {
        this.conversationHistory = this.conversationHistory.slice(-12);
      }

      return aiResponse;

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      throw error;
    }
  }

  /**
   * 대화 이력 초기화
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * 대화 이력 가져오기
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * localStorage에서 대화 이력 로드
   * @param {string} userId - 사용자 ID
   */
  loadHistory(userId) {
    try {
      const saved = localStorage.getItem(`simple_chat_${userId}`);
      if (saved) {
        this.conversationHistory = JSON.parse(saved);
        console.log('대화 이력 로드:', this.conversationHistory.length, '개');
      }
    } catch (error) {
      console.error('대화 이력 로드 실패:', error);
    }
  }

  /**
   * localStorage에 대화 이력 저장
   * @param {string} userId - 사용자 ID
   */
  saveHistory(userId) {
    try {
      localStorage.setItem(
        `simple_chat_${userId}`,
        JSON.stringify(this.conversationHistory)
      );
    } catch (error) {
      console.error('대화 이력 저장 실패:', error);
    }
  }
}

/**
 * 간단한 채팅 UI 설정
 * @param {string} containerId - 채팅 컨테이너 ID
 * @param {string} userId - 사용자 ID
 * @param {object} options - 추가 옵션
 */
function setupSimpleChat(containerId, userId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('채팅 컨테이너를 찾을 수 없습니다:', containerId);
    return null;
  }

  // 채팅 인스턴스 생성
  const chat = new SimpleChat();
  
  // 이력 로드
  if (userId) {
    chat.loadHistory(userId);
  }

  // HTML 구조 생성
  container.innerHTML = `
    <div class="simple-chat-container">
      <div class="simple-chat-messages" id="${containerId}-messages"></div>
      <div class="simple-chat-input-wrapper">
        <input 
          type="text" 
          id="${containerId}-input" 
          placeholder="메시지를 입력하세요..."
          maxlength="500"
        />
        <button id="${containerId}-send">전송</button>
      </div>
    </div>
  `;

  // 요소 참조
  const messagesDiv = document.getElementById(`${containerId}-messages`);
  const inputField = document.getElementById(`${containerId}-input`);
  const sendButton = document.getElementById(`${containerId}-send`);

  /**
   * 메시지를 화면에 추가
   */
  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    
    messageDiv.appendChild(bubble);
    messagesDiv.appendChild(messageDiv);
    
    // 스크롤 맨 아래로
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  /**
   * 타이핑 효과로 메시지 추가
   */
  async function addMessageWithTyping(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    messageDiv.appendChild(bubble);
    messagesDiv.appendChild(messageDiv);

    // 타이핑 효과
    let currentText = '';
    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      bubble.textContent = currentText;
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  /**
   * 로딩 인디케이터 표시
   */
  function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message bot';
    loadingDiv.id = 'loading-indicator';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble typing';
    bubble.innerHTML = '<span></span><span></span><span></span>';
    
    loadingDiv.appendChild(bubble);
    messagesDiv.appendChild(loadingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  /**
   * 로딩 인디케이터 제거
   */
  function hideLoading() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  /**
   * 메시지 전송
   */
  async function sendMessage() {
    const message = inputField.value.trim();
    
    // 검증
    if (!message || chat.isProcessing) return;

    // UI 업데이트
    chat.isProcessing = true;
    inputField.value = '';
    sendButton.disabled = true;
    inputField.disabled = true;

    // 사용자 메시지 표시
    addMessage(message, 'user');

    // 로딩 표시
    showLoading();

    try {
      // API 호출
      const response = await chat.sendMessage(message, {
        characterLevel: options.characterLevel || 1,
        characterStage: options.characterStage || 0
      });

      // 로딩 제거
      hideLoading();

      // AI 응답 표시 (타이핑 효과)
      await addMessageWithTyping(response, 'bot');

      // 이력 저장
      if (userId) {
        chat.saveHistory(userId);
      }

    } catch (error) {
      console.error('메시지 전송 오류:', error);
      
      hideLoading();
      
      // 에러 메시지 표시
      addMessage('죄송합니다. 응답을 받지 못했습니다. 다시 시도해주세요.', 'bot');
    } finally {
      // UI 복구
      chat.isProcessing = false;
      sendButton.disabled = false;
      inputField.disabled = false;
      inputField.focus();
    }
  }

  /**
   * 이전 대화 이력 표시
   */
  function displayHistory() {
    const history = chat.getHistory();
    history.forEach(msg => {
      const sender = msg.role === 'user' ? 'user' : 'bot';
      addMessage(msg.content, sender);
    });
  }

  // 이벤트 리스너 등록
  sendButton.addEventListener('click', sendMessage);
  
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // 초기 이력 표시
  displayHistory();

  // 초기 인사
  if (chat.getHistory().length === 0) {
    addMessage('안녕! 무엇을 도와드릴까요? 😊', 'bot');
  }

  // chat 인스턴스 반환
  return chat;
}

// 전역으로 export
window.SimpleChat = SimpleChat;
window.setupSimpleChat = setupSimpleChat;

export { SimpleChat, setupSimpleChat };

