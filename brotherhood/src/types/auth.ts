// 인증 관련 타입 정의 (백엔드 DTO와 매칭)

// LoginRequest.java와 매칭
export interface LoginRequest {
  username: string  // 이제 loginId를 의미
  password: string
  rememberMe?: boolean
}

// LoginResponse.java와 매칭
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: UserInfo
}

// UserDto.java와 매칭
export interface UserInfo {
  id: string
  username: string  // 이제 loginId를 의미
  loginId: string   // 명시적으로 loginId 필드 추가
  email: string
  firstName: string
  lastName: string
  baptismalName: string
  displayName: string
  phone?: string  // 백엔드와 일치 (phoneNumber -> phone)
  branchId: string
  branchName: string
  branchCode?: string  // 백엔드에 있음
  roles: string[]
  isActive: boolean
  fullName?: string  // 백엔드에 있음
  createdAt: string
  updatedAt: string
}

// TokenRefreshRequest
export interface TokenRefreshRequest {
  refreshToken: string
}

// PasswordChangeRequest
export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// UserProfileUpdateRequest
export interface UserProfileUpdateRequest {
  firstName?: string
  lastName?: string
  baptismalName?: string
  email?: string
  phone?: string  // 백엔드와 일치 (phoneNumber -> phone)
}
