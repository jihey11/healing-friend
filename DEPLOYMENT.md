# 배포 가이드

이 가이드는 Railway(백엔드)와 Netlify(프론트엔드)를 사용한 배포 방법을 설명합니다.

## 목차
1. [백엔드 배포 (Railway)](#백엔드-배포-railway)
2. [프론트엔드 배포 (Netlify)](#프론트엔드-배포-netlify)
3. [환경 변수 설정](#환경-변수-설정)
4. [문제 해결](#문제-해결)

---

## 백엔드 배포 (Railway)

### 1. Railway 프로젝트 생성

1. [Railway](https://railway.app)에 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택 (또는 "Empty Project" 후 수동 배포)

### 2. 백엔드 코드 연결

**Railway Root Directory 설정**

**방법 A: Root Directory를 `backend`로 설정 (일반적인 경우)**

1. Railway 대시보드 > Settings > Source
2. **Root Directory** 필드에 `backend` 입력
3. **Save** 클릭
4. 재배포 트리거

**방법 B: Root Directory를 비우기 (방법 A가 실패할 경우) ⭐ 지금 시도해보세요**

1. Railway 대시보드 > Settings > Source  
2. **Root Directory** 필드를 **완전히 비우기** (빈 문자열로 설정)
3. **Save** 클릭
4. 재배포 트리거 (Settings 저장 시 자동 재배포될 수 있음)

루트에 `railway.json`과 `nixpacks.toml` 파일을 추가했습니다. 이 파일들은 루트에서 실행되면서 자동으로 `backend` 디렉토리로 이동하여 빌드하고 실행합니다.

**중요 사항:**
- **Root Directory가 `backend`인 경우:**
  - Railway는 `backend` 디렉토리를 루트로 간주
  - `backend/railway.json` 파일이 사용됨
  - `backend/package.json`의 `start` 스크립트 실행

- **Root Directory가 비어있는 경우:**
  - Railway는 저장소 루트에서 실행
  - 루트의 `railway.json` 파일 사용
  - **하지만** `backend/package.json`을 실행하려면 추가 설정 필요

**⚠️ "Could not find root directory: backend" 오류 해결:**

1. **GitHub 저장소 구조 확인**
   - 저장소 루트에서 `backend/` 디렉토리가 직접 보이는지 확인
   - GitHub 웹사이트에서 저장소 열어서 확인

2. **Root Directory 경로 확인**
   - 저장소 루트가 `healing-friend-main/`인 경우 → Root Directory: `healing-friend-main/backend`
   - 저장소 루트에 `backend/`가 직접 있는 경우 → Root Directory: `backend`

3. **Railway 배포 로그 확인**
   - 실패한 배포 > "View logs" 클릭
   - "Snapshot code" 단계에서 실제 디렉토리 구조 확인
   - 로그에 나타난 경로에 맞게 Root Directory 설정

### 3. 환경 변수 설정

Railway 대시보드에서 **Variables** 탭으로 이동하여 다음 환경 변수 설정:

#### 필수 환경 변수

```
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=https://your-app-name.netlify.app
NODE_ENV=production
```

**주의**: `FRONTEND_URL`은 Netlify 배포 후 설정해야 합니다. 처음에는 임시로 빈 값 또는 `*`로 설정 후, Netlify URL을 얻은 후 업데이트하세요.

#### PORT
- Railway가 자동으로 할당하므로 별도 설정 불필요

### 4. 배포 확인

1. Railway 대시보드에서 배포 상태 확인
2. 배포 완료 후 생성된 URL 확인 (예: `https://your-backend.railway.app`)
3. 헬스 체크: `https://your-backend.railway.app/api/health` 접속하여 응답 확인

---

## 프론트엔드 배포 (Netlify)

### 1. Netlify 프로젝트 생성

1. [Netlify](https://www.netlify.com)에 로그인
2. "Add new site" > "Import an existing project" 클릭
3. GitHub 저장소 연결

### 2. 빌드 설정

Netlify가 자동으로 `netlify.toml` 파일을 읽습니다. 다음 설정 확인:

- **Base directory**: `healing-friend-main` (또는 프로젝트 루트)
- **Build command**: `node build-netlify.js` (자동 감지됨)
- **Publish directory**: `public` (자동 감지됨)

### 3. 환경 변수 설정

Netlify 대시보드에서 **Site settings** > **Environment variables**로 이동:

#### 필수 환경 변수

```
API_URL=https://your-backend.railway.app
```

**주의**: `API_URL`은 Railway 배포 완료 후 설정한 백엔드 URL이어야 합니다.

#### 선택 환경 변수 (Firebase 사용 시)

```
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 4. 배포 확인

1. Netlify 대시보드에서 배포 상태 확인
2. 배포 완료 후 생성된 URL 확인 (예: `https://your-app-name.netlify.app`)
3. 프론트엔드 접속하여 동작 확인

### 5. 백엔드 CORS 설정 업데이트

프론트엔드 배포가 완료되면, Railway에서 `FRONTEND_URL` 환경 변수를 Netlify URL로 업데이트:

```
FRONTEND_URL=https://your-app-name.netlify.app
```

Railway가 자동으로 재배포하며 CORS 설정이 업데이트됩니다.

---

## 환경 변수 설정

### Railway 환경 변수 (백엔드)

| 변수명 | 필수 | 설명 | 예시 |
|--------|------|------|------|
| `OPENAI_API_KEY` | ✅ | OpenAI API 키 | `sk-...` |
| `FRONTEND_URL` | ✅ | Netlify 배포 URL | `https://your-app.netlify.app` |
| `NODE_ENV` | ⚠️ | 환경 설정 | `production` |
| `PORT` | ❌ | 포트 번호 (자동 할당) | - |

### Netlify 환경 변수 (프론트엔드)

| 변수명 | 필수 | 설명 | 예시 |
|--------|------|------|------|
| `API_URL` | ✅ | Railway 백엔드 URL | `https://your-backend.railway.app` |
| `FIREBASE_API_KEY` | ❌ | Firebase API 키 | `AIza...` |
| `FIREBASE_AUTH_DOMAIN` | ❌ | Firebase Auth 도메인 | `project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | ❌ | Firebase 프로젝트 ID | `project-id` |
| `FIREBASE_STORAGE_BUCKET` | ❌ | Firebase Storage 버킷 | `project.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | ❌ | Firebase 메시징 발신자 ID | `123456789` |
| `FIREBASE_APP_ID` | ❌ | Firebase 앱 ID | `1:123:web:abc` |

---

## 문제 해결

### 백엔드 배포 문제

#### "Could not find root directory: backend" 오류
이 오류는 Railway가 backend 디렉토리를 찾지 못할 때 발생합니다.

**해결 방법:**

1. **Railway Root Directory 설정 (가장 확실한 방법)**
   - Railway 대시보드 > Settings > Service > Root Directory
   - `backend` 입력 후 Save
   - 재배포 트리거

2. **프로젝트 구조 확인**
   - GitHub 저장소에서 `backend/` 디렉토리가 루트에 있는지 확인
   - `backend/package.json` 파일 존재 확인
   - 저장소 루트 구조: `backend/`, `public/`, `railway.json` 등

3. **GitHub 푸시 확인**
   - 모든 파일이 GitHub에 푸시되었는지 확인
   - `.gitignore`에서 `backend/`가 무시되지 않는지 확인

4. **Railway 로그 확인**
   - 배포 로그에서 실제 파일 구조 확인
   - "Snapshot code" 단계에서 어떤 디렉토리가 보이는지 확인

#### 포트 바인딩 오류
- Railway는 자동으로 PORT 환경 변수를 할당합니다
- `server.js`에서 `0.0.0.0`으로 리스닝하도록 설정되어 있습니다

#### CORS 오류
- Railway의 `FRONTEND_URL` 환경 변수가 Netlify URL과 정확히 일치하는지 확인
- Netlify 배포 후 Railway 환경 변수 업데이트 필요

### 프론트엔드 배포 문제

#### 빌드 실패
- `build-netlify.js` 파일이 프로젝트 루트에 있는지 확인
- Node.js 버전 확인 (netlify.toml에서 `NODE_VERSION = "18"` 설정)

#### API 연결 오류
- Netlify의 `API_URL` 환경 변수가 Railway 백엔드 URL과 일치하는지 확인
- 브라우저 콘솔에서 네트워크 오류 확인
- Railway 백엔드 헬스 체크 URL로 직접 접속하여 백엔드가 실행 중인지 확인

#### 환경 변수 주입 안 됨
- Netlify 빌드 로그 확인
- `build-netlify.js` 스크립트 실행 여부 확인
- Netlify 환경 변수 설정 확인

### 일반적인 문제

#### 배포 후 업데이트가 반영되지 않음
1. Railway: 배포 로그에서 빌드/배포 상태 확인
2. Netlify: 빌드 로그 확인, 필요시 "Clear cache and deploy site" 실행
3. 브라우저 캐시 삭제 후 재접속

#### API 요청 404 오류
- 백엔드 엔드포인트 경로 확인 (`/api/chat`, `/api/analyze`)
- Railway 배포 URL 확인
- Network 탭에서 요청 URL 확인

---

## 배포 순서 요약

1. **백엔드 배포 (Railway)**
   - Railway 프로젝트 생성
   - GitHub 저장소 연결 (Root: `backend`)
   - 환경 변수 설정: `OPENAI_API_KEY`, `NODE_ENV=production`
   - 배포 완료 후 백엔드 URL 확인

2. **프론트엔드 배포 (Netlify)**
   - Netlify 프로젝트 생성
   - GitHub 저장소 연결
   - 환경 변수 설정: `API_URL` (Railway 백엔드 URL)
   - 배포 완료 후 프론트엔드 URL 확인

3. **CORS 설정 업데이트**
   - Railway 환경 변수 `FRONTEND_URL`을 Netlify URL로 업데이트
   - 자동 재배포 후 확인

---

## 추가 정보

- Railway 문서: https://docs.railway.app
- Netlify 문서: https://docs.netlify.com
- 프로젝트 구조는 `README.md` 참고

