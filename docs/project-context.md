# 프로젝트 개발 컨텍스트 문서

> **목적**: 바이브 코딩 시 AI 세션이 변경되어도 프로젝트 연속성을 유지하기 위한 인수인계 문서

**마지막 업데이트**: 2025-10-15  
**현재 버전**: v2.0 (간소화 버전)  
**Git 백업**: 이전 상세 버전은 Git 히스토리에서 확인 가능

---

## 📋 문서 사용법

### 🔄 자동 업데이트 규칙
- **문제 해결 시**: "문제 해결 레퍼런스" 섹션에 추가
- **새로운 구현 완료 시**: "최근 주요 작업" 섹션 최상단에 추가  
- **시스템 상태 변경 시**: "현재 시스템 상태" 섹션 업데이트

### 📝 업데이트 형식
- **날짜**: YYYY-MM-DD HH:MM 형식
- **내용**: 문제 → 해결 → 결과 명확히 구분
- **카테고리**: 백엔드/프론트엔드/데이터베이스/배포

### 🎯 새 세션 시작 시
1. **현재 시스템 상태** 섹션 먼저 확인
2. **다음 단계** 섹션에서 작업 항목 확인
3. **핵심 개발 규칙** 섹션 숙지

---

## 🎯 현재 시스템 상태

### ✅ 완료된 핵심 기능 (2025-10-15 기준)

#### 배포 및 인프라
- ✅ **Railway 프로덕션 배포** 완료
  - 백엔드: https://brotherhood-approval-system-production.up.railway.app
  - 프론트엔드: https://brotherhood-frontend-production.up.railway.app
  - PostgreSQL: Railway 제공 PostgreSQL 연결
  - 데이터: 12명 사용자, 15개 문서 마이그레이션 완료

#### 백엔드 (Spring Boot 3.2.0 + Java 17)
- ✅ **인증 시스템**: JWT 기반 로그인/로그아웃
- ✅ **사용자 관리**: UUID 기반 CRUD, 권한 관리
- ✅ **문서 관리**: CRUD, 검색, 필터링, 파일 첨부
- ✅ **결재 시스템**: 결재선 설정, 승인/반려, 결재 이력 추적
- ✅ **감사 로깅**: 모든 보안 이벤트 자동 기록
- ✅ **데이터베이스**: PostgreSQL 17, UUID 기반 설계

#### 프론트엔드 (Next.js 14 + React 19)
- ✅ **인증 UI**: 로그인, 로그아웃, 세션 관리
- ✅ **대시보드**: 통계, 결재 대기 목록, 최근 활동
- ✅ **문서 관리**: 생성, 수정, 삭제, 상세 조회, 검색
- ✅ **결재 관리**: 결재 대기, 이력, 워크플로우, 위임
- ✅ **사용자 관리**: 사용자 목록, 통계, 권한 관리
- ✅ **모바일 반응형**: 4단계 완전 구현, 터치 친화적 UI
- ✅ **접근성(a11y)**: WCAG 2.1 AA 준수
- ✅ **성능 최적화**: Gzip 압축, SWC minification

#### 보안 및 규정 준수
- ✅ **JWT 인증**: HttpOnly 쿠키, SameSite, Secure
- ✅ **권한 관리**: RBAC + ABAC 정책
- ✅ **CORS 설정**: Railway 프론트엔드 도메인 허용
- ✅ **SQL 인젝션 방지**: JPA 사용
- ✅ **XSS 방지**: React 기본 방어 + 입력 검증
- ✅ **CSRF 보호**: Spring Security 활성화

### ⚠️ 알려진 이슈 (2025-10-15)

1. **파일 업로드 영구 저장 문제** (중간)
   - **위치**: Railway Volume 제거로 인한 임시 저장
   - **문제**: Railway 재시작 시 업로드된 파일 사라짐
   - **영향**: 파일 첨부 기능 제한적 사용
   - **해결방법**: Cloudflare R2 또는 Railway Volume 재설정 필요
   - **우선순위**: 중간 (기능적 제약 있음)

2. **메모리 사용량 모니터링 필요** (낮음)
   - **위치**: Railway 배포 환경
   - **문제**: JWT 라이브러리로 인한 메모리 사용량 증가
   - **영향**: OOM 위험성 존재
   - **해결방법**: Railway 메모리 증설 또는 코드 최적화
   - **우선순위**: 낮음 (현재 정상 작동)

---

## 📝 최근 주요 작업

### 2025-10-15 (Railway Volume 설정 및 OOM 문제 해결)

