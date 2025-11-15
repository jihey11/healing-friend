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
    const firebaseAuth = getFirebaseAuth();
    
    // Firebase가 초기화되어 있는지 확인
    if (!firebaseAuth || !auth) {
      throw new Error('Firebase가 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
    }
    
    // Firebase 인증 사용
    const { createUserWithEmailAndPassword } = firebaseAuth;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Firestore에 사용자 데이터 저장
    if (db && window.firebaseModules) {
      const { setDoc, doc, serverTimestamp } = window.firebaseModules;
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        nickname: nickname,
        characterName: characterName,
        level: 1,
        exp: 0,
        evolutionStage: 0,
        dominantEmotion: null,
        emotionScores: {
          기쁨: 0,
          슬픔: 0,
          분노: 0,
          두려움: 0,
          놀람: 0,
          혐오: 0
        },
        createdAt: serverTimestamp()
      });
    }
    
    console.log('회원가입 성공:', user.uid);
    return true;
    
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
}

// 로그인 함수
export async function signIn(email, password, rememberMe = false) {
  try {
    const firebaseAuth = getFirebaseAuth();
    
    // Firebase가 초기화되어 있는지 확인
    if (!firebaseAuth || !auth) {
      throw new Error('Firebase가 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
    }
    
    // Firebase 인증 사용
    const { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } = firebaseAuth;
    
    // persistence 설정: 로그인 유지하면 LOCAL, 아니면 SESSION
    if (rememberMe) {
      await setPersistence(auth, browserLocalPersistence);
      localStorage.setItem('rememberMe', 'true');
      console.log('로그인 유지 설정: LOCAL (브라우저 닫아도 유지)');
    } else {
      await setPersistence(auth, browserSessionPersistence);
      localStorage.removeItem('rememberMe');
      console.log('로그인 유지 해제: SESSION (브라우저 닫으면 로그아웃)');
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('로그인 성공:', user.uid);
    return true;
    
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
}

// 로그아웃 함수
export async function signOutUser() {
  try {
    const firebaseAuth = getFirebaseAuth();
    
    if (!firebaseAuth || !auth) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }
    
    const { signOut } = firebaseAuth;
    await signOut(auth);
    
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('currentUser');
    console.log('로그아웃 성공');
    return true;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    return false;
  }
}

// 인증 상태 변경 감지
export function setupAuthStateListener(callback) {
  const firebaseAuth = getFirebaseAuth();
  
  if (!firebaseAuth || !auth) {
    console.error('Firebase가 초기화되지 않았습니다.');
    callback(null);
    return () => {};
  }
  
  const { onAuthStateChanged } = firebaseAuth;
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
      
      try {
        const success = await signIn(email, password, rememberMe);
        if (!success) {
          showAuthError('login-error', '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        }
      } catch (error) {
        const errorMsg = getErrorMessage(error);
        showAuthError('login-error', errorMsg);
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
      
      try {
        const success = await signUp(email, password, nickname, characterName);
        if (success) {
          // 회원가입 성공 시 자동 로그인 처리는 setupAuthStateListener에서 처리됨
        }
      } catch (error) {
        const errorMsg = getErrorMessage(error);
        showAuthError('signup-error', errorMsg);
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

