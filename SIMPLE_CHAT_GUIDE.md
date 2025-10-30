# 🤖 Simple Chat - GPT API 채팅 시스템

Railway 백엔드를 통해 OpenAI GPT API를 사용하는 간단한 채팅 시스템입니다.

## 📁 파일 구조

```
public/
├── js/
│   └── simple-chat.js          # 채팅 로직
├── css/
│   └── simple-chat.css         # 채팅 스타일
└── simple-chat-example.html    # 사용 예제
```

---

## 🚀 빠른 시작

### 1. HTML에 파일 추가

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Chat Example</title>
    
    <!-- CSS 추가 -->
    <link rel="stylesheet" href="css/simple-chat.css">
    
    <!-- 환경 변수 설정 -->
    <script>
        window.ENV = {
            API_URL: "https://your-backend.railway.app"
        };
    </script>
</head>
<body>
    <!-- 채팅 컨테이너 -->
    <div id="my-chat"></div>

    <!-- JavaScript -->
    <script type="module">
        import { setupSimpleChat } from './js/simple-chat.js';

        // 채팅 초기화
        setupSimpleChat('my-chat', 'user_001');
    </script>
</body>
</html>
```

### 2. 브라우저에서 열기

```bash
# 로컬 서버 실행 (예: VS Code Live Server)
# 또는 Netlify에 배포
```

---

## 📖 API 사용법

### SimpleChat 클래스

#### 생성자
```javascript
const chat = new SimpleChat();
```

#### 메서드

##### sendMessage(userMessage, options)
메시지를 보내고 GPT 응답을 받습니다.

```javascript
const response = await chat.sendMessage("안녕하세요!", {
    characterLevel: 5,
    characterStage: 1
});
console.log(response); // "안녕! 오늘은 어때? 😊"
```

**파라미터:**
- `userMessage` (string): 사용자 메시지
- `options` (object, 선택):
  - `characterLevel` (number): 캐릭터 레벨 (기본값: 1)
  - `characterStage` (number): 캐릭터 진화 단계 (기본값: 0)

**반환값:**
- `Promise<string>`: AI 응답 텍스트

##### clearHistory()
대화 이력을 초기화합니다.

```javascript
chat.clearHistory();
```

##### getHistory()
현재 대화 이력을 가져옵니다.

```javascript
const history = chat.getHistory();
console.log(history);
// [
//   { role: 'user', content: '안녕' },
//   { role: 'assistant', content: '안녕! 반가워!' }
// ]
```

##### loadHistory(userId)
localStorage에서 대화 이력을 불러옵니다.

```javascript
chat.loadHistory('user_123');
```

##### saveHistory(userId)
localStorage에 대화 이력을 저장합니다.

```javascript
chat.saveHistory('user_123');
```

---

### setupSimpleChat 함수

간단하게 UI까지 자동으로 설정합니다.

```javascript
import { setupSimpleChat } from './js/simple-chat.js';

const chat = setupSimpleChat(
    containerId,  // 컨테이너 ID
    userId,       // 사용자 ID
    options       // 옵션
);
```

**파라미터:**
- `containerId` (string): 채팅을 표시할 HTML 요소의 ID
- `userId` (string): 사용자 ID (대화 이력 저장용)
- `options` (object, 선택):
  - `characterLevel` (number): 캐릭터 레벨
  - `characterStage` (number): 캐릭터 진화 단계

**반환값:**
- `SimpleChat` 인스턴스

---

## 💡 사용 예제

### 예제 1: 기본 사용

```javascript
import { setupSimpleChat } from './js/simple-chat.js';

// 간단하게 설정
const chat = setupSimpleChat('chat-container', 'user_001');
```

### 예제 2: 커스텀 옵션

```javascript
const chat = setupSimpleChat('chat-container', 'user_001', {
    characterLevel: 10,
    characterStage: 2
});
```

### 예제 3: 수동으로 메시지 보내기

```javascript
import { SimpleChat } from './js/simple-chat.js';

const chat = new SimpleChat();

async function talk() {
    try {
        const response = await chat.sendMessage("오늘 기분이 좋아!");
        console.log("AI:", response);
    } catch (error) {
        console.error("에러:", error);
    }
}

talk();
```

### 예제 4: 대화 이력 관리

```javascript
const chat = new SimpleChat();

