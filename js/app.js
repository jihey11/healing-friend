//대부분 AI 사용

import { auth } from './config.js';
import { setupAuthUI } from './auth.js';
import { Character } from './character.js';
import { setupDiaryUI, updateNextDiaryTime } from './diary.js';
import { setupChatUI } from './chat.js';
import { setupTargetGame } from './game-target.js';
import { setupPuzzleGame } from './game-puzzle.js';
import { updateDailyTip, showToast } from './utils.js';
import { 
  isTutorialCompleted, 
  initializeTutorial, 
  startTutorial,
  markTutorialCompleted,
  TUTORIAL_MESSAGES
} from './tutorial.js';
import { FoodInventory, feedCharacter, getFoodById } from './food.js';

// Firebase 함수들을 동적으로 가져오는 헬퍼 함수
function getFirebaseAuth() {
  if (window.firebaseModules) {
    return window.firebaseModules;
  }
  return null;
}

// DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', () => {
  console.log('앱 초기화 시작');
  
  try {
    // DOM 요소 가져오기
    const loadingScreen = document.getElementById('loading-screen');
    const authContainer = document.getElementById('auth-container');
    const app = document.getElementById('app');
    
    if (!loadingScreen || !authContainer || !app) {
      throw new Error('필수 DOM 요소를 찾을 수 없습니다.');
    }
    
    // 현재는 데모 모드만 지원
    console.warn('Firebase 설정이 유효하지 않습니다. 데모 모드로 실행합니다.');
    
    // 데모 모드로 실행
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      authContainer.classList.remove('hidden');
      setupAuthUI();
      setupNavigation();
      setupTabs();
      setupDemoMode();
      console.log('데모 모드로 앱 초기화 완료');
    }, 1000);
    
    // 인증 UI 설정
    setupAuthUI();
    
    // 네비게이션 설정
    setupNavigation();
    
    // 탭 전환 설정
    setupTabs();
    
    // 앱 초기화 완료
    console.log('앱 초기화 완료');
    
  } catch (error) {
    console.error('앱 초기화 실패:', error);
    // 초기화 실패 시 로딩 화면 숨기기
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
    // 오류 발생 시에도 기본 UI는 표시
    const authContainer = document.getElementById('auth-container');
    if (authContainer) {
      authContainer.classList.remove('hidden');
      setupAuthUI();
      setupNavigation();
      setupTabs();
    }
  }
});

/**
 * 탭 전환 설정
 */
function setupTabs() {
  try {
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (!loginTab || !signupTab || !loginForm || !signupForm) {
      console.warn('탭 관련 DOM 요소를 찾을 수 없습니다.');
      return;
    }
    
    // 로그인 탭 클릭
    loginTab.addEventListener('click', () => {
      try {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        console.log('로그인 탭으로 전환');
      } catch (error) {
        console.error('로그인 탭 전환 중 오류:', error);
      }
    });
    
    // 회원가입 탭 클릭
    signupTab.addEventListener('click', () => {
      try {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        console.log('회원가입 탭으로 전환');
      } catch (error) {
        console.error('회원가입 탭 전환 중 오류:', error);
      }
    });
    
  } catch (error) {
    console.error('탭 설정 중 오류:', error);
  }
}

/**
 * 네비게이션 설정
 */
function setupNavigation() {
  try {
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    
    if (navBtns.length === 0 || views.length === 0) {
      console.warn('네비게이션 관련 DOM 요소를 찾을 수 없습니다.');
      return;
    }
    
    navBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const viewName = btn.dataset.view;
          
          console.log('네비게이션 버튼 클릭:', viewName);
          
          if (!viewName) {
            console.warn('뷰 이름이 설정되지 않은 버튼:', btn);
            return;
          }
          
          // 모든 버튼/뷰 비활성화
          navBtns.forEach(b => b.classList.remove('active'));
          views.forEach(v => v.classList.remove('active'));
          
          // 선택된 것만 활성화
          btn.classList.add('active');
          const targetView = document.getElementById(`${viewName}-view`);
          
          console.log('타겟 뷰 찾기:', `${viewName}-view`, !!targetView);
          
          if (targetView) {
            targetView.classList.add('active');
            console.log(`${viewName} 뷰로 전환 완료`);
            
            // 일기 뷰인 경우 추가 로그
            if (viewName === 'diary') {
              console.log('일기 뷰 활성화됨');
              const emotionBtns = document.querySelectorAll('.emotion-btn');
              console.log('일기 뷰의 감정 버튼 개수:', emotionBtns.length);
            }
            
            // 음식 뷰인 경우 음식 목록 렌더링
            if (viewName === 'food') {
              const currentUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
              if (currentUser.uid) {
                await renderFoodInventory(currentUser.uid);
              }
            }
          } else {
            console.warn(`${viewName}-view 요소를 찾을 수 없습니다.`);
          }
          
        } catch (error) {
          console.error('뷰 전환 중 오류:', error);
        }
      });
    });
    
    console.log('네비게이션 설정 완료');
    
  } catch (error) {
    console.error('네비게이션 설정 중 오류:', error);
  }
}

/**
 * 사용자 데이터 로드
 * @param {string} uid - 사용자 ID
 */
