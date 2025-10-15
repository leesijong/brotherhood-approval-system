# 스크립트 사용 가이드

## 📋 개요

이 문서는 Brotherhood 결재 시스템의 PowerShell 스크립트를 효율적으로 사용하는 방법을 설명합니다. 개발 과정에서 겪었던 불편사항들을 해결하기 위해 통합 관리 스크립트를 제공합니다.

---

## 🚨 필수 준수 사항

### 1. **PowerShell 우선 사용 원칙**
- ✅ **모든 명령어는 PowerShell로 먼저 실행**
- ✅ **Windows 환경에 최적화된 스크립트 활용**
- ✅ **수동 명령어 대신 제공된 스크립트 사용**

### 2. **스크립트 우선 사용 원칙**
- ✅ **디렉토리 이동 없이 프로젝트 루트에서 실행**
- ✅ **터미널 세션 관리 자동화 활용**
- ✅ **명령어 실행 완료 신호 확인**

### 3. **오류 방지 원칙**
- ✅ **PostgreSQL 경로 자동 탐지 활용**
- ✅ **데이터베이스명 표준화** (`approval_system_dev`)
- ✅ **백그라운드 프로세스 자동 관리**

---

## 🎯 해결된 문제점

### 1️⃣ PowerShell 환경 최적화
- ✅ PowerShell 우선 명령어 제공
- ✅ Windows 환경에 최적화된 스크립트
- ✅ 색상 구분으로 가독성 향상
- ⚠️ **`&&` 연산자 미지원**: PowerShell에서는 `&&` 연산자가 작동하지 않음

### 2️⃣ 터미널 세션 관리
- ✅ 통합 실행 스크립트로 디렉토리 문제 해결
- ✅ 백그라운드 프로세스 자동 관리
- ✅ 서비스 간 의존성 처리

### 3️⃣ 명령어 실행 완료 신호
- ✅ 명확한 완료 상태 표시
- ✅ 오류 처리 및 상태 확인
- ✅ 타임아웃 설정으로 무한 대기 방지

### 4️⃣ PostgreSQL 환경 설정
- ✅ 자동 경로 탐지
- ✅ 환경변수 자동 설정
- ✅ 데이터베이스명 표준화

---

## 🚀 빠른 시작

### 프로젝트 루트에서 실행
```powershell
# 전체 시스템 시작 (가장 간단)
.\start-system.ps1

# 시스템 상태 확인
.\check-system.ps1

# 데이터베이스 연결
.\connect-db.ps1

# 시스템 중지
.\stop-system.ps1
```

---

## 📁 스크립트 파일 구조

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
    ├── start-backend.ps1     # 백엔드 시작
    ├── start-frontend.ps1    # 프론트엔드 시작
    ├── start-all.ps1         # 전체 시작
    ├── check-status.ps1      # 상태 확인
    ├── db-manage.ps1         # DB 관리
    └── setup-postgresql.ps1  # PostgreSQL 설정
```

---

## 🎛️ 주요 스크립트 사용법

### 1. 시스템 시작/중지

#### 전체 시스템 시작
```powershell
# 프로젝트 루트에서 실행
.\start-system.ps1

# 또는 scripts 디렉토리의 통합 스크립트
.\scripts\simple-start.ps1 start
```

**동작**:
- 백엔드 빌드 및 실행 (새 PowerShell 창)
- 15초 대기 (백엔드 시작 완료)
- 프론트엔드 실행 (새 PowerShell 창)
- 각 창에서 로그 실시간 확인 가능

#### 전체 시스템 중지
```powershell
# 모든 서비스 중지
.\stop-system.ps1

# 또는
.\scripts\simple-start.ps1 stop
```

**동작**:
- Java 프로세스 종료 (백엔드)
- Node.js 프로세스 종료 (프론트엔드)
- 포트 8080, 3000 해제 확인

---

### 2. 개별 서비스 실행

#### 백엔드만 시작
```powershell
# 백엔드만 실행
.\scripts\simple-start.ps1 backend

# 또는 직접 스크립트
.\scripts\start-backend.ps1

# 빌드 생략하고 시작
.\scripts\start-backend.ps1 -Build:$false
```

#### 프론트엔드만 시작
```powershell
# 프론트엔드만 실행
.\scripts\simple-start.ps1 frontend

# 또는 직접 스크립트
.\scripts\start-frontend.ps1

# 의존성 설치 후 시작
.\scripts\start-frontend.ps1 -Install
```

---

### 3. 시스템 상태 확인

```powershell
# 전체 시스템 상태 확인
.\check-system.ps1

# 또는 간단한 상태 확인
.\scripts\test-status.ps1
```

**확인 항목**:
- ✅ 프로젝트 디렉토리 구조
- ✅ 개발 도구 설치 상태 (Java, Node.js, npm, Gradle)
- ✅ PostgreSQL 설치 및 연결 상태
- ✅ 서비스 실행 상태 (백엔드, 프론트엔드)
- ✅ 포트 사용 상태 (8080, 3000, 5432)
- ✅ 프로세스 실행 상태

---

### 4. 데이터베이스 관리

#### 데이터베이스 연결
```powershell
# 간단한 연결
.\connect-db.ps1

# 또는 관리 스크립트
.\scripts\simple-db.ps1 test
```

#### 데이터베이스 관리
```powershell
# 데이터베이스 생성
.\scripts\db-manage.ps1 create

# 데이터베이스 백업
.\scripts\db-manage.ps1 backup

