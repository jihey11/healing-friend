# Firebase 웹 앱 설정 정보 찾는 방법

## 단계별 가이드

### 1. Firebase Console 접속
1. 브라우저에서 [Firebase Console](https://console.firebase.google.com/) 접속
2. 로그인 (Google 계정)

### 2. 프로젝트 선택
1. 상단에서 "healing-friend" 프로젝트 선택

### 3. 프로젝트 설정 열기
1. Firebase Console 왼쪽 상단에 있는 **⚙️ (톱니바퀴) 아이콘** 클릭
2. 또는 화면 왼쪽 아래에 있는 **"프로젝트 설정"** 메뉴 클릭

### 4. 웹 앱 확인/추가
1. 설정 페이지에서 **"내 앱"** 섹션 찾기
2. 웹 앱이 있는지 확인:
   - **웹 앱이 없으면:**
     - **"웹 앱 추가"** 또는 **"</>"** 아이콘 클릭
     - 앱 닉네임 입력 (예: "healing-friend-web")
     - "이 앱에 Firebase Hosting도 설정하시겠습니까?" → 체크 해제 (선택사항)
     - **"앱 등록"** 클릭
   
   - **웹 앱이 이미 있으면:**
     - 웹 앱 목록에서 해당 앱 클릭

### 5. 설정 정보 확인
웹 앱을 추가하거나 선택하면 다음과 같은 설정 정보가 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "healing-friend.firebaseapp.com",
  projectId: "healing-friend",
  storageBucket: "healing-friend.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 6. 각 값의 위치
- **apiKey**: `apiKey` 필드의 값
- **authDomain**: `authDomain` 필드의 값
- **projectId**: `projectId` 필드의 값 (이미 "healing-friend"로 알고 있음)
- **storageBucket**: `storageBucket` 필드의 값
- **messagingSenderId**: `messagingSenderId` 필드의 값
- **appId**: `appId` 필드의 값

### 7. 스크린샷 참고 위치
설정 정보는 보통 다음과 같은 형태로 표시됩니다:

```
Firebase SDK snippet
> npm
> Config

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  ...
};
```

이 부분에서 각 값을 복사하면 됩니다.

## 주의사항
- 설정 정보는 프로젝트마다 다릅니다
- 다른 프로젝트의 설정 정보를 사용하면 안 됩니다
- `healing-friend` 프로젝트의 설정 정보만 사용하세요


