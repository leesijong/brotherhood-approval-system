# 프로젝트 실행 규칙

## 🚨 중요: Git Bash 사용 및 명령어 실행 위치 규칙

### 🖥️ **터미널 환경**
- **사용 터미널**: Git Bash (Windows Terminal + Git Bash 권장)
- **설치 확인**: `git --version` (현재: 2.51.0.windows.1)
- **경로**: `C:\Program Files\Git\bin\bash.exe`

### ⚠️ **PowerShell 사용 시 주의사항**
- **`&&` 연산자 미지원**: PowerShell에서는 `&&` 연산자가 작동하지 않음
- **대안**: `;` 또는 `if ($?) { }` 구문 사용
- **예시**:
  ```powershell
  # ❌ 잘못된 방법
  cd backend && .\gradlew bootRun
  
  # ✅ 올바른 방법
  cd backend; .\gradlew bootRun
  # 또는
  cd backend
  if ($?) { .\gradlew bootRun }
  ```

### 1. 백엔드 (Spring Boot) 실행
```bash
# 항상 /c/cckbm/backend 디렉토리에서 실행
cd /c/cckbm/backend
./gradlew bootRun
```

### 2. 프론트엔드 (Next.js) 실행
```bash
# ⚠️ 반드시 /c/cckbm/brotherhood 디렉토리에서 실행
# ⚠️ 같은 터미널 세션에서 cd와 npm 명령어를 연속으로 실행
cd /c/cckbm/brotherhood
npm run dev
```

### 3. 데이터베이스 작업
```bash
# 항상 /c/cckbm 디렉토리에서 실행
cd /c/cckbm
psql -U postgres -d approval_system_dev
```

## 📁 프로젝트 디렉토리 구조

```
C:\cckbm\
├── backend\          # Spring Boot 백엔드
│   ├── build.gradle
│   ├── src\
│   └── ...
├── brotherhood\      # Next.js 프론트엔드
│   ├── package.json
│   ├── src\
│   └── ...
├── db\              # 데이터베이스 스키마
│   ├── schema.sql
│   └── seed.sql
└── docs\            # 문서
    └── ...
```

## ⚠️ 주의사항

1. **Git Bash 사용 필수**
   - PowerShell 대신 Git Bash 사용
   - Unix 스타일 경로 사용 (`/c/cckbm`)

2. **절대 상위 디렉토리에서 npm 명령어 실행 금지**
   - `/c/cckbm`에서 `npm run dev` 실행하면 안됨
   - 반드시 `/c/cckbm/brotherhood`에서 실행

3. **터미널 세션 주의사항**
   - `cd brotherhood`와 `npm run dev`는 **반드시 같은 터미널 세션**에서 실행
   - 다른 터미널 세션에서 실행하면 디렉토리 변경이 적용되지 않음

4. **명령어 실행 전 현재 위치 확인**
   ```bash
   pwd  # Git Bash에서 현재 디렉토리 확인
   ```

5. **올바른 실행 순서**
   ```bash
   # 1. 데이터베이스 시작 (PostgreSQL)
   # 2. 백엔드 실행
   cd /c/cckbm/backend
   ./gradlew bootRun
   
   # 3. 프론트엔드 실행 (새 터미널에서)
   cd /c/cckbm/brotherhood
   npm run dev
   ```

## 🔧 문제 해결

### npm run dev가 잘못된 위치에서 실행되는 경우
```bash
# 1. 현재 위치 확인
pwd

# 2. 올바른 디렉토리로 이동
cd /c/cckbm/brotherhood

# 3. 다시 실행
npm run dev
```

### 포트 충돌 시
```bash
# Node.js 프로세스 종료
taskkill /f /im node.exe

# Java 프로세스 종료 (백엔드)
taskkill /f /im java.exe
```

## 📝 체크리스트

- [ ] Git Bash 사용 확인: `git --version`
- [ ] 백엔드 실행 전: `cd /c/cckbm/backend` 확인
- [ ] 프론트엔드 실행 전: `cd /c/cckbm/brotherhood` 확인
- [ ] 데이터베이스 작업 전: `cd /c/cckbm` 확인
- [ ] 명령어 실행 전: `pwd`로 현재 위치 확인
