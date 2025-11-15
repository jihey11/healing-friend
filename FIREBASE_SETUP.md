# Firebase Firestore 보안 규칙 설정 가이드

## 문제 상황
Firebase 권한 오류(`Missing or insufficient permissions`)가 발생하는 경우, Firestore 보안 규칙이 제대로 설정되지 않았을 가능성이 높습니다.

## 해결 방법

### 1. Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택

### 2. Firestore 보안 규칙 설정
1. 왼쪽 메뉴에서 **Firestore Database** 클릭
2. 상단 탭에서 **규칙** 클릭
3. 아래 규칙을 복사하여 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 사용자 데이터 - 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 일기 데이터 - 본인이 작성한 일기만 읽기/쓰기 가능
    match /diaries/{diaryId} {
      allow read: if request.auth != null && 
                     (resource == null || resource.data.uid == request.auth.uid);
      allow create: if request.auth != null && 
                      request.resource.data.uid == request.auth.uid;
      allow update, delete: if request.auth != null && 
                             resource.data.uid == request.auth.uid;
    }
    
    // 게임 진행 상황 - 본인만 읽기/쓰기 가능
    match /gameProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 기본적으로 모든 접근 거부
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. **게시** 버튼 클릭

### 3. 보안 규칙 설명

#### `users` 컬렉션
- 인증된 사용자만 자신의 사용자 문서에 접근 가능
- `request.auth.uid == userId` 조건으로 본인 데이터만 접근

#### `diaries` 컬렉션
- 인증된 사용자가 자신의 일기만 읽기/쓰기 가능
- 새 일기 작성 시 `uid` 필드가 현재 사용자와 일치해야 함
- 기존 일기는 `uid` 필드로 소유자 확인

#### `gameProgress` 컬렉션
- 인증된 사용자가 자신의 게임 진행 상황만 읽기/쓰기 가능

### 4. 테스트 모드 (개발 중 임시 사용)

⚠️ **주의**: 프로덕션 환경에서는 절대 사용하지 마세요!

개발 중에만 임시로 모든 접근을 허용하려면:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

이 규칙은 2025년 12월 31일까지 모든 읽기/쓰기를 허용합니다. 개발 완료 후 반드시 위의 보안 규칙으로 변경하세요.

### 5. 규칙 배포 확인
1. 규칙 게시 후 몇 분 정도 기다림
2. 브라우저를 새로고침하고 다시 시도
3. 콘솔에서 권한 오류가 사라졌는지 확인

## 문제 해결 체크리스트

- [ ] Firebase Console에 로그인했는가?
- [ ] 올바른 프로젝트를 선택했는가?
- [ ] Firestore Database > 규칙 탭으로 이동했는가?
- [ ] 보안 규칙을 복사하여 붙여넣었는가?
- [ ] "게시" 버튼을 클릭했는가?
- [ ] 사용자가 로그인되어 있는가? (인증 필요)
- [ ] 브라우저를 새로고침했는가?

## 추가 참고사항

- 보안 규칙 변경은 즉시 적용되지만, 최대 1분 정도 걸릴 수 있습니다
- 규칙 문법 오류가 있으면 게시가 거부됩니다
- 규칙 시뮬레이터를 사용하여 규칙을 테스트할 수 있습니다



