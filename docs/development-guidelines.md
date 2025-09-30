# 개발 가이드라인 (2025-09-24 현행화)

## 🚨 **중요: Git Bash 사용 및 명령어 실행 위치 규칙**

### 🖥️ **터미널 환경**
- **사용 터미널**: Git Bash (Windows Terminal + Git Bash 권장)
- **설치 확인**: `git --version` (현재: 2.51.0.windows.1)
- **경로**: `C:\Program Files\Git\bin\bash.exe`

### ⚠️ **PowerShell 사용 시 주의사항**
- **`&&` 연산자 미지원**: PowerShell에서는 `&&` 연산자가 작동하지 않음
- **대안**: `;` 또는 `if ($?) { }` 구문 사용
- **예시**:
  ```powershell
  # ❌ 잘못된 방법
  cd backend && .\gradlew bootRun
  
  # ✅ 올바른 방법
  cd backend; .\gradlew bootRun
  # 또는
  cd backend
  if ($?) { .\gradlew bootRun }
  ```

### 백엔드 실행
```bash
cd /c/cckbm/backend
./gradlew bootRun
```

### 프론트엔드 실행
```bash
cd /c/cckbm/brotherhood
npm run dev
```

### 데이터베이스 작업
```bash
cd /c/cckbm
psql -U postgres -d approval_system_dev
```

> **⚠️ 주의**: 
> 1. 절대 상위 디렉토리(`/c/cckbm`)에서 `npm run dev` 실행 금지!
> 2. PowerShell 대신 Git Bash 사용 필수
> 3. 경로는 Unix 스타일(`/c/cckbm`) 사용
> 자세한 규칙은 [프로젝트 실행 규칙 문서](project-execution-rules.md)를 참조하세요.

## 1. 개발 방법론

### 1.1 TDD (Test-Driven Development) 원칙

#### 백엔드 개발
- **필수**: 모든 코어 비즈니스 로직은 TDD로 구현
- **순서**: Red → Green → Refactor
- **범위**: 서비스 레이어, 도메인 로직, 비즈니스 규칙
- **UUID 처리**: 모든 ID 관련 로직은 UUID 기반으로 테스트

#### 프론트엔드 개발
- **우선**: 실행코드 우선 개발 (UI/UX 구현)
- **선택적**: 복잡한 비즈니스 로직에만 TDD 적용
- **범위**: 상태 관리, 유틸리티 함수, 복잡한 컴포넌트
- **API 연동**: 실제 백엔드 API와의 통신 테스트 포함

### 1.2 디버깅 전략

#### Perplexity 활용
- **사용 시점**: 구현 중 오류 발생 시
- **활용 방법**: 
  1. 오류 메시지와 컨텍스트를 정확히 기록
  2. Perplexity에 구체적인 문제 상황 입력
  3. 제안된 해결방법을 검토 후 적용
  4. 해결 과정을 문서화

#### 일반적인 디버깅 순서
1. 로그 확인
2. 단위 테스트 실행
3. Perplexity 검색
4. 코드 리뷰
5. 동료 상담

## 2. 코딩 표준

### 2.1 백엔드 (Java/Spring Boot)

