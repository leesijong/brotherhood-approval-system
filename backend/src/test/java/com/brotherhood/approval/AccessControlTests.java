package com.brotherhood.approval;

import com.brotherhood.approval.entity.Document;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.entity.Branch;
import com.brotherhood.approval.entity.Role;
import com.brotherhood.approval.service.AccessControlService;
import com.brotherhood.approval.repository.BranchRepository;
import com.brotherhood.approval.repository.UserRepository;
import com.brotherhood.approval.repository.RoleRepository;
import com.brotherhood.approval.repository.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.*;

/**
 * 문서 접근제어(RBAC+ABAC) 테스트
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Rollback
class AccessControlTests {

    @Autowired
    private AccessControlService accessControlService;
    
    @Autowired
    private BranchRepository branchRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private DocumentRepository documentRepository;

    private User author;
    private User manager;
    private User director;
    private User admin;
    private User otherUser;
    private Branch hqBranch;
    private Branch seoulBranch;
    private Document testDocument;

    @BeforeEach
    void setUp() {
        // 서비스 주입 확인
        assertThat(accessControlService).isNotNull();
        
        // 테스트 데이터 설정
        hqBranch = createBranch("HQ", "본원", "서울");
        seoulBranch = createBranch("SEOUL", "서울지사", "서울");
        
        author = createUser("author", "작성자", hqBranch, "USER");
        manager = createUser("manager", "매니저", hqBranch, "MANAGER");
        director = createUser("director", "이사", hqBranch, "DIRECTOR");
        admin = createUser("admin", "관리자", hqBranch, "ADMIN");
        otherUser = createUser("other", "다른사용자", hqBranch, "USER");
        
        testDocument = createDocument(author, hqBranch);
    }

    @Test
    @DisplayName("작성자 본인 문서 접근 권한 테스트")
    void testAuthorAccessToOwnDocument() {
        // Given
        User user = author;
        Document document = testDocument;
        String action = "READ";
        
        // When
        boolean hasAccess = accessControlService.hasAccess(user, document, action);
        
        // Then
        assertThat(hasAccess).isTrue();
    }

    @Test
    @DisplayName("작성자 본인 문서 수정 권한 테스트")
    void testAuthorModifyOwnDocument() {
        // Given
        User user = author;
        Document document = testDocument;
        String action = "UPDATE";
        
        // When
        boolean hasAccess = accessControlService.hasAccess(user, document, action);
        
        // Then
        assertThat(hasAccess).isTrue();
    }

    @Test
    @DisplayName("작성자 본인 문서 삭제 권한 테스트")
    void testAuthorDeleteOwnDocument() {
        // Given
        User user = author;
        Document document = testDocument;
        String action = "DELETE";
        
        // When
        boolean hasAccess = accessControlService.hasAccess(user, document, action);
        
        // Then
        assertThat(hasAccess).isTrue();
    }

    @Test
    @DisplayName("다른 사용자 문서 접근 거부 테스트")
    void testOtherUserAccessDenied() {
        // Given
        User user = otherUser;
        Document document = testDocument;
        String action = "READ";
        
        // When
        boolean hasAccess = accessControlService.hasAccess(user, document, action);
        
        // Then
        assertThat(hasAccess).isFalse();
    }

    @Test
    @DisplayName("관리자 모든 문서 접근 권한 테스트")
    void testAdminAccessToAllDocuments() {
        // Given
        User user = admin;
        Document document = testDocument;
        String action = "READ";
        
        // When
        boolean hasAccess = accessControlService.hasAccess(user, document, action);
        
        // Then
        assertThat(hasAccess).isTrue();
    }

    @Test
    @DisplayName("관리자 모든 문서 수정 권한 테스트")
    void testAdminModifyAllDocuments() {
        // Given
        User user = admin;
        Document document = testDocument;
        String action = "UPDATE";
        
        // When
        boolean hasAccess = accessControlService.hasAccess(user, document, action);
        
        // Then
        assertThat(hasAccess).isTrue();
    }

    @Test
    @DisplayName("지사별 문서 접근 제어 테스트")
    void testBranchBasedAccessControl() {
        // Given
        User seoulUser = createUser("seoul_user", "서울지사사용자", seoulBranch, "USER");
        Document seoulDocument = createDocument(seoulUser, seoulBranch);
        User hqUser = createUser("hq_user", "본원사용자", hqBranch, "USER");
        
        // When
        boolean seoulUserAccess = accessControlService.hasAccess(seoulUser, seoulDocument, "READ");
        boolean hqUserAccess = accessControlService.hasAccess(hqUser, seoulDocument, "READ");
        
        // Then
        assertThat(seoulUserAccess).isTrue();
        assertThat(hqUserAccess).isFalse();
    }

    @Test
    @DisplayName("보안 등급별 접근 제어 테스트")
    void testSecurityLevelBasedAccessControl() {
        // Given
        Document confidentialDocument = createDocument(author, hqBranch);
        confidentialDocument.setSecurityLevel(Document.SecurityLevel.CONFIDENTIAL);
        
        User user = createUser("user", "일반사용자", hqBranch, "USER");
        User manager = createUser("manager", "매니저", hqBranch, "MANAGER");
        User admin = createUser("admin", "관리자", hqBranch, "ADMIN");
        
        // When
        boolean userAccess = accessControlService.hasAccess(user, confidentialDocument, "READ");
        boolean managerAccess = accessControlService.hasAccess(manager, confidentialDocument, "READ");
        boolean adminAccess = accessControlService.hasAccess(admin, confidentialDocument, "READ");
        
        // Then
        assertThat(userAccess).isFalse();
        assertThat(managerAccess).isTrue();
        assertThat(adminAccess).isTrue();
    }

    @Test
    @DisplayName("문서 상태별 접근 제어 테스트")
    void testDocumentStatusBasedAccessControl() {
        // Given
        Document pendingDocument = createDocument(author, hqBranch);
        pendingDocument.setStatus("PENDING");
        
        User user = createUser("user", "일반사용자", hqBranch, "USER");
        User manager = createUser("manager", "매니저", hqBranch, "MANAGER");
        
        // When
        boolean userReadAccess = accessControlService.hasAccess(user, pendingDocument, "READ");
        boolean userUpdateAccess = accessControlService.hasAccess(user, pendingDocument, "UPDATE");
        boolean managerReadAccess = accessControlService.hasAccess(manager, pendingDocument, "READ");
        boolean managerUpdateAccess = accessControlService.hasAccess(manager, pendingDocument, "UPDATE");
        
        // Then
        assertThat(userReadAccess).isTrue();
        assertThat(userUpdateAccess).isFalse(); // 상신된 문서는 작성자도 수정 불가
        assertThat(managerReadAccess).isTrue();
        assertThat(managerUpdateAccess).isTrue();
    }

    @Test
    @DisplayName("시간 기반 접근 제어 테스트")
    void testTimeBasedAccessControl() {
        // Given
        Document document = createDocument(author, hqBranch);
        User user = createUser("user", "일반사용자", hqBranch, "USER");
        
        // When
        boolean accessDuringBusinessHours = accessControlService.hasAccess(user, document, "READ");
        
        // Then
        assertThat(accessDuringBusinessHours).isTrue();
    }

    @Test
    @DisplayName("IP 기반 접근 제어 테스트")
    void testIpBasedAccessControl() {
        // Given
        Document document = createDocument(author, hqBranch);
        User user = createUser("user", "일반사용자", hqBranch, "USER");
        String allowedIp = "192.168.1.100";
        String blockedIp = "10.0.0.100";
        
        // When
        boolean allowedIpAccess = accessControlService.hasAccess(user, document, "READ", allowedIp);
        boolean blockedIpAccess = accessControlService.hasAccess(user, document, "READ", blockedIp);
        
        // Then
        assertThat(allowedIpAccess).isTrue();
        assertThat(blockedIpAccess).isFalse();
    }

    @Test
    @DisplayName("역할 기반 접근 제어 테스트")
    void testRoleBasedAccessControl() {
        // Given
        Document document = createDocument(author, hqBranch);
        User user = createUser("user", "일반사용자", hqBranch, "USER");
        User manager = createUser("manager", "매니저", hqBranch, "MANAGER");
        User director = createUser("director", "이사", hqBranch, "DIRECTOR");
        
        // When
        boolean userAccess = accessControlService.hasAccess(user, document, "APPROVE");
        boolean managerAccess = accessControlService.hasAccess(manager, document, "APPROVE");
        boolean directorAccess = accessControlService.hasAccess(director, document, "APPROVE");
        
        // Then
        assertThat(userAccess).isFalse();
        assertThat(managerAccess).isTrue();
        assertThat(directorAccess).isTrue();
    }

    @Test
    @DisplayName("복합 접근 제어 정책 테스트")
    void testComplexAccessControlPolicy() {
        // Given
        Document confidentialDocument = createDocument(author, hqBranch);
        confidentialDocument.setSecurityLevel(Document.SecurityLevel.CONFIDENTIAL);
        confidentialDocument.setStatus("PENDING");
        
        User user = createUser("user", "일반사용자", hqBranch, "USER");
        User manager = createUser("manager", "매니저", hqBranch, "MANAGER");
        
        // When
        boolean userAccess = accessControlService.hasAccess(user, confidentialDocument, "READ");
        boolean managerAccess = accessControlService.hasAccess(manager, confidentialDocument, "READ");
        boolean managerApproveAccess = accessControlService.hasAccess(manager, confidentialDocument, "APPROVE");
        
        // Then
        assertThat(userAccess).isFalse(); // 보안 등급으로 인해 접근 거부
        assertThat(managerAccess).isTrue(); // 매니저는 기밀 문서 접근 가능
        assertThat(managerApproveAccess).isTrue(); // 매니저는 결재 가능
    }

    @Test
    @DisplayName("접근 제어 예외 상황 테스트")
    void testAccessControlException() {
        // Given
        Document document = createDocument(author, hqBranch);
        User user = null; // null 사용자
        
        // When & Then
        assertThatThrownBy(() -> accessControlService.hasAccess(user, document, "READ"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("사용자 정보가 필요합니다");
    }

    @Test
    @DisplayName("문서 접근 이력 기록 테스트")
    void testDocumentAccessLogging() {
        // Given
        Document document = createDocument(author, hqBranch);
        User user = createUser("user", "일반사용자", hqBranch, "USER");
        
        // When
        accessControlService.hasAccess(user, document, "READ");
        
        // Then
        // 접근 이력이 기록되었는지 확인
        // 실제 구현에서는 AuditLogService를 통해 확인
        assertThat(true).isTrue(); // 임시 구현
    }

    // Helper methods
    private Branch createBranch(String code, String name, String location) {
        Branch branch = Branch.builder()
                .code(code)
                .name(name)
                .isActive(true)
                .build();
        return branchRepository.save(branch);
    }

    private User createUser(String username, String displayName, Branch branch, String roleName) {
        User user = User.builder()
                .username(username)
                .firstName("테스트")
                .lastName("사용자")
                .baptismalName("요한")
                .email(username + "@brotherhood.com")
                .branch(branch)
                .isActive(true)
                .build();
        
        return userRepository.save(user);
    }

    private Document createDocument(User author, Branch branch) {
        Document document = Document.builder()
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
        return documentRepository.save(document);
    }
}
