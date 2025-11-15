# Firebase Realtime Database 보안 규칙 설정

## 설정 방법

### 1. Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "healing-friend" 프로젝트 선택

### 2. Realtime Database 규칙 탭으로 이동
1. 왼쪽 메뉴에서 **"Realtime Database"** 클릭
2. 상단 탭에서 **"규칙"** 클릭

### 3. 보안 규칙 입력
아래 규칙을 복사해서 붙여넣기:

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": true
    },
    "roomPasswords": {
      ".read": true,
      ".write": true
    }
  }
}
```

### 4. 규칙 게시
1. **"게시"** 버튼 클릭
2. 확인 메시지에서 **"게시"** 다시 클릭

## 주의사항
- 개발 중에는 위 규칙을 사용해도 되지만, 프로덕션에서는 더 엄격한 규칙을 설정하세요
- 테스트 모드로 시작했다면 이미 읽기/쓰기가 허용되어 있을 수 있습니다