#### 네이밍 컨벤션
- **클래스**: PascalCase (예: `UserService`, `DocumentController`)
- **메서드**: camelCase (예: `createUser`, `approveDocument`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_APPROVAL_STEPS`)
- **패키지**: 소문자 (예: `com.brotherhood.approval`)

#### 테스트 작성 규칙
```java
@Test
@DisplayName("사용자 생성 시 세례명이 필수여야 한다")
void createUser_WhenBaptismalNameIsNull_ShouldThrowException() {
    // Given
    UserCreateRequest request = UserCreateRequest.builder()
        .username("testuser")
        .email("test@example.com")
        .baptismalName(null) // 세례명 누락
        .build();
    
    // When & Then
    assertThatThrownBy(() -> userService.createUser(request))
        .isInstanceOf(ValidationException.class)
        .hasMessage("세례명은 필수입니다");
}
```

### 2.2 프론트엔드 (Next.js/React)

#### 컴포넌트 구조
```typescript
// 컴포넌트명.tsx
interface ComponentProps {
  // Props 타입 정의
}

export const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 실행코드 우선 구현
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

#### 상태 관리
- **간단한 상태**: useState
- **복잡한 상태**: useReducer 또는 Zustand
- **서버 상태**: React Query

## 3. 프로젝트 구조

### 3.1 백엔드 구조 (✅ 2024-09-18 완료)
```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/brotherhood/approval/
│   │   │       ├── controller/     # REST API 컨트롤러 (완료)
│   │   │       ├── service/        # 비즈니스 로직 (TDD 완료)
│   │   │       ├── repository/     # 데이터 접근 (완료)
│   │   │       ├── entity/         # JPA 엔티티 (완료)
│   │   │       ├── dto/            # 데이터 전송 객체 (완료)
│   │   │       ├── mapper/         # MapStruct 매퍼 (완료)
│   │   │       ├── config/         # 설정 클래스 (완료)
│   │   │       ├── exception/      # 예외 처리 (완료)
│   │   │       └── interceptor/    # 감사 로그 인터셉터 (완료)
│   │   └── resources/
│   │       ├── application.yml     # 메인 설정 파일
│   │       ├── application-dev.yml # 개발 설정 파일
│   │       └── db/migration/       # Flyway 마이그레이션
│   └── test/
│       ├── java/                   # 테스트 코드 (TDD 완료)
│       └── resources/
│           └── application-test.yml # 테스트 설정 파일
└── build.gradle                    # Gradle 빌드 설정
```

### 3.2 프론트엔드 구조
```
brotherhood/
├── src/
│   ├── components/                 # 재사용 가능한 컴포넌트
│   ├── pages/                      # Next.js 페이지
│   ├── hooks/                      # 커스텀 훅
│   ├── lib/                        # 유틸리티 함수
│   ├── types/                      # TypeScript 타입
│   └── styles/                     # 스타일 파일
├── public/                         # 정적 파일
└── package.json                    # 의존성 관리
```

## 4. Git 워크플로우

### 4.1 브랜치 전략
- **main**: 프로덕션 준비 코드
- **feature/**: 새로운 기능 개발
- **hotfix/**: 긴급 수정

### 4.2 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 설정, 의존성 관리
```

### 4.3 PR (Pull Request) 규칙
- **제목**: 명확한 변경사항 요약
- **설명**: 변경 이유, 테스트 방법, 관련 이슈
- **리뷰**: 최소 1명 이상의 코드 리뷰
- **테스트**: 모든 테스트 통과 확인

## 5. 품질 관리

### 5.1 코드 리뷰 체크리스트
- [ ] 코드가 요구사항을 만족하는가?
- [ ] 테스트 코드가 충분한가? (백엔드 TDD)
- [ ] 에러 처리가 적절한가?
- [ ] 보안 취약점은 없는가?
- [ ] 성능에 문제는 없는가?

### 5.2 테스트 커버리지
- **백엔드**: 최소 80% 이상
- **프론트엔드**: 핵심 로직 70% 이상

## 6. 문서화

### 6.1 필수 문서
- [ ] API 문서 (OpenAPI/Swagger)
- [ ] 데이터베이스 스키마 문서
- [ ] 배포 가이드
- [ ] 사용자 매뉴얼

### 6.2 코드 문서화
- **Java**: JavaDoc 필수
- **TypeScript**: JSDoc 권장
- **복잡한 로직**: 인라인 주석 추가

## 7. 보안 가이드라인

### 7.1 데이터 보호
- **민감 정보**: 환경변수 또는 시크릿 관리
- **암호화**: 전송 시 TLS, 저장 시 AES-256
- **접근 제어**: RBAC + ABAC 정책 적용

### 7.2 입력 검증
- **백엔드**: @Valid, @NotNull 등 어노테이션 활용
- **프론트엔드**: Zod 스키마 검증
- **SQL 인젝션**: JPA 사용으로 방지

## 8. 성능 최적화

### 8.1 데이터베이스
- **인덱스**: 자주 조회되는 컬럼에 인덱스 생성
- **쿼리 최적화**: N+1 문제 방지
- **연결 풀**: 적절한 크기 설정

### 8.2 프론트엔드
- **번들 크기**: 코드 스플리팅 적용
- **이미지**: WebP 형식 사용
- **캐싱**: 적절한 캐시 전략 적용

## 9. 최신 개발 진행 상황 (2025-09-24)

### 9.1 완료된 주요 작업
- ✅ **Spring Boot 애플리케이션 완전 구동**: PostgreSQL 연동, 모든 엔티티 동기화
- ✅ **테스트 환경 구축**: H2 인메모리 DB, ApplicationContext 로딩 성공
- ✅ **데이터베이스 엔티티 동기화**: 모든 테이블과 Java 엔티티 완벽 매핑
- ✅ **MapStruct + Lombok 통합**: 코드 생성 순서 문제 해결
- ✅ **Enum to String 마이그레이션**: 확장성과 유지보수성 향상
- ✅ **Repository @Query 최적화**: JPA 메서드 네이밍 문제 해결
- ✅ **Spring Security 설정**: 기본 보안 정책 및 테스트 모드 구성
- ✅ **로그인 ID 시스템**: login_id 필드 기반 인증 시스템 구현 (2025-09-24)
- ✅ **로그아웃 기능**: 안전한 로그아웃 처리 및 확인 다이얼로그 구현 (2025-09-24)
- ✅ **프론트엔드-백엔드 연동**: 실제 API 호출 및 인증 시스템 완전 작동 (2025-09-24)

### 9.2 기술적 해결 사항
- **Flyway 호환성**: PostgreSQL 17과 Flyway 10.8.1 버전 매칭
- **Gradle 멀티프로젝트**: Root와 backend 서브프로젝트 구성
- **환경 변수 설정**: PowerShell 프로필 영구 설정 (`JAVA_HOME`, `PATH`, `PGPASSWORD`)
- **ApplicationContext 로딩**: `spring.profiles.active` 설정 이슈 해결
- **로그인 ID 시스템**: name 필드와 분리된 login_id 필드 구현 (2025-09-24)
- **한글 입력 방지**: 로그인 ID에 영문, 숫자, 언더스코어만 허용 (2025-09-24)
- **실시간 입력 검증**: 프론트엔드에서 즉시 입력 필터링 (2025-09-24)
- **로그아웃 처리**: Spring Security 기반 세션 무효화 (2025-09-24)

### 9.3 현재 개발 환경 상태
- **Java 17**: Eclipse Adoptium JDK 설치 완료
- **Gradle 8.5**: 빌드 시스템 구성 완료
- **PostgreSQL 17**: 로컬 데이터베이스 구성 완료
- **Spring Boot 3.2.0**: 모든 의존성 정상 작동
- **H2 테스트 DB**: 테스트 환경 독립적 구성

### 9.4 다음 단계 권장사항
1. **문서 관리 기능 구현**: 문서 CRUD, 검색, 필터링 기능
2. **결재 시스템 구현**: 결재선 설정, 승인/반려 처리
3. **대시보드 기능 구현**: 통계 데이터, 최근 활동 표시
4. **사용자 관리 기능 구현**: 사용자 CRUD, 권한 관리
5. **Docker 컨테이너화**: 배포 환경 표준화

---

이 가이드라인을 따라 개발하면 일관성 있고 품질 높은 코드를 작성할 수 있습니다.

