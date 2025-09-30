# 한국순교복자수도회 내부결재 시스템

## 프로젝트 개요

한국순교복자수도회의 내부 문서 결재 시스템을 전자화하여 투명성과 추적성을 확보하고, 보안과 접근통제를 최우선으로 하는 전자결재 시스템입니다.

## 주요 기능

- **문서 관리**: 문서 기안, 작성, 수정, 버전 관리
- **결재 프로세스**: 순차/병렬/조건부 결재선 지원
- **권한 관리**: RBAC + ABAC 기반 세밀한 접근 제어
- **지사 지원**: 전 세계 여러 분원(지사) 구조 지원
- **보안**: MFA 인증, 암호화, 감사 로그
- **알림**: 실시간 알림 (웹/모바일/이메일)

## 🚨 **중요: 스크립트 사용 규칙**
- ✅ **모든 명령어는 PowerShell로 실행**
- ✅ **제공된 스크립트만 사용** (수동 명령어 금지)
- ✅ **프로젝트 루트에서 실행** (디렉토리 이동 금지)
- ⚠️ **`&&` 연산자 미지원**: PowerShell에서는 `&&` 연산자가 작동하지 않음
- 📖 **상세 규칙**: [SCRIPT_RULES.md](SCRIPT_RULES.md) 참조

## 🚀 **빠른 시작 (PowerShell 권장)**

### 💡 **간편 실행 스크립트**
프로젝트 루트에서 다음 명령어로 전체 시스템을 쉽게 시작할 수 있습니다:

```powershell
# 전체 시스템 시작
.\start-system.ps1

# 시스템 상태 확인
.\check-system.ps1

# 데이터베이스 연결
.\connect-db.ps1
```

### 🎛️ **마스터 제어 스크립트**
더 세밀한 제어가 필요한 경우:

```powershell
# 전체 시스템 시작
.\scripts\master-control.ps1 start

# 백엔드만 시작
.\scripts\master-control.ps1 backend

# 프론트엔드만 시작
.\scripts\master-control.ps1 frontend

# 데이터베이스 연결
.\scripts\master-control.ps1 db

# 시스템 상태 확인
.\scripts\master-control.ps1 status

# 모든 서비스 중지
.\scripts\master-control.ps1 stop

# 전체 시스템 재시작
.\scripts\master-control.ps1 restart
```

### 🔧 **PowerShell 프로필 설정 (선택사항)**
자주 사용하는 명령어를 간편하게 실행하려면:

```powershell
# PowerShell 프로필에 Brotherhood 함수들 추가
.\scripts\setup-powershell-profile.ps1

# 설정 후 사용 가능한 명령어
Start-BrotherhoodSystem    # 전체 시스템 시작 (또는 b-start)
Get-BrotherhoodStatus      # 상태 확인 (또는 b-status)
Connect-BrotherhoodDB      # DB 연결 (또는 b-db)
```

## 🚨 **중요: 명령어 실행 위치 규칙**

### 🖥️ **터미널 환경**
- **권장 터미널**: PowerShell (Windows 환경 최적화)
- **대안**: Git Bash (Unix 스타일 명령어 선호 시)
- **절대 금지**: cmd (Command Prompt)

### 📍 **디렉토리 위치 규칙**
```powershell
# ✅ 올바른 실행 위치
C:\cckbm> .\start-system.ps1

# ❌ 잘못된 실행 위치
C:\> .\start-system.ps1  # 프로젝트 루트가 아님
```

### 🔄 **기존 Git Bash 사용자**
Git Bash를 계속 사용하고 싶다면:

```bash
# 백엔드 실행
cd /c/cckbm/backend
./gradlew bootRun

# 프론트엔드 실행 (새 터미널)
cd /c/cckbm/brotherhood
npm run dev

# 데이터베이스 작업
cd /c/cckbm
psql -U postgres -d approval_system_dev
```

> **⚠️ 주의사항**: 
> 1. 절대 상위 디렉토리에서 `npm run dev` 실행 금지!
> 2. PowerShell 사용 시 `.ps1` 스크립트 활용 권장
> 3. 자세한 규칙은 [프로젝트 실행 규칙 문서](docs/project-execution-rules.md)를 참조하세요.

## 기술 스택

### 백엔드
- **Java 17 LTS**
- **Spring Boot 3.2.0**
- **PostgreSQL 17**
- **Spring Security 6.2.0**
- **Gradle 8.5**
- **UUID 기반 식별자**
- **로그인 ID 시스템**

### 프론트엔드 (Brotherhood 디자인 시스템)
- **Next.js 14.2.25** + **React 19** + **TypeScript 5.x**
- **Tailwind CSS 4.1.9** + **shadcn/ui** (UI Framework)
- **Radix UI** (접근성 지원)
- **Lucide React 0.454.0** (아이콘)
- **Geist** (현대적인 폰트)
- **Zustand** (상태 관리)
- **React Query** (서버 상태 관리)
- **브랜드 컬러**: #7e1416 (레드) - 한국순교복자수도회 홈페이지 색감 반영
  - 메인: #7e1416 (레드)
  - 보조: #f59e0b (앰버/오렌지)
  - 카드: #fef2f2 (연한 레드)
  - 파괴적: #dc2626 (빨간색)

## 로컬 개발 환경 설정

### 필수 요구사항
- Java 17 LTS
- PostgreSQL 17
- Gradle 8.5
- Node.js 18.x (Brotherhood 프론트엔드용)
- npm 또는 yarn

### 설치 및 실행

1. **데이터베이스 설정**
```bash
# PostgreSQL 설치 후 데이터베이스 생성
createdb approval_system_dev
```

2. **애플리케이션 실행**
```bash
# 백엔드 실행
cd /c/cckbm/backend
./gradlew bootRun

# 프론트엔드 실행 (새 터미널)
cd /c/cckbm/brotherhood
npm run dev
```

3. **접속**
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080/api
- API 문서: http://localhost:8080/swagger-ui.html

## 프로젝트 구조

```
cckbm/
├── backend/                 # Spring Boot 백엔드
├── brotherhood/             # Next.js 프론트엔드
├── db/                     # 데이터베이스 스키마
├── scripts/                # 실행 스크립트
├── config/                 # 설정 파일
├── docs/                   # 프로젝트 문서
└── docker-compose.yml      # 로컬 개발용 Docker 설정
```

## 개발 가이드

자세한 개발 가이드는 다음 문서를 참조하세요:

- [로컬 개발 환경 설정](docs/local-development.md)
- [프로젝트 구조 가이드](docs/project-structure.md)
- [API 명세서](docs/api-specification.md)
- [데이터베이스 설계](docs/database-design.md)
- [시스템 설계](docs/system-design.md)

## 라이선스

이 프로젝트는 한국순교복자수도회 내부 사용을 위한 것입니다.

## 기여하기

프로젝트 기여 방법은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참조하세요.