#### Railway Volume 설정 및 메모리 최적화
- ✅ **Railway Volume 설정**: `brotherhood-approval-system-volume` 생성 (500MB)
- ✅ **Volume 마운트**: `/app/uploads` 경로로 파일 저장소 설정
- ✅ **환경변수 설정**: `UPLOAD_DIR=/app/uploads` Railway 환경변수 추가
- ✅ **OOM 문제 해결**: JWT 라이브러리 임시 비활성화로 메모리 사용량 대폭 감소
- ✅ **JWT 복원**: 인증 기능 정상화를 위해 JWT 클래스들 복원
- ✅ **Volume 제거**: 메모리 부족 해결을 위해 Volume 삭제, 로컬 임시 저장으로 전환

#### 파일 업로드 시스템 개선
- ✅ **하드코딩 URL 제거**: `localhost:8080` → `apiRequest()` 통합
- ✅ **documentApi 확장**: `uploadAttachment()`, `deleteAttachment()`, `getAttachments()` 메서드 추가
- ✅ **Attachment 타입 통일**: `@/types`에서 import하여 일관성 확보
- ✅ **프론트엔드 수정**: 문서 수정 페이지에서 `fetch` → `documentApi` 사용

#### 인증 시스템 안정화
- ✅ **JWT 토큰 생성**: 실제 JWT 토큰 생성 로직 복원
- ✅ **SecurityConfig 복원**: JWT 인증 필터 정상 작동
- ✅ **문서 목록 복구**: JWT 인증으로 인한 문서 목록 표시 정상화

### 2025-10-15 (문서 정리)

#### 문서 구조 개선
- ✅ **docs/ 디렉토리 정리**: 24개 → 14개 (42% 감소)
- ✅ **통합 가이드 생성**:
  - `setup-guide.md`: 환경 설정 통합 (3개 문서 통합)
  - `scripts-guide.md`: 스크립트 사용법 통합 (2개 문서 통합)
- ✅ **중복/충돌 문서 제거**: 13개 파일 삭제
- ✅ **문서 카테고리화**: 5단계 구조 (정의/설계/가이드/진행/리포트)
- ✅ **project-context.md 간소화**: 1719줄 → 효율적 구조로 재구성

### 2025-10-13 (5단계 최종 폴리시 완료)

#### 접근성(a11y) 완전 개선
- ✅ **TopNavigation**: `role="banner"`, 모든 버튼 `aria-label`
- ✅ **AppLayout**: `role="main"` 추가
- ✅ **DashboardSidebar**: "새 문서 작성" 버튼 `aria-label`
- ✅ **로그인 페이지**: 폼 및 입력 필드 `aria-label`, `aria-required`
- ✅ **모든 아이콘**: `aria-hidden="true"` (스크린 리더 최적화)
- ✅ **검색 폼**: `role="search"` 추가
- ✅ **알림 버튼**: 읽지 않은 알림 수 포함 aria-label

#### 성능 최적화
- ✅ **Gzip 압축** 활성화
- ✅ **SWC minification** 활성화
- ✅ **소스맵 비활성화** (번들 크기 감소)
- ✅ **패키지 import 최적화** (lucide-react, radix-ui)
- ✅ **WebP 이미지** 형식 지원
- ✅ **ESLint 빌드 중 건너뛰기** (빌드 속도 향상)

#### 결재 시스템 완전 구현
- ✅ **ApprovalHistory 데이터 무결성** 보장
- ✅ **결재 이력 DB 자동 저장** (승인/반려 모든 액션 추적)
- ✅ **반려 사유 저장 및 표시**
- ✅ **문서/승인 단계 복원 기능**

#### 모바일 UI/UX 완성
- ✅ **반응형 승인/반려 버튼** (Option 4 디자인)
- ✅ **십자가 디자인 반려 모달** (가톨릭 브랜딩)
- ✅ **로고 클릭 네비게이션**
- ✅ **모바일 사이드바 개선** (가시성, 터치 친화적)
- ✅ **햄버거 메뉴 토글 개선**

### 2025-10-02 (모바일 반응형 시스템)

#### 4단계 체계적 구현
- ✅ **1단계**: 기본 레이아웃 최적화 (사이드바, 헤더, 메인)
- ✅ **2단계**: 테이블/리스트 컴포넌트 반응형
- ✅ **3단계**: 폼 및 입력 컴포넌트 최적화
- ✅ **4단계**: 문서 상세 및 뷰어 최적화

#### 핵심 기술
- ✅ 터치 친화적 UI: `min-h-[44px]` (44px 최소 터치 크기)
- ✅ 테이블 → 카드 변환: `hidden md:block` + `block md:hidden`
- ✅ 반응형 레이아웃: `flex-col lg:flex-row`

### 2025-10-01 (Railway 프로덕션 배포)

#### Railway 배포 성공까지 16-17번 시도

