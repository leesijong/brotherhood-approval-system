# Brotherhood 결재 시스템 개발 스크립트 규칙

## 📋 개요

이 문서는 Brotherhood 결재 시스템 개발 과정에서 **반드시 준수해야 하는 스크립트 사용 규칙**을 정의합니다. 개발 과정에서 겪었던 불편사항들을 해결하기 위해 작성된 PowerShell 스크립트들을 **무조건 활용**해야 합니다.

## 🚨 **필수 준수 사항**

### 1. **PowerShell 우선 사용 원칙**
- ✅ **모든 명령어는 PowerShell로 먼저 실행**
- ❌ **Git Bash, cmd 명령어는 절대 사용 금지**
- ✅ **Windows 환경에 최적화된 스크립트 활용**

### 2. **스크립트 우선 사용 원칙**
- ✅ **수동 명령어 대신 제공된 스크립트 사용**
- ✅ **디렉토리 이동 없이 프로젝트 루트에서 실행**
- ✅ **터미널 세션 관리 자동화 활용**

### 3. **오류 방지 원칙**
- ✅ **명령어 실행 완료 신호 확인**
- ✅ **PostgreSQL 경로 자동 탐지 활용**
- ✅ **데이터베이스명 표준화 (`approval_system_dev`)**

## 🎛️ **필수 사용 스크립트 목록**

### **🚀 시스템 시작**
```powershell
# 전체 시스템 시작 (무조건 사용)
.\start-system.ps1

# 개별 서비스 시작
.\scripts\simple-start.ps1 start    # 전체 시작
.\scripts\simple-start.ps1 backend  # 백엔드만
.\scripts\simple-start.ps1 frontend # 프론트엔드만
```

### **🛑 시스템 종료**
```powershell
# 모든 서비스 중지 (무조건 사용)
.\stop-system.ps1

# 마스터 스크립트로 중지
.\scripts\simple-start.ps1 stop
```

### **🔍 상태 확인**
```powershell
# 시스템 상태 확인 (무조건 사용)
.\check-system.ps1

# 개별 상태 확인
.\scripts\test-status.ps1
```

### **🗄️ 데이터베이스 관리**
```powershell
# 데이터베이스 연결 (무조건 사용)
.\connect-db.ps1

# 데이터베이스 테스트
.\scripts\simple-db.ps1 test

# 데이터베이스 도움말
.\scripts\simple-db.ps1 help
```

## 📁 **스크립트 파일 구조**

```
C:\cckbm\
├── start-system.ps1          # 🚀 전체 시스템 시작
├── stop-system.ps1           # 🛑 모든 서비스 중지
├── check-system.ps1          # 🔍 시스템 상태 확인
├── connect-db.ps1            # 🗄️ 데이터베이스 연결
└── scripts\
    ├── simple-start.ps1      # 🎛️ 마스터 제어 스크립트
    ├── test-status.ps1       # 📊 상태 확인 스크립트
    ├── simple-db.ps1         # 🗄️ 데이터베이스 관리 스크립트
    └── [기타 스크립트들...]
```

## 🚫 **절대 금지 사항**

### **명령어 실행 금지**
```powershell
# ❌ 절대 사용 금지
cd C:\cckbm\backend
.\gradlew bootRun

cd C:\cckbm\brotherhood  
npm run dev

cd C:\cckbm
psql -U postgres -d approval_system_dev
```

### **수동 디렉토리 이동 금지**
```powershell
# ❌ 절대 사용 금지
cd backend
cd brotherhood
Set-Location backend
```

### **Git Bash 명령어 금지**
```bash
# ❌ 절대 사용 금지
cd /c/cckbm/backend
./gradlew bootRun
```

## ✅ **올바른 사용 방법**

### **일상적인 개발 워크플로우**
```powershell
# 1. 프로젝트 루트에서 시스템 시작
.\start-system.ps1

# 2. 개발 작업 수행
# ... 코딩 작업 ...

# 3. 상태 확인 (필요시)
.\check-system.ps1

# 4. 데이터베이스 작업 (필요시)
.\connect-db.ps1

# 5. 시스템 종료 (필요시)
.\stop-system.ps1
```

### **문제 해결 시**
```powershell
# 1. 상태 확인
.\check-system.ps1

# 2. 모든 서비스 중지
.\stop-system.ps1

# 3. 시스템 재시작
.\start-system.ps1
```

## 🔧 **스크립트 특징**

### **자동화 기능**
- ✅ **디렉토리 자동 이동**: 스크립트 내부에서 처리
- ✅ **백그라운드 프로세스**: 각 서비스를 별도 창에서 실행
- ✅ **의존성 처리**: 백엔드 시작 후 프론트엔드 자동 시작
- ✅ **PostgreSQL 경로 자동 탐지**: 수동 경로 설정 불필요

### **오류 방지 기능**
- ✅ **명확한 상태 표시**: 각 단계별 성공/실패 표시
- ✅ **상세한 오류 메시지**: 문제 해결 방법 제시
- ✅ **타임아웃 설정**: 무한 대기 방지
- ✅ **데이터베이스명 표준화**: `approval_system_dev` 고정

## 📚 **스크립트 사용 가이드**

### **새로운 개발자 온보딩**
1. **프로젝트 루트로 이동**: `C:\cckbm`
2. **시스템 시작**: `.\start-system.ps1`
3. **상태 확인**: `.\check-system.ps1`
4. **개발 시작**: 백엔드(8080), 프론트엔드(3000) 접속

### **일일 개발 시작**
```powershell
# 프로젝트 루트에서
.\start-system.ps1
```

### **일일 개발 종료**
```powershell
# 프로젝트 루트에서
.\stop-system.ps1
```

## 🚨 **중요 알림**

### **AI 어시스턴트 지침**
- **모든 명령어 제안 시 PowerShell 스크립트 우선 제시**
- **수동 명령어 대신 제공된 스크립트 사용 강제**
- **디렉토리 이동 명령어 절대 제안 금지**
- **Git Bash 명령어 절대 제안 금지**

### **개발자 지침**
- **이 규칙을 반드시 준수**
- **스크립트 사용을 습관화**
- **수동 명령어 사용 금지**
- **문제 발생 시 스크립트 우선 사용**

## 📖 **참고 문서**

- [스크립트 사용 가이드](script-usage-guide.md)
- [프로젝트 실행 규칙](project-execution-rules.md)
- [로컬 개발 환경 설정](local-development.md)

## 🔄 **규칙 업데이트**

이 규칙은 프로젝트 진행에 따라 업데이트될 수 있습니다. 새로운 스크립트가 추가되면 이 문서에 반드시 반영해야 합니다.

---

**⚠️ 이 규칙을 준수하지 않으면 개발 과정에서 불편사항이 재발할 수 있습니다. 반드시 제공된 스크립트를 활용하세요!**
