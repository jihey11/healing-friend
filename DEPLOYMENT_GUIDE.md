# 🚀 Healing Friend 배포 가이드 (Railway + Netlify)

## 📋 아키텍처 개요

```
┌─────────────┐      HTTPS       ┌──────────────┐      OpenAI API    ┌──────────┐
│  Netlify    │ ────────────────> │   Railway    │ ─────────────────> │  OpenAI  │
│ (프론트엔드)  │   API 요청       │  (백엔드)     │    API 호출         │   API    │
└─────────────┘                  └──────────────┘                    └──────────┘
      │                                  │
      │                                  │
      └───────────── Firebase ───────────┘
           (Auth + Firestore)
```

- **프론트엔드**: Netlify (정적 호스팅)
- **백엔드**: Railway (Express.js 서버)
- **AI API**: OpenAI (백엔드에서만 호출)
- **인증/DB**: Firebase (Auth + Firestore)

---

## 🎯 배포 순서

1. **백엔드 배포** (Railway) ← 먼저!
2. **프론트엔드 배포** (Netlify)
3. **환경 변수 설정**
4. **테스트 및 확인**

---

# 📦 Part 1: 백엔드 배포 (Railway)

## Step 1: Railway 계정 생성 및 프로젝트 준비

### 1-1. Railway 가입
1. https://railway.app 접속
2. **"Start a New Project"** 클릭
3. GitHub 계정으로 로그인

### 1-2. GitHub 저장소 연결
1. Railway 대시보드에서 **"Deploy from GitHub repo"** 선택
2. **"healing-friend"** 저장소 선택
3. **Root Directory**: `backend` 입력 (중요!)

## Step 2: 환경 변수 설정

Railway 프로젝트 → **Variables** 탭:

```bash
# 필수 환경 변수
OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-netlify-app.netlify.app
```

