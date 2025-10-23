# Healing Friend - Backend API

Express.js 기반 백엔드 서버

## 🚀 로컬 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일 수정

# 개발 서버 실행
npm run dev

# 프로덕션 서버 실행
npm start
```

## 📡 API 엔드포인트

### POST /api/chat
AI 채팅 API

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "안녕?" }
  ],
  "characterLevel": 5,
  "characterStage": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "안녕! 오늘 기분은 어때? 😊",
  "usage": { ... }
}
```

### POST /api/analyze
일기 감정 분석 API

**Request:**
```json
{
  "diaryText": "오늘은 정말 행복한 하루였어..."
}
```

**Response:**
```json
{
  "success": true,
  "emotions": {
    "기쁨": 70,
    "슬픔": 5,
    "분노": 0,
    "두려움": 5,
    "놀람": 10,
    "혐오": 10
  },
  "usage": { ... }
}
```

## 🔐 환경 변수

- `OPENAI_API_KEY`: OpenAI API 키 (필수)
- `FRONTEND_URL`: 프론트엔드 URL (CORS)
- `PORT`: 서버 포트 (Railway 자동 할당)
- `NODE_ENV`: 환경 (development/production)

## 🚂 Railway 배포

1. Railway 프로젝트 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포