async function loadUserData(uid) {
  try {
    console.log('사용자 데이터 로드 시작:', uid);
    
    // 데모 모드인지 확인
    if (uid.startsWith('demo_')) {
      const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
      console.log('데모 사용자 데이터 로드:', demoUser);
      
      // UI 업데이트
      updateUserUI(demoUser);
      
      // 캐릭터 초기화
      await initializeCharacter(demoUser);
      
      // 각 기능 UI 설정
      await setupFeatureUIs(demoUser);
      
      // 헤더의 일기 작성 가능 시간 업데이트
      await updateNextDiaryTime(demoUser.uid);
      
      // 튜토리얼 체크 및 시작
      // 직접 localStorage에서 확인 (이중 체크)
      const tutorialKey = `tutorial_${uid}`;
      const tutorialDataRaw = localStorage.getItem(tutorialKey);
      const tutorialData = tutorialDataRaw ? JSON.parse(tutorialDataRaw) : null;
      
      // completed가 true이거나, currentStep이 마지막 단계 이상이면 완료
      let tutorialCompleted = false;
      if (tutorialData) {
        if (tutorialData.completed === true) {
          tutorialCompleted = true;
        } else if (tutorialData.currentStep >= TUTORIAL_MESSAGES.length - 1) {
          // 마지막 단계까지 진행되었으면 자동 완료 처리
          // currentStep은 0부터 시작하므로, 마지막 메시지 인덱스는 length - 1
          console.log('📝 마지막 단계까지 진행된 튜토리얼 자동 완료 처리:', uid, { currentStep: tutorialData.currentStep, totalMessages: TUTORIAL_MESSAGES.length });
          markTutorialCompleted(uid);
          tutorialCompleted = true;
        }
      }
      
      console.log('🔍 튜토리얼 체크 결과:', { 
        uid, 
        tutorialKey,
        tutorialDataRaw,
        tutorialData,
        tutorialCompleted,
        isTutorialCompletedResult: isTutorialCompleted(uid)
      });
      
      if (!tutorialCompleted) {
        console.log('📚 튜토리얼 시작 예정:', uid);
        // 홈 채팅 UI가 설정된 후 튜토리얼 시작
        setTimeout(() => {
          const chatBot = window.homeChatBot; // setupHomeChatUI에서 설정됨
          if (chatBot) {
            startTutorial(uid, chatBot);
          } else {
            console.warn('⚠️ ChatBot 인스턴스를 찾을 수 없습니다. 튜토리얼을 시작할 수 없습니다.');
            // 튜토리얼이 시작되지 않으면 입력 활성화
            const input = document.getElementById('home-chat-input');
            const sendButton = document.getElementById('home-chat-send');
            if (input) input.disabled = false;
            if (sendButton) sendButton.disabled = false;
          }
        }, 500); // UI 설정 대기
      } else {
        console.log('✅ 튜토리얼이 이미 완료되어 스킵합니다:', uid);
        // 튜토리얼이 이미 완료된 경우 입력 활성화
        const input = document.getElementById('home-chat-input');
        const sendButton = document.getElementById('home-chat-send');
        if (input) input.disabled = false;
        if (sendButton) sendButton.disabled = false;
      }
      
      return;
    }
    

    
    // 임시로 콘솔에 로그만 출력
    console.log('사용자 데이터 로드 완료:', uid);
    
  } catch (error) {
    console.error('사용자 데이터 로드 실패:', error);
  }
}

/**
 * 사용자 UI 업데이트
 * @param {Object} userData - 사용자 데이터
 */
function updateUserUI(userData) {
  try {
    // 사용자 정보 업데이트
    const userNickname = document.getElementById('user-nickname');
    const characterName = document.getElementById('character-name');
    
    if (userNickname) userNickname.textContent = userData.nickname || '사용자';
    if (characterName) characterName.textContent = userData.characterName || '힐링 프렌드';
    
    console.log('사용자 UI 업데이트 완료');
  } catch (error) {
    console.error('사용자 UI 업데이트 실패:', error);
  }
}

/**
 * 캐릭터 초기화
 * @param {Object} userData - 사용자 데이터
 */
