# 🚀 Brotherhood Approval System - 빠른 시작 가이드

## ⚠️ **중요: 올바른 실행 방법**

### 방법 1: 스크립트 사용 (권장)
```powershell
# 백엔드 실행
.\start-backend.ps1

# 프론트엔드 실행 (새 터미널에서)
.\start-frontend.ps1
```

### 방법 2: 수동 실행
```powershell
# 백엔드 실행
cd C:\cckbm\backend
.\gradlew bootRun

# 프론트엔드 실행 (새 터미널에서)
cd C:\cckbm\brotherhood
npm run dev
```

## 🚨 **절대 하지 말아야 할 것**

❌ **잘못된 방법**:
```powershell
# 이렇게 하면 안됩니다!
cd C:\cckbm
npm run dev  # ❌ 이 위치에서 실행하면 안됨

# 또는 다른 터미널 세션에서 실행
cd C:\cckbm\brotherhood  # 터미널 1
npm run dev              # 터미널 2 ❌ 다른 세션에서 실행하면 안됨
```

✅ **올바른 방법**:
```powershell
# 이렇게 해야 합니다! (같은 터미널 세션에서)
cd C:\cckbm\brotherhood
npm run dev  # ✅ 같은 세션에서 연속 실행
```

## 📁 프로젝트 구조

```
C:\cckbm\
├── backend\          # Spring Boot 백엔드
│   ├── build.gradle
│   └── src\
├── brotherhood\      # Next.js 프론트엔드
│   ├── package.json
│   └── src\
├── start-backend.ps1     # 백엔드 실행 스크립트
├── start-frontend.ps1    # 프론트엔드 실행 스크립트
└── QUICK-START.md        # 이 파일
```

## 🔧 문제 해결

### 포트 충돌 시
```powershell
# Node.js 프로세스 종료
taskkill /f /im node.exe

# Java 프로세스 종료
taskkill /f /im java.exe
```

### 현재 위치 확인
```powershell
pwd  # 현재 디렉토리 확인
```

## 📚 더 자세한 정보

- [프로젝트 실행 규칙](docs/project-execution-rules.md)
- [개발 가이드라인](docs/development-guidelines.md)
- [로컬 개발 환경 설정](docs/local-development.md)
