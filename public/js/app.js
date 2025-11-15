import { auth, db } from './config.js';
import { setupAuthUI, setupAuthStateListener, signOutUser } from './auth.js';
import { Character } from './character.js';
import { setupDiaryUI, updateNextDiaryTime } from './diary.js';
import { setupHomeChatUI } from './chat.js';
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
import { setupChatRoom } from './chat-room.js';

// Firebase 함수들을 동적으로 가져오는 헬퍼 함수
// cursor AI사용 (20~ 25줄)
function getFirebaseAuth() {
  if (window.firebaseModules) {
    return window.firebaseModules;
  }
  return null;
}

function getFirebaseFirestore() {
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
    
    // Firebase 모듈 로드 대기 또는 즉시 초기화
    const initializeApp = async () => {
      const firebaseAuth = getFirebaseAuth();
      
      if (firebaseAuth && auth) {
        // Firebase 인증 사용
        console.log('Firebase 인증 사용 가능');
        
        // 인증 상태 리스너 설정
        setupAuthStateListener(async (user) => {
          loadingScreen.classList.add('hidden');
          
          if (user) {
            console.log('사용자 로그인됨:', user.uid);
            authContainer.classList.add('hidden');
            app.classList.remove('hidden');
            
            // 사용자 데이터 로드 및 앱 초기화
            try {
              await loadUserData(user.uid);
              console.log('앱 초기화 완료');
            } catch (error) {
              console.error('앱 초기화 실패:', error);
            }
          } else {
            console.log('사용자 로그아웃 상태');
            authContainer.classList.remove('hidden');
            app.classList.add('hidden');
          }
        });
        
        // 인증 UI 설정
        setupAuthUI();
        
        // 네비게이션 설정
        setupNavigation();
        
        console.log('Firebase 모드로 앱 초기화 완료');
      } else {
        // Firebase 초기화 실패 - 데모 모드로 전환
        console.warn('Firebase 설정이 유효하지 않습니다. 데모 모드로 실행됩니다.');
        loadingScreen.classList.add('hidden');
        authContainer.classList.add('hidden');
        app.classList.remove('hidden');
        
        // 데모 모드로 앱 초기화
        try {
          // 데모 사용자로 로그인
          const demoUser = {
            uid: 'demo_' + Date.now(),
            email: 'demo@example.com',
            displayName: '데모 사용자'
          };
          
          // 데모 사용자 정보 저장
          localStorage.setItem('demoUser', JSON.stringify(demoUser));
          localStorage.setItem('currentUser', JSON.stringify(demoUser));
          
          // 사용자 데이터 로드 및 앱 초기화
          await loadUserData(demoUser.uid);
          console.log('데모 모드로 앱 초기화 완료');
        } catch (error) {
          console.error('데모 모드 초기화 실패:', error);
          // 에러 메시지 표시 (최후의 수단)
          const errorDiv = document.createElement('div');
          errorDiv.style.cssText = 'text-align: center; padding: 40px; color: #DC143C;';
          errorDiv.innerHTML = `
            <h2>앱 초기화 실패</h2>
            <p>앱을 초기화하는데 실패했습니다.</p>
            <p>페이지를 새로고침하거나 관리자에게 문의하세요.</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; font-size: 16px; background: #00CED1; color: white; border: none; border-radius: 8px; cursor: pointer;">새로고침</button>
          `;
          app.innerHTML = '';
          app.appendChild(errorDiv);
        }
        
        // 네비게이션 설정
        setupNavigation();
      }
    };
    
    // Firebase 모듈이 로드되었는지 확인
    if (window.firebaseModules) {
      initializeApp();
    } else {
      // Firebase 모듈 로드 이벤트 대기
      window.addEventListener('firebaseModulesLoaded', initializeApp);
      
      // 15초 후에도 로드되지 않으면 데모 모드로 전환
      setTimeout(() => {
        if (!window.firebaseModules) {
          console.warn('Firebase 모듈 로드 시간 초과. 데모 모드로 전환합니다.');
          initializeApp(); // 데모 모드로 초기화
        }
      }, 15000); // 15초로 증가 (모바일 환경 고려)
    }
    
    // 앱 초기화 완료
    console.log('앱 초기화 시작 완료');
    
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
    }
  }
});

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
              // currentUser를 먼저 시도하고, 없으면 demoUser 사용
              let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
              if (!currentUser.uid) {
                currentUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
              }
              if (currentUser.uid) {
                console.log('음식 뷰: uid로 인벤토리 렌더링:', currentUser.uid);
                await renderFoodInventory(currentUser.uid);
              } else {
                console.warn('음식 뷰: uid를 찾을 수 없습니다.');
              }
            }
            
            // 채팅 뷰인 경우 채팅방 초기화
            if (viewName === 'chat') {
              await setupChatRoom();
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
    
    // Firebase 사용자 처리
    console.log('Firebase 사용자 데이터 로드:', uid);
    
    // Firebase에서 사용자 데이터 가져오기 (Firestore)
    const firebaseAuth = getFirebaseAuth();
    if (firebaseAuth && auth && db) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Firestore에서 사용자 데이터 가져오기
        const { doc, getDoc } = window.firebaseModules;
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userData;
        if (userDoc.exists()) {
          // 기존 사용자 데이터 로드
          const firestoreData = userDoc.data();
          userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: firestoreData.nickname || currentUser.displayName || currentUser.email,
            characterName: firestoreData.characterName || '아띠',
            characterLevel: firestoreData.level || 1,
            characterExp: firestoreData.exp || 0,
            evolutionStage: firestoreData.evolutionStage || 0,
            emotionScores: firestoreData.emotionScores || {
              기쁨: 0, 슬픔: 0, 분노: 0, 두려움: 0, 놀람: 0, 혐오: 0
            },
            dominantEmotion: firestoreData.dominantEmotion || null,
            lastDiaryDate: firestoreData.lastDiaryDate || null
          };
          console.log('✅ Firestore에서 사용자 데이터 로드:', userData);
        } else {
          // 새 사용자 (회원가입 직후)
          userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email,
            characterName: '아띠',
            characterLevel: 1,
            characterExp: 0,
            evolutionStage: 0,
            emotionScores: {
              기쁨: 0, 슬픔: 0, 분노: 0, 두려움: 0, 놀람: 0, 혐오: 0
            },
            dominantEmotion: null,
            lastDiaryDate: null
          };
          console.log('⚠️ Firestore에 사용자 데이터가 없습니다. 기본값 사용:', userData);
        }
        
        // Firebase 사용자도 localStorage에 임시 저장 (캐싱)
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // UI 업데이트
        updateUserUI(userData);
        
        // 캐릭터 초기화
        await initializeCharacter(userData);
        
        // 각 기능 UI 설정
        await setupFeatureUIs(userData);
        
        // 헤더의 일기 작성 가능 시간 업데이트
        await updateNextDiaryTime(userData.uid);
        
        // 튜토리얼 체크
        const tutorialKey = `tutorial_${uid}`;
        const tutorialDataRaw = localStorage.getItem(tutorialKey);
        const tutorialData = tutorialDataRaw ? JSON.parse(tutorialDataRaw) : null;
        
        let tutorialCompleted = false;
        if (tutorialData) {
          if (tutorialData.completed === true) {
            tutorialCompleted = true;
          } else if (tutorialData.currentStep >= TUTORIAL_MESSAGES.length - 1) {
            console.log('📝 마지막 단계까지 진행된 튜토리얼 자동 완료 처리:', uid);
            markTutorialCompleted(uid);
            tutorialCompleted = true;
          }
        }
        
        if (!tutorialCompleted) {
          console.log('📚 튜토리얼 시작 예정:', uid);
          setTimeout(() => {
            const chatBot = window.homeChatBot;
            if (chatBot) {
              startTutorial(uid, chatBot);
            } else {
              console.warn('⚠️ ChatBot 인스턴스를 찾을 수 없습니다.');
              const input = document.getElementById('home-chat-input');
              const sendButton = document.getElementById('home-chat-send');
              if (input) input.disabled = false;
              if (sendButton) sendButton.disabled = false;
            }
          }, 500);
        } else {
          console.log('✅ 튜토리얼이 이미 완료되어 스킵합니다:', uid);
          const input = document.getElementById('home-chat-input');
          const sendButton = document.getElementById('home-chat-send');
          if (input) input.disabled = false;
          if (sendButton) sendButton.disabled = false;
        }
        
        console.log('Firebase 사용자 데이터 로드 완료:', uid);
      }
    }
    
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
        firstEmotion: null,
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
              firstEmotion: null,
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
              window.character.firstEmotion = null;
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
              window.character.firstEmotion = null;
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
    
    // 홈 채팅 UI 설정
    if (window.character) {
      setupHomeChatUI(userData.uid, window.character);
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
    
    // 로그아웃 버튼 설정
    setupLogoutButton();
    
    // 일기 목록 버튼 설정
    setupDiaryListButton(userData.uid);
    
    // 채팅방 초기화
    setupChatRoom();
    
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
      logoutBtn.addEventListener('click', async () => {
        if (confirm('정말 로그아웃하시겠습니까?')) {
          try {
            // Firebase 로그아웃 시도
            await signOutUser();
            
            // 캐릭터 정리
            if (window.character) {
              window.character.stopAnimation();
              window.character = null;
            }
            
            // 인증 화면으로 전환
            const authContainer = document.getElementById('auth-container');
            const app = document.getElementById('app');
            if (authContainer && app) {
              authContainer.classList.remove('hidden');
              app.classList.add('hidden');
            }
            
            showToast('로그아웃되었습니다.', 3000, 'success');
            
            // 페이지 새로고침으로 완전히 초기화
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error) {
            console.error('로그아웃 실패:', error);
            showToast('로그아웃에 실패했습니다.', 3000, 'error');
          }
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
      logoutBtn.addEventListener('click', async () => {
        if (confirm('로그아웃 하시겠습니까?')) {
          try {
            // Firebase 로그아웃 시도
            await signOutUser();
            
            // 캐릭터 정리
            if (window.character) {
              window.character.stopAnimation();
              window.character = null;
            }
            
            // 인증 화면으로 전환
            const authContainer = document.getElementById('auth-container');
            const app = document.getElementById('app');
            if (authContainer && app) {
              authContainer.classList.remove('hidden');
              app.classList.add('hidden');
            }
            
            showToast('로그아웃되었습니다.', 3000, 'success');
            
            // 페이지 새로고침으로 완전히 초기화
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error) {
            console.error('로그아웃 실패:', error);
            showToast('로그아웃에 실패했습니다.', 3000, 'error');
          }
        }
      });
    }
    
    console.log('마이페이지 설정 완료');
    
  } catch (error) {
    console.error('마이페이지 설정 실패:', error);
  }
}

/**
 * 일기 목록 버튼 설정 및 자동 로드
 */
function setupDiaryListButton(uid) {
  const loadDiaryBtn = document.getElementById('load-diary-btn');
  const diaryListContainer = document.getElementById('diary-list');
  const diaryListContainerWrapper = document.querySelector('.diary-list-container');
  const toggleBtn = document.getElementById('diary-list-toggle');
  
  if (!loadDiaryBtn || !diaryListContainer) return;
  
  // 접기/펼치기 토글 기능
  if (toggleBtn) {
    // 기존 이벤트 리스너 제거 (중복 방지)
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
    
    newToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isCollapsed = diaryListContainer.classList.toggle('collapsed');
      newToggleBtn.classList.toggle('collapsed', isCollapsed);
      
      // 컨테이너도 함께 접기/펼치기
      if (diaryListContainerWrapper) {
        diaryListContainerWrapper.classList.toggle('collapsed', isCollapsed);
        
        // 접힘 상태일 때 diary-right를 중앙 정렬
        const diaryRight = document.querySelector('.diary-right');
        if (diaryRight) {
          if (isCollapsed) {
            diaryRight.style.justifyContent = 'center';
            diaryRight.style.alignItems = 'center';
          } else {
            diaryRight.style.justifyContent = '';
            diaryRight.style.alignItems = 'stretch';
          }
        }
      }
      
      console.log('일기 목록 토글:', isCollapsed ? '접기' : '펼치기');
    });
  }
  
  // 버튼 클릭 이벤트 (새로고침 기능)
  loadDiaryBtn.addEventListener('click', async () => {
    loadDiaryBtn.textContent = '로딩 중...';
    loadDiaryBtn.disabled = true;
    
    await loadDiaryList(uid);
    
    loadDiaryBtn.textContent = '새로고침';
    loadDiaryBtn.disabled = false;
  });
  
  // 일기 탭으로 전환될 때 자동 로드
  const diaryViewBtn = document.querySelector('[data-view="diary"]');
  if (diaryViewBtn) {
    diaryViewBtn.addEventListener('click', () => {
      setTimeout(() => loadDiaryList(uid), 100);
    });
  }
  
  // 초기 로드
  setTimeout(() => loadDiaryList(uid), 500);
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
      diaryListContainer.innerHTML = `
        <div class="diary-list-empty">
          <p style="font-size: 48px;">📝</p>
          <p>아직 작성한 일기가 없어요</p>
          <p style="font-size: 14px; margin-top: 8px;">일기를 작성하면 여기에 표시됩니다</p>
        </div>
      `;
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
    <div class="diary-item-header">
      <span class="diary-item-date">${dateStr}</span>
      <span class="diary-item-emotion">${emotionEmojis[diary.selectedEmotion] || '😊'}</span>
    </div>
    <p class="diary-item-preview">${preview}</p>
  `;
  
  // 아이템 클릭 시 상세보기
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
    // uid가 없으면 currentUser에서 가져오기
    if (!uid) {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.uid) {
          uid = currentUser.uid;
          console.log('renderFoodInventory: currentUser에서 uid를 가져왔습니다:', uid);
        } else {
          console.error('renderFoodInventory: uid가 없습니다!');
          return;
        }
      } catch (error) {
        console.error('renderFoodInventory: currentUser 로드 실패:', error);
        return;
      }
    }
    
    console.log('renderFoodInventory 호출:', { uid });
    
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
    console.log('renderFoodInventory: 인벤토리 로드 완료:', inventory.items);
    
    // 음식 목록 가져오기
    const foods = inventory.getAllFoods();
    console.log('renderFoodInventory: 음식 목록:', foods);
    
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

