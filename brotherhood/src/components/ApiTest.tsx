'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks'
import { authApi, documentApi, dashboardApi } from '@/services'
import type { UserInfo, Document, DashboardStats } from '@/types'

export function ApiTest() {
  const [testResults, setTestResults] = useState<{
    auth: string
    documents: string
    dashboard: string
  }>({
    auth: '테스트 대기 중...',
    documents: '테스트 대기 중...',
    dashboard: '테스트 대기 중...'
  })

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)

  // 1. 인증 API 테스트
  const testAuthApi = async () => {
    try {
      setTestResults(prev => ({ ...prev, documents: '인증 API 테스트 중...' }))
      
      // 로그인 테스트 (실제로는 테스트 계정이 필요)
      const loginResponse = await authApi.login({
        username: 'test@brotherhood.kr',
        password: 'test123!'
      })
      
      setUserInfo(loginResponse.data?.user || null)
      setTestResults(prev => ({ 
        ...prev, 
        documents: `✅ 로그인 성공: ${loginResponse.data?.user?.displayName} (${loginResponse.data?.user?.branchName})` 
      }))
    } catch (error: any) {
      console.error('Auth API Error:', error)
      setTestResults(prev => ({ 
        ...prev, 
        documents: `❌ 로그인 실패: ${error.response?.data?.message || error.message || 'Unknown error'}` 
      }))
    }
  }

  // 2. 문서 API 테스트
  const testDocumentApi = async () => {
    try {
      setTestResults(prev => ({ ...prev, documents: '문서 API 테스트 중...' }))
      
      const documentsResponse = await documentApi.getDocuments({
        page: 0,
        size: 10
      })
      
      setDocuments(documentsResponse.data?.content || [])
      setTestResults(prev => ({ 
        ...prev, 
        documents: `✅ 문서 조회 성공: ${documentsResponse.data?.content?.length || 0}개 문서` 
      }))
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        documents: `❌ 문서 조회 실패: ${error.response?.data?.message || error.message}` 
      }))
    }
  }

  // 3. 대시보드 API 테스트
  const testDashboardApi = async () => {
    try {
      setTestResults(prev => ({ ...prev, dashboard: '대시보드 API 테스트 중...' }))
      
      const statsResponse = await dashboardApi.getDashboardStats()
      
      setDashboardStats(statsResponse.data || null)
      setTestResults(prev => ({ 
        ...prev, 
        dashboard: `✅ 대시보드 조회 성공: 총 ${statsResponse.data?.totalDocuments || 0}개 문서` 
      }))
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        dashboard: `❌ 대시보드 조회 실패: ${error.response?.data?.message || error.message}` 
      }))
    }
  }

  // 간단한 fetch 테스트
  const testSimpleFetch = async () => {
    try {
      setTestResults(prev => ({ ...prev, auth: '간단한 fetch 테스트 중...' }))
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_BASE_URL}/health`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.text()
      
      setTestResults(prev => ({ 
        ...prev, 
        auth: `✅ Health Fetch 성공: ${response.status} - ${data.substring(0, 100)}...` 
      }))
    } catch (error: any) {
      console.error('Fetch Error:', error)
      setTestResults(prev => ({ 
        ...prev, 
        auth: `❌ Health Fetch 실패: ${error.message}` 
      }))
    }
  }

  // Hello 엔드포인트 테스트
  const testHelloEndpoint = async () => {
    try {
      setTestResults(prev => ({ ...prev, auth: 'Hello 엔드포인트 테스트 중...' }))
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_BASE_URL}/hello`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.text()
      
      setTestResults(prev => ({ 
        ...prev, 
        auth: `✅ Hello 성공: ${response.status} - "${data}"` 
      }))
    } catch (error: any) {
      console.error('Hello Error:', error)
      setTestResults(prev => ({ 
        ...prev, 
        auth: `❌ Hello 실패: ${error.message}` 
      }))
    }
  }

  // 모든 API 테스트 실행
  const runAllTests = async () => {
    setTestResults({
      auth: '테스트 대기 중...',
      documents: '테스트 대기 중...',
      dashboard: '테스트 대기 중...'
    })
    
    // 먼저 간단한 fetch 테스트
    await testSimpleFetch()
    
    // 그 다음 axios 기반 테스트
    await testAuthApi()
    await testDocumentApi()
    await testDashboardApi()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API 테스트</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={runAllTests}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-hover"
        >
          모든 API 테스트 실행
        </button>
        <button
          onClick={testSimpleFetch}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Health Fetch 테스트
        </button>
        <button
          onClick={testHelloEndpoint}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Hello 엔드포인트 테스트
        </button>
        <button
          onClick={testAuthApi}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          인증 API 테스트
        </button>
      </div>

      <div className="grid gap-6">
        {/* 인증 API 테스트 결과 */}
        <div className="card-brotherhood p-4">
          <h2 className="text-lg font-semibold mb-2">인증 API 테스트</h2>
          <p className="text-sm text-muted-foreground mb-2">{testResults.auth}</p>
          {userInfo && (
            <div className="mt-2 p-3 bg-muted rounded-md">
              <h3 className="font-medium">사용자 정보:</h3>
              <pre className="text-xs mt-1 overflow-auto">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 문서 API 테스트 결과 */}
        <div className="card-brotherhood p-4">
          <h2 className="text-lg font-semibold mb-2">문서 API 테스트</h2>
          <p className="text-sm text-muted-foreground mb-2">{testResults.documents}</p>
          {documents.length > 0 && (
            <div className="mt-2 p-3 bg-muted rounded-md">
              <h3 className="font-medium">문서 목록:</h3>
              <pre className="text-xs mt-1 overflow-auto">
                {JSON.stringify(documents, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 대시보드 API 테스트 결과 */}
        <div className="card-brotherhood p-4">
          <h2 className="text-lg font-semibold mb-2">대시보드 API 테스트</h2>
          <p className="text-sm text-muted-foreground mb-2">{testResults.dashboard}</p>
          {dashboardStats && (
            <div className="mt-2 p-3 bg-muted rounded-md">
              <h3 className="font-medium">대시보드 통계:</h3>
              <pre className="text-xs mt-1 overflow-auto">
                {JSON.stringify(dashboardStats, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
