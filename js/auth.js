//대부분 AI 사용

import { auth, db } from './config.js';

// Firebase 함수들을 동적으로 가져오는 헬퍼 함수들
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

// 에러 코드 한글 매핑
const errorMessages = {
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
  'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
  'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
  'auth/user-not-found': '존재하지 않는 계정입니다.',
  'auth/wrong-password': '비밀번호가 일치하지 않습니다.',
  'auth/too-many-requests': '너무 많은 시도로 인해 일시적으로 차단되었습니다.',
  'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
  'auth/user-disabled': '비활성화된 계정입니다.'
};

// 회원가입 함수
export async function signUp(email, password, nickname, characterName) {
  try {
    // Firebase 초기화 확인 - 현재는 데모 모드만 지원
    console.warn('Firebase 설정이 유효하지 않습니다. 데모 모드로 실행합니다.');
    
    // 데모 모드에서는 로컬 스토리지에 사용자 정보 저장
    const demoUser = {
      uid: 'demo_' + Date.now(),
      email: email,
      nickname: nickname,
      characterName: characterName,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    console.log('데모 모드 회원가입 성공:', demoUser.uid);
    return true;
    
  } catch (error) {
    console.error('회원가입 실패:', error);
    return false;
  }
}

// 로그인 함수
export async function signIn(email, password, rememberMe = false) {
  try {
    // 현재는 데모 모드만 지원
    console.warn('Firebase 설정이 유효하지 않습니다. 데모 모드로 실행합니다.');
    
    // 데모 모드에서는 로컬 스토리지에서 사용자 정보 확인
    const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
    if (demoUser.email === email) {
      // 자동 로그인 설정
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      console.log('데모 모드 로그인 성공:', demoUser.uid);
      return true;
    } else {
      console.log('데모 모드: 등록되지 않은 사용자');
      return false;
    }
    
  } catch (error) {
    console.error('로그인 실패:', error);
    return false;
  }
}

// 로그아웃 함수
export async function signOutUser() {
  try {
    await signOut(auth);
    localStorage.removeItem('rememberMe');
    console.log('로그아웃 성공');
    return true;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    return false;
  }
}

// 인증 상태 변경 감지
export function setupAuthStateListener(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('사용자 로그인됨:', user.uid);
      callback(user);
    } else {
      console.log('사용자 로그아웃됨');
      callback(null);
    }
  });
}

// UI 이벤트 리스너 설정
export function setupAuthUI() {
  // 탭 전환
  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  
  if (loginTab && signupTab && loginForm && signupForm) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
      clearAuthError('login-error');
      clearAuthError('signup-error');
    });
    
    signupTab.addEventListener('click', () => {
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      clearAuthError('login-error');
      clearAuthError('signup-error');
    });
  }
  
  // 로그인 폼 제출
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthError('login-error');
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const rememberMe = document.getElementById('remember-me').checked;
      
      if (!email || !password) {
        showAuthError('login-error', '이메일과 비밀번호를 입력해주세요.');
        return;
      }
      
      const success = await signIn(email, password, rememberMe);
      if (!success) {
        showAuthError('login-error', '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      }
    });
  }
  
  // 회원가입 폼 제출
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthError('signup-error');
      
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm').value;
      const nickname = document.getElementById('signup-nickname').value;
      const characterName = document.getElementById('signup-character-name').value;
      
      // 유효성 검사
      if (!email || !password || !confirmPassword || !nickname || !characterName) {
        showAuthError('signup-error', '모든 필드를 입력해주세요.');
        return;
      }
      
      if (password !== confirmPassword) {
        showAuthError('signup-error', '비밀번호가 일치하지 않습니다.');
        return;
      }
      
      if (password.length < 6) {
        showAuthError('signup-error', '비밀번호는 6자 이상이어야 합니다.');
        return;
      }
      
      if (nickname.length > 10) {
        showAuthError('signup-error', '닉네임은 10자 이하여야 합니다.');
        return;
      }
      
      if (characterName.length > 10) {
        showAuthError('signup-error', '캐릭터 이름은 10자 이하여야 합니다.');
        return;
      }
      
      const success = await signUp(email, password, nickname, characterName);
      if (!success) {
        showAuthError('signup-error', '회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    });
  }
}

// 에러 메시지 표시
export function showAuthError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

// 에러 메시지 초기화
export function clearAuthError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
}

// Firebase 에러를 한글 메시지로 변환
export function getErrorMessage(error) {
  const code = error.code || error;
  return errorMessages[code] || '오류가 발생했습니다. 다시 시도해주세요.';
}

// 현재 사용자 정보 가져오기
export function getCurrentUser() {
  return auth.currentUser;
}

// 자동 로그인 확인
export function shouldRememberUser() {
  return localStorage.getItem('rememberMe') === 'true';
}

// 사용자 데이터 가져오기 (Firestore)
export async function getUserData(uid) {
  try {
    if (!window.firebaseModules || !db) {
      console.warn('Firebase가 초기화되지 않았습니다.');
      return null;
    }
    
    const { getDoc, doc } = window.firebaseModules;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('사용자 데이터 가져오기 실패:', error);
    return null;
  }
}

