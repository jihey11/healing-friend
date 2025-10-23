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

이 프로젝트는 **백엔드/프론트엔드 분리 구조**로 설계되었습니다:
- **프론트엔드**: Firebase Hosting에 배포
- **백엔드**: Firebase Functions (서버리스)
- **보안**: OpenAI API 키는 백엔드에서만 관리

### 빠른 시작 (로컬 개발)

1. **저장소 클론**
```bash
git clone https://github.com/jihey11/healing-friend.git
cd healing-friend
```

2. **의존성 설치**
```bash
cd functions
npm install
```

3. **Firebase 로그인**
```bash
firebase login
```

4. **로컬 에뮬레이터 실행**
```bash
firebase emulators:start
```

5. 브라우저에서 `http://localhost:5000` 접속

### 프로덕션 배포

전체 배포 가이드는 **[DEPLOYMENT.md](./DEPLOYMENT.md)** 파일을 참고하세요.

**요약**:
```bash
# Firebase 초기화
firebase init

# OpenAI API 키 설정
firebase functions:secrets:set OPENAI_API_KEY

# 배포
firebase deploy
```

## 🛠️ 기술 스택

### 프론트엔드
- **Framework**: Vanilla JavaScript (ES6+)
- **UI**: HTML5, CSS3
- **Canvas API**: 캐릭터 렌더링 및 게임
- **Module System**: ES6 Modules

### 백엔드
- **Platform**: Firebase Functions (Node.js 18)
- **AI**: OpenAI GPT-4o-mini API
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Hosting**: Firebase Hosting
- **Storage**: Firebase Cloud Storage (선택)

## 📁 프로젝트 구조

```
healing-friend/
├── public/                 # 프론트엔드 (Firebase Hosting)
│   ├── index.html         # 메인 HTML
│   ├── css/               # 스타일시트
│   │   ├── reset.css
│   │   ├── variables.css
│   │   ├── style.css
│   │   ├── auth.css
│   │   ├── character.css
│   │   └── game.css
│   ├── js/                # JavaScript 모듈
│   │   ├── app.js         # 메인 앱
│   │   ├── auth.js        # 인증
│   │   ├── character.js   # 캐릭터 시스템
│   │   ├── chat.js        # AI 대화 (Functions 호출)
│   │   ├── diary.js       # 일기 (Functions 호출)
│   │   ├── food.js        # 음식 시스템
│   │   ├── game-target.js # 과녁 게임
│   │   ├── game-puzzle.js # 퍼즐 게임
│   │   ├── config.js      # 설정
│   │   └── utils.js       # 유틸리티
│   └── assets/            # 이미지 및 리소스
├── functions/             # 백엔드 (Firebase Functions)
│   ├── index.js          # Functions 코드
│   │   ├── chat()        # AI 채팅 함수
│   │   └── analyzeDiaryEmotion() # 감정 분석 함수
│   ├── package.json      # 의존성
│   └── .gitignore        # Git 무시 파일
├── firebase.json         # Firebase 설정
├── .firebaserc           # Firebase 프로젝트 설정
├── .gitignore            # Git 무시 파일
├── README.md             # 프로젝트 설명
└── DEPLOYMENT.md         # 배포 가이드
```

## 🔐 보안

### API 키 관리

✅ **안전**: OpenAI API 키는 **Firebase Functions**에서만 사용
- 클라이언트 코드에 노출되지 않음
- Firebase Secrets로 안전하게 관리
- 환경 변수로 주입

❌ **위험**: 프론트엔드에 API 키 하드코딩 (절대 금지!)

### Firebase 보안 규칙

Firestore와 Storage에 적절한 보안 규칙 설정 필요:
- 사용자 인증 확인
- 본인 데이터만 읽기/쓰기 허용
- 악의적인 요청 차단

자세한 내용은 [DEPLOYMENT.md](./DEPLOYMENT.md)의 "보안 규칙 설정" 섹션 참고

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

