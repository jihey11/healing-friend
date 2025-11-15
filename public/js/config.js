// Firebase 설정
// TODO: 실제 배포 시에는 .env 파일에서 환경변수를 로드해야 합니다.
// 현재는 개발 단계이므로 직접 값을 입력하거나 window.ENV 객체를 사용합니다.
// 
// .env 파일 사용 방법:
// 1. .env 파일에 실제 Firebase 설정값들을 입력
// 2. Vite나 Webpack 등의 번들러에서 환경변수 로드
// 3. import.meta.env.VITE_FIREBASE_API_KEY 형태로 접근
//
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

// Firebase 설정이 유효한지 확인하는 함수
function isFirebaseConfigValid() {
  return !!(
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== "your_firebase_api_key" &&
    firebaseConfig.authDomain && 
    firebaseConfig.authDomain !== "your-project.firebaseapp.com" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "your-project-id"
  );
}

// Firebase 모듈이 로드될 때까지 기다린 후 초기화
function initializeFirebase() {
  try {
    // Firebase 설정이 유효한지 먼저 확인
    if (!isFirebaseConfigValid()) {
      console.warn('Firebase 설정이 유효하지 않습니다. 데모 모드로 실행됩니다.');
      app = null;
      auth = null;
      db = null;
      return false;
    }
    
    // window.firebaseModules에서 Firebase 함수들을 가져옴
    if (window.firebaseModules) {
      const { initializeApp, getApp, getApps, getAuth, getFirestore } = window.firebaseModules;
      
      // 이미 초기화된 앱이 있는지 확인
      try {
        const getAppsFunc = getApps || (() => []);
        const existingApps = getAppsFunc();
        
        if (existingApps.length > 0) {
          // 기존 앱 재사용
          app = existingApps[0];
          console.log('기존 Firebase 앱 재사용 (config.js)');
        } else {
          // 새 앱 생성
          app = initializeApp(firebaseConfig);
          console.log('새 Firebase 앱 생성 (config.js)');
        }
        
        auth = getAuth(app);
        db = getFirestore(app);
        
        console.log('Firebase 초기화 성공');
        return true;
      } catch (error) {
        // 중복 앱 오류인 경우 기존 앱 재사용
        if (error.code === 'app/duplicate-app' || error.message?.includes('already exists')) {
          try {
            const getAppFunc = getApp || (() => null);
            app = getAppFunc('[DEFAULT]');
            if (app) {
              auth = getAuth(app);
              db = getFirestore(app);
              console.log('중복 앱 오류 해결: 기존 앱 재사용 (config.js)');
              return true;
            }
          } catch (retryError) {
            console.error('Firebase 앱 재사용 실패:', retryError);
          }
        }
        throw error;
      }
    } else {
      console.warn('Firebase 모듈이 아직 로드되지 않았습니다.');
      return false;
    }
  } catch (error) {
    console.error('Firebase 초기화 실패:', error);
    console.warn('데모 모드로 전환합니다.');
    
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
  // Firebase 설정이 유효한 경우에만 초기화 시도
  if (isFirebaseConfigValid()) {
    initializeFirebase();
  } else {
    console.warn('Firebase 설정이 유효하지 않습니다. 데모 모드로 실행됩니다.');
  }
});

window.addEventListener('firebaseModulesFailed', (event) => {
  console.warn('Firebase 모듈 로드 실패:', event.detail);
  console.warn('데모 모드로 실행됩니다.');
});

// 페이지 로드 시 Firebase 모듈이 이미 로드되어 있는지 확인
if (isFirebaseConfigValid()) {
  if (window.firebaseModules) {
    console.log('Firebase 모듈이 이미 로드되어 있습니다.');
    initializeFirebase();
  } else {
    console.log('Firebase 모듈 로드를 기다리는 중...');
  }
} else {
  console.warn('Firebase 설정이 없습니다. 데모 모드로 실행됩니다.');
}

// 주의: OpenAI API 키는 프론트엔드에서 사용하지 않습니다!
// 모든 AI 호출은 백엔드 서버를 통해 이루어집니다.
// API_URL은 window.ENV.API_URL을 통해 접근하세요.

// Firebase Firestore 인스턴스 가져오기 함수
// 다른 파일들과의 호환성을 위해 window.firebaseModules를 반환
export function getFirebaseFirestore() {
  try {
    if (window.firebaseModules) {
      return window.firebaseModules;
    }
    console.warn('Firebase 모듈이 로드되지 않았습니다.');
    return null;
  } catch (error) {
    console.error('getFirebaseFirestore 오류:', error);
    return null;
  }
}

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
    'FIREBASE_APP_ID'
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

console.log('Backend API URL:', window.ENV?.API_URL ? '설정됨' : '누락');

