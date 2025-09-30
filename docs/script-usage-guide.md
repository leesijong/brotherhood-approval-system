# Brotherhood 결재 시스템 스크립트 사용 가이드

## 📋 개요

이 문서는 Brotherhood 결재 시스템의 PowerShell 스크립트들을 효율적으로 사용하는 방법을 설명합니다. 개발 과정에서 겪었던 불편사항들을 해결하기 위해 통합 관리 스크립트를 제공합니다.

## 🎯 해결된 문제점

### 1️⃣ **PowerShell 환경 최적화**
- ✅ PowerShell 우선 명령어 제공
- ✅ Windows 환경에 최적화된 스크립트
- ✅ 색상 구분으로 가독성 향상
- ⚠️ **`&&` 연산자 미지원**: PowerShell에서는 `&&` 연산자가 작동하지 않음

### 2️⃣ **터미널 세션 관리**
- ✅ 통합 실행 스크립트로 디렉토리 문제 해결
- ✅ 백그라운드 프로세스 자동 관리
- ✅ 서비스 간 의존성 처리

### 3️⃣ **명령어 실행 완료 신호**
- ✅ 명확한 완료 상태 표시
- ✅ 오류 처리 및 상태 확인
- ✅ 타임아웃 설정으로 무한 대기 방지

### 4️⃣ **PostgreSQL 환경 설정**
- ✅ 자동 경로 탐지
- ✅ 환경변수 자동 설정
- ✅ 데이터베이스명 표준화 (`approval_system_dev`)

## 🚀 빠른 시작

### 프로젝트 루트에서 실행
```powershell
# 전체 시스템 시작 (가장 간단)
.\start-system.ps1

# 시스템 상태 확인
.\check-system.ps1

# 데이터베이스 연결
.\connect-db.ps1
```

## 🎛️ 마스터 제어 스크립트

### 기본 사용법
```powershell
.\scripts\master-control.ps1 [액션]
```

### 사용 가능한 액션

#### 🟢 **시스템 관리**
```powershell
# 전체 시스템 시작 (백엔드 + 프론트엔드)
.\scripts\master-control.ps1 start

# 모든 서비스 중지
.\scripts\master-control.ps1 stop

# 전체 시스템 재시작
.\scripts\master-control.ps1 restart

# 시스템 상태 확인
.\scripts\master-control.ps1 status
```

#### 🔵 **개별 서비스**
```powershell
# 백엔드만 시작
.\scripts\master-control.ps1 backend

# 프론트엔드만 시작
.\scripts\master-control.ps1 frontend
```

#### 🗄️ **데이터베이스**
```powershell
# 데이터베이스 연결
.\scripts\master-control.ps1 db
```

#### 🔧 **빌드 관리**
```powershell
# 백엔드 빌드만 실행
.\scripts\master-control.ps1 build

# 빌드 파일 정리
.\scripts\master-control.ps1 clean
```

#### ❓ **도움말**
```powershell
# 도움말 표시
.\scripts\master-control.ps1 help
```

## 🔧 개별 스크립트

### 백엔드 관리
```powershell
# 백엔드 시작 (빌드 포함)
.\scripts\start-backend.ps1

# 백엔드 시작 (빌드 생략)
.\scripts\start-backend.ps1 -Build:$false

# 백엔드 시작 (종료 시 대기하지 않음)
.\scripts\start-backend.ps1 -NoExit
```

### 프론트엔드 관리
```powershell
# 프론트엔드 시작
.\scripts\start-frontend.ps1

# 의존성 설치 후 시작
.\scripts\start-frontend.ps1 -Install

# 종료 시 대기하지 않음
.\scripts\start-frontend.ps1 -NoExit
```

### 통합 시작
```powershell
# 백엔드와 프론트엔드 순차 시작
.\scripts\start-all.ps1

# 빌드 생략하고 시작
.\scripts\start-all.ps1 -SkipBuild

# 백엔드 대기 시간 조정 (기본 15초)
.\scripts\start-all.ps1 -BackendWaitTime 20
```

## 🗄️ 데이터베이스 관리

### 데이터베이스 관리 스크립트
```powershell
.\scripts\db-manage.ps1 [액션] [옵션]
```

### 사용 가능한 액션
```powershell
# 데이터베이스 연결
.\scripts\db-manage.ps1 connect

# 데이터베이스 생성
.\scripts\db-manage.ps1 create

# 데이터베이스 삭제 (확인 필요)
.\scripts\db-manage.ps1 drop

# 데이터베이스 목록
.\scripts\db-manage.ps1 list

# 데이터베이스 백업
.\scripts\db-manage.ps1 backup

# 데이터베이스 복원
.\scripts\db-manage.ps1 restore

# 데이터베이스 상태 확인
.\scripts\db-manage.ps1 status
```

