# 프로젝트 디렉토리 구조 가이드

## 전체 프로젝트 구조
```
cckbm/
├── brotherhood/                      # Brotherhood 프론트엔드 (Next.js 14 + React 19)
│   ├── src/                          # 소스 코드
│   │   ├── components/               # React 컴포넌트
│   │   ├── pages/                    # Next.js 페이지
│   │   ├── hooks/                    # 커스텀 훅
│   │   ├── lib/                      # 유틸리티 함수
│   │   ├── types/                    # TypeScript 타입
│   │   └── styles/                   # 스타일 파일
│   ├── public/                       # 정적 파일
│   ├── docs/                         # 프로젝트 문서
│   ├── package.json                  # Node.js 의존성
│   ├── tailwind.config.ts            # Tailwind CSS 설정
│   ├── components.json               # shadcn/ui 설정
│   └── next.config.mjs               # Next.js 설정
├── backend/                          # Spring Boot 백엔드
│   ├── build.gradle                  # Gradle 빌드 설정
│   ├── settings.gradle               # Gradle 프로젝트 설정
│   ├── gradle/                       # Gradle Wrapper
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── cckbm/
│   │   │   │           └── approval/
│   │   │   │               ├── Application.java
│   │   │   │               ├── config/              # 설정 클래스
│   │   │   │               │   ├── SecurityConfig.java
│   │   │   │               │   ├── MethodSecurityConfig.java
│   │   │   │               │   └── DatabaseConfig.java
│   │   │   │               ├── entity/              # JPA 엔티티
│   │   │   │               │   ├── User.java
│   │   │   │               │   ├── Role.java
│   │   │   │               │   ├── Branch.java
│   │   │   │               │   ├── Document.java
│   │   │   │               │   ├── ApprovalLine.java
│   │   │   │               │   ├── ApprovalStep.java
│   │   │   │               │   ├── Comment.java
│   │   │   │               │   ├── Attachment.java
│   │   │   │               │   ├── AuditLog.java
│   │   │   │               │   └── Policy.java
│   │   │   │               ├── repository/          # JPA 리포지토리
│   │   │   │               │   ├── UserRepository.java
│   │   │   │               │   ├── DocumentRepository.java
│   │   │   │               │   └── ...
│   │   │   │               ├── service/             # 비즈니스 로직
│   │   │   │               │   ├── UserService.java
│   │   │   │               │   ├── DocumentService.java
│   │   │   │               │   ├── ApprovalService.java
│   │   │   │               │   └── ...
│   │   │   │               ├── controller/          # REST API 컨트롤러
│   │   │   │               │   ├── AuthController.java
│   │   │   │               │   ├── DocumentController.java
│   │   │   │               │   ├── ApprovalController.java
│   │   │   │               │   └── ...
│   │   │   │               ├── dto/                 # 데이터 전송 객체
│   │   │   │               │   ├── request/
│   │   │   │               │   ├── response/
│   │   │   │               │   └── ...
│   │   │   │               ├── mapper/              # MapStruct 매퍼
│   │   │   │               │   └── DocumentMapper.java
│   │   │   │               ├── exception/           # 예외 처리
│   │   │   │               │   ├── GlobalExceptionHandler.java
│   │   │   │               │   └── CustomExceptions.java
│   │   │   │               └── util/                # 유틸리티 클래스
│   │   │   │                   ├── SecurityUtil.java
│   │   │   │                   └── FileUtil.java
│   │   │   └── resources/
│   │   │       ├── application.yml                  # 기본 설정
│   │   │       ├── application-dev.yml             # 개발 환경 설정
│   │   │       ├── db/
│   │   │       │   └── migration/                   # Flyway 마이그레이션
│   │   │       │       ├── V1__init.sql
│   │   │       │       └── V2__add_indexes.sql
│   │   │       └── static/                          # 정적 리소스 (프론트엔드)
│   │   └── test/                                    # 테스트 코드
│   │       └── java/
│   │           └── com/
│   │               └── cckbm/
│   │                   └── approval/
│   │                       ├── service/
│   │                       ├── controller/
│   │                       └── integration/
├── frontend/                         # 프론트엔드 (정적 파일)
│   ├── index.html                    # 메인 대시보드
│   ├── login.html                    # 로그인 페이지
│   ├── documents/                    # 문서 관련 페이지
│   │   ├── list.html                 # 문서 목록
│   │   ├── new.html                  # 문서 작성
│   │   └── detail.html               # 문서 상세/결재
│   ├── admin/                        # 관리자 페이지
│   │   └── index.html
│   ├── css/                          # 스타일시트
│   │   └── styles.css
│   ├── js/                           # JavaScript
│   │   ├── app.js                    # 메인 애플리케이션
│   │   ├── api.js                    # API 클라이언트
│   │   ├── approval.js               # 결재 관련 기능
│   │   ├── access.js                 # 접근 제어
│   │   ├── file.js                   # 파일 업/다운로드
│   │   ├── validation.js             # 유효성 검사
│   │   └── watermark.js              # 워터마크 기능
│   └── partials/                     # 공통 컴포넌트
│       ├── header.html
│       ├── sidebar.html
│       └── footer.html
├── db/                               # 데이터베이스 관련
│   ├── schema.sql                    # 스키마 정의
│   └── seed.sql                      # 초기 데이터
├── scripts/                          # 실행 스크립트
│   ├── run-local.sh                  # 로컬 실행 스크립트
│   ├── setup-db.sh                   # DB 설정 스크립트
│   └── backup-local.sh               # 로컬 백업 스크립트
├── config/                           # 설정 파일
│   └── local/                        # 로컬 개발용 설정
│       ├── application-local.yml
│       └── database-local.yml
├── docs/                             # 문서
│   ├── requirement.md
│   ├── checklist.md
│   ├── project-structure.md
│   ├── api-specification.md
│   ├── database-design.md
│   ├── local-development.md
│   └── setup-guide.md
├── Dockerfile                        # Docker 이미지 빌드
├── docker-compose.yml                # 로컬 개발용 Docker Compose
├── .gitignore
└── README.md
```

## 주요 디렉토리 설명

### Backend (`backend/`)
- **Spring Boot 3.x** 기반 REST API 서버
- **Java 17** 사용
- **Gradle** 빌드 도구
- **PostgreSQL** 데이터베이스 연동

### Frontend (`frontend/`)
- **순수 HTML/CSS/JavaScript** (jQuery 3.x)
- **Bootstrap 5.x** UI 프레임워크 (선택적)
- **정적 파일**로 Spring Boot에서 서빙

### Database (`db/`)
- **PostgreSQL** 스키마 정의
- **Flyway** 마이그레이션 파일
- **초기 데이터** 시드 파일

### Scripts (`scripts/`)
- **로컬 개발 환경** 구축 스크립트
- **데이터베이스** 설정 및 백업 스크립트

### Config (`config/`)
- **로컬 개발용** 설정 파일
- **환경별** 설정 분리

### Docs (`docs/`)
- **프로젝트 문서** 전체
- **API 명세서**, **데이터베이스 설계** 등

## 개발 순서 권장사항

1. **프로젝트 초기 설정** (`backend/` 디렉토리 생성)
2. **데이터베이스 설계** (`db/` 스키마 정의)
3. **백엔드 코어** (엔티티 → 리포지토리 → 서비스 → 컨트롤러)
4. **프론트엔드 기본** (HTML 템플릿 → JavaScript)
5. **통합 테스트** 및 **로컬 실행 검증**
