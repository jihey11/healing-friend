# 🎭 캐릭터 Idle Animation 가이드

HTML5 Canvas 2D API를 사용한 부드러운 제자리 애니메이션 시스템입니다.

## 📁 파일 구조

```
public/
├── character-idle-animation.html    # 기본 버전
└── character-idle-advanced.html     # 고급 버전 (4가지 패턴)
```

---

## 🚀 바로 실행하기

### 방법 1: 로컬에서 실행
```bash
# 브라우저에서 파일 직접 열기
open public/character-idle-animation.html
```

### 방법 2: Netlify 배포 후
```
https://your-site.netlify.app/character-idle-animation.html
https://your-site.netlify.app/character-idle-advanced.html
```

---

## 📖 기본 버전 (character-idle-animation.html)

### ✨ 특징

✅ **requestAnimationFrame** 사용  
✅ **Delta Time** 기반 8fps 제어  
✅ **제자리 모션** (이동 없음)  
✅ **부드러운 전환** (베지어 곡선)  
✅ **매 프레임 clearRect()** 초기화  

### 🎬 애니메이션 동작

```
프레임 0-3: 위로 올라가기 (스케일 증가)
프레임 4-7: 아래로 내려가기 (스케일 감소)
```

**8프레임 루프:**
- 프레임 0: 기본 상태
- 프레임 1-2: 위로 움직이며 세로로 늘어남
- 프레임 3: 최고점
- 프레임 4: 기본 상태로 복귀
- 프레임 5-6: 아래로 움직이며 가로로 넓어짐
- 프레임 7: 복귀 중

### 📊 프레임 데이터 구조

```javascript
const ANIMATION_FRAMES = [
    { 
        scaleY: 1.00,    // Y축 크기 (세로)
        offsetY: 0,      // Y축 위치
        squish: 1.00     // X축 크기 (가로, 찌그러짐)
    },
    // ... 총 8개 프레임
];
```

---

## 🎮 고급 버전 (character-idle-advanced.html)

### ✨ 추가 기능

✅ **4가지 애니메이션 패턴**  
✅ **실시간 패턴 전환**  
✅ **회전(rotation) 효과**  
✅ **좌우 움직임 지원**  
✅ **현재 프레임 정보 표시**  

### 🎨 4가지 패턴

#### 1️⃣ 통통 튀기 (bounce)
```javascript
// 위아래로 튀는 모션
// Y축 스케일 변화 + 위치 변화
```

#### 2️⃣ 숨쉬기 (breathe)
```javascript
// 부드럽게 커졌다 작아지는 모션
// 전체 스케일 변화
```

#### 3️⃣ 좌우 흔들기 (sway)
```javascript
// 좌우로 흔들리는 모션
// X축 위치 + 회전 변화
```

#### 4️⃣ 신나게 (excited)
```javascript
// 활발하게 움직이는 모션
// 스케일 + 위치 + 회전 모두 변화
```

---

## 🔧 핵심 기술 설명

### 1. Delta Time 기반 프레임 제어

```javascript
// 목표: 초당 8프레임
const targetFPS = 8;
const frameDuration = 1000 / 8; // 125ms

function animate(currentTime) {
    const deltaTime = currentTime - lastFrameTime;
    accumulatedTime += deltaTime;

    // 125ms마다 프레임 전환
    if (accumulatedTime >= frameDuration) {
        currentFrame = (currentFrame + 1) % totalFrames;
        accumulatedTime -= frameDuration;
    }

    // 매 프레임 렌더링 (60fps로 부드럽게)
    drawCharacter(currentFrame);
    requestAnimationFrame(animate);
}
```

**장점:**
- 화면 주사율과 무관하게 일정한 속도
- 60Hz/144Hz 모니터 모두 동일한 속도
- 프레임 드랍에도 안정적

### 2. 베지어 곡선으로 부드러운 형태

```javascript
// 원을 베지어 곡선으로 근사
const k = 0.552284749831; // 매직 넘버
const ox = rx * k;
const oy = ry * k;

// 4개의 베지어 곡선으로 원 그리기
ctx.bezierCurveTo(
    cx + ox, cy - ry,  // 제어점 1
    cx + rx, cy - oy,  // 제어점 2
    cx + rx, cy        // 끝점
);
```

