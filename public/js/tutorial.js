/**
 * 튜토리얼 시스템
 * 첫 로그인 시에만 튜토리얼을 표시하고, 홈 화면 대화창을 통해 진행됩니다.
 */

// 튜토리얼 완료 여부 확인
export function isTutorialCompleted(uid) {
  try {
    const tutorialData = localStorage.getItem(`tutorial_${uid}`);
    if (!tutorialData) {
      console.log('튜토리얼 데이터 없음:', uid);
      return false;
    }
    const data = JSON.parse(tutorialData);
    
    // completed가 true이면 완료
    if (data.completed === true) {
      console.log('튜토리얼 완료 여부 확인:', { uid, isCompleted: true, data });
      return true;
    }
    
    // currentStep이 마지막 단계 이상이면 자동 완료 처리
    // currentStep은 0부터 시작하므로, 마지막 메시지 인덱스는 length - 1
    const currentStep = data.currentStep || 0;
    if (currentStep >= TUTORIAL_MESSAGES.length - 1) {
      console.log('📝 튜토리얼이 마지막 단계까지 진행되었지만 완료 처리되지 않음. 자동 완료 처리:', uid, { currentStep, totalMessages: TUTORIAL_MESSAGES.length });
      markTutorialCompleted(uid);
      return true;
    }
    
    console.log('튜토리얼 완료 여부 확인:', { uid, isCompleted: false, currentStep, totalSteps: TUTORIAL_MESSAGES.length, data });
    return false;
  } catch (error) {
    console.error('튜토리얼 완료 여부 확인 오류:', error);
    return false;
  }
}

