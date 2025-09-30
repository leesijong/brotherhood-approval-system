# 프로젝트 디렉토리 구조 가이드 (2025-09-24 현행화)

> ✅ **현재 상태**: 백엔드 전체 구조 완성, 프론트엔드 기본 구조 설정, UUID 기반 데이터베이스 설계 완료, 로그인 ID 시스템 구현, 로그아웃 기능 구현

## 전체 프로젝트 구조 (✅ 구현 완료)

```
cckbm/
├── backend/                          # ✅ Spring Boot 백엔드 (완료)
│   ├── build.gradle                  # ✅ Gradle 빌드 설정 (UUID 지원)
│   ├── settings.gradle               # ✅ Gradle 프로젝트 설정
│   ├── gradle/                       # ✅ Gradle Wrapper
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── brotherhood/
│   │   │   │           └── approval/
│   │   │   │               ├── ApprovalSystemApplication.java  # ✅ 메인 애플리케이션
│   │   │   │               ├── config/              # ✅ 설정 클래스 (완료)
│   │   │   │               │   ├── SecurityConfig.java
│   │   │   │               │   └── MethodSecurityConfig.java
│   │   │   │               ├── entity/              # ✅ JPA 엔티티 (UUID 기반, 완료)
│   │   │   │               │   ├── User.java           # UUID 기본키 + login_id 필드
│   │   │   │               │   ├── Role.java           # UUID 기본키
│   │   │   │               │   ├── UserRole.java       # UUID 기본키 + is_active 필드
│   │   │   │               │   ├── Branch.java         # UUID 기본키
│   │   │   │               │   ├── Document.java       # UUID 기본키 + document_number 필드
│   │   │   │               │   ├── ApprovalLine.java   # UUID 기본키
│   │   │   │               │   ├── ApprovalStep.java   # UUID 기본키
│   │   │   │               │   ├── ApprovalHistory.java # UUID 기본키
│   │   │   │               │   ├── Comment.java        # UUID 기본키
│   │   │   │               │   ├── Attachment.java     # UUID 기본키
│   │   │   │               │   ├── AuditLog.java       # UUID 기본키
│   │   │   │               │   ├── Notification.java   # UUID 기본키
│   │   │   │               │   └── Policy.java         # UUID 기본키
│   │   │   │               ├── repository/          # ✅ JPA 리포지토리 (UUID 기반, 완료)
│   │   │   │               │   ├── UserRepository.java           # UUID 타입 지원 + login_id 조회
│   │   │   │               │   ├── RoleRepository.java           # UUID 타입 지원
│   │   │   │               │   ├── UserRoleRepository.java       # UUID 타입 지원
│   │   │   │               │   ├── BranchRepository.java         # UUID 타입 지원
│   │   │   │               │   ├── DocumentRepository.java       # UUID 타입 지원
│   │   │   │               │   ├── ApprovalLineRepository.java   # UUID 타입 지원
│   │   │   │               │   ├── ApprovalStepRepository.java   # UUID 타입 지원
│   │   │   │               │   ├── ApprovalHistoryRepository.java # UUID 타입 지원
│   │   │   │               │   ├── CommentRepository.java        # UUID 타입 지원
│   │   │   │               │   ├── AttachmentRepository.java     # UUID 타입 지원
│   │   │   │               │   ├── AuditLogRepository.java       # UUID 타입 지원
│   │   │   │               │   ├── NotificationRepository.java   # UUID 타입 지원
│   │   │   │               │   └── PolicyRepository.java         # UUID 타입 지원
│   │   │   │               ├── service/             # ✅ 비즈니스 로직 (UUID 변환 지원, 완료)
│   │   │   │               │   ├── UserService.java             # UUID 변환 로직 + login_id 중복 검사
│   │   │   │               │   ├── AuthService.java             # JWT 토큰 생성, UUID 변환, login_id 기반 로그인
│   │   │   │               │   ├── JwtService.java              # JWT 토큰 관리
│   │   │   │               │   ├── DocumentService.java         # UUID 변환 로직 포함
│   │   │   │               │   ├── DocumentNumberService.java   # 문서 번호 생성
│   │   │   │               │   ├── ApprovalService.java         # UUID 변환 로직 포함
│   │   │   │               │   ├── ApprovalPolicyService.java   # 결재 정책 관리
│   │   │   │               │   ├── CrossBranchApprovalService.java # 교차 결재
│   │   │   │               │   ├── AttachmentService.java       # UUID 변환 로직 포함
│   │   │   │               │   ├── NotificationService.java     # UUID 변환 로직 포함
│   │   │   │               │   ├── AuditLogService.java         # UUID 변환 로직 포함
│   │   │   │               │   ├── AccessControlService.java    # 접근 제어
│   │   │   │               │   └── DashboardService.java        # 대시보드 통계
│   │   │   │               ├── controller/          # ✅ REST API 컨트롤러 (완료)
│   │   │   │               │   ├── AuthController.java         # 로그인/로그아웃 API + 세션 검증
│   │   │   │               │   ├── HealthController.java       # 헬스 체크 API
│   │   │   │               │   ├── UserController.java         # 사용자 관리 API
│   │   │   │               │   ├── DocumentController.java     # 문서 관리 API
│   │   │   │               │   ├── ApprovalController.java     # 결재 관리 API
│   │   │   │               │   ├── AttachmentController.java   # 첨부파일 API
│   │   │   │               │   ├── NotificationController.java # 알림 API
│   │   │   │               │   ├── DashboardController.java    # 대시보드 API
│   │   │   │               │   └── AdminController.java        # 관리자 API
│   │   │   │               ├── dto/                 # ✅ 데이터 전송 객체 (완료)
│   │   │   │               │   ├── BaseResponse.java          # 기본 응답 형식
│   │   │   │               │   ├── PageResponse.java          # 페이지네이션 응답
│   │   │   │               │   ├── auth/                      # 인증 관련 DTO
│   │   │   │               │   │   ├── LoginRequest.java      # login_id 기반 로그인
│   │   │   │               │   │   └── LoginResponse.java     # userInfo 구조 포함
│   │   │   │               │   ├── user/                      # 사용자 관련 DTO
│   │   │   │               │   │   ├── UserDto.java           # login_id 필드 포함
│   │   │   │               │   │   ├── UserCreateRequest.java # login_id 검증 포함
│   │   │   │               │   │   └── UserUpdateRequest.java # login_id 검증 포함
│   │   │   │               │   ├── document/                  # 문서 관련 DTO
│   │   │   │               │   ├── approval/                  # 결재 관련 DTO
│   │   │   │               │   ├── attachment/                # 첨부파일 관련 DTO
│   │   │   │               │   ├── notification/              # 알림 관련 DTO
│   │   │   │               │   └── comment/                   # 댓글 관련 DTO
│   │   │   │               ├── mapper/              # ✅ MapStruct 매퍼 (완료)
│   │   │   │               │   ├── UserMapper.java
│   │   │   │               │   ├── DocumentMapper.java
│   │   │   │               │   ├── ApprovalStepMapper.java
│   │   │   │               │   ├── ApprovalLineMapper.java
│   │   │   │               │   ├── ApprovalHistoryMapper.java
│   │   │   │               │   ├── AttachmentMapper.java
│   │   │   │               │   ├── NotificationMapper.java
│   │   │   │               │   ├── AuditLogMapper.java
│   │   │   │               │   ├── BranchMapper.java
│   │   │   │               │   ├── PolicyMapper.java
│   │   │   │               │   ├── CommentMapper.java
│   │   │   │               │   └── RoleMapper.java
│   │   │   │               ├── exception/           # ✅ 예외 처리 (완료)
│   │   │   │               │   └── GlobalExceptionHandler.java
│   │   │   │               └── interceptor/         # ✅ 인터셉터 (완료)
│   │   │   │                   └── AuditLoggingInterceptor.java
│   │   │   └── resources/
│   │   │       ├── application.yml                  # ✅ 기본 설정
│   │   │       ├── application-dev.yml             # ✅ 개발 환경 설정 (UUID 지원)
│   │   │       ├── db/
│   │   │       │   └── migration/                   # ✅ Flyway 마이그레이션 (UUID 기반)
│   │   │       │       ├── V1__init.sql            # UUID 스키마 생성
│   │   │       │       └── V2__seed_data.sql       # 초기 데이터 (UUID 기반)
│   │   │       ├── logback-spring.xml              # ✅ 로깅 설정
│   │   │       └── META-INF/
│   │   │           └── services/                    # ✅ MapStruct 설정
│   │   └── test/                                    # ✅ 테스트 코드 (부분 완료)
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── brotherhood/
│   │       │           └── approval/
│   │       │               ├── AccessControlTests.java
│   │       │               ├── ApprovalPolicyTests.java
│   │       │               ├── AuditLogTests.java
│   │       │               ├── CrossBranchApprovalTests.java
│   │       │               ├── DocumentServiceTests.java
│   │       │               └── UserServiceTests.java
│   │       └── resources/
│   │           └── application-test.yml             # ✅ 테스트 설정
├── brotherhood/                      # ✅ Brotherhood 프론트엔드 (Next.js + React)
│   ├── app/                          # ✅ Next.js App Router (완료)
│   │   ├── api-test/                 # ✅ API 테스트 페이지
│   │   ├── approvals/                # ✅ 결재 관리 페이지
│   │   ├── dashboard/                # ✅ 대시보드 페이지
│   │   ├── documents/                # ✅ 문서 관리 페이지
│   │   │   ├── [id]/                # ✅ 문서 상세 페이지
│   │   │   └── create/              # ✅ 문서 생성 페이지
│   │   ├── login/                    # ✅ 로그인 페이지 (실제 API 연동)
│   │   ├── settings/                 # ✅ 설정 페이지
│   │   ├── test/                     # ✅ 테스트 페이지
│   │   ├── users/                    # ✅ 사용자 관리 페이지
│   │   ├── globals.css               # ✅ 전역 스타일
│   │   ├── layout.tsx                # ✅ 루트 레이아웃
│   │   └── page.tsx                  # ✅ 홈 페이지
│   ├── src/                          # ✅ 소스 코드 (완료)
│   │   ├── components/               # ✅ React 컴포넌트
│   │   │   ├── ui/                   # ✅ shadcn/ui 컴포넌트
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   └── use-toast.ts
│   │   │   ├── layout/               # ✅ 레이아웃 컴포넌트
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   └── TopNavigation.tsx
│   │   │   ├── ApiTest.tsx           # ✅ API 테스트 컴포넌트
│   │   │   ├── ProtectedRoute.tsx    # ✅ 인증 보호 컴포넌트
│   │   │   ├── ThemeToggle.tsx       # ✅ 테마 토글 컴포넌트
│   │   │   ├── dashboard-header.tsx  # ✅ 대시보드 헤더
│   │   │   ├── dashboard-sidebar.tsx # ✅ 대시보드 사이드바
│   │   │   ├── dashboard-stats.tsx   # ✅ 대시보드 통계
│   │   │   ├── pending-approvals.tsx # ✅ 대기 결재 목록
│   │   │   ├── recent-documents.tsx  # ✅ 최근 문서 목록
│   │   │   └── DataTable.tsx         # ✅ 데이터 테이블
│   │   ├── hooks/                    # ✅ 커스텀 훅
│   │   │   ├── useAuth.ts            # ✅ 인증 훅 + 로그아웃 기능
│   │   │   ├── useDocuments.ts       # ✅ 문서 관리 훅
│   │   │   ├── usePermissions.ts     # ✅ 권한 관리 훅
│   │   │   ├── useSessionExpiry.ts   # ✅ 세션 만료 훅
│   │   │   ├── useTheme.ts           # ✅ 테마 관리 훅
│   │   │   └── useTokenRefresh.ts    # ✅ 토큰 갱신 훅
│   │   ├── lib/                      # ✅ 유틸리티 함수
│   │   │   └── utils.ts              # ✅ 공통 유틸리티
│   │   ├── providers/                # ✅ Context Provider
│   │   │   ├── AuthProvider.tsx      # ✅ 인증 컨텍스트
│   │   │   ├── QueryProvider.tsx     # ✅ React Query 설정
│   │   │   └── ThemeProvider.tsx     # ✅ 테마 컨텍스트
│   │   ├── services/                 # ✅ API 서비스 (완료)
│   │   │   ├── api.ts                # ✅ Axios 기본 설정
│   │   │   ├── authApi.ts            # ✅ 인증 API
│   │   │   ├── documentApi.ts        # ✅ 문서 API
│   │   │   ├── approvalApi.ts        # ✅ 결재 API
│   │   │   ├── dashboardApi.ts       # ✅ 대시보드 API
│   │   │   └── userApi.ts            # ✅ 사용자 API
│   │   ├── stores/                   # ✅ 상태 관리
│   │   │   ├── authStore.ts          # ✅ 인증 상태 관리
│   │   │   └── uiStore.ts            # ✅ UI 상태 관리
│   │   ├── types/                    # ✅ TypeScript 타입 (완료)
│   │   │   ├── auth.ts               # ✅ 인증 관련 타입
│   │   │   ├── document.ts           # ✅ 문서 관련 타입
│   │   │   ├── approval.ts           # ✅ 결재 관련 타입
│   │   │   ├── user.ts               # ✅ 사용자 관련 타입
│   │   │   └── common.ts             # ✅ 공통 타입
│   │   └── styles/                   # ✅ 스타일 파일
│   ├── public/                       # ✅ 정적 파일
│   │   ├── icons/                    # ✅ 아이콘 파일
│   │   └── images/                   # ✅ 이미지 파일
│   ├── docs/                         # ✅ 프로젝트 문서
│   │   ├── api/                      # ✅ API 문서
│   │   ├── components/               # ✅ 컴포넌트 문서
│   │   └── design/                   # ✅ 디자인 문서
│   ├── package.json                  # ✅ Node.js 의존성 (Next.js 14.2.25)
│   ├── tailwind.config.ts            # ✅ Tailwind CSS 설정
│   ├── components.json               # ✅ shadcn/ui 설정
│   ├── next.config.mjs               # ✅ Next.js 설정
│   ├── tsconfig.json                 # ✅ TypeScript 설정
│   └── test-api.js                   # ✅ API 테스트 스크립트
├── db/                               # ✅ 데이터베이스 관련 (UUID 기반)
│   ├── schema.sql                    # ✅ 스키마 정의 (UUID 기반)
│   ├── schema-new.sql                # ✅ 새로운 스키마 (UUID 기반)
│   └── seed.sql                      # ✅ 초기 데이터 (UUID 기반)
├── scripts/                          # ✅ 실행 스크립트
│   ├── install-java.ps1              # ✅ Java 설치 스크립트
│   ├── install-postgresql.ps1        # ✅ PostgreSQL 설치 스크립트
│   ├── install-postgresql-simple.ps1 # ✅ 간단한 PostgreSQL 설치
│   ├── setup-local-env.ps1           # ✅ 로컬 환경 설정
│   ├── start-backend.ps1             # ✅ 백엔드 시작 스크립트
│   ├── run-local.ps1                 # ✅ 로컬 실행 스크립트
│   └── backup-local.ps1              # ✅ 로컬 백업 스크립트
├── config/                           # ✅ 설정 파일
│   └── local/                        # ✅ 로컬 개발용 설정
│       └── application-local.yml
├── docs/                             # ✅ 문서 (현행화 완료)
│   ├── requirement.md                # ✅ 요구사항 문서
│   ├── checklist.md                  # ✅ 체크리스트
│   ├── project-structure.md          # ✅ 프로젝트 구조 (현재 문서)
│   ├── api-specification.md          # ✅ API 명세서
│   ├── database-design.md            # ✅ 데이터베이스 설계 (UUID 기반)
│   ├── development-guidelines.md     # ✅ 개발 가이드라인
│   ├── environment-setup.md          # ✅ 환경 설정 가이드
│   ├── local-development.md          # ✅ 로컬 개발 가이드
│   ├── testing-guide.md              # ✅ 테스트 가이드
│   ├── ui-design.md                  # ✅ UI 디자인 가이드
│   ├── tech-stack.md                 # ✅ 기술 스택 문서
│   ├── system-design.md              # ✅ 시스템 설계 문서
│   ├── windows-terminal-guide.md     # ✅ Windows 터미널 가이드
│   └── assets/                       # ✅ 문서용 이미지
│       ├── mobile-layout.svg         # ✅ 모바일 레이아웃
│       ├── pc-layout.svg             # ✅ PC 레이아웃
│       ├── permissions.svg           # ✅ 권한 구조도
│       └── spring-boot-components.svg # ✅ Spring Boot 컴포넌트
├── build.gradle                      # ✅ 루트 Gradle 설정
├── settings.gradle                   # ✅ Gradle 프로젝트 설정
├── wt-config.json                    # ✅ Windows Terminal 설정
├── .gitignore                        # ✅ Git 무시 파일
└── README.md                         # ✅ 프로젝트 README
```