async function initializeCharacter(userData) {
  try {
    console.log('캐릭터 초기화 시작');
    
    // 기존 캐릭터 데이터 로드 시도
    let characterData = JSON.parse(localStorage.getItem('characterData') || '{}');
    
    // 기존 데이터가 없거나 사용자 ID가 다르면 새로 생성
    if (!characterData.uid || characterData.uid !== userData.uid) {
      console.log('새 캐릭터 데이터 생성');
      characterData = {
        uid: userData.uid,
        level: 1,
        exp: 0,
        evolutionStage: 0,
        firstEmotionColor: null,
        currentShape: 'circle',
        emotions: {
          기쁨: 0, 슬픔: 0, 분노: 0,
          두려움: 0, 놀람: 0, 혐오: 0
        },
        isAdmin: userData.isAdmin || false
      };
      
      // 새 캐릭터 데이터 저장
      localStorage.setItem('characterData', JSON.stringify(characterData));
    } else {
      console.log('기존 캐릭터 데이터 로드:', characterData);
      
      // 기존 데이터에 isAdmin 속성이 없으면 추가
      if (characterData.isAdmin === undefined) {
        characterData.isAdmin = userData.isAdmin || false;
        localStorage.setItem('characterData', JSON.stringify(characterData));
        console.log('isAdmin 속성 추가:', characterData.isAdmin);
      }
    }
    
    // 캐릭터 인스턴스 생성
    window.character = new Character('character-canvas', characterData);
    
    // 캐릭터 정보를 전역으로 저장
    window.currentUser = userData;
    
    // 관리자 계정일 때만 감정 점수 표시
    if (userData.isAdmin) {
      const emotionScoresElement = document.getElementById('emotion-scores');
      const adminResetBtn = document.getElementById('admin-reset-btn');
      const adminEvolveGroup = document.getElementById('admin-evolve-group');
      const adminRevertBase = document.getElementById('admin-revert-base');
      const adminEvolve1 = document.getElementById('admin-evolve-1');
      const adminEvolve2 = document.getElementById('admin-evolve-2');
      const adminEvolve3 = document.getElementById('admin-evolve-3');
      const adminEmotionSelect = document.getElementById('admin-emotion-select');
      const adminEvolve3Custom = document.getElementById('admin-evolve-3-custom');
      const adminEvolve1Custom = document.getElementById('admin-evolve-1-custom');
      const adminEvolve2Custom = document.getElementById('admin-evolve-2-custom');
      if (emotionScoresElement) {
        emotionScoresElement.classList.remove('hidden');
        updateEmotionScores(characterData.emotions);
      }
      if (adminResetBtn) {
        adminResetBtn.classList.remove('hidden');
        adminResetBtn.addEventListener('click', () => {
          try {
            if (!confirm('캐릭터의 레벨/경험치/감정/진화 상태를 모두 초기화할까요?')) return;
            const resetData = {
              uid: characterData.uid,
              level: 1,
              exp: 0,
              evolutionStage: 0,
              firstEmotionColor: null,
              currentShape: 'circle',
              emotions: { 기쁨: 0, 슬픔: 0, 분노: 0, 두려움: 0, 놀람: 0, 혐오: 0 },
              isAdmin: true
            };
            localStorage.setItem('characterData', JSON.stringify(resetData));
            // 화면 반영
            if (window.character) {
              window.character.level = 1;
              window.character.exp = 0;
              window.character.evolutionStage = 0;
              window.character.firstEmotionColor = null;
              window.character.currentShape = 'circle';
              window.character.emotions = { 기쁨: 0, 슬픔: 0, 분노: 0, 두려움: 0, 놀람: 0, 혐오: 0 };
              window.character.updateExpBar();
              window.character.render();
            }
            updateEmotionScores(resetData.emotions);
            showToast('캐릭터가 초기화되었습니다.', 2500, 'success');
          } catch (error) {
            console.error('관리자 초기화 실패:', error);
            showToast('초기화 실패', 2500, 'error');
          }
        });
      }
      if (adminEvolveGroup && adminEvolve1 && adminEvolve2 && adminEvolve3) {
        adminEvolveGroup.classList.remove('hidden');
        const evolveTo = async (stage) => {
          try {
            if (!window.character) return;
            // 최고 감정 기준으로 색/도형 설정을 위해 내부 로직 활용
            const highest = window.character.getHighestEmotion();
            window.character.evolve(stage, highest);
            window.character.render();
            // 저장 반영
            await window.character.saveToFirestore();
            // 통계 UI 반영
            const statsEvolution = document.getElementById('stats-evolution');
            if (statsEvolution) {
              const evolutionNames = ['알', '1단계', '2단계', '3단계 (최종)'];
              statsEvolution.textContent = evolutionNames[stage] || '알';
            }
            showToast(`${stage}단계로 진화했습니다.`, 2000, 'success');
          } catch (error) {
            console.error('관리자 진화 실패:', error);
            showToast('진화 실패', 2000, 'error');
          }
        };
        adminEvolve1.addEventListener('click', () => evolveTo(1));
        adminEvolve2.addEventListener('click', () => evolveTo(2));
        adminEvolve3.addEventListener('click', () => evolveTo(3));
        if (adminRevertBase) {
          adminRevertBase.addEventListener('click', async () => {
            try {
              if (!window.character) return;
              // 기본 상태로 복귀
              window.character.evolutionStage = 0;
              window.character.firstEmotionColor = null;
              window.character.currentShape = 'circle';
              window.character.render();
              await window.character.saveToFirestore();
              const statsEvolution = document.getElementById('stats-evolution');
              if (statsEvolution) statsEvolution.textContent = '알';
              showToast('기본 모습으로 변경했습니다.', 2000, 'success');
            } catch (error) {
              console.error('기본 모습 복귀 실패:', error);
              showToast('변경 실패', 2000, 'error');
            }
          });
        }
        if (adminEmotionSelect && adminEvolve3Custom) {
          adminEvolve3Custom.addEventListener('click', async () => {
            try {
              if (!window.character) return;
              const emotion = adminEmotionSelect.value || '기쁨';
              window.character.evolve(3, emotion);
              window.character.render();
              await window.character.saveToFirestore();
              const statsEvolution = document.getElementById('stats-evolution');
              if (statsEvolution) statsEvolution.textContent = '3단계 (최종)';
              showToast(`선택 감정(${emotion})으로 3단계 진화했습니다.`, 2000, 'success');
            } catch (error) {
              console.error('선택 감정 3단계 진화 실패:', error);
              showToast('진화 실패', 2000, 'error');
            }
          });
        }
        if (adminEmotionSelect && adminEvolve1Custom) {
          adminEvolve1Custom.addEventListener('click', async () => {
            try {
              if (!window.character) return;
              const emotion = adminEmotionSelect.value || '기쁨';
              // 1단계는 firstEmotionColor를 선택 감정으로 세팅
              window.character.evolve(1, emotion);
              window.character.render();
              await window.character.saveToFirestore();
              const statsEvolution = document.getElementById('stats-evolution');
              if (statsEvolution) statsEvolution.textContent = '1단계';
              showToast(`선택 감정(${emotion})으로 1단계 진화했습니다.`, 2000, 'success');
            } catch (error) {
              console.error('선택 감정 1단계 진화 실패:', error);
              showToast('진화 실패', 2000, 'error');
            }
          });
        }
        if (adminEmotionSelect && adminEvolve2Custom) {
          adminEvolve2Custom.addEventListener('click', async () => {
            try {
              if (!window.character) return;
              const emotion = adminEmotionSelect.value || '기쁨';
              // 2단계는 표정 변화만 반영
              if (window.character.evolutionStage < 1) {
                window.character.evolve(1, emotion);
              }
              window.character.evolve(2, emotion);
              window.character.render();
              await window.character.saveToFirestore();
              const statsEvolution = document.getElementById('stats-evolution');
              if (statsEvolution) statsEvolution.textContent = '2단계';
              showToast(`선택 감정(${emotion}) 표정으로 2단계 진화했습니다.`, 2000, 'success');
            } catch (error) {
              console.error('2단계 표정 진화 실패:', error);
              showToast('진화 실패', 2000, 'error');
            }
          });
        }
      }
    }
    
    console.log('캐릭터 초기화 완료:', {
      level: characterData.level,
      exp: characterData.exp,
      evolutionStage: characterData.evolutionStage,
      emotions: characterData.emotions
    });
    
  } catch (error) {
    console.error('캐릭터 초기화 실패:', error);
    showToast('캐릭터 초기화에 실패했습니다.', 3000, 'error');
  }
}