### 환경 변수 설명:
- `OPENAI_API_KEY`: OpenAI API 키 (https://platform.openai.com/api-keys)
- `NODE_ENV`: 환경 설정 (production)
- `PORT`: Railway가 자동 할당 (3000으로 설정)
- `FRONTEND_URL`: Netlify 배포 후 URL 입력 (처음엔 `*`로 설정 가능)

## Step 3: 배포 설정 확인

Railway는 자동으로 감지하지만, 수동 설정이 필요한 경우:

**Settings** → **Deploy** 섹션:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Watch Paths**: `backend/**`

## Step 4: 배포 실행

1. **"Deploy"** 버튼 클릭
2. 배포 로그 확인
3. 배포 완료 후 **URL 복사** (예: `https://your-app.railway.app`)

### 배포 확인:
```bash
# 헬스 체크
curl https://your-app.railway.app/api/health

# 응답 예시:
{
  "status": "healthy",
  "timestamp": "2025-10-23T..."
}
```

## Step 5: 도메인 설정 (선택)

**Settings** → **Domains**:
- Railway 기본 도메인 사용 또는
- 커스텀 도메인 연결 가능

---

# 🌐 Part 2: 프론트엔드 배포 (Netlify)

## Step 1: Netlify 계정 생성 및 사이트 생성

### 1-1. Netlify 가입
1. https://netlify.com 접속
2. **"Sign up"** 클릭
3. GitHub 계정으로 로그인

### 1-2. 새 사이트 생성
1. **"Add new site"** → **"Import an existing project"**
2. **GitHub** 선택
3. **"healing-friend"** 저장소 선택

## Step 2: 빌드 설정

**Site settings** → **Build & deploy**:

```
Base directory: (비워두기)
Build command: echo 'No build required'
Publish directory: public
```

또는 `netlify.toml` 파일이 자동으로 인식됩니다.

## Step 3: 환경 변수 설정

**Site settings** → **Environment variables**:

```bash
API_URL=https://your-backend-url.railway.app
```

⚠️ **중요**: Railway 배포 URL을 정확히 입력하세요!

## Step 4: Deploy 설정

1. **"Deploy site"** 클릭
2. 배포 진행 상황 확인
3. 배포 완료 후 **URL 확인** (예: `https://your-app.netlify.app`)

## Step 5: index.html 환경 변수 업데이트

배포 후, `public/index.html` 파일의 API_URL을 수정하고 재배포:

```html
<script>
    window.ENV = {
        // Railway 백엔드 URL로 변경
        API_URL: "https://your-actual-backend.railway.app",
        
        // Firebase 설정 (실제 값으로 변경)
        FIREBASE_API_KEY: "your_actual_firebase_api_key",
        FIREBASE_AUTH_DOMAIN: "your-project.firebaseapp.com",
        FIREBASE_PROJECT_ID: "your-project-id",
        // ...
    };
</script>
```

변경 후:
```bash
git add public/index.html
git commit -m "Update API_URL for production"
git push
```

Netlify가 자동으로 재배포합니다.

## Step 6: 커스텀 도메인 설정 (선택)

**Site settings** → **Domain management**:
- Netlify 서브도메인 변경 또는
- 커스텀 도메인 연결

---

# 🔐 Part 3: CORS 및 보안 설정

## Railway 백엔드 환경 변수 업데이트

Netlify 배포 URL을 받은 후, Railway 환경 변수를 업데이트:

```bash
FRONTEND_URL=https://your-actual-app.netlify.app
```

이렇게 하면 백엔드가 특정 프론트엔드만 허용합니다.

---

# ✅ Part 4: 배포 확인 및 테스트

## 4-1. 백엔드 API 테스트

```bash
# 헬스 체크
curl https://your-backend.railway.app/api/health

# 채팅 API 테스트
curl -X POST https://your-backend.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "안녕"}],
    "characterLevel": 1,
    "characterStage": 0
  }'
```

## 4-2. 프론트엔드 테스트

1. Netlify URL 접속
2. 회원가입/로그인
3. 일기 작성 → 감정 분석 확인
4. 채팅 → AI 응답 확인
5. 게임 플레이

## 4-3. 브라우저 콘솔 확인

개발자 도구 (F12) → Console 탭:
- ✅ 오류 없는지 확인
- ✅ API 호출 성공 확인
- ✅ Network 탭에서 Railway API 호출 확인

---

# 🔄 Part 5: 업데이트 및 재배포

## 백엔드 업데이트

```bash
# 코드 수정 후
cd backend
git add .
git commit -m "백엔드 기능 개선"
git push
```

Railway가 자동으로 재배포합니다.

## 프론트엔드 업데이트

```bash
# 코드 수정 후
cd public
git add .
git commit -m "프론트엔드 UI 개선"
git push
```

Netlify가 자동으로 재배포합니다.

---

# 🆘 문제 해결

## 백엔드 문제

### "API 호출 실패" 오류
**원인**: CORS 설정 문제

**해결**:
1. Railway → Variables → `FRONTEND_URL` 확인
2. Netlify URL과 정확히 일치하는지 확인
3. 백엔드 재배포

### "OpenAI API 키 오류"
**원인**: 환경 변수 미설정

**해결**:
1. Railway → Variables → `OPENAI_API_KEY` 확인
2. OpenAI 대시보드에서 키 유효성 확인
3. 새 키 발급 후 재설정

### 배포 실패
**원인**: 의존성 설치 실패

**해결**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
git add .
git commit -m "Update dependencies"
git push
```

## 프론트엔드 문제

### "백엔드 연결 실패"
**원인**: API_URL 잘못 설정

**해결**:
1. `public/index.html`의 `API_URL` 확인
2. Railway URL과 정확히 일치하는지 확인
3. 재배포

### Firebase 인증 오류
**원인**: Firebase 설정 누락

**해결**:
1. Firebase Console → 프로젝트 설정
2. `public/index.html`에 올바른 Firebase 설정 입력
3. 재배포

---

# 📊 모니터링

## Railway 로그 확인

Railway 프로젝트 → **Deployments** → 최신 배포 → **View Logs**

## Netlify 로그 확인

Netlify 사이트 → **Deploys** → 최신 배포 → **Deploy log**

## OpenAI 사용량 확인

https://platform.openai.com/usage

---

# 💰 비용 관리

## Railway 무료 티어
- **$5 무료 크레딧/월** (신용카드 등록 필요)
- **512MB RAM**
- **1 vCPU**
- 무료 크레딧 소진 후 종료 또는 유료 전환

## Netlify 무료 티어
- **100GB 대역폭/월**
- **300분 빌드 시간/월**
- **무제한 사이트**
- 충분히 무료로 사용 가능

## OpenAI API 비용
- **gpt-4o-mini**: $0.150/1M 입력 토큰, $0.600/1M 출력 토큰
- **예상 비용**: 월 $10-30 (사용자 100명 기준)

### 비용 절감 팁:
1. 짧은 메시지는 로컬 응답 사용 (현재 구현됨)
2. 대화 이력 제한 (최근 4개만 전송)
3. OpenAI Usage Limits 설정

---

# 🎉 배포 완료!

축하합니다! Healing Friend가 성공적으로 배포되었습니다!

## 최종 확인 체크리스트

- [ ] Railway 백엔드 배포 완료
- [ ] Railway 환경 변수 설정 완료
- [ ] Netlify 프론트엔드 배포 완료
- [ ] API_URL 업데이트 완료
- [ ] Firebase 설정 완료
- [ ] 모든 기능 테스트 완료
- [ ] 에러 없는지 확인 완료

## 다음 단계

1. **도메인 연결** (선택)
2. **모니터링 설정**
3. **백업 전략 수립**
4. **사용자 피드백 수집**

---

## 📞 지원

문제가 발생하면:
- GitHub Issues: https://github.com/jihey11/healing-friend/issues
- Railway 문서: https://docs.railway.app
- Netlify 문서: https://docs.netlify.com

**즐거운 배포 되세요! 🚀**

