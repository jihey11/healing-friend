# 🚀 Healing Friend 배포 가이드

## 📋 목차
1. [사전 준비](#사전-준비)
2. [Firebase 프로젝트 설정](#firebase-프로젝트-설정)
3. [백엔드 배포 (Firebase Functions)](#백엔드-배포)
4. [프론트엔드 배포 (Firebase Hosting)](#프론트엔드-배포)
5. [환경 변수 설정](#환경-변수-설정)
6. [배포 확인](#배포-확인)
7. [문제 해결](#문제-해결)

---

## 사전 준비

### 1. 필수 계정 및 도구

- **Firebase 계정** (https://console.firebase.google.com)
- **OpenAI 계정** (https://platform.openai.com)
- **Node.js 18 이상** 설치
- **Firebase CLI** 설치

### 2. Firebase CLI 설치

```bash
npm install -g firebase-tools
```

### 3. Firebase 로그인

```bash
firebase login
```

---

## Firebase 프로젝트 설정

### 1. Firebase 프로젝트 생성

1. Firebase Console 접속: https://console.firebase.google.com
2. **"프로젝트 추가"** 클릭
3. 프로젝트 이름 입력 (예: `healing-friend`)
4. Google Analytics 설정 (선택 사항)
5. 프로젝트 생성 완료

### 2. Firebase 서비스 활성화

#### Authentication
1. 좌측 메뉴 → **Authentication**
2. **"시작하기"** 클릭
3. 로그인 제공업체 설정:
   - **이메일/비밀번호** 활성화
   - (선택) Google, Facebook 등 추가

#### Firestore Database
1. 좌측 메뉴 → **Firestore Database**
2. **"데이터베이스 만들기"** 클릭
3. 위치 선택: **asia-northeast3 (서울)** 권장
4. 보안 규칙: **테스트 모드**로 시작 (나중에 수정)

#### Firebase Hosting
1. 좌측 메뉴 → **Hosting**
2. **"시작하기"** 클릭

---

## 백엔드 배포 (Firebase Functions)

### 1. Firebase 프로젝트 초기화

프로젝트 루트에서:

```bash
firebase init
```

설정 선택:
- ✅ Functions
- ✅ Hosting
- ✅ Firestore (이미 설정한 경우 건너뛰기)

**중요**: 
- Functions 언어: **JavaScript**
- ESLint: 선택 사항
- 의존성 설치: **Yes**
- Public directory: **public**
- Single-page app: **Yes**
- GitHub 자동 배포: **No** (선택 사항)

### 2. Firebase 프로젝트 ID 설정

`.firebaserc` 파일 수정:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

**프로젝트 ID 찾기**: Firebase Console → 프로젝트 설정 → 프로젝트 ID

### 3. 환경 변수 설정 (OpenAI API 키)

#### 방법 1: Firebase CLI 사용 (권장)

```bash
cd functions
firebase functions:secrets:set OPENAI_API_KEY
```

프롬프트가 나오면 OpenAI API 키 입력 후 Enter

#### 방법 2: .env 파일 사용 (로컬 테스트용)

```bash
cd functions
cp .env.example .env
```

`.env` 파일 편집:
```
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

⚠️ **주의**: `.env` 파일은 Git에 커밋하지 마세요! (이미 .gitignore에 추가됨)

### 4. Functions 의존성 설치

```bash
cd functions
npm install
```

### 5. Functions 배포

```bash
firebase deploy --only functions
```

배포 성공 시 다음과 같은 URL이 표시됩니다:
```
✔  functions[chat(asia-northeast3)]: Successful create operation.
✔  functions[analyzeDiaryEmotion(asia-northeast3)]: Successful create operation.
```

---

## 프론트엔드 배포 (Firebase Hosting)

### 1. Firebase 설정 업데이트

`public/index.html` 파일에서 Firebase 설정 업데이트:

```html
<script>
    window.ENV = {
        // Firebase 설정 (Firebase Console → 프로젝트 설정 → 앱에서 확인)
        FIREBASE_API_KEY: "your_actual_api_key",
        FIREBASE_AUTH_DOMAIN: "your-project.firebaseapp.com",
        FIREBASE_PROJECT_ID: "your-project-id",
        FIREBASE_STORAGE_BUCKET: "your-project.appspot.com",
        FIREBASE_MESSAGING_SENDER_ID: "your_sender_id",
        FIREBASE_APP_ID: "your_app_id",
        
        // OpenAI API 키는 더 이상 여기에 넣지 않습니다!
        // OPENAI_API_KEY: "" // ← 삭제됨
    };
</script>
```

**Firebase 설정 값 찾기**:
1. Firebase Console → 프로젝트 설정
2. "내 앱" 섹션으로 스크롤
3. "앱 추가" → "웹" 선택 (없는 경우)
4. 설정 값 복사

### 2. Hosting 배포

```bash
firebase deploy --only hosting
```

배포 성공 시 호스팅 URL이 표시됩니다:
```
✔  Deploy complete!

Hosting URL: https://your-project.web.app
```

### 3. 전체 배포 (Functions + Hosting)

한 번에 모두 배포하려면:

```bash
firebase deploy
```

---

## 환경 변수 설정

### OpenAI API 키 발급

1. https://platform.openai.com/api-keys 접속
2. **"Create new secret key"** 클릭
3. 키 이름 입력 (예: `healing-friend-prod`)
4. **복사** (다시 볼 수 없으므로 안전한 곳에 저장!)

### Firebase Functions에 API 키 설정

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

입력 프롬프트에 API 키 붙여넣기

### 환경 변수 확인

```bash
firebase functions:secrets:access OPENAI_API_KEY
```

---

## 배포 확인

### 1. Functions 동작 확인

Firebase Console → Functions로 이동하여:
- `chat` 함수 상태 확인
- `analyzeDiaryEmotion` 함수 상태 확인

### 2. 웹사이트 접속

배포된 URL로 접속:
```
https://your-project.web.app
```

### 3. 기능 테스트

1. **회원가입/로그인** 테스트
2. **일기 작성** 및 감정 분석 확인
3. **채팅** 기능 테스트
4. **게임** 기능 테스트

### 4. 로그 확인

문제 발생 시 로그 확인:

```bash
# Functions 로그
firebase functions:log

# 실시간 로그
firebase functions:log --only chat
```

또는 Firebase Console → Functions → 로그 탭

---

## 문제 해결

### 1. "unauthenticated" 오류

**원인**: Firebase Authentication이 제대로 설정되지 않음

**해결**:
1. Firebase Console → Authentication 확인
2. 이메일/비밀번호 로그인 활성화 확인
3. 로그아웃 후 다시 로그인

### 2. "OpenAI API 키 오류"

**원인**: API 키가 설정되지 않았거나 잘못됨

**해결**:
```bash
firebase functions:secrets:set OPENAI_API_KEY
```

올바른 API 키 재입력 후:
```bash
firebase deploy --only functions
```

### 3. "CORS 오류"

**원인**: Firebase Functions 리전 불일치

**해결**:
`public/index.html`에서 Functions 리전 설정:
```javascript
firebase.functions().useEmulator("localhost", 5001); // 로컬 테스트
// 또는
firebase.functions(); // 기본 리전 (us-central1)
```

리전이 `asia-northeast3`인 경우 자동으로 처리됨

### 4. "할당량 초과"

**원인**: OpenAI API 사용량 초과

**해결**:
1. OpenAI Console → Usage 확인
2. 결제 정보 업데이트
3. Rate Limit 설정

### 5. Functions 배포 실패

**원인**: Node.js 버전 불일치

**해결**:
```bash
# Node.js 버전 확인
node --version

# 18 이상이어야 함
# nvm 사용 시:
nvm use 18
```

---

## 비용 관리

### Firebase 무료 할당량

- **Cloud Functions**: 200만 호출/월
- **Hosting**: 10GB 저장, 360MB/일 전송
- **Firestore**: 50,000 읽기, 20,000 쓰기/일

### OpenAI API 비용

- **gpt-4o-mini**: $0.150/1M 입력 토큰, $0.600/1M 출력 토큰
- **예상 비용**: 사용자 100명 기준 월 $10-20

### 비용 알림 설정

1. Firebase Console → 예산 및 알림
2. 예산 설정 (예: $10/월)
3. 알림 임계값 설정 (50%, 90%, 100%)

---

## 보안 규칙 설정

### Firestore 보안 규칙

`firestore.rules` 파일:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 문서
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 일기
    match /diaries/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 채팅 기록
    match /chats/{userId}/messages/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

배포:
```bash
firebase deploy --only firestore:rules
```

---

## 추가 최적화

### 1. Firebase Hosting 캐싱

`firebase.json`에 추가:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=604800"
          }
        ]
      }
    ]
  }
}
```

### 2. Functions 메모리 최적화

`functions/index.js`에서:

```javascript
setGlobalOptions({
  region: 'asia-northeast3',
  maxInstances: 10,
  memory: '256MB', // 필요에 따라 조정
  timeoutSeconds: 60
});
```

---

## 모니터링

### Firebase Console

- **Performance Monitoring**: 성능 추적
- **Crashlytics**: 오류 보고
- **Analytics**: 사용자 행동 분석

### OpenAI Usage Dashboard

https://platform.openai.com/usage

- 일일/월별 사용량 확인
- 비용 추적
- Rate limit 모니터링

---

## 업데이트 및 재배포

### 코드 수정 후

```bash
# 변경사항 확인
git status

# 커밋
git add .
git commit -m "기능 개선"

# GitHub 푸시 (선택)
git push

# 배포
firebase deploy
```

### Functions만 업데이트

```bash
firebase deploy --only functions
```

### Hosting만 업데이트

```bash
firebase deploy --only hosting
```

---

## 도움말 및 참고 자료

- **Firebase 문서**: https://firebase.google.com/docs
- **OpenAI API 문서**: https://platform.openai.com/docs
- **Firebase Functions 가이드**: https://firebase.google.com/docs/functions
- **Firebase Hosting 가이드**: https://firebase.google.com/docs/hosting

---

## 지원

문제가 발생하면:
1. Firebase Console → Functions → 로그 확인
2. 브라우저 개발자 도구 → Console 확인
3. GitHub Issues에 문의

---

**축하합니다! 🎉**

Healing Friend가 성공적으로 배포되었습니다!