// 이력 로드
chat.loadHistory('user_123');

// 대화
await chat.sendMessage("안녕!");

// 이력 저장
chat.saveHistory('user_123');

// 이력 확인
console.log(chat.getHistory());

// 이력 초기화
chat.clearHistory();
```

---

## 🎨 CSS 커스터마이징

### 색상 변경

```css
/* simple-chat.css 수정 */

.simple-chat-input-wrapper button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.chat-message.user .message-bubble {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}
```

### 크기 조절

```css
.simple-chat-container {
    height: 500px; /* 원하는 높이 */
}

.message-bubble {
    font-size: 16px; /* 폰트 크기 */
}
```

---

## 🔧 고급 사용법

### HTML에 직접 통합

홈 화면에 채팅을 추가하고 싶다면:

```html
<!-- index.html -->
<div class="home-layout">
    <div class="home-left">
        <!-- 캐릭터 영역 -->
    </div>
    <div class="home-right">
        <!-- 채팅 영역 -->
        <div id="home-chat" style="height: 100%;"></div>
    </div>
</div>

<script type="module">
    import { setupSimpleChat } from './js/simple-chat.js';
    
    // 사용자 로그인 후
    const userData = getCurrentUser();
    setupSimpleChat('home-chat', userData.uid, {
        characterLevel: userData.level,
        characterStage: userData.stage
    });
</script>
```

### React/Vue 등 프레임워크에서 사용

```javascript
// React 예제
import { useEffect, useRef } from 'react';
import { SimpleChat } from './simple-chat';

function ChatComponent() {
    const chatRef = useRef(null);

    useEffect(() => {
        const chat = new SimpleChat();
        chatRef.current = chat;

        // 초기 대화 이력 로드
        chat.loadHistory('user_001');

        return () => {
            // 정리
            chat.saveHistory('user_001');
        };
    }, []);

    const handleSend = async (message) => {
        const response = await chatRef.current.sendMessage(message);
        // UI 업데이트
    };

    return (
        <div>
            {/* 채팅 UI */}
        </div>
    );
}
```

---

## ⚙️ 환경 설정

### Railway 백엔드 URL 설정

```javascript
// index.html 또는 config.js
window.ENV = {
    API_URL: "https://your-backend.railway.app"
};
```

### 로컬 테스트

```javascript
window.ENV = {
    API_URL: "http://localhost:3000"
};
```

---

## 🐛 문제 해결

### "API 오류: 404"
- Railway 백엔드 URL 확인
- Railway가 정상 동작 중인지 확인

### "잘못된 응답 형식"
- Railway 환경 변수에 `OPENAI_API_KEY` 설정 확인
- 백엔드 로그 확인

### "대화 이력이 로드되지 않음"
- localStorage가 활성화되어 있는지 확인
- userId가 올바른지 확인

---

## 📝 참고사항

### 비용 절감 팁
- 짧은 메시지로 대화
- 불필요한 대화 이력 정리
- 대화 이력 길이 제한 (현재 최대 6턴)

### 보안
- API 키는 절대 프론트엔드에 노출하지 않음
- Railway 백엔드를 통해 안전하게 호출
- CORS 설정으로 허용된 도메인만 접근 가능

---

## 🆚 기존 chat.js와 비교

| 기능 | chat.js | simple-chat.js |
|------|---------|----------------|
| GPT API | ✅ | ✅ |
| 로컬 응답 | ✅ | ❌ |
| 하이브리드 시스템 | ✅ | ❌ |
| 복잡도 | 높음 | 낮음 |
| 파일 크기 | ~700줄 | ~300줄 |
| 사용 난이도 | 중 | 쉬움 |
| 커스터마이징 | 어려움 | 쉬움 |

---

## 🎯 결론

`simple-chat.js`는:
- ✅ **단순함**: GPT API만 사용
- ✅ **명확함**: 이해하기 쉬운 코드
- ✅ **유연함**: 쉽게 커스터마이징
- ✅ **독립적**: 다른 파일과 의존성 없음

기존 `chat.js`를 대체하거나, 별도의 채팅 기능이 필요할 때 사용하세요!

---

## 📞 지원

문제가 있거나 질문이 있으시면 언제든지 물어보세요! 😊