### 3. 변형(Transform) 적용

```javascript
ctx.save();                          // 현재 상태 저장

// 1. 회전 중심으로 이동
ctx.translate(cx, cy);

// 2. 회전 적용
ctx.rotate(rotation * Math.PI / 180);

// 3. 원위치
ctx.translate(-cx, -cy);

// 4. 그리기
drawCharacter();

ctx.restore();                       // 상태 복원
```

---

## 💡 커스터마이징 가이드

### 속도 변경

```javascript
// 더 빠르게 (12fps)
const CONFIG = {
    animation: {
        targetFPS: 12,
        frameDuration: 1000 / 12,
        totalFrames: 8
    }
};

// 더 느리게 (4fps)
const CONFIG = {
    animation: {
        targetFPS: 4,
        frameDuration: 1000 / 4,
        totalFrames: 8
    }
};
```

### 색상 변경

```javascript
const CONFIG = {
    character: {
        color: '#FF69B4',        // 핑크
        strokeColor: '#FF1493',  // 진한 핑크
        eyeColor: '#000000'      // 검정
    }
};
```

### 크기 변경

```javascript
const CONFIG = {
    canvas: {
        width: 600,      // 캔버스 너비
        height: 500,     // 캔버스 높이
        centerX: 300,    // 중심 X
        centerY: 250     // 중심 Y
    },
    character: {
        baseRadius: 100  // 캐릭터 크기
    }
};
```

### 새로운 패턴 추가

```javascript
const ANIMATION_PATTERNS = {
    // 기존 패턴들...
    
    // 새 패턴: 점프
    jump: [
        { scaleX: 1.00, scaleY: 1.00, offsetX: 0, offsetY: 0,   rotation: 0 },
        { scaleX: 0.95, scaleY: 1.05, offsetX: 0, offsetY: -5,  rotation: 0 },
        { scaleX: 0.90, scaleY: 1.10, offsetX: 0, offsetY: -15, rotation: 0 },
        { scaleX: 0.85, scaleY: 1.15, offsetX: 0, offsetY: -30, rotation: 0 },
        { scaleX: 0.90, scaleY: 1.10, offsetX: 0, offsetY: -35, rotation: 0 },
        { scaleX: 0.95, scaleY: 1.05, offsetX: 0, offsetY: -25, rotation: 0 },
        { scaleX: 1.00, scaleY: 1.00, offsetX: 0, offsetY: -10, rotation: 0 },
        { scaleX: 1.10, scaleY: 0.90, offsetX: 0, offsetY: 0,   rotation: 0 }
    ]
};
```

---

## 🎨 프레임 데이터 파라미터

| 파라미터 | 설명 | 범위 | 예시 |
|---------|------|------|------|
| `scaleX` | 가로 크기 배율 | 0.5 ~ 1.5 | 1.05 = 5% 확대 |
| `scaleY` | 세로 크기 배율 | 0.5 ~ 1.5 | 0.95 = 5% 축소 |
| `offsetX` | 좌우 위치 이동 | -50 ~ 50 | 10 = 오른쪽으로 10px |
| `offsetY` | 상하 위치 이동 | -50 ~ 50 | -5 = 위로 5px |
| `rotation` | 회전 각도 | -45 ~ 45 | 10 = 시계방향 10도 |
| `squish` | 찌그러짐 (X축) | 0.5 ~ 1.5 | 1.1 = 10% 넓어짐 |

---

## 🐛 디버깅

### 콘솔에서 제어

```javascript
// 브라우저 콘솔에서 사용 가능
characterAnimation.stop();              // 정지
characterAnimation.start();             // 시작
characterAnimation.getCurrentFrame();   // 현재 프레임
characterAnimation.getFrameData();      // 프레임 데이터
```

### 프레임별 확인

```javascript
// 각 프레임을 천천히 확인
const CONFIG = {
    animation: {
        targetFPS: 1,  // 1초에 1프레임
        frameDuration: 1000
    }
};
```

---

## ⚡ 성능 최적화 팁

### 1. 불필요한 그리기 최소화

