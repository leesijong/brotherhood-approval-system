# 인증 API 명세서

## 🔐 인증 시스템 개요

Brotherhood 내부결재 시스템은 JWT(JSON Web Token) 기반의 인증 시스템을 사용합니다.

## 📋 기본 정보

- **Base URL**: `http://localhost:8080/api/v1`
- **인증 방식**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## 🔑 인증 엔드포인트

### 1. 로그인

**POST** `/auth/login`

사용자 로그인을 처리합니다.

#### 요청 본문
```json
{
  "email": "admin@brotherhood.or.kr",
  "password": "password123"
}
```

#### 응답 (성공)
```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@brotherhood.or.kr",
      "name": "김관리자",
      "baptismalName": "요한",
      "role": "ADMIN",
      "department": "시스템관리부",
      "phone": "010-1234-5678",
      "isActive": true,
      "lastLoginAt": "2024-01-15T09:30:00Z"
    }
  }
}
```

#### 응답 (실패)
```json
{
  "success": false,
  "message": "이메일 또는 비밀번호가 올바르지 않습니다",
  "error": "INVALID_CREDENTIALS"
}
```

### 2. 토큰 갱신

**POST** `/auth/refresh`

만료된 액세스 토큰을 갱신합니다.

#### 요청 본문
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 응답 (성공)
```json
{
  "success": true,
  "message": "토큰 갱신 성공",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. 로그아웃

**POST** `/auth/logout`

사용자 로그아웃을 처리합니다.

#### 요청 헤더
```
Authorization: Bearer <access_token>
```

#### 응답 (성공)
```json
{
  "success": true,
  "message": "로그아웃 성공"
}
```

### 4. 비밀번호 변경

**PUT** `/auth/password`

사용자 비밀번호를 변경합니다.

#### 요청 헤더
```
Authorization: Bearer <access_token>
```

#### 요청 본문
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

#### 응답 (성공)
```json
{
  "success": true,
  "message": "비밀번호가 성공적으로 변경되었습니다"
}
```

## 🔒 보안 기능

### 1. 다단계 인증 (MFA)

**POST** `/auth/mfa/setup`

MFA 설정을 시작합니다.

#### 요청 헤더
```
Authorization: Bearer <access_token>
```

#### 응답 (성공)
```json
{
  "success": true,
  "message": "MFA 설정을 위한 QR 코드가 생성되었습니다",
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "secretKey": "JBSWY3DPEHPK3PXP",
    "backupCodes": [
      "12345678",
      "87654321",
      "11223344"
    ]
  }
}
```

### 2. MFA 인증

**POST** `/auth/mfa/verify`

MFA 코드를 검증합니다.

#### 요청 본문
```json
{
  "code": "123456"
}
```

#### 응답 (성공)
```json
{
  "success": true,
  "message": "MFA 인증 성공"
}
```

## 👤 사용자 정보

### 1. 현재 사용자 정보 조회

**GET** `/auth/me`

현재 로그인한 사용자의 정보를 조회합니다.

#### 요청 헤더
```
Authorization: Bearer <access_token>
```

#### 응답 (성공)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@brotherhood.or.kr",
    "name": "김관리자",
    "baptismalName": "요한",
    "role": "ADMIN",
    "department": "시스템관리부",
    "phone": "010-1234-5678",
    "isActive": true,
    "mfaEnabled": true,
    "lastLoginAt": "2024-01-15T09:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T09:30:00Z"
  }
}
```

### 2. 사용자 정보 수정

**PUT** `/auth/me`

현재 사용자의 정보를 수정합니다.

#### 요청 헤더
```
Authorization: Bearer <access_token>
```

#### 요청 본문
```json
{
  "name": "김관리자",
  "baptismalName": "요한",
  "phone": "010-1234-5678",
  "department": "시스템관리부"
}
```

#### 응답 (성공)
```json
{
  "success": true,
  "message": "사용자 정보가 성공적으로 수정되었습니다",
  "data": {
    "id": 1,
    "email": "admin@brotherhood.or.kr",
    "name": "김관리자",
    "baptismalName": "요한",
    "role": "ADMIN",
    "department": "시스템관리부",
    "phone": "010-1234-5678",
    "isActive": true,
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

## 🚨 에러 코드

| 코드 | 설명 | HTTP 상태 |
|------|------|-----------|
| `INVALID_CREDENTIALS` | 잘못된 인증 정보 | 401 |
| `TOKEN_EXPIRED` | 토큰 만료 | 401 |
| `TOKEN_INVALID` | 유효하지 않은 토큰 | 401 |
| `MFA_REQUIRED` | MFA 인증 필요 | 403 |
| `MFA_INVALID` | 잘못된 MFA 코드 | 400 |
| `PASSWORD_WEAK` | 약한 비밀번호 | 400 |
| `USER_INACTIVE` | 비활성 사용자 | 403 |
| `RATE_LIMIT_EXCEEDED` | 요청 한도 초과 | 429 |

## 🔧 클라이언트 구현 예제

### JavaScript/TypeScript
```typescript
// API 클라이언트 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 인터셉터 - 토큰 갱신 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await apiClient.post('/auth/refresh', {
            refreshToken
          })
          localStorage.setItem('accessToken', response.data.data.token)
          localStorage.setItem('refreshToken', response.data.data.refreshToken)
          return apiClient.request(error.config)
        } catch (refreshError) {
          // 리프레시 토큰도 만료된 경우 로그인 페이지로 리다이렉트
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// 로그인 함수
export const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password })
  const { token, refreshToken, user } = response.data.data
  
  localStorage.setItem('accessToken', token)
  localStorage.setItem('refreshToken', refreshToken)
  localStorage.setItem('user', JSON.stringify(user))
  
  return user
}

// 로그아웃 함수
export const logout = async () => {
  try {
    await apiClient.post('/auth/logout')
  } finally {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
}
```

### React 훅 예제
```typescript
// useAuth 훅
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const response = await apiClient.get('/auth/me')
          setUser(response.data.data)
        } catch (error) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const user = await loginAPI(email, password)
    setUser(user)
    return user
  }

  const logout = async () => {
    await logoutAPI()
    setUser(null)
  }

  return { user, loading, login, logout }
}
```

---

이 API 명세서를 참고하여 Brotherhood 프로젝트의 인증 시스템을 구현해주세요.