// 튜토리얼 완료 처리
export function markTutorialCompleted(uid) {
  try {
    // 기존 데이터 유지하면서 completed만 업데이트
    const existingData = JSON.parse(localStorage.getItem(`tutorial_${uid}`) || '{}');
    const tutorialData = {
      ...existingData,
      completed: true,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem(`tutorial_${uid}`, JSON.stringify(tutorialData));
    console.log('✅ 튜토리얼 완료 처리:', uid, tutorialData);
    
    // 확인: 저장 후 바로 읽어서 검증
    const verify = localStorage.getItem(`tutorial_${uid}`);
    console.log('✅ 튜토리얼 완료 저장 확인:', verify);
  } catch (error) {
    console.error('❌ 튜토리얼 완료 처리 오류:', error);
  }
}

// 튜토리얼 단계 설정
export function setTutorialStep(uid, step) {
  try {
    const tutorialData = JSON.parse(localStorage.getItem(`tutorial_${uid}`) || '{}');
    // 완료된 튜토리얼은 수정하지 않음
    if (tutorialData.completed === true) {
      console.log('완료된 튜토리얼은 수정할 수 없습니다:', uid);
      return;
    }
    tutorialData.currentStep = step;
    tutorialData.updatedAt = new Date().toISOString();
    localStorage.setItem(`tutorial_${uid}`, JSON.stringify(tutorialData));
  } catch (error) {
    console.error('튜토리얼 단계 설정 오류:', error);
  }
}

// 튜토리얼 단계 가져오기
export function getTutorialStep(uid) {
  try {
    const tutorialData = JSON.parse(localStorage.getItem(`tutorial_${uid}`) || '{}');
    return tutorialData.currentStep || 0;
  } catch (error) {
    console.error('튜토리얼 단계 가져오기 오류:', error);
    return 0;
  }
}

/**
 * 튜토리얼 메시지 배열
 * 설명 내용은 여기에 추가됩니다.
 */
export const TUTORIAL_MESSAGES = [
  '안녕? {nickname}!',
  '나는 아띠의 감정별에서 온 {characterName}야!',
  '이쁜 이름 지어준거 너무너무 고마워!!',
  '처음 시작하기에 앞서 기능들을 설명해줄게 😊',
  '홈화면에서는 나랑 대화를 할 수 있어!',
  '지금처럼 대화창으로 대화를 할 수 있지.',
  '일기장에서는 너가 원하는 일기를 쓸 수 있어!',
  '너의 하루를 적어도 되고, 힘들었던 일, 행복했던 일 등 너만의 이야기를 적어내리면 되는곳이야!',
  '하지만 주의 할게 있어!',
  '일기는 하루에 한번만 작성할 수 있어.',
  '또한 일기장에서는 전에 너가 썼던 일기들을 확인할 수 있고, 그 일기 내용에서 나오는 감정 점수도 확인할 수 있어!',
  '감정 점수는 내가 진화할때 사용해!',
  '어떤 감정이 모이느냐에 따라 내 모습이 변하거든!',
  '게임에서는 여러 게임을 해서 나한테 줄 수 있는 음식을 얻을 수 있어!',
  '하지만 게임 당 하루에 가능한 횟수는 정해져있으니 주의해!',
  '게임에서 얻은 음식들은 음식탭에서 확인할 수 있어!',
  '또한 음식마다 감정이 있으니 선택해서 줄 수 있어',
  '마이에서는 너의 정보, 내 레벨 등을 확인할 수 있어!',
  '알림을 받을지도 선택할 수 있어!',
  '힘들 땐 언제든 나에게 와줘!',
  '너의 하루를 들어주고, 함께 웃어줄게!!'
];

/**
 * 튜토리얼 시작
 * 홈 화면 대화창에 메시지를 자동으로 보냅니다.
 */
export async function startTutorial(uid, chatBot) {
  try {
    // 이미 완료된 튜토리얼이면 시작하지 않음
    if (isTutorialCompleted(uid)) {
      console.log('튜토리얼이 이미 완료되었습니다:', uid);
      return;
    }
    
    console.log('튜토리얼 시작:', uid);
    
    // 튜토리얼 초기화 (완료 상태는 유지)
    const tutorialData = JSON.parse(localStorage.getItem(`tutorial_${uid}`) || '{}');
    if (!tutorialData.completed) {
      // 완료되지 않은 경우에만 단계 설정
      setTutorialStep(uid, 0);
    }
    
    // 튜토리얼 진행 중에는 입력 비활성화
    disableChatInput();
    
    // 첫 메시지 전송
    if (TUTORIAL_MESSAGES.length > 0) {
      await sendTutorialMessage(0, chatBot);
    }
  } catch (error) {
    console.error('튜토리얼 시작 오류:', error);
  }
}

/**
 * 튜토리얼 메시지 전송
 * @param {number} stepIndex - 메시지 인덱스
 * @param {ChatBot} chatBot - ChatBot 인스턴스
 */
export async function sendTutorialMessage(stepIndex, chatBot) {
  try {
    if (stepIndex >= TUTORIAL_MESSAGES.length) {
      // 튜토리얼 완료
      const uid = chatBot.uid;
      console.log('🎯 튜토리얼 완료 처리 시작:', uid);
      markTutorialCompleted(uid);
      
      // 완료 상태 재확인
      const verifyKey = `tutorial_${uid}`;
      const verifyData = localStorage.getItem(verifyKey);
      console.log('✅ 튜토리얼 완료 저장 재확인:', { verifyKey, verifyData });
      
      // 완료 메시지 추가
      const messagesContainer = document.getElementById('home-chat-messages');
      if (messagesContainer) {
        await addTutorialMessageWithTyping('이제 궁금한 게 있으면 언제든지 물어봐! 😊', messagesContainer);
      }
      
      // 튜토리얼 완료 후 입력 활성화 (약간의 지연을 두어 완료 메시지 표시 후)
      setTimeout(() => {
        enableChatInput();
      }, 500);
      
      return;
    }

    let message = TUTORIAL_MESSAGES[stepIndex];
    if (!message) {
      return;
    }

    // 동적 변수 치환 (닉네임, 캐릭터 이름 등)
    message = replaceTutorialVariables(message, chatBot);

    // 홈 화면 대화창에 메시지 추가
    const messagesContainer = document.getElementById('home-chat-messages');
    if (!messagesContainer) {
      console.warn('홈 채팅 메시지 컨테이너를 찾을 수 없습니다.');
      return;
    }

    // 메시지 추가 (타이핑 효과와 함께)
    await addTutorialMessageWithTyping(message, messagesContainer);
    
    // 단계 업데이트
    setTutorialStep(chatBot.uid, stepIndex);

    // 다음 단계로 이동 (자동 또는 버튼 클릭)
    // 현재는 자동으로 다음 메시지 전송 (설정 가능)
    const autoNext = true; // 자동 진행 여부
    if (autoNext) {
      // 마지막 메시지인지 확인
      if (stepIndex >= TUTORIAL_MESSAGES.length - 1) {
        // 마지막 메시지를 보냈으므로 완료 처리
        console.log('📝 마지막 메시지 전송 완료, 튜토리얼 완료 처리:', chatBot.uid);
        markTutorialCompleted(chatBot.uid);
        
        // 완료 메시지 추가
        const messagesContainer = document.getElementById('home-chat-messages');
        if (messagesContainer) {
          await addTutorialMessageWithTyping('이제 궁금한 게 있으면 언제든지 물어봐! 😊', messagesContainer);
        }
        
        // 입력 활성화
        setTimeout(() => {
          enableChatInput();
        }, 500);
      } else {
        // 다음 메시지까지 대기 시간 (밀리초)
        const delay = 1500; // 1.5초 대기 (읽을 시간 제공)
        setTimeout(() => {
          sendTutorialMessage(stepIndex + 1, chatBot);
        }, delay);
      }
    }
  } catch (error) {
    console.error('튜토리얼 메시지 전송 오류:', error);
  }
}

/**
 * 튜토리얼 메시지의 동적 변수 치환
 * @param {string} message - 원본 메시지
 * @param {ChatBot} chatBot - ChatBot 인스턴스
 * @returns {string} 치환된 메시지
 */
function replaceTutorialVariables(message, chatBot) {
  try {
    // 사용자 정보 가져오기
    const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
    const nickname = demoUser.nickname || '친구';
    
    // 캐릭터 이름 가져오기
    let characterName = '힐링 프렌드';
    if (chatBot && chatBot.characterData && chatBot.characterData.name) {
      characterName = chatBot.characterData.name;
    } else if (window.character && window.character.name) {
      characterName = window.character.name;
    } else if (demoUser.characterName) {
      characterName = demoUser.characterName;
    }
    
    // 변수 치환
    message = message.replace(/{nickname}/g, nickname);
    message = message.replace(/{characterName}/g, characterName);
    
    return message;
  } catch (error) {
    console.error('변수 치환 오류:', error);
    return message;
  }
}

/**
 * 타이핑 효과와 함께 메시지 추가
 */
async function addTutorialMessageWithTyping(message, container) {
  return new Promise((resolve) => {
    // 메시지 버블 생성
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot';
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = '';
    
    messageDiv.appendChild(bubbleDiv);
    container.appendChild(messageDiv);
    
    // 스크롤
    container.scrollTop = container.scrollHeight;
    
    // 타이핑 효과
    let charIndex = 0;
    const typingSpeed = 20; // 문자당 밀리초 (더 빠르게)
    
    const typingInterval = setInterval(() => {
      if (charIndex < message.length) {
        bubbleDiv.textContent += message[charIndex];
        charIndex++;
        container.scrollTop = container.scrollHeight;
      } else {
        clearInterval(typingInterval);
        resolve();
      }
    }, typingSpeed);
  });
}

/**
 * 튜토리얼 초기화 (회원가입 시 호출)
 * 이미 완료된 튜토리얼이 있으면 초기화하지 않음
 */
export function initializeTutorial(uid) {
  try {
    // 이미 완료된 튜토리얼이 있으면 초기화하지 않음
    if (isTutorialCompleted(uid)) {
      console.log('이미 완료된 튜토리얼이 있어 초기화하지 않습니다:', uid);
      return;
    }
    
    const tutorialData = {
      completed: false,
      currentStep: 0,
      startedAt: new Date().toISOString()
    };
    localStorage.setItem(`tutorial_${uid}`, JSON.stringify(tutorialData));
    console.log('튜토리얼 초기화:', uid);
  } catch (error) {
    console.error('튜토리얼 초기화 오류:', error);
  }
}

/**
 * 채팅 입력 비활성화 (튜토리얼 진행 중)
 */
function disableChatInput() {
  try {
    const input = document.getElementById('home-chat-input');
    const sendButton = document.getElementById('home-chat-send');
    
    if (input) {
      input.disabled = true;
      input.placeholder = '튜토리얼 진행 중...';
    }
    if (sendButton) {
      sendButton.disabled = true;
    }
  } catch (error) {
    console.error('채팅 입력 비활성화 오류:', error);
  }
}

/**
 * 채팅 입력 활성화 (튜토리얼 완료 후)
 */
function enableChatInput() {
  try {
    const input = document.getElementById('home-chat-input');
    const sendButton = document.getElementById('home-chat-send');
    
    if (input) {
      input.disabled = false;
      input.placeholder = '메시지를 입력하세요...';
      input.removeAttribute('readonly');
      // 약간의 지연 후 포커스 설정 (UI 업데이트 대기)
      setTimeout(() => {
        input.focus();
      }, 100);
    }
    if (sendButton) {
      sendButton.disabled = false;
      sendButton.style.pointerEvents = 'auto';
      sendButton.style.opacity = '1';
    }
    
    console.log('✅ 채팅 입력 활성화 완료:', {
      inputDisabled: input?.disabled,
      sendButtonDisabled: sendButton?.disabled
    });
  } catch (error) {
    console.error('❌ 채팅 입력 활성화 오류:', error);
  }
}

