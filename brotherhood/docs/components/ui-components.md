# UI 컴포넌트 가이드 (Brotherhood 디자인 시스템)

## 🎨 shadcn/ui 컴포넌트 시스템

Brotherhood 프로젝트는 shadcn/ui를 기반으로 한 현대적이고 접근성이 뛰어난 UI 컴포넌트 시스템을 사용합니다.

## 📦 설치된 컴포넌트

### 기본 컴포넌트
- **Button** - 버튼 컴포넌트
- **Card** - 카드 컨테이너
- **Input** - 입력 필드
- **Badge** - 상태 표시 배지

### 고급 컴포넌트
- **Dialog** - 모달 다이얼로그
- **Dropdown Menu** - 드롭다운 메뉴
- **Select** - 선택 박스
- **Tabs** - 탭 네비게이션
- **Toast** - 알림 메시지

## 🎯 Brotherhood 커스텀 컴포넌트

### DashboardHeader
```tsx
import { DashboardHeader } from '@/components/dashboard-header'

// 사용법
<DashboardHeader />
```

**특징:**
- 메인 레드 배경 (`bg-primary`)
- 알림 배지와 사용자 정보 표시
- 한국순교복자성직수도회 브랜딩

### DashboardStats
```tsx
import { DashboardStats } from '@/components/dashboard-stats'

// 사용법
<DashboardStats />
```

**특징:**
- 3개 카드 그리드 레이아웃
- 아이콘과 색상으로 구분
- 호버 효과와 트랜지션

### PendingApprovals
```tsx
import { PendingApprovals } from '@/components/pending-approvals'

// 사용법
<PendingApprovals />
```

**특징:**
- 결재 대기 목록 표시
- 긴급도별 색상 구분
- 액션 버튼 포함

## 🎨 컬러 시스템 적용

### Primary 컬러 (#7e1416)
```tsx
// 메인 버튼
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
  메인 액션
</Button>

// 헤더 배경
<header className="bg-primary text-primary-foreground">
  헤더 내용
</header>
```

### Secondary 컬러 (#f59e0b)
```tsx
// 보조 버튼
<Button variant="secondary" className="bg-secondary text-secondary-foreground">
  보조 액션
</Button>

// 경고 배지
<Badge className="bg-warning text-warning-foreground">
  진행중
</Badge>
```

### Card 배경 (#fef2f2)
```tsx
// 카드 컨테이너
<Card className="bg-card border-border">
  <CardContent>
    카드 내용
  </CardContent>
</Card>
```

## 📱 반응형 디자인

### 모바일 우선 설계
```tsx
// 모바일: 1열, 태블릿: 2열, 데스크톱: 3열
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id}>
      <CardContent>{item.content}</CardContent>
    </Card>
  ))}
</div>
```

### 브레이크포인트
- **sm**: 640px 이상
- **md**: 768px 이상
- **lg**: 1024px 이상
- **xl**: 1280px 이상

## ♿ 접근성 기능

### Radix UI 기반
모든 컴포넌트는 Radix UI를 기반으로 하여 다음 접근성 기능을 제공합니다:

- **키보드 네비게이션**: Tab, Enter, Escape 키 지원
- **스크린 리더**: ARIA 레이블 및 역할 정의
- **포커스 관리**: 자동 포커스 및 포커스 트랩
- **색상 대비**: WCAG 2.1 AA 수준 준수

### 사용 예제
```tsx
// 접근성이 뛰어난 버튼
<Button 
  aria-label="문서 삭제"
  aria-describedby="delete-description"
>
  삭제
</Button>
<div id="delete-description" className="sr-only">
  이 작업은 되돌릴 수 없습니다
</div>
```

## 🎭 다크모드 지원

### CSS 변수 기반
```css
:root {
  --background: #ffffff;
  --foreground: #374151;
  /* ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

### 컴포넌트 사용
```tsx
// 다크모드 자동 적용
<Card className="bg-background text-foreground">
  <CardContent>
    자동으로 다크모드 색상 적용
  </CardContent>
</Card>
```

## 🔧 커스터마이징

### Tailwind CSS 클래스
```tsx
// 커스텀 스타일 적용
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 py-3">
  커스텀 버튼
</Button>
```

### CSS 변수 오버라이드
```css
/* globals.css */
:root {
  --primary: #7e1416; /* Brotherhood 메인 컬러 */
  --secondary: #f59e0b; /* Brotherhood 보조 컬러 */
}
```

## 📚 컴포넌트 개발 가이드

### 새 컴포넌트 생성
1. `src/components/` 디렉토리에 파일 생성
2. TypeScript 인터페이스 정의
3. JSDoc 주석으로 문서화
4. Storybook 스토리 작성 (선택사항)

### 예제: 새 컴포넌트
```tsx
// src/components/UserCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UserCardProps {
  name: string
  baptismalName: string
  role: string
  avatar?: string
}

/**
 * 사용자 정보를 표시하는 카드 컴포넌트
 * @param name - 사용자 이름
 * @param baptismalName - 세례명
 * @param role - 사용자 역할
 * @param avatar - 아바타 이미지 URL (선택사항)
 */
export function UserCard({ name, baptismalName, role, avatar }: UserCardProps) {
  return (
    <Card className="bg-card border-border hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-card-foreground">
          {name} ({baptismalName})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{role}</p>
      </CardContent>
    </Card>
  )
}
```

## 🚀 성능 최적화

### React.memo 사용
```tsx
import { memo } from 'react'

export const UserCard = memo(function UserCard({ name, baptismalName, role }: UserCardProps) {
  // 컴포넌트 로직
})
```

### 동적 임포트
```tsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <HeavyComponent />
    </Suspense>
  )
}
```

## 🧪 테스트

### 컴포넌트 테스트 예제
```tsx
import { render, screen } from '@testing-library/react'
import { UserCard } from '@/components/UserCard'

test('사용자 정보가 올바르게 표시되는지 확인', () => {
  render(
    <UserCard 
      name="김관리자" 
      baptismalName="요한" 
      role="시스템 관리자" 
    />
  )
  
  expect(screen.getByText('김관리자 (요한)')).toBeInTheDocument()
  expect(screen.getByText('시스템 관리자')).toBeInTheDocument()
})
```

---

이 가이드를 참고하여 Brotherhood 프로젝트의 UI 컴포넌트를 일관되고 접근성 있게 개발해주세요.
