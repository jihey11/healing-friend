# Firebase 설정 가이드 (간단 버전)

## 📋 설정 순서

### 1️⃣ Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. Google 계정으로 로그인
3. **"healing-friend"** 프로젝트 선택

### 2️⃣ 웹 앱 설정 정보 가져오기
1. 왼쪽 상단 **⚙️ (톱니바퀴 아이콘)** 클릭 → **"프로젝트 설정"**
2. **"내 앱"** 섹션에서 웹 앱 확인
   - 웹 앱이 없으면: **"</>"** 또는 **"웹 앱 추가"** 클릭 → 앱 등록
   - 웹 앱이 있으면: 해당 앱 클릭
3. **"Firebase SDK snippet"** → **"Config"** 탭에서 다음 값들을 복사:
   ```javascript
   apiKey: "AIzaSy..."
   authDomain: "healing-friend.firebaseapp.com"
   projectId: "healing-friend"
   storageBucket: "healing-friend.appspot.com"
   messagingSenderId: "123456789"
   appId: "1:123456789:web:abcdef..."
   ```

### 3️⃣ Realtime Database URL 확인
1. Firebase Console 왼쪽 메뉴에서 **"Realtime Database"** 클릭
2. 데이터베이스가 없으면:
   - **"데이터베이스 만들기"** 클릭
   - 위치 선택 (가장 가까운 지역)
   - **"테스트 모드로 시작"** 선택
3. 데이터베이스 URL 확인:
   - 예: `https://healing-friend-default-rtdb.firebaseio.com/`
   - 상단에 표시된 URL을 복사

### 4️⃣ 프로젝트 파일에 설정 추가
`public/index.html` 파일을 열고, 34-39번째 줄의 빈 값들을 채워주세요:

```javascript
window.ENV = {
    // 백엔드 API URL
    API_URL: "http://localhost:3000",
    
    // Firebase 설정 (2단계에서 복사한 값들)
    FIREBASE_API_KEY: "여기에 apiKey 값 붙여넣기",
    FIREBASE_AUTH_DOMAIN: "여기에 authDomain 값 붙여넣기",
    FIREBASE_PROJECT_ID: "healing-friend",
    FIREBASE_STORAGE_BUCKET: "여기에 storageBucket 값 붙여넣기",
    FIREBASE_MESSAGING_SENDER_ID: "여기에 messagingSenderId 값 붙여넣기",
    FIREBASE_APP_ID: "여기에 appId 값 붙여넣기",
    
    // Realtime Database URL (3단계에서 확인한 URL)
    FIREBASE_DATABASE_URL: "https://healing-friend-default-rtdb.firebaseio.com/"
};
```

### 5️⃣ 설정 확인
1. 파일 저장
2. 브라우저에서 페이지 새로고침 (F5 또는 Ctrl+R)
3. 채팅 탭 클릭
4. 콘솔에서 다음 메시지 확인:
   - ✅ "Firebase 모듈 로드 완료"
   - ✅ "채팅 Firebase Realtime Database 초기화 성공"

## ⚠️ 주의사항
- 모든 값은 따옴표(`"`) 안에 넣어주세요
- 마지막에 쉼표(`,`)가 있는지 확인하세요
- Realtime Database가 활성화되어 있어야 합니다

## 🔧 문제 해결
- **"Firebase 설정이 없습니다"** 메시지가 나오면:
  - `window.ENV` 객체에 모든 값이 제대로 입력되었는지 확인
  - 따옴표가 빠지지 않았는지 확인
  
- **"permission-denied"** 오류가 나오면:
  - Firebase Console > Realtime Database > 규칙 탭
  - 테스트 모드로 설정되어 있는지 확인

- **데이터베이스 URL을 찾을 수 없으면:**
  - Firebase Console > Realtime Database 메뉴로 이동
  - 상단에 표시된 URL 확인

