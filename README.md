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

### 필수 요구사항
- 웹 브라우저 (Chrome, Firefox, Safari 등)
- OpenAI API 키 (선택사항)

### 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/your-username/healing-friend.git
cd healing-friend
```

2. API 키 설정
`index.html` 파일의 33번째 줄에서 OpenAI API 키를 설정하세요:
```javascript
OPENAI_API_KEY: "your_openai_api_key_here"
```

3. 로컬 서버 실행
```bash
# Python 3 사용
python -m http.server 8000

# 또는 Node.js http-server 사용
npx http-server -p 8000
```

4. 브라우저에서 `http://localhost:8000` 접속

### 데모 모드
Firebase 설정 없이 로컬 스토리지로 데모 모드 사용 가능합니다.

## 🛠️ 기술 스택

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Canvas API**: 캐릭터 렌더링 및 게임
- **AI**: OpenAI GPT-4 API
- **Storage**: LocalStorage (데모), Firebase Firestore (선택)
- **Module System**: ES6 Modules

## 📁 프로젝트 구조

```
healing-friend/
├── index.html          # 메인 HTML
├── css/               # 스타일시트
│   ├── reset.css
│   ├── variables.css
│   ├── style.css
│   ├── auth.css
│   ├── character.css
│   └── game.css
├── js/                # JavaScript 모듈
│   ├── app.js         # 메인 앱
│   ├── auth.js        # 인증
│   ├── character.js   # 캐릭터 시스템
│   ├── chat.js        # AI 대화
│   ├── diary.js       # 일기 및 감정 분석
│   ├── food.js        # 음식 시스템
│   ├── game-target.js # 과녁 게임
│   ├── game-puzzle.js # 퍼즐 게임
│   ├── config.js      # 설정
│   └── utils.js       # 유틸리티
└── assets/            # 이미지 및 리소스
```

## 🔐 보안 주의사항

⚠️ **중요**: API 키를 절대 공개 저장소에 올리지 마세요!

프로덕션 배포 시:
1. 환경 변수 사용
2. 백엔드 API 서버 구축
3. API 키를 서버에서 관리

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