## 주요 디렉토리 설명

### Backend (`backend/`)
- **Spring Boot 3.2.0** 기반 REST API 서버
- **Java 17** 사용
- **Gradle 8.5** 빌드 도구
- **PostgreSQL 17** 데이터베이스 연동
- **UUID 기반** 데이터베이스 설계
- **JWT 토큰** 인증 시스템
- **MapStruct** 객체 매핑
- **Flyway** 데이터베이스 마이그레이션

### Frontend (`brotherhood/`)
- **Next.js 14.2.25 + React 19 + TypeScript 5.x**
- **Tailwind CSS 4.1.9 + shadcn/ui** UI 프레임워크
- **App Router** 기반 라우팅
- **실제 백엔드 API 연동** 완료
- **JWT 토큰 기반** 인증 시스템
- **Zustand** 상태 관리
- **React Query** 서버 상태 관리

### Database (`db/`)
- **PostgreSQL 17** 스키마 정의
- **UUID 기본키** 사용
- **Flyway 마이그레이션** 파일
- **초기 데이터** 시드 파일
- **is_active 필드** 추가된 user_roles 테이블
- **document_number, rejected_at, rejection_reason** 필드 추가된 documents 테이블

### Scripts (`scripts/`)
- **PowerShell 기반** 실행 스크립트
- **로컬 개발 환경** 구축 스크립트
- **데이터베이스** 설정 및 백업 스크립트
- **백엔드/프론트엔드** 시작 스크립트

