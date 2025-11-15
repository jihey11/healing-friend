# 🚨 Railway 배포 즉시 수정 방법

## 현재 문제
"Could not find root directory: backend" 오류가 계속 발생합니다.

## ⚡ 즉시 해결 방법

### Step 1: Railway Root Directory 비우기

1. Railway 대시보드 접속: https://railway.app
2. `healing-friend` 프로젝트 선택
3. **Settings** 탭 클릭
4. **Source** 섹션으로 스크롤
5. **Root Directory** 필드의 `backend` 텍스트를 **완전히 삭제** (빈 문자열로 만들기)
6. **Save** 버튼 클릭
7. 자동 재배포 대기 (또는 수동으로 재배포 트리거)

### Step 2: 변경사항 GitHub에 푸시

```bash
cd "C:\Users\ghrkr\OneDrive\바탕 화면\healing-friend-main (1)\healing-friend-main"

git add railway.json nixpacks.toml
git commit -m "Fix Railway: add root config files for deployment"
git push origin main
```

### Step 3: 배포 확인

- Railway 대시보드에서 배포 상태 확인
- 배포 로그 확인 (성공/실패 여부)
- 실패 시 로그의 구체적인 오류 메시지 확인

## 왜 이 방법이 작동하는가?

1. **Root Directory를 비우면**: Railway가 GitHub 저장소의 루트에서 시작
2. **루트의 `railway.json`**: `cd backend && npm start` 명령으로 backend로 이동
3. **`nixpacks.toml`**: 빌드 시 `cd backend && npm install` 실행
4. 결과적으로 Railway가 루트에서 시작하지만, 자동으로 backend로 이동하여 실행

## 여전히 실패한다면

1. **GitHub 저장소 구조 확인**
   - https://github.com/jihey11/healing-friend 접속
   - 저장소 루트에 `backend/` 디렉토리가 있는지 확인
   - `backend/package.json` 파일이 있는지 확인

2. **Railway 배포 로그 확인**
   - 실패한 배포 > "View logs" 클릭
   - "Snapshot code" 단계에서 어떤 파일/디렉토리가 보이는지 확인
   - 실제 구조에 맞게 Root Directory 재설정

3. **대안: Root Directory를 다른 경로로 시도**
   - 만약 GitHub에 `healing-friend-main/backend/` 구조라면
   - Root Directory: `healing-friend-main/backend` 시도