```javascript
// ❌ 나쁜 예
function animate() {
    clearCanvas();
    drawBackground();      // 변하지 않는 배경
    drawCharacter();
}

// ✅ 좋은 예
drawBackground();          // 한 번만 그리기
function animate() {
    clearCanvas();
    drawCharacter();
}
```

### 2. 그림자 효과 최적화

```javascript
// 몸체에만 그림자 적용
ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
ctx.shadowBlur = 15;
drawBody();

// 그림자 제거 (눈, 입에는 불필요)
ctx.shadowColor = 'transparent';
ctx.shadowBlur = 0;
drawFace();
```

### 3. Canvas 크기 최적화

```javascript
// 적절한 크기 사용
// ❌ 너무 큼: 800x800 (성능 저하)
// ✅ 적당함: 400x400
// ⚠️ 너무 작음: 200x200 (픽셀화)
```

---

## 📚 학습 자료

### Canvas API
- [MDN Canvas Tutorial](https://developer.mozilla.org/ko/docs/Web/API/Canvas_API/Tutorial)
- [베지어 곡선 이해하기](https://javascript.info/bezier-curve)

### 애니메이션
- [requestAnimationFrame 가이드](https://developer.mozilla.org/ko/docs/Web/API/window/requestAnimationFrame)
- [Delta Time 개념](https://gameprogrammingpatterns.com/game-loop.html)

### 프레임 애니메이션
- [Sprite Animation](https://spicyyoghurt.com/tutorials/html5-javascript-game-development/create-a-sprite-animation-with-canvas)

---

## 🎯 활용 예시

### 1. 게임 캐릭터
```javascript
// 대기, 걷기, 점프 상태별 애니메이션
if (player.state === 'idle') {
    playAnimation('breathe');
} else if (player.state === 'walk') {
    playAnimation('sway');
}
```

### 2. 로딩 인디케이터
```javascript
// 로딩 중 애니메이션
showLoadingCharacter('excited');
```

### 3. UI 장식
```javascript
// 웹사이트 마스코트
<canvas id="mascot"></canvas>
setupIdleAnimation('mascot', 'bounce');
```

---

## 🆚 다른 방법과 비교

| 방법 | 이 코드 | GIF | CSS Animation | Lottie |
|------|---------|-----|---------------|--------|
| 파일 크기 | ✅ 작음 | ❌ 큼 | ✅ 작음 | ⚠️ 중간 |
| 프레임 제어 | ✅ 정밀 | ❌ 어려움 | ⚠️ 제한적 | ✅ 좋음 |
| 동적 변경 | ✅ 쉬움 | ❌ 불가능 | ⚠️ 제한적 | ⚠️ 어려움 |
| 학습 곡선 | ⚠️ 중간 | ✅ 쉬움 | ✅ 쉬움 | ❌ 어려움 |
| 품질 | ✅ 벡터 | ❌ 픽셀 | ✅ 벡터 | ✅ 벡터 |

---

## 🎓 다음 단계

1. ✅ **완료**: 기본 Idle Animation
2. ✅ **완료**: 여러 패턴 추가
3. 🔜 **추천**: 캐릭터 상호작용 (클릭 반응)
4. 🔜 **추천**: 여러 캐릭터 동시 애니메이션
5. 🔜 **고급**: 스프라이트 시트 로딩

---

## 💬 FAQ

**Q: 왜 8fps인가요?**  
A: 픽셀 아트 게임이나 귀여운 캐릭터에 적합한 속도입니다. 60fps보다 의도적으로 느린 프레임 전환이 더 귀여운 느낌을 줍니다.

**Q: 프레임 수를 늘릴 수 있나요?**  
A: 네! `totalFrames`와 `ANIMATION_FRAMES` 배열만 수정하면 됩니다.

**Q: 이미지 파일을 사용할 수 있나요?**  
A: 가능합니다! `drawImage()`로 스프라이트 시트를 로딩해서 사용할 수 있습니다.

**Q: 모바일에서도 작동하나요?**  
A: 네! Canvas는 모든 모던 브라우저에서 지원됩니다.

---

## 🎉 완성!

이제 브라우저에서 파일을 열어서 부드러운 애니메이션을 확인해보세요!

```bash
# Netlify 배포 후
https://your-site.netlify.app/character-idle-animation.html
```

궁금한 점이 있으면 언제든 물어보세요! 😊


