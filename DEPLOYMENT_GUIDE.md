# 🚀 Healing Friend 배포 가이드

백엔드는 Railway로, 프론트엔드는 Netlify로 배포합니다.

## 📋 아키텍처

```
┌─────────────┐      HTTPS       ┌──────────────┐      API Call    ┌──────────┐
│  Netlify    │ ────────────────> │   Railway    │ ──────────────> │  OpenAI  │
│ (프론트엔드)  │   API 요청       │  (백엔드)     │    API 호출        │   API    │
└─────────────┘                  └──────────────┘                  └──────────┘
```

---

# 📦 Part 1: 백엔드 배포 (Railway)

## Step 1: GitHub에 푸시

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Step 2: Railway 배포

1. **Railway 가입**: https://railway.app
2. **"New Project"** → **"Deploy from GitHub repo"** 선택
3. **"healing-friend"** 저장소 선택
4. **Settings** → **Root Directory**: `backend` 입력 ⚠️ 중요!
5. **Settings** → **Deploy Command**: (비워두기, 자동 감지)

## Step 3: 환경 변수 설정

Railway 프로젝트 → **Variables** 탭에서 추가:

```bash
OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
FRONTEND_URL=*
```

### OpenAI API 키 발급 방법:
1. https://platform.openai.com/api-keys 접속
2. **"Create new secret key"** 클릭
3. 키 복사 후 Railway 환경 변수에 설정

## Step 4: 배포 완료 및 URL 확인

1. 배포가 완료되면 **URL 확인** (예: `https://healing-friend.railway.app`)
2. **헬스 체크**:
```bash
curl https://your-app.railway.app/api/health
# 응답: {"status":"healthy","timestamp":"..."}
```

---

# 🌐 Part 2: 프론트엔드 배포 (Netlify)

## Step 1: Netlify 배포

1. **Netlify 가입**: https://netlify.com
2. **"Add new site"** → **"Import an existing project"** → **"GitHub"** 선택
3. **"healing-friend"** 저장소 선택
4. **"Deploy site"** 클릭

## Step 2: 배포 설정 확인

자동으로 `netlify.toml` 설정이 적용됩니다:
- **Publish directory**: `public`
- **Build command**: `echo 'No build required'`

## Step 3: API URL 설정

배포 완료 후, Railway 백엔드 URL로 업데이트:

**방법 1: GitHub에서 직접 수정**
1. `public/index.html` 파일 열기
2. 25번째 줄의 `API_URL` 수정:
```html
API_URL: "https://your-actual-backend.railway.app",
```
3. 저장 후 커밋 및 푸시:
```bash
git add public/index.html
git commit -m "Update API URL for production"
git push
```

**방법 2: Netlify 대시보드에서 수정**
1. Netlify 사이트 → **"Rewrites and redirects"**
2. 환경 변수로 설정 (하지만 현재 구조에서는 방법 1 추천)

## Step 4: 재배포

변경 사항이 Netlify에 자동 반영되거나:
- Netlify 사이트 → **"Trigger deploy"** 클릭

---

# ⚙️ Part 3: CORS 설정

Netlify URL을 받은 후, Railway 환경 변수를 업데이트:

```bash
FRONTEND_URL=https://your-actual-app.netlify.app
```

이렇게 하면 특정 프론트엔드만 허용되어 보안이 강화됩니다.

---

# ✅ Part 4: 배포 확인

## 백엔드 테스트

```bash
# 헬스 체크
curl https://your-backend.railway.app/api/health

# 채팅 API 테스트
curl -X POST https://your-backend.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"안녕"}],"characterLevel":1,"characterStage":0}'
```

## 프론트엔드 테스트

1. Netlify URL 접속
2. 회원가입/로그인
3. 일기 작성 → 감정 분석 확인
4. 채팅 → AI 응답 확인
5. 게임 플레이

## 브라우저 콘솔 확인

개발자 도구 (F12) → Console:
- 에러 메시지 확인
- Network 탭에서 Railway API 호출 확인

---

# 🔄 업데이트 및 재배포

## 백엔드 업데이트

```bash
cd backend
# 코드 수정 후
git add .
git commit -m "백엔드 개선"
git push
```

Railway가 자동으로 재배포합니다.

## 프론트엔드 업데이트

```bash
# 코드 수정 후
git add .
git commit -m "프론트엔드 개선"
git push
```

Netlify가 자동으로 재배포합니다.

---

# 🆘 문제 해결

## "API 호출 실패" 오류

**원인**: CORS 설정 문제

**해결**:
1. Railway → Variables → `FRONTEND_URL` 확인
2. Netlify URL과 정확히 일치하는지 확인
3. 백엔드 재배포

## "OpenAI API 키 오류"

**원인**: 환경 변수 미설정

**해결**:
1. Railway → Variables → `OPENAI_API_KEY` 확인
2. OpenAI 대시보드에서 키 유효성 확인
3. 새 키 발급 후 재설정

## "백엔드 연결 실패"

**원인**: API_URL 잘못 설정

**해결**:
1. `public/index.html`의 `API_URL` 확인 (25번째 줄)
2. Railway URL과 정확히 일치하는지 확인
3. 재배포

---

# 💰 비용

## Railway 무료 티어
- $5 무료 크레딧/월 (신용카드 등록 필요)
- 512MB RAM, 1 vCPU
- 무료 크레딧 소진 후 종료 또는 유료 전환

## Netlify 무료 티어
- 100GB 대역폭/월
- 300분 빌드 시간/월
- 무제한 사이트
- 충분히 무료로 사용 가능

## OpenAI API 비용
- gpt-4o-mini: $0.150/1M 입력 토큰, $0.600/1M 출력 토큰
- 예상 비용: 월 $10-30 (사용자 100명 기준)

---

# 🎉 배포 완료!

## 최종 확인 체크리스트

- [ ] Railway 백엔드 배포 완료
- [ ] Railway 환경 변수 설정 완료
- [ ] Netlify 프론트엔드 배포 완료
- [ ] API_URL 업데이트 완료
- [ ] 모든 기능 테스트 완료
- [ ] 에러 없는지 확인 완료

## 다음 단계

1. 도메인 연결 (Railway/Netlify 모두 지원)
2. 모니터링 설정
3. 사용자 피드백 수집

---

**즐거운 배포 되세요! 🚀**
