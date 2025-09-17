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

## 기술 스택

### 백엔드
- **Java 17 LTS**
- **Spring Boot 3.2.0**
- **PostgreSQL 16.1**
- **Spring Security 6.2.0**
- **Gradle 8.5**

### 프론트엔드
- **HTML5/CSS3/JavaScript**
- **jQuery 3.7.1**
- **Bootstrap 5.3.2** (선택적)

## 로컬 개발 환경 설정

### 필수 요구사항
- Java 17 LTS
- PostgreSQL 16.1
- Gradle 8.5

### 설치 및 실행

1. **데이터베이스 설정**
```bash
# PostgreSQL 설치 후 데이터베이스 생성
createdb approval_system_dev
```

2. **애플리케이션 실행**
```bash
# 백엔드 실행
cd backend
./gradlew bootRun

# 또는 Docker Compose 사용
docker-compose up -d
```

3. **접속**
- 웹 애플리케이션: http://localhost:8080
- API 문서: http://localhost:8080/swagger-ui.html

## 프로젝트 구조

```
cckbm/
├── backend/                 # Spring Boot 백엔드
├── frontend/               # 정적 웹 리소스
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
