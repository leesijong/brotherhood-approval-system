# 🚀 Brotherhood 프로젝트 빠른 스크립트 참조

## 📍 **실행 위치**: `C:\cckbm` (프로젝트 루트)

## 🎯 **필수 명령어들**

### **시스템 시작**
```powershell
.\start-system.ps1
```

### **시스템 종료**
```powershell
.\stop-system.ps1
```

### **상태 확인**
```powershell
.\check-system.ps1
```

### **데이터베이스 연결**
```powershell
.\connect-db.ps1
```

## 🎛️ **고급 명령어들**

### **개별 서비스 관리**
```powershell
.\scripts\simple-start.ps1 start    # 전체 시작
.\scripts\simple-start.ps1 backend  # 백엔드만
.\scripts\simple-start.ps1 frontend # 프론트엔드만
.\scripts\simple-start.ps1 stop     # 모든 서비스 중지
.\scripts\simple-start.ps1 help     # 도움말
```

### **데이터베이스 관리**
```powershell
.\scripts\simple-db.ps1 connect  # 연결
.\scripts\simple-db.ps1 test     # 테스트
.\scripts\simple-db.ps1 help     # 도움말
```

## 🚫 **절대 금지**

```powershell
# ❌ 이런 명령어들 절대 사용 금지
cd C:\cckbm\backend
.\gradlew bootRun

cd C:\cckbm\brotherhood
npm run dev

cd C:\cckbm
psql -U postgres -d approval_system_dev
```

## ✅ **올바른 방법**

```powershell
# ✅ 프로젝트 루트에서 스크립트 사용
.\start-system.ps1
```

---
**💡 팁**: 모든 명령어는 `C:\cckbm` 디렉토리에서 실행하세요!