/**
 * 감정 점수 UI 업데이트
 * @param {Object} emotions - 감정 점수 객체
 */
function updateEmotionScores(emotions) {
  try {
    const emotionMap = {
      '기쁨': 'emotion-joy',
      '슬픔': 'emotion-sadness', 
      '분노': 'emotion-anger',
      '두려움': 'emotion-fear',
      '놀람': 'emotion-surprise',
      '혐오': 'emotion-disgust'
    };
    
    for (const [emotion, score] of Object.entries(emotions)) {
      const elementId = emotionMap[emotion];
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          // 소수점 첫 번째 자리까지만 표시
          element.textContent = Math.round(score * 10) / 10;
        }
      }
    }
    
    console.log('감정 점수 UI 업데이트 완료:', emotions);
    
  } catch (error) {
    console.error('감정 점수 UI 업데이트 실패:', error);
  }
}

// updateEmotionScores 함수를 전역으로 노출 (다른 모듈에서 사용하기 위해)
window.updateEmotionScores = updateEmotionScores;

/**
 * 각 기능 UI 설정
 * @param {Object} userData - 사용자 데이터
 */
async function setupFeatureUIs(userData) {
  try {
    console.log('기능 UI 설정 시작');
    
    // 일기 UI 설정
    if (window.character) {
      console.log('일기 UI 설정 호출:', userData.uid);
      setupDiaryUI(userData.uid, window.character);
    } else {
      console.warn('캐릭터가 없어서 일기 UI 설정을 건너뜁니다.');
    }
    
    // 채팅 UI 설정
    if (window.character) {
      setupChatUI(userData.uid, window.character);
    }
    
    // 게임 UI 설정
    if (window.character) {
      setupTargetGame(userData.uid, window.character);
      setupPuzzleGame(userData.uid, window.character);
    }
    
    // 오늘의 팁 업데이트
    updateDailyTip();
    
    // 마이페이지 설정
    const mypageUserData = JSON.parse(localStorage.getItem('demoUser') || '{}');
    if (mypageUserData.uid) {
      await setupMyPage(mypageUserData);
    }
    
    // 로그아웃 버튼 설정 (setupMyPage에서도 설정하지만 중복 방지)
    // setupLogoutButton();
    
    console.log('기능 UI 설정 완료');
    
  } catch (error) {
    console.error('기능 UI 설정 실패:', error);
  }
}

/**
 * 로그아웃 버튼 설정
 */
function setupLogoutButton() {
  try {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('정말 로그아웃하시겠습니까?')) {
          // 로컬 스토리지 클리어
          localStorage.removeItem('demoUser');
          localStorage.removeItem('rememberMe');
          
          // 인증 화면으로 전환
          const authContainer = document.getElementById('auth-container');
          const app = document.getElementById('app');
          authContainer.classList.remove('hidden');
          app.classList.add('hidden');
          
          // 캐릭터 정리
          if (window.character) {
            window.character.stopAnimation();
            window.character = null;
          }
          
          showToast('로그아웃되었습니다.', 3000, 'success');
        }
      });
    }
  } catch (error) {
    console.error('로그아웃 버튼 설정 실패:', error);
  }
}

/**
 * 에러 처리 유틸리티
 * @param {Error} error - 에러 객체
 * @param {string} context - 에러 발생 컨텍스트
 */
function handleError(error, context) {
  console.error(`${context}에서 오류 발생:`, error);
  
  // 사용자에게 알림 표시 (추후 토스트 메시지로 구현)
  // showToast('오류가 발생했습니다. 다시 시도해주세요.', 'error');
}

/**
 * 앱 상태 확인
 */
function checkAppStatus() {
  try {
    const loadingScreen = document.getElementById('loading-screen');
    const authContainer = document.getElementById('auth-container');
    const app = document.getElementById('app');
    
    console.log('앱 상태:', {
      loadingScreen: loadingScreen?.classList.contains('hidden') ? '숨김' : '표시',
      authContainer: authContainer?.classList.contains('hidden') ? '숨김' : '표시',
      app: app?.classList.contains('hidden') ? '숨김' : '표시',
      currentUser: auth.currentUser ? '로그인됨' : '로그아웃됨'
    });
  } catch (error) {
    console.error('앱 상태 확인 중 오류:', error);
  }
}

/**
 * 데모 모드 설정
 */
