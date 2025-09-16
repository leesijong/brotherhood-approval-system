## 구현 체크리스트 (프론트엔드/백엔드/설정)

아래 순서대로 진행합니다. 각 항목 완료 시 [x]로 표시하세요.

### 0) 프로젝트 초기 설정
- [ ] 리포지토리 초기화 및 브랜치 전략 준비 (`main`, `feature/*`)
- [ ] GitHub Actions 시크릿 설정: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `DB_URL`, `DB_USER`, `DB_PASS`
- [ ] 개발/운영 프로파일 환경변수 정의 (`SPRING_PROFILES_ACTIVE`, 프론트엔드 베이스 URL)

### 1) 데이터베이스/스키마
- [ ] DB 선택 및 인스턴스 준비: PostgreSQL 16 (권장) 또는 MariaDB 10.6+
- [ ] 스키마 정의 파일 생성 `db/schema.sql`
  - [ ] 테이블: `users`, `roles`, `user_roles`, `branches`, `documents`, `approval_lines`, `approval_steps`, `comments`, `attachments`, `audit_logs`, `policies`
- [ ] 초기 데이터(권장) `db/seed.sql` (기본 역할/지사/템플릿)
- [ ] 마이그레이션 도구 선택/초기화 (예: Flyway) `backend/src/main/resources/db/migration/V1__init.sql`
- [ ] 멀티테넌시/지사 스코프 키(Branch-ID) 설계 및 인덱스 적용

### 2) 백엔드(Spring Boot 3, Java 17)
- [ ] 프로젝트 생성 (Gradle) `backend/build.gradle`, `backend/settings.gradle`
- [ ] 애플리케이션 엔트리 `backend/src/main/java/.../Application.java`
- [ ] 환경설정 `backend/src/main/resources/application.yml`, `application-dev.yml`, `application-prod.yml`
- [ ] 보안 설정
  - [ ] `SecurityConfig` (MFA 훅, 세션/JWT 정책, CSRF)
  - [ ] `MethodSecurityConfig` (권한 주석)
- [ ] 도메인 엔티티(`entity`)
  - [ ] `User`, `Role`, `Branch`, `Document`, `ApprovalLine`, `ApprovalStep`, `Comment`, `Attachment`, `AuditLog`, `Policy`
- [ ] 리포지토리(`repository`)
- [ ] DTO/요청/응답(`dto`)
- [ ] 매퍼(`mapper`) (MapStruct 권장)
- [ ] 서비스(`service`)
  - [ ] 사용자/권한 서비스
  - [ ] 결재선/결재 프로세스 서비스 (순차/병렬/조건부, 대결/위임)
  - [ ] 문서/첨부 관리 서비스(바이러스 스캔 훅 포함 지점)
  - [ ] 감사 로그 서비스(WORM/별도 저장 연계 포인트)
- [ ] 컨트롤러(`controller`)
  - [ ] 인증/세션/프로필 API
  - [ ] 문서 CRUD/검색 API(권한 필터링)
  - [ ] 결재 상신/승인/반려/회수/재상신 API
  - [ ] 첨부 업/다운로드 API(권한/워터마크 정책)
  - [ ] 알림 훅(웹훅/메일/푸시 연계 지점)
  - [ ] 지사/본원 라우팅 정책 API(조건부 결재선 추천)
- [ ] 예외/에러 응답 표준화 `GlobalExceptionHandler`
- [ ] OpenAPI 문서 `springdoc` 설정
- [ ] 로깅/감사 인터셉터(열람/검색/다운로드/권한 변경 기록)
- [ ] 단위/통합 테스트 (TDD)
  - [ ] 결재선 정책 엔진 테스트 `src/test/java/.../ApprovalPolicyTests.java`
  - [ ] 문서 접근제어(RBAC+ABAC) 테스트 `AccessControlTests.java`
  - [ ] 감사 로깅 무결성 테스트 `AuditLogTests.java`
  - [ ] 지사 교차 결재 시나리오 테스트 `CrossBranchApprovalTests.java`

### 3) 프론트엔드(jQuery + HTML/CSS)
- [ ] 정적 리소스 구조 `frontend/`
  - [ ] `frontend/index.html` (대시보드/알림 요약)
  - [ ] `frontend/login.html`, `frontend/logout.html`
  - [ ] 문서 목록 `frontend/documents/list.html`
  - [ ] 문서 작성 `frontend/documents/new.html`
  - [ ] 문서 상세/결재 `frontend/documents/detail.html`
  - [ ] 관리(지사/사용자/정책) `frontend/admin/index.html`
  - [ ] 공통 스크립트 `frontend/js/app.js` (AJAX 기본, 에러/토스트, 로딩)
  - [ ] API 클라이언트 `frontend/js/api.js` (인증 헤더, CSRF 토큰 처리)
  - [ ] 결재 UX 스크립트 `frontend/js/approval.js` (상신/승인/반려/회수)
  - [ ] 접근제어 UX `frontend/js/access.js` (버튼/메뉴 가시성)
  - [ ] 스타일 `frontend/css/styles.css` (또는 Bootstrap 5 사용)
  - [ ] 뷰어 보안 옵션(워터마크) `frontend/js/watermark.js`
  - [ ] 파일 업/다운로드 컴포넌트 `frontend/js/file.js`
  - [ ] 클라이언트 사이드 유효성 검사 `frontend/js/validation.js`
  - [ ] 템플릿 조각(`partials`): 헤더/사이드바/푸터
  - [ ] 지사 선택/전환 UI 및 결재선 추천 미리보기

### 4) 권한/정책 구성(중요)
- [ ] 역할/권한 시드: 일반/중간관리/책임/장상/관리자
- [ ] 문서 등급 정책(일반/대외비/비밀/특정) + 다운로드 제한
- [ ] 지사(분원) 라우팅 규칙(금액/유형/통화/본원 승인 삽입)
- [ ] 교차 지사 결재 접근 최소화 정책(Need-to-Know)
- [ ] 지역 경계 태그 및 경보 정책(지사 외 전파 방지)

### 5) 감사/모니터링/알림
- [ ] 감사 로그 수집 파이프라인(별도 저장/WORM 지향) 연동 지점 토글
- [ ] 시스템/보안/애플리케이션 로그 수집 설정
- [ ] 알림 채널 설정(메일/푸시). 토큰/SMTP 자격증명 시크릿 분리

### 6) 배포/인프라
- [ ] Dockerfile (백엔드)
- [ ] docker-compose.yaml (app + db + reverse-proxy)
- [ ] Nginx 리버스 프록시 설정(HTTPS/TLS) `ops/nginx/conf.d/app.conf`
- [ ] GitHub Actions 배포 잡(이미지 빌드/푸시/SSH 배포) 점검
- [ ] 백업/복구 스크립트(덤프/복원) `ops/backup/*`
- [ ] 로컬 우선 실행 검증 → 이후 AWS(또는 클라우드) 환경 연동 계획 수립

### 7) 문서/운영
- [ ] OpenAPI 스펙 파일 `docs/openapi.yaml`
- [ ] 운영 플레이북(장애·보안 이벤트 대응) `docs/runbook.md`
- [ ] 사용자 매뉴얼(기안/결재/대결/회수) `docs/user-guide.md`

---

## 산출물 경로 요약
- 백엔드: `backend/src/main/java`, `backend/src/main/resources`, `backend/src/test/java`
- 프론트엔드: `frontend/*` (html/css/js/partials)
- 스키마/마이그레이션: `db/*`, `backend/src/main/resources/db/migration/*`
- 인프라: `Dockerfile`, `docker-compose.yaml`, `ops/*`
- 문서: `docs/*`


