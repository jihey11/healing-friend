# 🌐 Netlify 설정 가이드

이 가이드는 Healing Friend 프로젝트를 Netlify에 배포하는 방법을 단계별로 설명합니다.

## 📋 목차

1. [Netlify 프로젝트 생성](#1-netlify-프로젝트-생성)
2. [GitHub 저장소 연결](#2-github-저장소-연결)
3. [빌드 설정 확인](#3-빌드-설정-확인)
4. [환경 변수 설정](#4-환경-변수-설정) ⭐ 중요!
5. [배포 확인](#5-배포-확인)

---

## 1. Netlify 프로젝트 생성

### Step 1: Netlify 가입 및 로그인

1. [Netlify 웹사이트](https://www.netlify.com) 접속
2. **"Sign up"** 또는 **"Log in"** 클릭
3. GitHub 계정으로 로그인 (권장)

### Step 2: 새 사이트 생성

1. Netlify 대시보드에서 **"Add new site"** 클릭
2. **"Import an existing project"** 선택
3. **"GitHub"** 선택하여 GitHub 저장소 연결

---

## 2. GitHub 저장소 연결

### Step 1: 저장소 선택

1. GitHub 인증 완료 후 저장소 목록에서 **"healing-friend"** 선택
2. **"Connect"** 클릭

### Step 2: 브랜치 선택

- **Branch to deploy**: `main` 선택
- **Base directory**: (비워두기 - 프로젝트 루트 사용)
- **Build command**: 자동 감지됨 (`node build-netlify.js`)
- **Publish directory**: 자동 감지됨 (`public`)

> 💡 **참고**: `netlify.toml` 파일이 있으면 자동으로 설정을 읽어옵니다.

---

## 3. 빌드 설정 확인

Netlify가 자동으로 `netlify.toml` 파일을 읽어서 다음 설정을 적용합니다:

- ✅ **Build command**: `node build-netlify.js`
- ✅ **Publish directory**: `public`
- ✅ **Node version**: 18

**확인 방법:**
1. Netlify 대시보드 > **Site settings** > **Build & deploy**
2. **Build settings** 섹션에서 확인

---

## 4. 환경 변수 설정 ⭐ 중요!

이 단계가 가장 중요합니다. 환경 변수를 설정하지 않으면 앱이 제대로 동작하지 않습니다.

### Step 1: 환경 변수 페이지로 이동

1. Netlify 대시보드에서 사이트 선택
2. 왼쪽 메뉴에서 **"Site settings"** 클릭
3. **"Environment variables"** 클릭 (또는 **"Project configuration"** > **"Environment variables"**)

### Step 2: 필수 환경 변수 추가

**"Add a variable"** 버튼을 클릭하여 다음 변수들을 하나씩 추가합니다:

#### ✅ 필수: API_URL

```
Key: API_URL
Value: https://your-backend.railway.app
```

> ⚠️ **주의**: 
> - Railway에서 백엔드를 먼저 배포해야 합니다
> - Railway 배포 후 생성된 URL을 여기에 입력하세요
> - 예시: `https://healing-friend-production.up.railway.app`

**설정 방법:**
1. **"Add a variable"** 클릭
2. **Key**: `API_URL` 입력
3. **Value**: Railway 백엔드 URL 입력 (예: `https://your-backend.railway.app`)
4. **"Save"** 클릭

### Step 3: Firebase 환경 변수 추가 (선택사항)

Firebase 인증 및 채팅 기능을 사용하는 경우 다음 변수들을 추가하세요:

#### Firebase 설정 값 찾는 방법:

1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택
3. ⚙️ **프로젝트 설정** 클릭
4. **"내 앱"** 섹션에서 웹 앱(</>) 선택
5. **"SDK 설정 및 구성"** 섹션에서 값 복사

#### 추가할 환경 변수들:

```
Key: FIREBASE_API_KEY
Value: AIzaSyBo_9CNsDaPyNiJVFkpkuV6vBghC-oKJqw
```

```
Key: FIREBASE_AUTH_DOMAIN
Value: healing-friend.firebaseapp.com
```

```
Key: FIREBASE_PROJECT_ID
Value: healing-friend
```

```
Key: FIREBASE_STORAGE_BUCKET
Value: healing-friend.firebasestorage.app
```

```
Key: FIREBASE_MESSAGING_SENDER_ID
Value: 903142131790
```

```
Key: FIREBASE_APP_ID
Value: 1:903142131790:web:c2e414321180b92b6adb1f
```

> 💡 **팁**: 각 변수를 추가할 때마다 **"Save"** 버튼을 클릭하세요.

### Step 4: 환경 변수 확인

설정한 환경 변수 목록:

| Key | 필수 | 설명 |
|-----|------|------|
| `API_URL` | ✅ | Railway 백엔드 URL |
| `FIREBASE_API_KEY` | ❌ | Firebase API 키 |
| `FIREBASE_AUTH_DOMAIN` | ❌ | Firebase Auth 도메인 |
| `FIREBASE_PROJECT_ID` | ❌ | Firebase 프로젝트 ID |
| `FIREBASE_STORAGE_BUCKET` | ❌ | Firebase Storage 버킷 |
| `FIREBASE_MESSAGING_SENDER_ID` | ❌ | Firebase 메시징 발신자 ID |
| `FIREBASE_APP_ID` | ❌ | Firebase 앱 ID |

---

## 5. 배포 확인

### Step 1: 배포 트리거

환경 변수를 설정한 후:

1. Netlify 대시보드로 돌아가기
2. **"Deploys"** 탭 클릭
3. **"Trigger deploy"** > **"Deploy site"** 클릭
   - 또는 GitHub에 푸시하면 자동 배포됩니다

### Step 2: 배포 로그 확인

1. 배포 목록에서 최신 배포 클릭
2. **"Deploy log"** 확인
3. 다음 메시지가 보이면 성공:
   ```
   ✅ 환경 변수 주입 완료
   ✅ Netlify 빌드 완료
   ```

### Step 3: 사이트 URL 확인

배포 완료 후:

1. Netlify 대시보드에서 **"Site overview"** 확인
2. **"Production"** 섹션에서 URL 확인
   - 예: `https://healing-friend.netlify.app`
   - 또는 커스텀 도메인

### Step 4: 사이트 동작 확인

1. 배포된 URL 접속
2. 다음 기능들이 정상 동작하는지 확인:
   - ✅ 로그인/회원가입
   - ✅ 일기 작성
   - ✅ AI 대화
   - ✅ 게임 플레이
   - ✅ 캐릭터 표시

---

## 🔧 문제 해결

### 문제 1: "API_URL 환경 변수가 설정되지 않았습니다" 경고

**원인**: `API_URL` 환경 변수가 설정되지 않음

**해결 방법**:
1. Netlify 대시보드 > **Site settings** > **Environment variables**
2. `API_URL` 변수가 있는지 확인
3. 없으면 추가하고, 있으면 값이 올바른지 확인
4. 재배포

### 문제 2: 백엔드 API 호출 실패 (CORS 오류)

**원인**: Railway 백엔드의 `FRONTEND_URL`이 설정되지 않음

**해결 방법**:
1. Railway 대시보드로 이동
2. **Variables** 탭에서 `FRONTEND_URL` 확인
3. Netlify 배포 URL로 설정 (예: `https://your-app.netlify.app`)
4. Railway 재배포

### 문제 3: 빌드 실패

**원인**: `build-netlify.js` 스크립트 실행 실패

**해결 방법**:
1. 배포 로그 확인
2. Node.js 버전 확인 (18 이상 필요)
3. `netlify.toml` 파일 확인
4. GitHub 저장소에 `build-netlify.js` 파일이 있는지 확인

### 문제 4: Firebase 인증 오류

**원인**: Firebase 환경 변수가 잘못 설정됨

**해결 방법**:
1. Firebase Console에서 설정 값 다시 확인
2. Netlify 환경 변수 값과 비교
3. 오타 확인 (특히 따옴표, 공백)
4. 재배포

---

## 📝 체크리스트

배포 전 확인사항:

- [ ] Railway 백엔드 배포 완료
- [ ] Railway 백엔드 URL 확인
- [ ] Netlify 프로젝트 생성
- [ ] GitHub 저장소 연결
- [ ] `API_URL` 환경 변수 설정
- [ ] Firebase 환경 변수 설정 (사용하는 경우)
- [ ] 배포 완료 확인
- [ ] 사이트 동작 테스트

---

## 🎉 완료!

Netlify 배포가 완료되었습니다!

이제 다음 단계를 진행하세요:

1. **Railway 백엔드 설정 업데이트**
   - Railway > Variables > `FRONTEND_URL`을 Netlify URL로 설정

2. **도메인 설정** (선택사항)
   - Netlify > **Domain settings**에서 커스텀 도메인 추가

3. **모니터링**
   - Netlify > **Analytics**에서 사이트 통계 확인

---

## 📚 추가 자료

- [Netlify 공식 문서](https://docs.netlify.com/)
- [Railway 배포 가이드](./DEPLOYMENT.md)
- [Firebase 설정 가이드](./FIREBASE_SETUP.md)