# 데이터베이스 복원
.\scripts\db-manage.ps1 restore

# 데이터베이스 목록
.\scripts\db-manage.ps1 list

# 데이터베이스 상태
.\scripts\db-manage.ps1 status
```

---

## 🔧 마스터 제어 스크립트

### 기본 사용법
```powershell
.\scripts\master-control.ps1 [액션]
```

### 사용 가능한 액션

#### 🟢 시스템 관리
```powershell
# 전체 시스템 시작
.\scripts\master-control.ps1 start

# 모든 서비스 중지
.\scripts\master-control.ps1 stop

# 전체 시스템 재시작
.\scripts\master-control.ps1 restart

# 시스템 상태 확인
.\scripts\master-control.ps1 status
```

#### 🔵 개별 서비스
```powershell
# 백엔드만 시작
.\scripts\master-control.ps1 backend

# 프론트엔드만 시작
.\scripts\master-control.ps1 frontend
```

#### 🗄️ 데이터베이스
```powershell
# 데이터베이스 연결
.\scripts\master-control.ps1 db
```

#### 🔧 빌드 관리
```powershell
# 백엔드 빌드만 실행
.\scripts\master-control.ps1 build

# 빌드 파일 정리
.\scripts\master-control.ps1 clean
```

#### ❓ 도움말
```powershell
# 도움말 표시
.\scripts\master-control.ps1 help
```

---

## 🚫 절대 금지 사항

### ❌ 수동 명령어 실행 금지
```powershell
# ❌ 절대 사용 금지
cd C:\cckbm\backend
.\gradlew bootRun

cd C:\cckbm\brotherhood  
npm run dev

cd C:\cckbm
psql -U postgres -d approval_system_dev
```

### ❌ 수동 디렉토리 이동 금지
```powershell
# ❌ 절대 사용 금지
cd backend
cd brotherhood
Set-Location backend
```

### ✅ 올바른 사용 방법
```powershell
# ✅ 올바른 방법: 스크립트 사용
.\start-system.ps1
.\check-system.ps1
.\connect-db.ps1
```

---

## 💡 일상적인 개발 워크플로우

### 개발 시작
```powershell
# 1. 프로젝트 루트로 이동
cd C:\cckbm

# 2. 시스템 상태 확인
.\check-system.ps1

# 3. 전체 시스템 시작
.\start-system.ps1

# 4. 브라우저에서 확인
# 프론트엔드: http://localhost:3000
# 백엔드: http://localhost:8080/api/health
```

### 개발 작업 중
```powershell
# 코드 수정 후 백엔드만 재시작 (필요시)
.\stop-system.ps1
.\scripts\simple-start.ps1 backend

# 프론트엔드는 hot-reload로 자동 반영
```

### 개발 종료
```powershell
# 모든 서비스 중지
.\stop-system.ps1
```

---

## 🚨 문제 해결

### 1. PowerShell 실행 정책 오류
```powershell
# 실행 정책 변경
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. PostgreSQL 경로를 찾을 수 없음
```powershell
# PostgreSQL 환경 설정 실행
.\scripts\setup-postgresql.ps1
```

### 3. 포트 충돌 오류
```powershell
# 모든 서비스 중지
.\stop-system.ps1

# 프로세스 강제 종료
Get-Process | Where-Object {$_.ProcessName -like "*java*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force
```

### 4. 데이터베이스 연결 실패
```powershell
# PostgreSQL 서비스 상태 확인
Get-Service postgresql*

# PostgreSQL 서비스 시작
Start-Service postgresql-x64-17
```

### 5. 스크립트 대기 상태
- **문제**: 스크립트가 무한 대기 상태
- **해결**: `Ctrl+C`로 중단 후 `.\stop-system.ps1` 실행

---

## 📚 추가 리소스

- [개발 환경 설정 가이드](setup-guide.md)
- [개발 가이드라인](development-guidelines.md)
- [프로젝트 진행 상황](project-context.md)
- [API 명세서](api-specification.md)

---

## 💡 스크립트 특징

### 자동화 기능
- ✅ **디렉토리 자동 이동**: 스크립트 내부에서 처리
- ✅ **백그라운드 프로세스**: 각 서비스를 별도 창에서 실행
- ✅ **의존성 처리**: 백엔드 시작 후 프론트엔드 자동 시작
- ✅ **PostgreSQL 경로 자동 탐지**: 수동 경로 설정 불필요

### 오류 방지 기능
- ✅ **명확한 상태 표시**: 각 단계별 성공/실패 표시
- ✅ **상세한 오류 메시지**: 문제 해결 방법 제시
- ✅ **타임아웃 설정**: 무한 대기 방지
- ✅ **데이터베이스명 표준화**: `approval_system_dev` 고정

---

## 🎯 AI 어시스턴트 지침

### 명령어 제안 시
- **PowerShell 스크립트 우선 제시**
- **수동 명령어 대신 제공된 스크립트 사용 강제**
- **디렉토리 이동 명령어 절대 제안 금지**

### 개발자 지침
- **이 규칙을 반드시 준수**
- **스크립트 사용을 습관화**
- **수동 명령어 사용 금지**
- **문제 발생 시 스크립트 우선 사용**

---

**⚠️ 이 규칙을 준수하지 않으면 개발 과정에서 불편사항이 재발할 수 있습니다. 반드시 제공된 스크립트를 활용하세요!**

---

**마지막 업데이트**: 2025-10-15  
**작성자**: AI Assistant

