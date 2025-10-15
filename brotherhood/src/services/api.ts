// API 클라이언트 기본 설정 (Axios 인스턴스)

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { BaseResponse, ErrorResponse } from '@/types'

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

// Axios 인스턴스 생성
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 (토큰 자동 추가)
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('brotherhood-auth')
      console.log('🔍 [API 요청 인터셉터] authData 존재:', !!authData)
      
      if (authData) {
        try {
          const { state } = JSON.parse(authData)
          console.log('🔍 [API 요청 인터셉터] state:', state)
          
          if (state?.accessToken) {
            config.headers.Authorization = `Bearer ${state.accessToken}`
            console.log('✅ [API 요청 인터셉터] Authorization 헤더 추가:', `Bearer ${state.accessToken.substring(0, 20)}...`)
          } else {
            console.warn('⚠️ [API 요청 인터셉터] accessToken 없음')
          }
          
          // X-User-Id 헤더 추가
          if (state?.user?.id) {
            config.headers['X-User-Id'] = state.user.id
            console.log('✅ [API 요청 인터셉터] X-User-Id 헤더 추가:', state.user.id)
          }
          
          // X-User-Roles 헤더 추가
          if (state?.user?.roles) {
            // roles가 이미 string[] 형식이므로 직접 join
            const roles = Array.isArray(state.user.roles) 
              ? state.user.roles.join(',')
              : state.user.roles.map((role: any) => role.name || role).join(',')
            config.headers['X-User-Roles'] = roles
            console.log('✅ [API 요청 인터셉터] X-User-Roles 헤더 추가:', roles)
          }
        } catch (error) {
          console.error('❌ [API 요청 인터셉터] auth data 파싱 실패:', error)
        }
      } else {
        console.warn('⚠️ [API 요청 인터셉터] localStorage에 brotherhood-auth 없음')
      }
    }
    
    console.log('📤 [API 요청]', config.method?.toUpperCase(), config.url, 'Headers:', config.headers)
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터 (에러 처리 및 토큰 갱신) - 임시로 비활성화
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('Response received:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('Response error:', error)
    return Promise.reject(error)
  }
)

// 토큰 관리 헬퍼 함수들
const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const authData = localStorage.getItem('brotherhood-auth')
    if (authData) {
      const { state } = JSON.parse(authData)
      return state?.refreshToken || null
    }
  } catch (error) {
    console.warn('Failed to get refresh token:', error)
  }
  return null
}

const updateTokens = (tokens: { accessToken: string; refreshToken: string }) => {
  if (typeof window === 'undefined') return
  
  try {
    const authData = localStorage.getItem('brotherhood-auth')
    if (authData) {
      const data = JSON.parse(authData)
      data.state.accessToken = tokens.accessToken
      data.state.refreshToken = tokens.refreshToken
      localStorage.setItem('brotherhood-auth', JSON.stringify(data))
    }
  } catch (error) {
    console.error('Failed to update tokens:', error)
  }
}

const clearTokens = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('brotherhood-auth')
}

const refreshAccessToken = async (refreshToken: string): Promise<BaseResponse<{ accessToken: string; refreshToken: string }>> => {
  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken
  })
  return response.data
}

// API 응답 타입 확인 헬퍼
export const isApiError = (error: any): error is { response: { data: ErrorResponse } } => {
  return error?.response?.data && error.response.data.success === false
}

// 공통 API 요청 래퍼
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<BaseResponse<T>> => {
  try {
    const response = await apiClient(config)
    // 응답 데이터를 한 번만 읽기
    const responseData = response.data
    return responseData
  } catch (error: any) {
    console.error('API Request Error:', error)
    
    if (isApiError(error)) {
      throw error.response.data
    }
    
    // 네트워크 에러나 기타 에러 처리
    const errorMessage = error.response?.data?.message || error.message || 'Network error occurred'
    throw {
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: error.response?.status || 500,
      timestamp: new Date().toISOString()
    } as ErrorResponse
  }
}

// 파일 업로드용 API 클라이언트
export const createFormDataRequest = (
  url: string,
  formData: FormData,
  onUploadProgress?: (progressEvent: any) => void
) => {
  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  })
}

export default apiClient
