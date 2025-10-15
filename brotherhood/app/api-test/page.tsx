'use client';

import { useState } from 'react';

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
  
  const testEndpoints = [
    { name: 'Health Check', url: `${API_BASE_URL}/health`, method: 'GET' },
    { name: 'Test Endpoint', url: `${API_BASE_URL}/test`, method: 'GET' },
    { name: 'Simple Hello', url: `${API_BASE_URL}/hello`, method: 'GET' },
    { name: 'Auth Login', url: `${API_BASE_URL}/auth/login`, method: 'POST', body: { username: 'admin', password: 'admin123' } },
  ];

  const runTest = async (endpoint: any) => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(endpoint.url, options);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let responseData;
      const contentType = response.headers.get('content-type');
      
      // 응답 본문을 한 번만 읽기 위해 텍스트로 먼저 읽은 후 파싱
      const responseText = await response.text();
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }
      } else {
        responseData = responseText;
      }

      const result = {
        name: endpoint.name,
        url: endpoint.url,
        method: endpoint.method,
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        data: responseData,
        success: response.ok,
        timestamp: new Date().toLocaleTimeString(),
      };

      setTestResults(prev => [result, ...prev]);
    } catch (error) {
      const result = {
        name: endpoint.name,
        url: endpoint.url,
        method: endpoint.method,
        status: 'ERROR',
        statusText: 'Network Error',
        responseTime: 'N/A',
        data: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setTestResults(prev => [result, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    for (const endpoint of testEndpoints) {
      await runTest(endpoint);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API 테스트</h1>
        <div className="flex gap-2">
          <button 
            onClick={runAllTests} 
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? '테스트 중...' : '모든 테스트 실행'}
          </button>
          <button 
            onClick={clearResults}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            결과 지우기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testEndpoints.map((endpoint, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {endpoint.name}
                <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                  {endpoint.method}
                </span>
              </h3>
              <p className="text-sm text-gray-600 font-mono">
                {endpoint.url}
              </p>
            </div>
            <button 
              onClick={() => runTest(endpoint)} 
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              테스트 실행
            </button>
          </div>
        ))}
      </div>

      {testResults.length > 0 && (
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">테스트 결과</h2>
          <p className="text-sm text-gray-600 mb-4">
            총 {testResults.length}개의 테스트 결과
          </p>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{result.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {result.responseTime}
                    </span>
                    <span className="text-sm text-gray-500">
                      {result.timestamp}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {result.method} {result.url}
                </div>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                  <pre>{JSON.stringify(result.data, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}