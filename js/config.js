//대부분 AI 사용 
// 현재는 브라우저에서 직접 window.ENV 객체를 통해 접근하도록 구현

const firebaseConfig = {
  apiKey: window.ENV?.FIREBASE_API_KEY || "your_firebase_api_key",
  authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: window.ENV?.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || "your_sender_id",
  appId: window.ENV?.FIREBASE_APP_ID || "your_app_id"
};

// Firebase 앱 초기화
let app;
let auth;
let db;

// Firebase 모듈이 로드될 때까지 기다린 후 초기화
function initializeFirebase() {
  try {
    // window.firebaseModules에서 Firebase 함수들을 가져옴
    if (window.firebaseModules) {
      const { initializeApp, getAuth, getFirestore } = window.firebaseModules;
      
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      
      console.log('Firebase 초기화 성공');
      return true;
    } else {
      console.warn('Firebase 모듈이 아직 로드되지 않았습니다.');
      return false;
    }
  } catch (error) {
    console.error('Firebase 초기화 실패:', error);
    console.error('환경변수를 확인해주세요. window.ENV 객체에 Firebase 설정이 필요합니다.');
    
    // 기본값으로 빈 객체라도 export하여 앱이 크래시되지 않도록 함
    app = null;
    auth = null;
    db = null;
    return false;
  }
}

// Firebase 모듈 로드 이벤트 리스너
window.addEventListener('firebaseModulesLoaded', () => {
  console.log('Firebase 모듈 로드 이벤트 수신');
  initializeFirebase();
});

window.addEventListener('firebaseModulesFailed', (event) => {
  console.warn('Firebase 모듈 로드 실패:', event.detail);
  console.warn('데모 모드로 실행됩니다.');
});

// 페이지 로드 시 Firebase 모듈이 이미 로드되어 있는지 확인
if (window.firebaseModules) {
  console.log('Firebase 모듈이 이미 로드되어 있습니다.');
  initializeFirebase();
} else {
  console.log('Firebase 모듈 로드를 기다리는 중...');
}

// OpenAI API 키
// TODO: .env 파일에서 로드하도록 변경 필요
export const OPENAI_API_KEY = window.ENV?.OPENAI_API_KEY || "your_openai_api_key_here";

// Firebase 서비스 export
export { auth, db };

// 앱 인스턴스도 export (필요한 경우)
export { app };

// 설정 검증 함수
export const validateConfig = () => {
  const requiredKeys = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN', 
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'OPENAI_API_KEY'
  ];
  
  const missingKeys = requiredKeys.filter(key => !window.ENV?.[key]);
  
  if (missingKeys.length > 0) {
    console.warn('누락된 환경변수:', missingKeys);
    console.warn('window.ENV 객체에 다음 값들을 설정해주세요:', missingKeys);
    return false;
  }
  
  return true;
};

// 개발 환경에서 설정 상태 확인 (브라우저 환경에서는 항상 실행)
console.log('현재 Firebase 설정:', {
  apiKey: firebaseConfig.apiKey ? '설정됨' : '누락',
  authDomain: firebaseConfig.authDomain ? '설정됨' : '누락',
  projectId: firebaseConfig.projectId ? '설정됨' : '누락',
  storageBucket: firebaseConfig.storageBucket ? '설정됨' : '누락',
  messagingSenderId: firebaseConfig.messagingSenderId ? '설정됨' : '누락',
  appId: firebaseConfig.appId ? '설정됨' : '누락'
});

console.log('OpenAI API 키:', OPENAI_API_KEY ? '설정됨' : '누락');