function setupDemoMode() {
  // 데모 모드에서 로그인 성공 시 메인 앱으로 전환
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      if (email && password) {
        // 이메일 기반으로 고유한 UID 생성
        const uid = 'demo_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
        
        // 데모 모드에서는 localStorage에 이메일 관련 데이터가 있는지만 확인
        // 매우 관대한 검증: 키나 값에 이메일이 포함되어 있으면 통과
        let isRegistered = false;
        let foundUserData = null;
        let foundDemoUser = null;
        
        try {
          // 1. demoUser 직접 확인
          try {
            const storedDemoUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
            if (storedDemoUser && (storedDemoUser.email === email || storedDemoUser.uid === uid)) {
              isRegistered = true;
              foundDemoUser = storedDemoUser;
              console.log('✅ demoUser에서 발견:', storedDemoUser);
            }
          } catch (e) {
            console.warn('demoUser 확인 중 오류:', e);
          }
          
          // 2. 모든 localStorage 검색 - 키나 값에 이메일이 포함되어 있으면 통과
          if (!isRegistered) {
            const allKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key) {
                allKeys.push(key);
                
                // 키에 이메일이나 uid가 포함되어 있는지 확인
                if (key.includes(email) || key.includes(uid)) {
                  isRegistered = true;
                  console.log('✅ 키에 이메일/UID 포함 발견:', key);
                }
                
                // 값 확인
                try {
                  const value = localStorage.getItem(key);
                  if (value && typeof value === 'string') {
                    // 문자열에 이메일이 직접 포함되어 있는지 확인 (매우 관대)
                    if (value.includes(email)) {
                      isRegistered = true;
                      console.log('✅ 값에 이메일 포함 발견:', key);
                      
                      // JSON 파싱 시도
                      try {
                        const parsed = JSON.parse(value);
                        if (parsed && typeof parsed === 'object' && parsed !== null) {
                          // 이메일이 일치하는 경우
                          if (parsed.email === email) {
                            foundUserData = parsed;
                            console.log('✅ 이메일로 사용자 데이터 발견:', key, parsed);
                          }
                          // UID가 일치하는 경우
                          if (parsed.uid && parsed.uid === uid) {
                            foundUserData = parsed;
                            console.log('✅ UID로 사용자 데이터 발견:', key, parsed);
                          }
                        }
                      } catch (e) {
                        // JSON 파싱 실패해도 값에 이메일이 있으면 통과
                      }
                    }
                  }
                } catch (e) {
                  // 값 읽기 실패 시 무시
                }
              }
            }
            
            console.log('📋 localStorage 모든 키:', allKeys);
          }
          
          // 3. localStorage에 데이터가 하나라도 있으면 통과 (매우 관대한 방식)
          // 이는 모바일에서 다른 형식으로 저장되었을 가능성을 고려
          if (!isRegistered && localStorage.length > 0) {
            // localStorage에 데이터가 있으면 통과 (데모 모드이므로)
            isRegistered = true;
            console.log('✅ localStorage에 데이터가 있어서 통과 (데모 모드)');
          }
          
        } catch (e) {
          console.error('localStorage 검색 중 오류:', e);
          // 에러가 발생해도 데모 모드에서는 통과 (매우 관대)
          isRegistered = true;
          console.log('⚠️ 에러 발생했지만 데모 모드이므로 통과');
        }
        
        // 최종 확인
        if (!isRegistered) {
          console.log('❌ 회원가입 확인 실패 - 이메일:', email, 'UID:', uid);
          console.log('localStorage 키 목록:', Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)));
          alert('회원가입되지 않은 이메일입니다. 먼저 회원가입을 진행해주세요.');
          return;
        }
        
        // 회원가입된 사용자 정보 가져오기
        let demoUser;
        
        // 우선순위: foundUserData > foundDemoUser > userData > 기본값
        if (foundUserData) {
          demoUser = foundUserData;
          if (!demoUser.uid) {
            demoUser.uid = uid;
          }
        } else if (foundDemoUser) {
          demoUser = foundDemoUser;
        } else {
          // userData 확인
          const registeredUserData = localStorage.getItem(`userData_${uid}`);
          if (registeredUserData) {
            try {
              demoUser = JSON.parse(registeredUserData);
            } catch (e) {
              console.warn('userData 파싱 실패:', e);
            }
          }
        }
        
        // 찾지 못한 경우 기본값 생성
        if (!demoUser) {
          demoUser = {
            uid: uid,
            email: email,
            nickname: '사용자',
            characterName: '힐링 프렌드',
            isAdmin: false
          };
        }
        
        // demoUser와 userData에 저장 (다음 로그인을 위해)
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        localStorage.setItem(`userData_${uid}`, JSON.stringify(demoUser));
        
        // 관리자 계정 확인
        const isAdmin = email === 'ghrkrtldk@gmail.com';
        if (isAdmin) {
          demoUser.isAdmin = true;
          demoUser.nickname = '관리자';
        }
        
        // 현재 로그인 사용자 정보 저장
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        
        // 메인 앱으로 전환
        const authContainer = document.getElementById('auth-container');
        const app = document.getElementById('app');
        authContainer.classList.add('hidden');
        app.classList.remove('hidden');
        
        // 사용자 데이터 로드
        await loadUserData(demoUser.uid);
      }
    });
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const nickname = document.getElementById('signup-nickname').value;
      const characterName = document.getElementById('signup-character-name').value;
      
      if (email && password && nickname && characterName) {
        // 이메일 기반으로 고유한 UID 생성
        const uid = 'demo_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
        
        // 데모 모드에서는 로컬 스토리지에 저장
        const demoUser = {
          uid: uid, // 이메일 기반 고유 UID
          email: email,
          nickname: nickname,
          characterName: characterName,
          isAdmin: false
        };
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        
        // 회원가입된 사용자 정보 저장 (로그인 시 확인용)
        localStorage.setItem(`userData_${uid}`, JSON.stringify(demoUser));
        
        // 사용자 생성 시간 저장 (계정별)
        const createdAtKey = `userCreatedAt_${uid}`;
        if (!localStorage.getItem(createdAtKey)) {
          localStorage.setItem(createdAtKey, new Date().toISOString());
        }
        
        // 메인 앱으로 전환
        const authContainer = document.getElementById('auth-container');
        const app = document.getElementById('app');
        authContainer.classList.add('hidden');
        app.classList.remove('hidden');
        
        // 사용자 데이터 로드
        await loadUserData(demoUser.uid);
      }
    });
  }
}

/**
 * 마이페이지 설정
 */