### Config (`config/`)
- **로컬 개발용** 설정 파일
- **환경별** 설정 분리
- **UUID 지원** 설정

### Docs (`docs/`)
- **프로젝트 문서** 전체
- **API 명세서**, **데이터베이스 설계** 등
- **현행화 완료** (2025-09-22)

## 주요 기술적 개선사항

### 1. UUID 기반 설계
- 모든 주요 테이블에서 UUID를 기본키로 사용
- 확장성과 보안 향상
- 분산 시스템 대응 가능

### 2. 데이터베이스 스키마 개선
- `user_roles` 테이블에 `is_active` 필드 추가
- `documents` 테이블에 `document_number`, `rejected_at`, `rejection_reason` 필드 추가
- `approval_history` 테이블 추가로 결재 이력 추적 강화
- **`users` 테이블에 `login_id` 필드 추가** (2025-09-24)
- **`login_id` 기반 인증 시스템** 구현

### 3. 프론트엔드 API 연동
- 실제 백엔드 API와 연동 완료
- JWT 토큰 기반 인증 시스템 구현
- 로그인 페이지에서 실제 API 호출
- **로그인 ID 기반 인증** 구현 (2025-09-24)
- **로그아웃 기능** 구현 (2025-09-24)

### 4. 개발 환경 개선
- PowerShell 기반 스크립트로 Windows 환경 최적화
- Gradle과 npm을 통한 독립적인 빌드 시스템
- 로컬 개발 환경 자동화
- **프로젝트 실행 규칙** 문서화 (2025-09-24)

