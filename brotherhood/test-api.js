// API 테스트 스크립트
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

async function testApi() {
  console.log('🚀 API 테스트 시작...\n');

  try {
    // 1. 헬스 체크
    console.log('1. 헬스 체크 테스트...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 헬스 체크 성공:', healthResponse.status);
  } catch (error) {
    console.log('❌ 헬스 체크 실패:', error.message);
  }

  try {
    // 2. 로그인 테스트
    console.log('\n2. 로그인 API 테스트...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin@brotherhood.kr',
      password: 'admin123!'
    });
    console.log('✅ 로그인 성공:', loginResponse.data.user?.displayName);
    
    const token = loginResponse.data.accessToken;
    
    // 3. 사용자 정보 조회 테스트
    console.log('\n3. 사용자 정보 조회 테스트...');
    const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 사용자 정보 조회 성공:', userResponse.data.displayName);
    
    // 4. 문서 목록 조회 테스트
    console.log('\n4. 문서 목록 조회 테스트...');
    const documentsResponse = await axios.get(`${API_BASE_URL}/documents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 문서 목록 조회 성공:', documentsResponse.data.content?.length || 0, '개 문서');
    
    // 5. 대시보드 통계 조회 테스트
    console.log('\n5. 대시보드 통계 조회 테스트...');
    const statsResponse = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 대시보드 통계 조회 성공:', statsResponse.data.totalDocuments, '개 총 문서');
    
    console.log('\n🎉 모든 API 테스트 완료!');
    
  } catch (error) {
    console.log('❌ API 테스트 실패:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('응답 데이터:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testApi();
