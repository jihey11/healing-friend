# 🌟 힐링 프렌드 (Healing Friend)

정신건강 케어를 위한 AI 캐릭터와 함께하는 일기, 대화, 게임 서비스입니다.

## ✨ 주요 기능

### 📝 감정 일기
- 하루에 한 번 감정을 선택하고 일기 작성
- AI 기반 감정 분석 (GPT-4 + 키워드 분석)
- 감정별 점수 누적으로 캐릭터 성장

### 💬 AI 대화
- OpenAI GPT-4 기반 공감 대화
- 짧은 메시지는 로컬 응답, 긴 메시지는 AI 응답
- 대화 내역 저장

### 🎮 미니 게임
- **과녁 맞추기**: 스트레스 해소 게임 (30초, 난이도 3단계)
- **슬라이딩 퍼즐**: 마음 챙김 게임 (3×3, 4×4)
- 하루 5회 플레이 제한
- 게임 보상으로 경험치 획득

### 🐣 캐릭터 성장
- **레벨 시스템**: 경험치로 레벨업
- **진화 시스템**: 감정 점수에 따라 4단계 진화
  - 0단계: 흰색 알
  - 1단계: 감정 색상 적용
  - 2단계: 감정별 표정 추가
  - 3단계: 그라데이션 최종 진화
- 6가지 감정별 다른 색상과 표정

### 🍽️ 음식 인벤토리
- 게임 보상으로 음식 획득
- 음식으로 캐릭터에게 경험치 제공
- 감정별 음식 분류

## 🎨 감정별 색상

| 감정 | 몸 색깔 | 윤곽선 |
|------|---------|--------|
| 기쁨 | #FFFF84 | #FFF68E |
| 분노 | #ff7777 | #ff6f6f |
| 슬픔 | #a9c7ff | #8db5ff |
| 두려움 | #c7aeff | #bea3ff |
| 놀람 | #b9ffff | #a7ffff |
| 혐오 | #b9ffd5 | #a4ffc8 |

## 🚀 시작하기

### 아키텍처

이 프로젝트는 **백엔드/프론트엔드 완전 분리 구조**로 설계되었습니다:
- **프론트엔드**: Netlify (정적 호스팅)
- **백엔드**: Railway (Express.js 서버)
- **보안**: OpenAI API 키는 백엔드에서만 관리

### 로컬 개발 환경 설정

#### 1. 저장소 클론
```bash
git clone https://github.com/jihey11/healing-friend.git
cd healing-friend
```

#### 2. 백엔드 서버 실행
```bash
cd backend
npm install
cp .env.example .env
# .env 파일에서 OPENAI_API_KEY 설정
npm run dev
```

백엔드 서버가 `http://localhost:3000`에서 실행됩니다.

#### 3. 프론트엔드 실행
```bash
# 새 터미널에서
cd public

# 간단한 HTTP 서버 실행
python -m http.server 8000
# 또는
npx http-server -p 8000
```

브라우저에서 `http://localhost:8000` 접속

### 프로덕션 배포

전체 배포 가이드는 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** 파일을 참고하세요.

**배포 순서**:
1. **Railway에 백엔드 배포** (먼저!)
2. **Netlify에 프론트엔드 배포**
3. **환경 변수 설정**
4. **테스트**

## 🛠️ 기술 스택

### 프론트엔드
- **Framework**: Vanilla JavaScript (ES6+)
- **UI**: HTML5, CSS3
- **Canvas API**: 캐릭터 렌더링 및 게임
- **Module System**: ES6 Modules
- **Hosting**: Netlify

### 백엔드
- **Framework**: Express.js (Node.js 18+)
- **AI**: OpenAI GPT-4o-mini API
- **Security**: Helmet, CORS, Rate Limiting
- **Hosting**: Railway

### 인증 & 데이터베이스
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore

## 📁 프로젝트 구조

```
healing-friend/
├── public/                  # 프론트엔드 (Netlify)
│   ├── index.html          # 메인 HTML
│   ├── css/                # 스타일시트
│   │   ├── reset.css
│   │   ├── variables.css
│   │   ├── style.css
│   │   ├── auth.css
│   │   ├── character.css
│   │   └── game.css
│   ├── js/                 # JavaScript 모듈
│   │   ├── app.js          # 메인 앱
│   │   ├── auth.js         # 인증
│   │   ├── character.js    # 캐릭터 시스템
│   │   ├── chat.js         # AI 대화 (백엔드 API 호출)
│   │   ├── diary.js        # 일기 (백엔드 API 호출)
│   │   ├── food.js         # 음식 시스템
│   │   ├── game-target.js  # 과녁 게임
│   │   ├── game-puzzle.js  # 퍼즐 게임
│   │   ├── config.js       # 설정
│   │   └── utils.js        # 유틸리티
│   ├── assets/             # 이미지 및 리소스
│   └── _redirects          # Netlify 리다이렉트 설정
├── backend/                # 백엔드 (Railway)
│   ├── server.js           # Express.js 서버
│   │   ├── POST /api/chat    # AI 채팅 API
│   │   └── POST /api/analyze # 감정 분석 API
│   ├── package.json        # 의존성
│   ├── .env.example        # 환경 변수 예시
│   ├── .gitignore          # Git 무시 파일
│   ├── railway.json        # Railway 설정
│   └── README.md           # 백엔드 문서
├── netlify.toml            # Netlify 설정
├── .gitignore              # Git 무시 파일
├── README.md               # 프로젝트 설명
└── DEPLOYMENT_GUIDE.md     # 배포 가이드
```

## 🔐 보안

### API 키 관리

✅ **안전**: OpenAI API 키는 **Railway 백엔드 서버**에서만 사용
- 클라이언트 코드에 절대 노출되지 않음
- Railway 환경 변수로 안전하게 관리
- Express.js 서버에서만 API 호출

❌ **위험**: 프론트엔드에 API 키 하드코딩 (절대 금지!)

### 보안 기능

- **Helmet**: 보안 헤더 자동 설정
- **CORS**: 허용된 도메인만 접근 가능
- **Rate Limiting**: DDoS 공격 방지 (15분당 100 요청)
- **Input Validation**: 모든 요청 데이터 검증

### Firebase 보안

Firestore와 Storage에 적절한 보안 규칙 설정:
- 사용자 인증 확인
- 본인 데이터만 읽기/쓰기 허용

자세한 내용은 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 참고

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 문의

프로젝트 관련 문의사항이 있으시면 Issue를 등록해주세요.

---

Made with ❤️ for mental health care
