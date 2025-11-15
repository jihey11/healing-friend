# 로컬 개발 가이드

이 문서는 힐링 프렌드 프로젝트를 로컬에서 개발하기 위한 가이드입니다.

## 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn
- OpenAI API 키 (백엔드에서 사용)

## 시작하기

### 1. 백엔드 설정

```bash
# backend 디렉토리로 이동
cd backend

# 의존성 설치
npm install

# .env 파일 생성 (수동으로 생성)
# backend 디렉토리에 .env 파일을 만들고 다음 내용을 추가하세요:
# 
# OPENAI_API_KEY=your_actual_openai_api_key
# PORT=3000
# NODE_ENV=development

# 개발 서버 시작
npm run dev
# 또는
npm start
```

**백엔드 .env 파일 예시:**
```
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
PORT=3000
NODE_ENV=development
```

백엔드 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

### 2. 프론트엔드 설정

프론트엔드는 정적 파일이므로 웹 서버만 필요합니다.

#### 방법 1: Python HTTP 서버 사용 (간단)

```bash
# 프로젝트 루트 디렉토리에서
python -m http.server 8080
# 또는 Python 2의 경우
python -m SimpleHTTPServer 8080
```

#### 방법 2: Node.js http-server 사용

```bash
# 전역 설치 (한 번만)
npm install -g http-server

# 프로젝트 루트 디렉토리에서 실행
http-server -p 8080
```

#### 방법 3: VS Code Live Server 확장 사용

VS Code의 Live Server 확장을 설치하고 `index.html` 파일을 우클릭하여 "Open with Live Server" 선택

### 3. 환경 설정 확인

#### index.html 확인

`index.html` 파일의 `window.ENV` 객체에서 다음을 확인하세요:

```javascript
window.ENV = {
    // 백엔드 API URL (로컬 개발 서버)
    API_URL: "http://localhost:3000",
    // ...
};
```

#### 백엔드 .env 파일 확인

`backend/.env` 파일에서 다음을 확인하세요:

```env
OPENAI_API_KEY=your_actual_openai_api_key
PORT=3000
NODE_ENV=development
```

## 개발 팁

### API 연결 테스트

브라우저 개발자 도구의 콘솔에서 다음을 확인할 수 있습니다:

```javascript
// API URL 확인
console.log(window.ENV?.API_URL);

// 백엔드 헬스 체크
fetch('http://localhost:3000/api/health')
  .then(res => res.json())
  .then(data => console.log('Backend Health:', data));
```

### CORS 문제 해결

로컬 개발 시 CORS 오류가 발생하면:

1. `backend/server.js`의 CORS 설정 확인
2. 프론트엔드가 실행되는 포트가 허용 목록에 있는지 확인
3. 필요시 `backend/.env`에 `FRONTEND_URL` 설정

### 로그 확인

- **프론트엔드**: 브라우저 개발자 도구 콘솔
- **백엔드**: 터미널 출력

## 문제 해결

### 백엔드 서버가 시작되지 않음

- Node.js 버전 확인: `node --version` (18 이상 필요)
- 포트 3000이 이미 사용 중인지 확인
- `backend/package.json`의 의존성이 모두 설치되었는지 확인

### API 호출 실패

- 백엔드 서버가 실행 중인지 확인
- `index.html`의 `API_URL`이 올바른지 확인
- 브라우저 콘솔에서 CORS 오류 확인
- 네트워크 탭에서 요청 상태 확인

### OpenAI API 오류

- `.env` 파일의 `OPENAI_API_KEY`가 올바른지 확인
- OpenAI API 키에 충분한 크레딧이 있는지 확인
- API 키가 활성화되어 있는지 확인

## 배포 전 체크리스트

로컬에서 테스트 완료 후 배포하기 전:

- [ ] `index.html`의 `API_URL`을 배포 URL로 변경
- [ ] `backend/server.js`의 CORS 설정을 프로덕션용으로 변경
- [ ] 환경변수를 배포 플랫폼에 설정
- [ ] `.env` 파일이 저장소에 커밋되지 않았는지 확인

## 추가 정보

- 백엔드 API 엔드포인트: `/api/chat`, `/api/analyze`, `/api/health`
- 기본 포트: 프론트엔드 8080, 백엔드 3000
- 데모 모드: Firebase 없이도 로컬 스토리지를 사용하여 작동

