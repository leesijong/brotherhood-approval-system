# Brotherhood 프로젝트 구조 가이드

## 📁 전체 프로젝트 구조

```
brotherhood/
├── src/                    # 소스 코드 (메인)
│   ├── components/         # React 컴포넌트
│   │   ├── ui/            # shadcn/ui 기본 컴포넌트
│   │   ├── dashboard-*.tsx # 대시보드 관련 컴포넌트
│   │   ├── forms/         # 폼 관련 컴포넌트
│   │   ├── layout/        # 레이아웃 컴포넌트
│   │   └── common/        # 공통 컴포넌트
│   ├── pages/             # Next.js 페이지
│   │   ├── fonts/         # 폰트 파일
│   │   ├── globals.css    # 전역 스타일
│   │   ├── layout.tsx     # 레이아웃 컴포넌트
│   │   ├── page.tsx       # 메인 페이지
│   │   ├── dashboard/     # 대시보드 페이지
│   │   ├── documents/     # 문서 관리 페이지
│   │   ├── approvals/     # 결재 관리 페이지
│   │   └── users/         # 사용자 관리 페이지
│   ├── hooks/             # 커스텀 훅
│   │   ├── useAuth.ts     # 인증 관련 훅
│   │   ├── useDocuments.ts # 문서 관련 훅
│   │   └── useApprovals.ts # 결재 관련 훅
│   ├── lib/               # 유틸리티 함수
│   │   ├── utils.ts       # 공통 유틸리티
│   │   ├── auth.ts        # 인증 관련 함수
│   │   ├── api.ts         # API 호출 함수
│   │   └── validations.ts # 유효성 검사 함수
│   ├── types/             # TypeScript 타입 정의
│   │   ├── auth.ts        # 인증 관련 타입
│   │   ├── document.ts    # 문서 관련 타입
│   │   ├── user.ts        # 사용자 관련 타입
│   │   └── common.ts      # 공통 타입
│   └── styles/            # 추가 스타일 파일
│       ├── components.css # 컴포넌트별 스타일
│       └── themes.css     # 테마 관련 스타일
├── public/                # 정적 파일
│   ├── images/            # 이미지 파일
│   │   ├── logos/         # 로고 이미지
│   │   ├── icons/         # 아이콘 이미지
│   │   └── backgrounds/   # 배경 이미지
│   └── icons/             # 아이콘 파일
├── docs/                  # 문서
│   ├── api/               # API 문서
│   │   ├── auth.md        # 인증 API
│   │   ├── documents.md   # 문서 API
│   │   └── users.md       # 사용자 API
│   ├── components/        # 컴포넌트 문서
│   │   ├── ui-components.md # UI 컴포넌트 가이드
│   │   └── custom-components.md # 커스텀 컴포넌트 가이드
│   └── design/            # 디자인 문서
│       ├── color-system.md # 컬러 시스템
│       ├── typography.md   # 타이포그래피
│       └── components.md   # 컴포넌트 디자인
├── app/                   # 기존 Next.js 앱 디렉토리 (이전)
├── components/            # 기존 컴포넌트 디렉토리 (이전)
├── lib/                   # 기존 라이브러리 디렉토리 (이전)
├── package.json           # 프로젝트 의존성
├── tailwind.config.ts     # Tailwind CSS 설정
├── components.json        # shadcn/ui 설정
├── tsconfig.json          # TypeScript 설정
├── next.config.mjs        # Next.js 설정
├── postcss.config.mjs     # PostCSS 설정
└── README.md              # 프로젝트 설명서
```

## 🎯 디렉토리별 역할

### `/src` - 메인 소스 코드
- **components/**: 재사용 가능한 React 컴포넌트
- **pages/**: Next.js 페이지 컴포넌트
- **hooks/**: 커스텀 React 훅
- **lib/**: 유틸리티 함수 및 헬퍼
- **types/**: TypeScript 타입 정의
- **styles/**: CSS 및 스타일 파일

### `/public` - 정적 파일
- **images/**: 이미지 파일 (로고, 아이콘, 배경)
- **icons/**: SVG 아이콘 파일

### `/docs` - 프로젝트 문서
- **api/**: API 명세서 및 가이드
- **components/**: 컴포넌트 사용법 가이드
- **design/**: 디자인 시스템 문서

## 🔧 설정 파일

### `package.json`
- 프로젝트 메타데이터 및 의존성 관리
- 스크립트 명령어 정의

### `tailwind.config.ts`
- Tailwind CSS 설정
- 커스텀 컬러, 폰트, 스페이싱 정의

### `components.json`
- shadcn/ui 설정
- 컴포넌트 경로 및 스타일 설정

### `tsconfig.json`
- TypeScript 컴파일러 설정
- 경로 별칭 및 타입 체크 설정

## 📝 네이밍 컨벤션

### 파일명
- **컴포넌트**: PascalCase (예: `DashboardHeader.tsx`)
- **훅**: camelCase with `use` prefix (예: `useAuth.ts`)
- **유틸리티**: camelCase (예: `apiClient.ts`)
- **타입**: camelCase (예: `userTypes.ts`)

### 디렉토리명
- **소문자**: 모든 디렉토리는 소문자 사용
- **하이픈**: 여러 단어는 하이픈으로 구분 (예: `user-management`)

## 🚀 개발 워크플로우

### 1. 새 컴포넌트 생성
```bash
# src/components/ui/ 디렉토리에 새 컴포넌트 생성
touch src/components/ui/NewComponent.tsx
```

### 2. 새 페이지 생성
```bash
# src/pages/ 디렉토리에 새 페이지 생성
mkdir src/pages/new-page
touch src/pages/new-page/page.tsx
```

### 3. 새 훅 생성
```bash
# src/hooks/ 디렉토리에 새 훅 생성
touch src/hooks/useNewFeature.ts
```

### 4. 새 타입 정의
```bash
# src/types/ 디렉토리에 새 타입 정의
touch src/types/newFeature.ts
```

## 📚 문서화 가이드

### 컴포넌트 문서
- 각 컴포넌트는 JSDoc 주석으로 문서화
- Props, 사용법, 예제 포함

### API 문서
- API 엔드포인트별 상세 명세
- 요청/응답 예제 포함

### 디자인 문서
- 컬러 시스템, 타이포그래피, 컴포넌트 가이드
- 시각적 예제 및 사용법 포함

## 🔍 코드 품질

### TypeScript
- 모든 파일에 타입 정의
- `any` 타입 사용 금지
- 엄격한 타입 체크 활성화

### ESLint
- 코드 스타일 일관성 유지
- 잠재적 오류 사전 발견

### Prettier
- 코드 포맷팅 자동화
- 팀 내 코드 스타일 통일

---

이 구조는 Brotherhood 프로젝트의 확장성과 유지보수성을 고려하여 설계되었습니다. 새로운 기능 추가 시 이 가이드를 참고하여 일관된 구조를 유지해주세요.
