'use client'

import React, { useState } from 'react'

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<{
    health: string
    auth: string
    documents: string
  }>({
    health: '테스트 대기 중...',
    auth: '테스트 대기 중...',
    documents: '테스트 대기 중...'
  })

  const [isLoading, setIsLoading] = useState(false)

  // 1. 헬스 체크 테스트
  const testHealth = async () => {
    try {
      setTestResults(prev => ({ ...prev, health: '헬스 체크 테스트 중...' }))
      
      const response = await fetch('http://localhost:8080/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestResults(prev => ({ 
          ...prev, 
          health: `✅ 헬스 체크 성공: ${data.message}` 
        }))
      } else {
        setTestResults(prev => ({ 
          ...prev, 
          health: `❌ 헬스 체크 실패: ${response.status} ${response.statusText}` 
        }))
      }
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        health: `❌ 헬스 체크 오류: ${error.message}` 
      }))
    }
  }

  // 2. 로그인 테스트
  const testAuth = async () => {
    try {
      setTestResults(prev => ({ ...prev, auth: '로그인 테스트 중...' }))
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin@brotherhood.kr',
          password: 'admin123!'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestResults(prev => ({ 
          ...prev, 
          auth: `✅ 로그인 성공: ${data.data?.user?.displayName || '사용자'}` 
        }))
      } else {
        const errorData = await response.json()
        setTestResults(prev => ({ 
          ...prev, 
          auth: `❌ 로그인 실패: ${response.status} - ${errorData.message || response.statusText}` 
        }))
      }
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        auth: `❌ 로그인 오류: ${error.message}` 
      }))
    }
  }

  // 3. 문서 목록 테스트
  const testDocuments = async () => {
    try {
      setTestResults(prev => ({ ...prev, documents: '문서 목록 테스트 중...' }))
      
      const response = await fetch('http://localhost:8080/api/documents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestResults(prev => ({ 
          ...prev, 
          documents: `✅ 문서 목록 성공: ${data.data?.content?.length || 0}개 문서` 
        }))
      } else {
        const errorData = await response.json()
        setTestResults(prev => ({ 
          ...prev, 
          documents: `❌ 문서 목록 실패: ${response.status} - ${errorData.message || response.statusText}` 
        }))
      }
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        documents: `❌ 문서 목록 오류: ${error.message}` 
      }))
    }
  }

  // 모든 테스트 실행
  const runAllTests = async () => {
    setIsLoading(true)
    setTestResults({
      health: '테스트 대기 중...',
      auth: '테스트 대기 중...',
      documents: '테스트 대기 중...'
    })
    
    await testHealth()
    await new Promise(resolve => setTimeout(resolve, 1000)) // 1초 대기
    await testAuth()
    await new Promise(resolve => setTimeout(resolve, 1000)) // 1초 대기
    await testDocuments()
    
    setIsLoading(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API 테스트</h1>
      
      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={isLoading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-hover disabled:opacity-50"
        >
          {isLoading ? '테스트 중...' : '모든 API 테스트 실행'}
        </button>
      </div>

      <div className="grid gap-6">
        {/* 헬스 체크 테스트 결과 */}
        <div className="card-brotherhood p-4">
          <h2 className="text-lg font-semibold mb-2">헬스 체크 테스트</h2>
          <p className="text-sm text-muted-foreground mb-2">{testResults.health}</p>
        </div>

        {/* 로그인 테스트 결과 */}
        <div className="card-brotherhood p-4">
          <h2 className="text-lg font-semibold mb-2">로그인 테스트</h2>
          <p className="text-sm text-muted-foreground mb-2">{testResults.auth}</p>
        </div>

        {/* 문서 목록 테스트 결과 */}
        <div className="card-brotherhood p-4">
          <h2 className="text-lg font-semibold mb-2">문서 목록 테스트</h2>
          <p className="text-sm text-muted-foreground mb-2">{testResults.documents}</p>
        </div>
      </div>
    </div>
  )
}
