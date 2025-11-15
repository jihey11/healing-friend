# Firebase 설정 단계별 가이드 (실전)

## 현재 상태
- ✅ Firebase 모듈은 이미 로드됨
- ❌ `window.ENV` 객체의 Firebase 설정 값들이 비어있음

## 해결 방법

### 1단계: Firebase Console 접속
1. 브라우저에서 [Firebase Console](https://console.firebase.google.com/) 접속
2. Google 계정으로 로그인
3. **"healing-friend"** 프로젝트 선택

### 2단계: 웹 앱 설정 정보 가져오기
1. Firebase Console 왼쪽 상단 **⚙️ (톱니바퀴 아이콘)** 클릭
2. **"프로젝트 설정"** 클릭
3. 아래로 스크롤하여 **"내 앱"** 섹션 찾기
4. 웹 앱이 있는지 확인:
   - **없으면**: **"</>"** 또는 **"웹 앱 추가"** 클릭 → 앱 닉네임 입력 → **"앱 등록"**
   - **있으면**: 해당 웹 앱 클릭
5. **"Firebase SDK snippet"** → **"Config"** 탭 클릭
6. 다음과 같은 코드가 보입니다:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "healing-friend.firebaseapp.com",
     projectId: "healing-friend",
     storageBucket: "healing-friend.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef..."
   };
   ```

### 3단계: index.html 파일 수정
1. `public/index.html` 파일을 열기
2. **34-39번째 줄** 찾기:
   ```javascript
   FIREBASE_API_KEY: "",
   FIREBASE_AUTH_DOMAIN: "",
   FIREBASE_PROJECT_ID: "healing-friend",
   FIREBASE_STORAGE_BUCKET: "",
   FIREBASE_MESSAGING_SENDER_ID: "",
   FIREBASE_APP_ID: "",
   ```
3. 2단계에서 복사한 값들을 각각 붙여넣기:
   ```javascript
   FIREBASE_API_KEY: "AIzaSy...",  // firebaseConfig의 apiKey 값
   FIREBASE_AUTH_DOMAIN: "healing-friend.firebaseapp.com",  // firebaseConfig의 authDomain 값
   FIREBASE_PROJECT_ID: "healing-friend",  // 이미 있음
   FIREBASE_STORAGE_BUCKET: "healing-friend.appspot.com",  // firebaseConfig의 storageBucket 값
   FIREBASE_MESSAGING_SENDER_ID: "123456789",  // firebaseConfig의 messagingSenderId 값
   FIREBASE_APP_ID: "1:123456789:web:abcdef...",  // firebaseConfig의 appId 값
   ```

### 4단계: Realtime Database 확인
1. Firebase Console 왼쪽 메뉴에서 **"Realtime Database"** 클릭
2. 데이터베이스가 없으면:
   - **"데이터베이스 만들기"** 클릭
   - 위치 선택 (가장 가까운 지역)
   - **"테스트 모드로 시작"** 선택
3. 데이터베이스 URL 확인:
   - 상단에 표시된 URL 확인
   - 예: `https://healing-friend-default-rtdb.firebaseio.com/`
4. `index.html`의 43번째 줄 확인:
   ```javascript
   FIREBASE_DATABASE_URL: "https://healing-friend-default-rtdb.firebaseio.com/"
   ```
   - 이미 올바른 URL이 있으면 그대로 사용
   - 다르면 실제 URL로 수정

### 5단계: 파일 저장 및 확인
1. `index.html` 파일 저장
2. 브라우저에서 페이지 새로고침 (F5 또는 Ctrl+R)
3. 개발자 도구 콘솔 열기 (F12)
4. 다음 메시지 확인:
   - ✅ "Firebase 모듈 로드 완료"
   - ✅ "Firebase 초기화 성공"
   - ✅ "채팅 Firebase Realtime Database 초기화 성공"
5. 채팅 탭 클릭하여 채팅 기능이 작동하는지 확인

## 예시 (실제 값으로 교체 필요)
```javascript
window.ENV = {
    API_URL: "http://localhost:3000",
    
    // Firebase 설정 (Firebase Console에서 가져온 실제 값)
    FIREBASE_API_KEY: "AIzaSyBzthYnyx3fB-chKbfSvCXNzEZg1qVyZMo",
    FIREBASE_AUTH_DOMAIN: "healing-friend.firebaseapp.com",
    FIREBASE_PROJECT_ID: "healing-friend",
    FIREBASE_STORAGE_BUCKET: "healing-friend.appspot.com",
    FIREBASE_MESSAGING_SENDER_ID: "949516365646",
    FIREBASE_APP_ID: "1:949516365646:web:999615293f5c6fc117781f",
    
    // Realtime Database URL
    FIREBASE_DATABASE_URL: "https://healing-friend-default-rtdb.firebaseio.com/"
};
```

## 주의사항
- 모든 값은 **따옴표(`"`)** 안에 넣어야 합니다
- 값 앞뒤에 공백이 없어야 합니다
- 마지막 항목 뒤에는 쉼표(`,`)가 없어야 합니다
- Firebase Console에서 복사한 값과 정확히 일치해야 합니다

## 문제 해결
- **"Firebase 설정이 없습니다"** 메시지가 계속 나오면:
  - `FIREBASE_API_KEY`가 비어있지 않은지 확인
  - 브라우저 콘솔에서 `window.ENV` 객체 확인
  - 파일 저장 후 하드 리프레시 (Ctrl+Shift+R)

- **"permission-denied"** 오류가 나오면:
  - Firebase Console > Realtime Database > 규칙 탭
  - 테스트 모드로 설정되어 있는지 확인