async function setupMyPage(userData) {
  try {
    console.log('마이페이지 설정 시작');
    
    // 사용자 정보 표시
    const userNickname = document.getElementById('user-nickname');
    const characterNameEl = document.getElementById('character-name');
    
    if (userNickname) {
      userNickname.textContent = userData.nickname || '데모 사용자';
    }
    
    if (characterNameEl) {
      characterNameEl.textContent = userData.characterName || '힐링 프렌드';
    }
    
    // 캐릭터 데이터 가져오기
    const characterData = JSON.parse(localStorage.getItem('characterData') || '{}');
    
    // 통계 표시
    const statsLevel = document.getElementById('stats-level');
    const statsEvolution = document.getElementById('stats-evolution');
    const statsDiaries = document.getElementById('stats-diaries');
    const daysCount = document.getElementById('days-count');
    
    if (statsLevel) {
      statsLevel.textContent = characterData.level || 1;
    }
    
    if (statsEvolution) {
      const evolutionNames = ['알', '1단계', '2단계', '3단계 (최종)'];
      statsEvolution.textContent = evolutionNames[characterData.evolutionStage || 0];
    }
    
    // 일기 개수 계산 (사용자별)
    const storageKey = `diaries_${userData.uid}`;
    const diaries = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (statsDiaries) {
      statsDiaries.textContent = diaries.length;
    }
    
    // 가입 일수 계산 (계정별)
    if (daysCount) {
      const createdAtKey = `userCreatedAt_${userData.uid}`;
      const createdAt = localStorage.getItem(createdAtKey);
      if (createdAt) {
        const created = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysCount.textContent = diffDays;
      } else {
        daysCount.textContent = 1;
      }
    }
    
    // 감정 통계 바 그래프 (숨김 처리)
    // renderEmotionBars(characterData.emotions || {});
    
    // 일기 목록은 버튼 클릭 시 로드되도록 변경
    setupDiaryListButton(userData.uid);
    
    // 알림 토글
    const notificationToggle = document.getElementById('notification-toggle');
    if (notificationToggle) {
      notificationToggle.checked = Notification.permission === 'granted';
      
      notificationToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          if ('Notification' in window) {
            Notification.requestPermission();
          }
        }
      });
    }
    
    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('로그아웃 하시겠습니까?')) {
          // 로컬 스토리지에서 현재 사용자 정보만 제거
          localStorage.removeItem('demoUser');
          localStorage.removeItem('rememberMe');
          
          // 캐릭터 정리
          if (window.character) {
            window.character.stopAnimation();
            window.character = null;
          }
          
          // 인증 화면으로 전환 (새로고침 없이)
          const authContainer = document.getElementById('auth-container');
          const app = document.getElementById('app');
          if (authContainer && app) {
            authContainer.classList.remove('hidden');
            app.classList.add('hidden');
          }
          
          showToast('로그아웃되었습니다.', 3000, 'success');
        }
      });
    }
    
    console.log('마이페이지 설정 완료');
    
  } catch (error) {
    console.error('마이페이지 설정 실패:', error);
  }
}

/**
 * 일기 목록 버튼 설정
 */
function setupDiaryListButton(uid) {
  const loadDiaryBtn = document.getElementById('load-diary-btn');
  const diaryListContainer = document.getElementById('diary-list');
  
  if (!loadDiaryBtn || !diaryListContainer) return;
  
  // 초기에는 일기 목록 숨김
  diaryListContainer.style.display = 'none';
  
  // 버튼 클릭 이벤트
  loadDiaryBtn.addEventListener('click', async () => {
    // 이미 보이는 상태면 숨김
    if (diaryListContainer.style.display === 'block') {
      diaryListContainer.style.display = 'none';
      loadDiaryBtn.textContent = '일기 목록 보기';
    } else {
      // 일기 목록 로드 및 표시
      loadDiaryBtn.textContent = '로딩 중...';
      loadDiaryBtn.disabled = true;
      
      await loadDiaryList(uid);
      
      diaryListContainer.style.display = 'block';
      loadDiaryBtn.textContent = '일기 목록 숨기기';
      loadDiaryBtn.disabled = false;
    }
  });
}

/**
 * 감정 바 그래프 렌더링
 */
