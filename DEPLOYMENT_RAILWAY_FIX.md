# Railway 배포 문제 해결 가이드

## 현재 문제
"Could not find root directory: backend" 오류가 발생하고 있습니다.

## 해결 방법

### 방법 1: Root Directory를 비우기 (시도해보세요)

1. Railway 대시보드 > Settings > Source
2. **Root Directory 필드를 완전히 비우기** (빈 문자열로 설정)
3. Save 클릭
4. 배포 트리거

루트에 `railway.json` 파일을 추가했습니다. 이 파일이 있으면 Railway가 루트에서 직접 실행을 시도합니다.

### 방법 2: GitHub 저장소 구조 확인

GitHub 저장소에서 실제 구조를 확인하세요:
- 저장소 루트에 `backend/` 디렉토리가 직접 있는지
- 아니면 `healing-friend-main/backend/`인지

**GitHub 저장소 루트에 `backend/`가 직접 있는 경우:**
- Railway Root Directory: `backend` (현재 설정 유지)

**GitHub 저장소 루트가 `healing-friend-main/`인 경우:**
- Railway Root Directory: `healing-friend-main/backend`

### 방법 3: Railway 배포 로그 확인

1. Railway 대시보드에서 실패한 배포 클릭
2. "View logs" 버튼 클릭
3. "Snapshot code" 단계 확인
4. 로그에 나타난 실제 디렉토리 구조 확인
5. 그에 맞게 Root Directory 설정

### 방법 4: 직접 배포 (임시 해결책)

Railway CLI를 사용하여 직접 배포:

```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# backend 디렉토리로 이동
cd backend

# 배포
railway up
```

## 확인 사항

- [ ] GitHub에 `backend/` 디렉토리가 푸시되었는지 확인
- [ ] `.gitignore`에서 `backend/`가 무시되지 않는지 확인
- [ ] Railway 배포 로그에서 실제 파일 구조 확인
- [ ] `backend/package.json` 파일이 존재하는지 확인
- [ ] `backend/server.js` 파일이 존재하는지 확인

## 다음 단계

1. 위 방법들을 순서대로 시도
2. 각 시도 후 배포 로그 확인
3. 여전히 실패하면 Railway 지원팀에 문의 (배포 로그와 함께)