**해결한 8가지 핵심 문제**:
1. **NoResourceFoundException**: API 요청이 static resource로 처리
2. **Controller 매핑 경로 불일치**: `/api` prefix 누락
3. **AuditLog actionAt null 제약조건**: 타임스탬프 누락
4. **DocumentController 필수 헤더 오류**: X-User-Id required 문제
5. **프론트엔드 TypeScript 빌드 오류**: 12개 파일 타입 오류
6. **public 폴더 Git 추적 문제**: 이미지 파일 404
7. **Railway PostgreSQL 스키마 불일치**: 빈 DB 마이그레이션
8. **Dockerfile 빌드 오류**: JAR 파일명 동적 변경

#### 데이터 마이그레이션
- ✅ 로컬 → Railway PostgreSQL: 12명 사용자, 15개 문서
- ✅ JPA `ddl-auto: update`로 자동 스키마 생성
- ✅ `pg_dump` → `railway connect` → `psql` 순서로 복원

---

## 🚀 다음 단계

### 우선순위 높음 (2025-10-15 완료)
1. ✅ **사용자 목록 페이지 하드코딩 URL 수정** (완료)
   - `app/users/page.tsx` 120번 줄 수정
   - `fetch('http://localhost:8080...')` → `apiRequest(...)` 변경
   - Railway 프로덕션 배포 완료

2. ✅ **파일 업로드 시스템 개선** (완료)
   - 하드코딩 URL 제거
   - documentApi 통합
   - Attachment 타입 통일

### 우선순위 중간 (다음 작업)
1. **파일 영구 저장 시스템 구현**
   - Cloudflare R2 설정 및 연동
   - 또는 Railway Volume 재설정 (메모리 증설 필요)
   - 파일 업로드/다운로드 영구 저장
   - 예상 시간: 2-3시간

2. **통계/리포트 시스템 구현** (4개 페이지)
   - **문서 통계** (`/reports/documents`): 문서 처리 현황, 지사별/유형별/보안등급별 분포, 처리 시간 분석
   - **결재 통계** (`/reports/approvals`): 결재 프로세스 효율성, 결재자별 성과, 결재선 복잡도 분석
   - **사용자 통계** (`/reports/users`): 지사별/역할별 사용자 분포, 활동도 분석, 세례명 관리 현황
   - **시스템 통계** (`/reports/system`): 성능 모니터링, 보안 이벤트, 데이터베이스 통계, API 사용량
   - **기술 스택**: Recharts + PostgreSQL 집계 쿼리 + 시계열 분석
   - **예상 시간**: 20-27시간 (문서→결재→사용자→시스템 순서)

### 우선순위 중간
1. **알림 시스템 구현**
   - Notification 엔티티 및 Repository
   - NotificationService (TDD)
   - NotificationController API
   - 프론트엔드 알림 컴포넌트
   - WebSocket 또는 Server-Sent Events

2. **권한 관리 시스템 강화**
   - 세부 권한 제어 기능
   - RBAC 강화
   - 문서 등급별 접근 권한

3. **문서 버전 관리 기능**
   - 버전 비교 뷰
   - 이전 버전 복원
   - 버전 이력 추적

### 우선순위 낮음
1. 결재선 템플릿 기능
2. 대시보드 통계 고도화
3. 고급 검색 및 필터링
4. 성능 최적화 (대용량 데이터)

---

## 💡 핵심 개발 규칙

### 🚨 필수 준수 사항

#### PowerShell 사용 원칙
```powershell
# ❌ 잘못된 방법 (&&는 PowerShell에서 미지원)
cd backend && gradle bootRun

# ✅ 올바른 방법
cd backend
gradle bootRun
```

#### 시스템 시작/중지 (반드시 스크립트 사용)
```powershell
# 전체 시스템 시작
.\start-system.ps1
Start-Sleep -Seconds 15  # ⚠️ 필수 대기!

# 시스템 중지
.\stop-system.ps1
```

#### 디렉토리 이동 규칙
  ```powershell
# 백엔드 실행 - 반드시 backend 디렉토리에서
cd C:\cckbm\backend
gradle bootRun

# 프론트엔드 실행 - 반드시 brotherhood 디렉토리에서
cd C:\cckbm\brotherhood
npm run dev

# ❌ 상위 디렉토리에서 npm run dev 실행 절대 금지!
```

### 🔧 Git 작업 규칙

#### 커밋 메시지
```bash
# ✅ 영어 메시지 사용 (PowerShell 인코딩 이슈 회피)
git commit -m "feat: add user management page"

# ❌ 한글 메시지 사용 금지 (PowerShell 파싱 오류)
git commit -m "기능: 사용자 관리 페이지 추가"
```

