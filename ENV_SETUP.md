# 🔧 환경 변수 설정 가이드

## 📋 필요한 환경 변수

### 백엔드 (Firebase Functions)

#### 1. OpenAI API 키

**functions/.env** (로컬 테스트용만)
```bash
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

**프로덕션 (Firebase Secrets 사용)**
```bash
firebase functions:secrets:set OPENAI_API_KEY
```

---

### 프론트엔드 (Firebase Hosting)

#### Firebase 설정

`public/index.html` 파일에서 설정:

```html
<script>
    window.ENV = {
        // Firebase Console → 프로젝트 설정 → 앱에서 값 복사
        FIREBASE_API_KEY: "AIza...",
        FIREBASE_AUTH_DOMAIN: "your-project.firebaseapp.com",
        FIREBASE_PROJECT_ID: "your-project-id",
        FIREBASE_STORAGE_BUCKET: "your-project.appspot.com",
        FIREBASE_MESSAGING_SENDER_ID: "123456789",
        FIREBASE_APP_ID: "1:123:web:abc"
    };
</script>
```

---

## 🔐 보안 주의사항

### ✅ 안전한 방법

1. **백엔드 API 키**: Firebase Secrets 사용
   ```bash
   firebase functions:secrets:set OPENAI_API_KEY
   ```

2. **프론트엔드 설정**: Firebase 설정은 공개 가능 (Firebase 자체 보안으로 보호)

3. **Git 관리**: `.env` 파일은 절대 커밋하지 않기
   ```
   # .gitignore에 이미 추가됨
   .env
   .env.local
   functions/.env
   ```

### ❌ 피해야 할 방법

1. **하드코딩**: 코드에 직접 API 키 작성
2. **GitHub에 업로드**: .env 파일 커밋
3. **클라이언트 노출**: OpenAI API 키를 프론트엔드에 포함

---

## 📝 OpenAI API 키 발급

1. https://platform.openai.com 접속
2. 로그인 후 **API Keys** 메뉴
3. **Create new secret key** 클릭
4. 이름 입력 (예: `healing-friend-prod`)
5. **복사** (다시 볼 수 없음!)
6. 안전한 곳에 저장

---

## 🔄 환경별 설정

### 로컬 개발

```bash
# functions/.env 파일 생성
cd functions
echo "OPENAI_API_KEY=your_key_here" > .env
```

### 프로덕션

```bash
# Firebase Secrets 설정
firebase functions:secrets:set OPENAI_API_KEY

# 배포 시 자동으로 주입됨
firebase deploy --only functions
```

---

## ✅ 설정 확인

### 로컬 테스트

```bash
# 에뮬레이터 실행
firebase emulators:start

# Functions 로그 확인
# 브라우저에서 http://localhost:5000 접속
```

### 프로덕션 확인

```bash
# Functions 로그
firebase functions:log

# 실시간 로그
firebase functions:log --only chat
```

---

## 🆘 문제 해결

### "API 키 없음" 오류

```bash
# Secrets 다시 설정
firebase functions:secrets:set OPENAI_API_KEY

# Functions 재배포
firebase deploy --only functions
```

### "unauthenticated" 오류

- Firebase Authentication 설정 확인
- 이메일/비밀번호 로그인 활성화 확인
- 로그아웃 후 재로그인

---

## 📚 참고 자료

- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env?gen=2nd#secret-manager)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Firebase Console](https://console.firebase.google.com)

