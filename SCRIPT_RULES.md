# 🚨 Brotherhood 프로젝트 스크립트 사용 규칙 (AI 어시스턴트 필수 참조)

## ⚠️ **중요: 이 규칙을 반드시 준수하세요!**

### **PowerShell 스크립트 우선 사용 원칙**
- ✅ **모든 명령어는 PowerShell로 먼저 실행**
- ❌ **Git Bash, cmd 명령어 절대 사용 금지**
- ✅ **제공된 스크립트만 사용**

### **필수 사용 스크립트들**
```powershell
# 시스템 시작 (무조건 사용)
.\start-system.ps1

# 시스템 종료 (무조건 사용)  
.\stop-system.ps1

# 상태 확인 (무조건 사용)
.\check-system.ps1

# 데이터베이스 연결 (무조건 사용)
.\connect-db.ps1
```

### **절대 금지 사항**
```powershell
# ❌ 절대 사용 금지
cd C:\cckbm\backend
.\gradlew bootRun

cd C:\cckbm\brotherhood
npm run dev

cd C:\cckbm
psql -U postgres -d approval_system_dev
```

### **올바른 사용법**
```powershell
# ✅ 올바른 방법
# 프로젝트 루트(C:\cckbm)에서 실행
.\start-system.ps1
```

---
**이 규칙을 준수하지 않으면 개발 과정에서 불편사항이 재발합니다!**
