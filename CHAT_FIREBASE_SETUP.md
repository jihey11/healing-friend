# 채팅 기능 Firebase 설정 가이드

채팅 기능을 사용하려면 Firebase Realtime Database를 설정해야 합니다.

## 1. Firebase Console에서 Realtime Database 활성화

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택 (또는 새 프로젝트 생성)
3. 왼쪽 메뉴에서 **"Realtime Database"** 클릭
4. **"데이터베이스 만들기"** 클릭
5. 위치 선택 (가장 가까운 지역 선택)
6. 보안 규칙 설정:
   - **테스트 모드로 시작** 선택 (개발 중)
   - 또는 아래 규칙 사용:

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": true
    },
    "roomPasswords": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 2. Firebase 프로젝트 설정 정보 가져오기

1. Firebase Console에서 프로젝트 설정(⚙️) 클릭
2. **"내 앱"** 섹션에서 웹 앱 추가 (이미 있으면 스킵)
3. 설정 정보 복사:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## 3. Realtime Database URL 확인

1. Firebase Console에서 **"Realtime Database"** 메뉴로 이동
2. 데이터베이스 URL 확인 (예: `https://your-project-id-default-rtdb.firebaseio.com/`)

## 4. 프로젝트에 설정 추가

`public/index.html` 파일의 `window.ENV` 객체에 Firebase 설정을 추가하세요:

```javascript
window.ENV = {
    // 백엔드 API URL
    API_URL: "http://localhost:3000",
    
    // Firebase 설정
    FIREBASE_API_KEY: "AIzaSyBzthYnyx3fB-chKbfSvCXNzEZg1qVyZMo",
    FIREBASE_AUTH_DOMAIN: "your-project.firebaseapp.com",
    FIREBASE_PROJECT_ID: "your-project-id",
    FIREBASE_STORAGE_BUCKET: "your-project.appspot.com",
    FIREBASE_MESSAGING_SENDER_ID: "949516365646",
    FIREBASE_APP_ID: "1:949516365646:web:999615293f5c6fc117781f",
    
    // Realtime Database URL (중요!)
    FIREBASE_DATABASE_URL: "https://your-project-id-default-rtdb.firebaseio.com/"
};
```

## 5. 설정 예시 (chat-site-main 참고)

chat-site-main 폴더의 `script.js`를 참고하면 다음과 같은 설정을 사용할 수 있습니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBzthYnyx3fB-chKbfSvCXNzEZg1qVyZMo",
  authDomain: "chating-site-9f769.firebaseapp.com",
  projectId: "chating-site-9f769",
  storageBucket: "chating-site-9f769.firebasestorage.app",
  messagingSenderId: "949516365646",
  appId: "1:949516365646:web:999615293f5c6fc117781f",
  measurementId: "G-HQ2VES84BL"
};
```

이 설정을 `window.ENV`에 맞게 변환하면:

```javascript
window.ENV = {
    FIREBASE_API_KEY: "AIzaSyBzthYnyx3fB-chKbfSvCXNzEZg1qVyZMo",
    FIREBASE_AUTH_DOMAIN: "chating-site-9f769.firebaseapp.com",
    FIREBASE_PROJECT_ID: "chating-site-9f769",
    FIREBASE_STORAGE_BUCKET: "chating-site-9f769.firebasestorage.app",
    FIREBASE_MESSAGING_SENDER_ID: "949516365646",
    FIREBASE_APP_ID: "1:949516365646:web:999615293f5c6fc117781f",
    FIREBASE_DATABASE_URL: "https://chating-site-9f769-default-rtdb.firebaseio.com/"
};
```

## 6. 설정 확인

브라우저 콘솔을 열고 다음을 확인하세요:

1. `window.ENV` 객체가 올바르게 설정되었는지 확인
2. 채팅 탭을 클릭했을 때 "채팅 Firebase Realtime Database 초기화 성공" 메시지가 나오는지 확인
3. 에러가 발생하면 콘솔에서 확인

## 주의사항

- **보안**: 실제 배포 시에는 Firebase 보안 규칙을 더 엄격하게 설정하세요
- **비용**: Realtime Database는 사용량에 따라 비용이 발생할 수 있습니다
- **테스트**: 개발 중에는 테스트 모드로 시작하되, 프로덕션에서는 반드시 보안 규칙을 설정하세요

## 문제 해결

- "Firebase 설정이 없습니다" 메시지가 나오면: `window.ENV` 객체에 모든 Firebase 설정값이 있는지 확인
- "permission-denied" 오류가 나오면: Firebase Console에서 Realtime Database 보안 규칙 확인
- 데이터베이스 URL을 찾을 수 없으면: Firebase Console > Realtime Database에서 URL 확인