function renderEmotionBars(emotions) {
  const emotionBarsContainer = document.getElementById('emotion-bars');
  if (!emotionBarsContainer) return;
  
  const emotionData = {
    '기쁨': { score: emotions['기쁨'] || 0, color: '#FFFF84' },
    '슬픔': { score: emotions['슬픔'] || 0, color: '#4169E1' },
    '분노': { score: emotions['분노'] || 0, color: '#DC143C' },
    '두려움': { score: emotions['두려움'] || 0, color: '#2F4F4F' },
    '놀람': { score: emotions['놀람'] || 0, color: '#00CED1' },
    '혐오': { score: emotions['혐오'] || 0, color: '#9370DB' }
  };
  
  const maxScore = 100;
  
  emotionBarsContainer.innerHTML = Object.entries(emotionData).map(([emotion, data]) => {
    const percentage = (data.score / maxScore) * 100;
    const displayScore = Math.round(data.score * 10) / 10;
    
    return `
      <div class="emotion-bar-item" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; color: #333;">
          <span style="font-weight: 500;">${emotion}</span>
          <span style="font-weight: bold; color: ${data.color};">${displayScore}점</span>
        </div>
        <div style="width: 100%; height: 20px; background: #E0E0E0; border-radius: 10px; overflow: hidden;">
          <div style="width: ${percentage}%; height: 100%; background: ${data.color}; transition: width 0.5s ease;"></div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 일기 목록 로드
 */
async function loadDiaryList(uid) {
  const diaryListContainer = document.getElementById('diary-list');
  if (!diaryListContainer) return;
  
  try {
    // 로컬 스토리지에서 일기 목록 가져오기 (사용자별)
    const storageKey = `diaries_${uid}`;
    const diaries = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (diaries.length === 0) {
      diaryListContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 40px 0;">아직 작성한 일기가 없어요.</p>';
      return;
    }
    
    // 최신순 정렬
    diaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 최대 20개만 표시
    const displayDiaries = diaries.slice(0, 20);
    
    diaryListContainer.innerHTML = '';
    
    displayDiaries.forEach((diary, index) => {
      const diaryItem = createDiaryItem(index, diary, uid);
      diaryListContainer.appendChild(diaryItem);
    });
    
  } catch (error) {
    console.error('일기 목록 로드 실패:', error);
    diaryListContainer.innerHTML = '<p style="text-align: center; color: #ff4444; padding: 40px 0;">일기를 불러오는데 실패했습니다.</p>';
  }
}

/**
 * 일기 아이템 생성
 */
function createDiaryItem(diaryId, diary, uid) {
  const item = document.createElement('div');
  item.className = 'diary-item';
  
  const date = new Date(diary.createdAt);
  const dateStr = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const emotionEmojis = {
    '기쁨': '😊',
    '슬픔': '😢',
    '분노': '😡',
    '두려움': '😰',
    '놀람': '😲',
    '혐오': '😖'
  };
  
  const preview = diary.content.length > 50 
    ? diary.content.substring(0, 50) + '...'
    : diary.content;
  
  item.innerHTML = `
    <div class="diary-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span class="diary-date" style="font-size: 14px; color: #666;">${dateStr}</span>
      <span class="diary-emotion" style="font-size: 24px;">${emotionEmojis[diary.selectedEmotion] || '😊'}</span>
    </div>
    <p class="diary-preview" style="color: #333; line-height: 1.6; margin-bottom: 12px;">${preview}</p>
    <div class="diary-actions">
      <button class="btn-view" style="padding: 8px 16px; background: var(--color-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">상세보기</button>
    </div>
  `;
  
  item.style.cssText = `
    background: white;
    padding: 16px;
    margin-bottom: 12px;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: all 0.3s;
    cursor: pointer;
  `;
  
  item.addEventListener('mouseenter', () => {
    item.style.transform = 'translateX(5px)';
    item.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
  });
  
  item.addEventListener('mouseleave', () => {
    item.style.transform = 'translateX(0)';
    item.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });
  
  // 상세보기
  item.querySelector('.btn-view').addEventListener('click', (e) => {
    e.stopPropagation();
    showDiaryDetail(diaryId, diary, uid);
  });
  
  // 아이템 전체 클릭 시에도 상세보기
  item.addEventListener('click', () => {
    showDiaryDetail(diaryId, diary, uid);
  });
  
  return item;
}

/**
 * 일기 상세보기 모달
 */
function showDiaryDetail(diaryId, diary, uid) {
  // 모달 생성
  const modal = document.createElement('div');
  modal.className = 'diary-detail-modal';
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.3s;
  `;
  
  const date = new Date(diary.createdAt);
  const dateStr = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  
  const emotionEmojis = {
    '기쁨': '😊',
    '슬픔': '😢',
    '분노': '😡',
    '두려움': '😰',
    '놀람': '😲',
    '혐오': '😖'
  };
  
  // 수정 가능 여부 (24시간 이내)
  const canEdit = canEditDiary(diary.createdAt);
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    padding: 32px;
    border-radius: 20px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
  `;
  
  modalContent.innerHTML = `
    <button class="modal-close" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 28px; cursor: pointer; color: #999;">&times;</button>
    <h2 style="margin-bottom: 8px; color: #333;">${dateStr} ${emotionEmojis[diary.selectedEmotion] || '😊'}</h2>
    <p style="color: #666; margin-bottom: 24px; font-size: 14px;">선택한 감정: ${diary.selectedEmotion}</p>
    
    <div class="diary-full-content" style="margin: 24px 0; line-height: 1.8; white-space: pre-wrap; color: #333; font-size: 16px;">
      ${diary.content}
    </div>
    
    ${diary.analysisResult ? `
      <div class="diary-analysis" style="background: #f5f7fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h3 style="margin-bottom: 16px; color: #333; font-size: 18px;">감정 분석 결과</h3>
        ${Object.entries(diary.analysisResult).map(([emotion, score]) => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px;">
            <span style="color: #666;">${emotion}</span>
            <span style="font-weight: bold; color: #333;">${score.toFixed(1)}점</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    <div class="diary-detail-actions" style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">
      ${canEdit ? `
        <button class="btn-danger" id="delete-diary-btn" style="padding: 12px 24px; background: #DC143C; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 15px;">삭제</button>
      ` : `
        <p style="color: #999; font-size: 14px; flex: 1;">작성 후 24시간이 지나 삭제할 수 없습니다.</p>
      `}
      <button class="btn-primary" id="close-detail-btn" style="padding: 12px 24px; background: var(--color-primary); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 15px; margin-left: auto;">닫기</button>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // 닫기 기능
  const closeModal = () => {
    modal.remove();
  };
  
  modalContent.querySelector('.modal-close').addEventListener('click', closeModal);
  modalContent.querySelector('#close-detail-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // 삭제 기능
  if (canEdit) {
    modalContent.querySelector('#delete-diary-btn')?.addEventListener('click', () => {
      if (confirm('정말 삭제하시겠습니까?\n삭제된 일기는 복구할 수 없습니다.')) {
        try {
          // 로컬 스토리지에서 삭제 (사용자별)
          const storageKey = `diaries_${uid}`;
          const diaries = JSON.parse(localStorage.getItem(storageKey) || '[]');
          diaries.splice(diaryId, 1);
          localStorage.setItem(storageKey, JSON.stringify(diaries));
          
          showToast('일기가 삭제되었습니다.');
          closeModal();
          loadDiaryList(uid); // 목록 새로고침
        } catch (error) {
          console.error('일기 삭제 실패:', error);
          showToast('일기 삭제에 실패했습니다.', 3000, 'error');
        }
      }
    });
  }
}

/**
 * 일기 수정 가능 여부 확인 (24시간 이내)
 */
function canEditDiary(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffHours = (now - created) / (1000 * 60 * 60);
  return diffHours < 24;
}

/**
 * 음식 인벤토리 렌더링
 * @param {string} uid - 사용자 ID
 */
async function renderFoodInventory(uid) {
  try {
    const foodGrid = document.getElementById('food-grid');
    const foodEmpty = document.getElementById('food-empty');
    const totalFoodCount = document.getElementById('total-food-count');
    
    // DOM 요소가 없으면 (음식 뷰가 활성화되지 않았으면) 조용히 반환
    // 음식은 이미 저장되었으므로, 나중에 음식 뷰를 열면 표시됨
    if (!foodGrid || !foodEmpty) {
      console.log('음식 그리드 또는 빈 상태 요소를 찾을 수 없습니다. (음식 뷰가 활성화되지 않음)');
      return;
    }
    
    // 인벤토리 로드
    const inventory = new FoodInventory(uid);
    await inventory.load();
    
    // 음식 목록 가져오기
    const foods = inventory.getAllFoods();
    
    // 전체 음식 개수 업데이트
    const totalCount = foods.reduce((sum, food) => sum + food.quantity, 0);
    if (totalFoodCount) {
      totalFoodCount.textContent = totalCount;
    }
    
    if (foods.length === 0 || totalCount === 0) {
      foodGrid.innerHTML = '';
      foodEmpty.classList.remove('hidden');
      return;
    }
    
    foodEmpty.classList.add('hidden');
    foodGrid.innerHTML = '';
    
    // 음식 등급 정보 로드
    const foodGrades = JSON.parse(localStorage.getItem(`foodGrades_${uid}`) || '{}');
    
    // 음식 카드 생성
    foods.forEach(food => {
      const card = document.createElement('div');
      card.className = 'food-card';
      card.dataset.foodId = food.id;
      
      // 해당 음식의 등급 정보 가져오기 (가장 높은 등급 표시)
      let displayGrade = '';
      let gradeColor = '#999';
      if (foodGrades[food.id] && foodGrades[food.id].length > 0) {
        // 가장 높은 등급 찾기
        const grades = foodGrades[food.id].map(fg => fg.grade);
        const gradeOrder = { 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
        const highestGrade = grades.reduce((a, b) => gradeOrder[a] > gradeOrder[b] ? a : b, 'D');
        displayGrade = `${highestGrade}급`;
        const gradeColors = { 'S': '#FFD700', 'A': '#FF6B6B', 'B': '#4ECDC4', 'C': '#45B7D1', 'D': '#96CEB4' };
        gradeColor = gradeColors[highestGrade] || '#999';
      }
      
      card.innerHTML = `
        <div class="food-emoji">${food.emoji}</div>
        <div class="food-name">${food.name}</div>
        <div class="food-quantity">보유: ${food.quantity}개</div>
        ${displayGrade ? `<div class="food-grade" style="color: ${gradeColor}; font-weight: bold; font-size: 12px; margin-top: 4px;">${displayGrade}</div>` : ''}
        <div class="food-exp" style="margin-top: 8px; background: ${food.color || '#f0f0f0'}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px;">
          EXP +${food.exp}
        </div>
      `;
      
      // 음식 카드 클릭 이벤트
      card.addEventListener('click', async () => {
        if (food.quantity <= 0) {
          showToast('보유한 음식이 없습니다.', 2000, 'error');
          return;
        }
        
        if (!window.character) {
          showToast('캐릭터를 찾을 수 없습니다.', 2000, 'error');
          return;
        }
        
        try {
          // 로딩 표시
          card.style.opacity = '0.5';
          card.style.pointerEvents = 'none';
          
          // 음식 먹이기
          const result = await feedCharacter(window.character, food.id, inventory, uid);
          
          // 성공 메시지
          let message = `${food.name}을(를) 먹였습니다!`;
          if (result.leveledUp) {
            message += `\n레벨업! ${result.prevLevel} → ${result.newLevel}`;
          }
          message += `\n${food.emotion} 감정 +${result.emotionPoints}점`;
          showToast(message, 3000, 'success');
          
          // 인벤토리 다시 렌더링
          await renderFoodInventory(uid);
          
        } catch (error) {
          console.error('음식 먹이기 실패:', error);
          showToast(error.message || '음식을 먹이는데 실패했습니다.', 2000, 'error');
          card.style.opacity = '1';
          card.style.pointerEvents = 'auto';
        }
      });
      
      foodGrid.appendChild(card);
    });
    
    // 필터 버튼 이벤트
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // 활성화 상태 변경
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        const cards = foodGrid.querySelectorAll('.food-card');
        
        cards.forEach(card => {
          const foodId = parseInt(card.dataset.foodId);
          const food = getFoodById(foodId);
          
          if (filter === 'all' || food.emotion === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
    
    console.log('음식 인벤토리 렌더링 완료:', foods.length);
    
  } catch (error) {
    console.error('음식 인벤토리 렌더링 실패:', error);
  }
}

// 전역 함수로 노출 (다른 모듈에서 호출 가능)
window.renderFoodInventory = renderFoodInventory;

// 개발 환경에서 전역 함수로 노출 (디버깅용)
// 브라우저 환경에서는 항상 디버깅 함수들을 노출
window.checkAppStatus = checkAppStatus;
window.loadUserData = loadUserData;
window.setupMyPage = setupMyPage;