### PostgreSQL 환경 설정
```powershell
# PostgreSQL 경로 자동 설정
.\scripts\setup-postgresql.ps1
```

## 🔍 시스템 모니터링

### 상태 확인
```powershell
# 전체 시스템 상태 확인
.\scripts\check-status.ps1

# 마스터 스크립트로 상태 확인
.\scripts\master-control.ps1 status
```

### 확인 항목
- ✅ 프로젝트 디렉토리 구조
- ✅ 개발 도구 설치 상태 (Java, Node.js, npm, Gradle)
- ✅ PostgreSQL 설치 및 연결 상태
- ✅ 서비스 실행 상태 (백엔드, 프론트엔드)
- ✅ 포트 사용 상태 (8080, 3000, 5432)
- ✅ 프로세스 실행 상태

## ⚙️ PowerShell 프로필 설정

### 프로필 설정
```powershell
# Brotherhood 함수들을 PowerShell 프로필에 추가
.\scripts\setup-powershell-profile.ps1
```

### 설정 후 사용 가능한 명령어
```powershell
# 전체 시스템 시작
Start-BrotherhoodSystem
# 또는 간단히
b-start

# 시스템 상태 확인
Get-BrotherhoodStatus
# 또는 간단히
b-status

# 데이터베이스 연결
Connect-BrotherhoodDB
# 또는 간단히
b-db

# 프로젝트 디렉토리로 이동
Set-BrotherhoodDirectory
# 또는 간단히
b-cd

# 도움말 표시
Get-BrotherhoodHelp
# 또는 간단히
b-help
```

## 📁 환경 설정 파일

### 경로 설정 파일
```yaml
# config/local/paths.yml
paths:
  project_root: "C:\cckbm"
  backend: "C:\cckbm\backend"
  frontend: "C:\cckbm\brotherhood"
  
postgresql:
  install_paths:
    - "C:\Program Files\PostgreSQL\17\bin"
    - "C:\Program Files\PostgreSQL\16\bin"
    
database:
  name: "approval_system_dev"
  user: "postgres"
  port: 5432
```

## 🚨 문제 해결

### 자주 발생하는 문제

#### 1. **PowerShell 실행 정책 오류**
```powershell
# 실행 정책 변경
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. **PostgreSQL 경로를 찾을 수 없음**
```powershell
# PostgreSQL 환경 설정 실행
.\scripts\setup-postgresql.ps1
```

#### 3. **포트 충돌 오류**
```powershell
# 모든 서비스 중지
.\scripts\master-control.ps1 stop

# 프로세스 강제 종료
Get-Process | Where-Object {$_.ProcessName -like "*java*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force
```

#### 4. **데이터베이스 연결 실패**
```powershell
# PostgreSQL 서비스 상태 확인
Get-Service postgresql*

# PostgreSQL 서비스 시작
Start-Service postgresql-x64-17
```

### 로그 확인
```powershell
# 백엔드 로그
Get-Content "C:\cckbm\backend\logs\application.log" -Tail 50

# 프론트엔드 로그 (Next.js)
Get-Content "C:\cckbm\brotherhood\.next\build.log" -Tail 50
```

## 📚 추가 리소스

- [프로젝트 실행 규칙](project-execution-rules.md)
- [로컬 개발 환경 설정](local-development.md)
- [시스템 설계 문서](system-design.md)
- [API 명세서](api-specification.md)

## 💡 팁과 모범 사례

### 1. **일상적인 개발 워크플로우**
```powershell
# 1. 시스템 상태 확인
.\check-system.ps1

# 2. 전체 시스템 시작
.\start-system.ps1

# 3. 개발 작업 수행

# 4. 시스템 중지 (필요시)
.\scripts\master-control.ps1 stop
```

### 2. **빠른 디버깅**
```powershell
# 백엔드만 재시작
.\scripts\master-control.ps1 stop
.\scripts\master-control.ps1 backend

# 프론트엔드만 재시작
.\scripts\start-frontend.ps1
```

### 3. **데이터베이스 작업**
```powershell
# 데이터베이스 상태 확인
.\scripts\db-manage.ps1 status

# 백업 생성
.\scripts\db-manage.ps1 backup

# 데이터베이스 연결
.\connect-db.ps1
```

이제 개발 과정에서 겪었던 불편사항들이 크게 줄어들 것입니다! 🎉