#### Railway 배포 전 체크리스트
1. ✅ 로컬 빌드 테스트: `cd brotherhood && npm run build`
2. ✅ TypeScript 오류 확인: `npx tsc --noEmit`
3. ✅ Git 커밋: 영어 메시지 사용
4. ✅ Railway 배포: `git push origin main`

### 🎯 개발 방법론

#### 백엔드 (TDD 필수)
- **순서**: Red → Green → Refactor
- **범위**: 서비스 레이어, 도메인 로직, 비즈니스 규칙
- **테스트 프레임워크**: JUnit 5 + Mockito

#### 프론트엔드 (실행코드 우선)
- **우선**: UI/UX 구현 후 필요시 TDD 적용
- **범위**: 복잡한 비즈니스 로직, 상태 관리, 유틸리티 함수

---

## 📚 참고: 문제 해결 레퍼런스

### Railway 메모리 및 Volume 관련

#### Out of Memory (OOM) 오류
- **원인**: JWT 라이브러리 + Volume 마운트로 인한 메모리 사용량 급증
- **증상**: Railway 배포 실패, "Out of Memory" 로그
- **해결**: 
  - JWT 라이브러리 임시 비활성화 (메모리 감소)
  - Volume 제거 (파일 시스템 오버헤드 제거)
  - JWT 복원 후 인증 기능 정상화
- **예방**: Railway 메모리 증설 또는 Cloudflare R2 사용 고려

#### Volume 설정 및 제거
- **Volume 생성**: `railway volume add --mount-path /app/uploads`
- **Volume 삭제**: `railway volume delete --volume volume-name`
- **환경변수 설정**: `railway variables --set "UPLOAD_DIR=/app/uploads"`
- **제한사항**: Railway 무료 플랜은 0.5GB, 메모리 사용량 증가

### Railway 배포 관련

#### API 요청이 404 오류
- **원인**: WebConfig에서 `/api/**` 경로를 static resource로 잘못 등록
- **해결**: WebConfig.java 삭제, application-prod.yml MVC 설정 추가
- **참고**: [project-context.md Git 히스토리](git log docs/project-context.md)

#### TypeScript 프로덕션 빌드 오류
- **원인**: `npm run dev`는 느슨하지만 `npm run build`는 엄격한 타입 체크
- **해결**: 
  - PageResponse.data.content 명시적 접근
  - roles 타입 수정 (`role === 'ADMIN'`)
  - useSearchParams 제거, window.location 직접 사용
- **배포 전 필수**: 로컬에서 `npm run build` 테스트

### JPA/Hibernate 관련

#### Lazy Loading 문제
- **원인**: 트랜잭션 범위 밖에서 연관 엔티티 접근
- **해결**: 
  - `@Transactional` 어노테이션 추가
  - 명시적 엔티티 조회 (별도 쿼리)
  - `document.getApprovalLines()` 대신 `approvalLineRepository.findByDocumentId()` 사용

#### 제약 조건 위반 오류
- **원인**: 외래키 제약조건 미준수, null 값 입력
- **해결**: 
  - 데이터베이스 저장 로직 개선
  - 트랜잭션 관리 강화
  - `actionAt(LocalDateTime.now())` 같은 필수 필드 설정

### 프론트엔드 관련

#### undefined 접근 오류
- **원인**: API 응답 후 배열/객체가 `undefined`
- **해결**: 
  - `data && data.length > 0` 안전한 접근
  - `data ? data.length : 0` 삼항 연산자
  - Optional chaining: `data?.map()`

#### 하드코딩 URL 문제
- **원인**: `fetch('http://localhost:8080/...')` 환경별 URL 다름
- **해결**: `apiRequest({ url: '/...' })` 환경 변수 기반 URL 사용

---

## 📖 추가 참고 문서

- [요구사항 정의서](requirement.md) - ⭐ 프로젝트 전체 요구사항
- [환경 설정 가이드](setup-guide.md) - 개발 환경 구축
- [스크립트 사용 가이드](scripts-guide.md) - PowerShell 스크립트 활용
- [개발 가이드라인](development-guidelines.md) - 코딩 표준 및 방법론
- [API 명세서](api-specification.md) - REST API 문서

---

## 🔄 문서 버전 관리

### 이전 버전 확인 방법
```powershell
# 이전 상세 버전 확인
git log --oneline docs/project-context.md

# 특정 버전으로 복원 (필요시)
git show <commit-hash>:docs/project-context.md > project-context-backup.md
```

### 버전 히스토리
- **v2.0** (2025-10-15): 간소화 버전, 핵심 정보만 유지 (현재)
- **v1.0** (2025-09-26~2025-10-13): 상세 버전, Git 히스토리에서 확인 가능

---

**이 문서는 매일 업데이트됩니다. 새 세션 시작 시 반드시 "현재 시스템 상태"와 "다음 단계" 섹션을 확인하세요.**
