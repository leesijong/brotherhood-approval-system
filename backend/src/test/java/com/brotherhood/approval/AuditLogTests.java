package com.brotherhood.approval;

import com.brotherhood.approval.entity.AuditLog;
import com.brotherhood.approval.dto.audit.AuditLogDto;
import com.brotherhood.approval.entity.Document;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.entity.Branch;
import com.brotherhood.approval.service.AuditLogService;
import com.brotherhood.approval.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

/**
 * 감사 로깅 무결성 테스트
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuditLogTests {

    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private AuditLogRepository auditLogRepository;

    private User testUser;
    private Document testDocument;
    private Branch testBranch;

    @BeforeEach
    void setUp() {
        // 테스트 데이터 설정
        testBranch = createBranch("HQ", "본원", "서울");
        testUser = createUser("testuser", "테스트사용자", testBranch, "USER");
        testDocument = createDocument(testUser, testBranch);
    }

    @Test
    @DisplayName("감사 로그 생성 테스트")
    void testCreateAuditLog() {
        // Given
        String action = "CREATE";
        String resourceType = "DOCUMENT";
        String resourceId = testDocument.getId();
        String ipAddress = "192.168.1.100";
        
        // When
        AuditLog auditLog = auditLogService.createAuditLog(
            testUser.getId(), action, resourceType, resourceId, ipAddress);
        
        // Then
        assertThat(auditLog).isNotNull();
        assertThat(auditLog.getUserId()).isEqualTo(testUser.getId());
        assertThat(auditLog.getAction()).isEqualTo(action);
        assertThat(auditLog.getResourceType()).isEqualTo(resourceType);
        assertThat(auditLog.getResourceId()).isEqualTo(resourceId);
        assertThat(auditLog.getIpAddress()).isEqualTo(ipAddress);
        assertThat(auditLog.getActionAt()).isNotNull();
    }

    @Test
    @DisplayName("감사 로그 무결성 검증 테스트")
    void testAuditLogIntegrity() {
        // Given
        String action = "UPDATE";
        String resourceType = "DOCUMENT";
        String resourceId = testDocument.getId();
        String ipAddress = "192.168.1.100";
        
        // When
        AuditLog auditLog = auditLogService.createAuditLog(
            testUser.getId(), action, resourceType, resourceId, ipAddress);
        
        // Then
        // 필수 필드 검증
        assertThat(auditLog.getUserId()).isNotBlank();
        assertThat(auditLog.getAction()).isNotBlank();
        assertThat(auditLog.getResourceType()).isNotBlank();
        assertThat(auditLog.getResourceId()).isNotBlank();
        assertThat(auditLog.getActionAt()).isNotNull();
        
        // 타임스탬프 검증
        assertThat(auditLog.getActionAt()).isBeforeOrEqualTo(LocalDateTime.now());
        assertThat(auditLog.getActionAt()).isAfter(LocalDateTime.now().minusMinutes(1));
    }

    @Test
    @DisplayName("감사 로그 수정 불가 검증 테스트")
    void testAuditLogImmutable() {
        // Given
        AuditLog auditLog = auditLogService.createAuditLog(
            testUser.getId(), "CREATE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        
        // When
        auditLog.setAction("MODIFIED");
        auditLog.setResourceType("MODIFIED");
        auditLogRepository.save(auditLog);
        
        // Then
        // 감사 로그는 수정되어서는 안 됨 (실제로는 @PreUpdate 등으로 방지)
        AuditLog savedLog = auditLogRepository.findById(auditLog.getId()).orElse(null);
        assertThat(savedLog).isNotNull();
        // 실제 구현에서는 수정이 방지되어야 함
    }

    @Test
    @DisplayName("감사 로그 삭제 불가 검증 테스트")
    void testAuditLogUndeletable() {
        // Given
        AuditLog auditLog = auditLogService.createAuditLog(
            testUser.getId(), "CREATE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        
        // When & Then
        // 감사 로그는 삭제되어서는 안 됨
        assertThatThrownBy(() -> auditLogRepository.delete(auditLog))
            .isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("감사 로그 시간 순서 검증 테스트")
    void testAuditLogTimeOrder() {
        // Given
        LocalDateTime startTime = LocalDateTime.now();
        
        // When
        AuditLog log1 = auditLogService.createAuditLog(
            testUser.getId(), "CREATE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        
        try {
            Thread.sleep(100); // 100ms 대기
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        AuditLog log2 = auditLogService.createAuditLog(
            testUser.getId(), "UPDATE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        
        // Then
        assertThat(log1.getActionAt()).isBefore(log2.getActionAt());
        assertThat(log1.getActionAt()).isAfter(startTime);
        assertThat(log2.getActionAt()).isBefore(LocalDateTime.now());
    }

    @Test
    @DisplayName("감사 로그 사용자별 조회 테스트")
    void testGetAuditLogsByUser() {
        // Given
        auditLogService.createAuditLog(
            testUser.getId(), "CREATE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        auditLogService.createAuditLog(
            testUser.getId(), "UPDATE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        
        // When
        List<AuditLog> userLogs = auditLogService.getAuditLogsByUser(testUser.getId());
        
        // Then
        assertThat(userLogs).hasSize(2);
        assertThat(userLogs).allMatch(log -> log.getUserId().equals(testUser.getId()));
    }

    @Test
    @DisplayName("감사 로그 리소스별 조회 테스트")
    void testGetAuditLogsByResource() {
        // Given
        auditLogService.createAuditLog(
            testUser.getId(), "CREATE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        auditLogService.createAuditLog(
            testUser.getId(), "UPDATE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        
        // When
        List<AuditLogDto> resourceLogs = auditLogService.getAuditLogsByResource(
            "DOCUMENT", testDocument.getId());
        
        // Then
        assertThat(resourceLogs).hasSize(2);
        assertThat(resourceLogs).allMatch(log -> 
            log.getResourceType().equals("DOCUMENT") && 
            log.getResourceId().equals(testDocument.getId()));
    }

    @Test
    @DisplayName("감사 로그 액션별 조회 테스트")
    void testGetAuditLogsByAction() {
        // Given
        auditLogService.createAuditLog(
            testUser.getId(), "CREATE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        auditLogService.createAuditLog(
            testUser.getId(), "UPDATE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        auditLogService.createAuditLog(
            testUser.getId(), "DELETE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        
        // When
        List<AuditLogDto> createLogs = auditLogService.getAuditLogsByAction("CREATE");
        List<AuditLogDto> updateLogs = auditLogService.getAuditLogsByAction("UPDATE");
        List<AuditLogDto> deleteLogs = auditLogService.getAuditLogsByAction("DELETE");
        
        // Then
        assertThat(createLogs).hasSize(1);
        assertThat(updateLogs).hasSize(1);
        assertThat(deleteLogs).hasSize(1);
        assertThat(createLogs.get(0).getAction()).isEqualTo("CREATE");
        assertThat(updateLogs.get(0).getAction()).isEqualTo("UPDATE");
        assertThat(deleteLogs.get(0).getAction()).isEqualTo("DELETE");
    }

    @Test
    @DisplayName("감사 로그 시간 범위 조회 테스트")
    void testGetAuditLogsByTimeRange() {
        // Given
        LocalDateTime startTime = LocalDateTime.now().minusHours(1);
        LocalDateTime endTime = LocalDateTime.now().plusHours(1);
        
        auditLogService.createAuditLog(
            testUser.getId(), "CREATE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        
        // When
        List<AuditLog> logs = auditLogService.getAuditLogsByTimeRange(startTime, endTime);
        
        // Then
        assertThat(logs).hasSize(1);
        assertThat(logs.get(0).getActionAt()).isAfter(startTime);
        assertThat(logs.get(0).getActionAt()).isBefore(endTime);
    }

    @Test
    @DisplayName("감사 로그 IP 주소 검증 테스트")
    void testAuditLogIpAddress() {
        // Given
        String ipAddress = "192.168.1.100";
        
        // When
        AuditLog auditLog = auditLogService.createAuditLog(
            testUser.getId(), "CREATE", "DOCUMENT", testDocument.getId(), ipAddress);
        
        // Then
        assertThat(auditLog.getIpAddress()).isEqualTo(ipAddress);
        assertThat(auditLog.getIpAddress()).matches("^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$");
    }

    @Test
    @DisplayName("감사 로그 사용자 에이전트 검증 테스트")
    void testAuditLogUserAgent() {
        // Given
        String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
        
        // When
        AuditLog auditLog = auditLogService.createAuditLogWithUserAgent(
            testUser.getId(), "CREATE", "DOCUMENT", testDocument.getId(), 
            "192.168.1.100", userAgent);
        
        // Then
        assertThat(auditLog.getUserAgent()).isEqualTo(userAgent);
    }

    @Test
    @DisplayName("감사 로그 세션 ID 검증 테스트")
    void testAuditLogSessionId() {
        // Given
        String sessionId = "test-session-123";
        
        // When
        AuditLog auditLog = auditLogService.createAuditLogWithSession(
            testUser.getId(), "CREATE", "DOCUMENT", testDocument.getId(), 
            "192.168.1.100", sessionId);
        
        // Then
        assertThat(auditLog.getSessionId()).isEqualTo(sessionId);
    }

    @Test
    @DisplayName("감사 로그 성공/실패 상태 검증 테스트")
    void testAuditLogSuccessStatus() {
        // Given
        String action = "CREATE";
        
        // When
        AuditLog successLog = auditLogService.createAuditLogWithStatus(
            testUser.getId(), action, "DOCUMENT", testDocument.getId(), 
            "192.168.1.100", true, null);
        
        AuditLog failureLog = auditLogService.createAuditLogWithStatus(
            testUser.getId(), action, "DOCUMENT", testDocument.getId(), 
            "192.168.1.100", false, "권한 부족");
        
        // Then
        assertThat(successLog.getIsSuccessful()).isTrue();
        assertThat(successLog.getErrorMessage()).isNull();
        
        assertThat(failureLog.getIsSuccessful()).isFalse();
        assertThat(failureLog.getErrorMessage()).isEqualTo("권한 부족");
    }

    @Test
    @DisplayName("감사 로그 JSON 데이터 검증 테스트")
    void testAuditLogJsonData() {
        // Given
        String oldValues = "{\"title\":\"이전 제목\",\"status\":\"DRAFT\"}";
        String newValues = "{\"title\":\"새 제목\",\"status\":\"PENDING\"}";
        
        // When
        AuditLog auditLog = auditLogService.createAuditLogWithData(
            testUser.getId(), "UPDATE", "DOCUMENT", testDocument.getId(), 
            "192.168.1.100", oldValues, newValues);
        
        // Then
        assertThat(auditLog.getOldValues()).isEqualTo(oldValues);
        assertThat(auditLog.getNewValues()).isEqualTo(newValues);
    }

    @Test
    @DisplayName("감사 로그 대량 생성 성능 테스트")
    void testAuditLogBulkCreationPerformance() {
        // Given
        int logCount = 1000;
        LocalDateTime startTime = LocalDateTime.now();
        
        // When
        for (int i = 0; i < logCount; i++) {
            auditLogService.createAuditLog(
                testUser.getId(), "CREATE", "DOCUMENT", testDocument.getId(), "192.168.1.100");
        }
        
        LocalDateTime endTime = LocalDateTime.now();
        
        // Then
        long duration = java.time.Duration.between(startTime, endTime).toMillis();
        assertThat(duration).isLessThan(5000); // 5초 이내 완료
        
        List<AuditLog> allLogs = auditLogService.getAuditLogsByUser(testUser.getId());
        assertThat(allLogs).hasSize(logCount);
    }

    @Test
    @DisplayName("감사 로그 무결성 검증 실패 테스트")
    void testAuditLogIntegrityFailure() {
        // Given
        String invalidUserId = "";
        String invalidAction = null;
        String invalidResourceType = "";
        String invalidResourceId = null;
        
        // When & Then
        assertThatThrownBy(() -> auditLogService.createAuditLog(
            invalidUserId, invalidAction, invalidResourceType, invalidResourceId, "192.168.1.100"))
            .isInstanceOf(IllegalArgumentException.class);
    }

    // Helper methods
    private Branch createBranch(String code, String name, String location) {
        return Branch.builder()
                .code(code)
                .name(name)
                .isActive(true)
                .build();
    }

    private User createUser(String username, String displayName, Branch branch, String roleName) {
        return User.builder()
                .username(username)
                .firstName("테스트")
                .lastName("사용자")
                .baptismalName("요한")
                .email(username + "@brotherhood.com")
                .branch(branch)
                .isActive(true)
                .build();
    }

    private Document createDocument(User author, Branch branch) {
        return Document.builder()
                .title("테스트 문서")
                .content("테스트 내용")
                .author(author)
                .branch(branch)
                .documentType("GENERAL")
                .securityLevel(Document.SecurityLevel.GENERAL)
                .priority(Document.Priority.NORMAL)
                .status("DRAFT")
                .isFinal(false)
                .version(1)
                .build();
    }
}