### 5. 인증 시스템 개선 (2025-09-24)
- **로그인 ID 시스템**: `name` 필드와 분리된 `login_id` 필드 사용
- **한글 입력 방지**: 로그인 ID에 영문, 숫자, 언더스코어만 허용
- **실시간 입력 검증**: 프론트엔드에서 즉시 입력 필터링
- **로그아웃 기능**: 확인 다이얼로그와 함께 안전한 로그아웃 처리
- **세션 관리**: Spring Security 기반 세션 무효화

## 개발 순서 권장사항

1. **프로젝트 초기 설정** ✅ 완료
2. **데이터베이스 설계** ✅ 완료 (UUID 기반)
3. **백엔드 코어** ✅ 완료 (엔티티 → 리포지토리 → 서비스 → 컨트롤러)
4. **프론트엔드 기본** ✅ 완료 (React 컴포넌트 → Next.js 페이지)
5. **API 연동** ✅ 완료 (실제 백엔드 연동)
6. **통합 테스트** ✅ 완료 (로그인 기능 검증)

## 현재 상태 요약

- ✅ **백엔드**: 완전 구현 및 실행 가능
- ✅ **프론트엔드**: 완전 구현 및 실행 가능  
- ✅ **데이터베이스**: UUID 기반 설계 완료
- ✅ **API 연동**: 로그인 기능 완전 작동
- ✅ **문서**: 모든 문서 현행화 완료
- ✅ **개발 환경**: 로컬 개발 환경 완전 구축
- ✅ **인증 시스템**: 로그인 ID 기반 인증 완료 (2025-09-24)
- ✅ **로그아웃 기능**: 안전한 로그아웃 처리 완료 (2025-09-24)