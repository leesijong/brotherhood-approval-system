package com.brotherhood.approval;

import com.brotherhood.approval.entity.ApprovalLine;
import com.brotherhood.approval.entity.ApprovalStep;
import com.brotherhood.approval.entity.Document;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.entity.Branch;
import com.brotherhood.approval.entity.Role;
import com.brotherhood.approval.service.ApprovalPolicyService;
import com.brotherhood.approval.repository.BranchRepository;
import com.brotherhood.approval.repository.UserRepository;
import com.brotherhood.approval.repository.RoleRepository;
import com.brotherhood.approval.repository.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;

/**
 * 결재선 정책 엔진 테스트
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ApprovalPolicyTests {

    @Autowired
    private ApprovalPolicyService approvalPolicyService;
    
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
    private Branch hqBranch;
    private Branch seoulBranch;
    private Document testDocument;

    @BeforeEach
    void setUp() {
        // 테스트 데이터 설정
        hqBranch = createBranch("HQ", "본원", "서울");
        seoulBranch = createBranch("SEOUL", "서울지사", "서울");
        
        author = createUser("author", "작성자", hqBranch, "USER");
        manager = createUser("manager", "매니저", hqBranch, "MANAGER");
        director = createUser("director", "이사", hqBranch, "DIRECTOR");
        admin = createUser("admin", "관리자", hqBranch, "ADMIN");
        
        testDocument = createDocument(author, hqBranch);
    }

    @Test
    @DisplayName("기본 순차 결재선 생성 테스트")
    void testCreateSequentialApprovalLine() {
        // Given
        Document document = testDocument;
        String policyType = "SEQUENTIAL";
        
        // When
        List<ApprovalStep> approvalSteps = approvalPolicyService.createApprovalSteps(
            document, policyType, null);
        
        // Then
        assertThat(approvalSteps).hasSize(2);
        assertThat(approvalSteps.get(0).getStepOrder()).isEqualTo(1);
        assertThat(approvalSteps.get(1).getStepOrder()).isEqualTo(2);
        assertThat(approvalSteps.get(0).getApproverType()).isEqualTo(ApprovalStep.ApproverType.PERSON);
        assertThat(approvalSteps.get(1).getApproverType()).isEqualTo(ApprovalStep.ApproverType.PERSON);
    }

    @Test
    @DisplayName("병렬 결재선 생성 테스트")
    void testCreateParallelApprovalLine() {
        // Given
        Document document = testDocument;
        String policyType = "PARALLEL";
        
        // When
        List<ApprovalStep> approvalSteps = approvalPolicyService.createApprovalSteps(
            document, policyType, null);
        
        // Then
        assertThat(approvalSteps).hasSize(2);
        assertThat(approvalSteps.get(0).getStepOrder()).isEqualTo(1);
        assertThat(approvalSteps.get(1).getStepOrder()).isEqualTo(1); // 병렬이므로 같은 순서
        assertThat(approvalSteps.get(0).getIsRequired()).isFalse();
        assertThat(approvalSteps.get(1).getIsRequired()).isFalse();
    }

    @Test
    @DisplayName("조건부 결재선 생성 테스트")
    void testCreateConditionalApprovalLine() {
        // Given
        Document document = testDocument;
        String policyType = "CONDITIONAL";
        String condition = "amount > 1000000"; // 100만원 이상
        
        // When
        List<ApprovalStep> approvalSteps = approvalPolicyService.createApprovalSteps(
            document, policyType, condition);
        
        // Then
        assertThat(approvalSteps).hasSize(3);
        assertThat(approvalSteps.get(0).getIsConditional()).isTrue();
        assertThat(approvalSteps.get(0).getConditionExpression()).isEqualTo(condition);
    }

    @Test
    @DisplayName("지사별 결재선 정책 테스트")
    void testBranchSpecificApprovalPolicy() {
        // Given
        Document seoulDocument = createDocument(author, seoulBranch);
        String policyType = "BRANCH_SPECIFIC";
        
        // When
        List<ApprovalStep> approvalSteps = approvalPolicyService.createApprovalSteps(
            seoulDocument, policyType, null);
        
        // Then
        assertThat(approvalSteps).hasSize(2);
        // 지사별 정책에 따라 다른 결재선이 생성되어야 함
        assertThat(approvalSteps.get(0).getApprover().getBranch()).isEqualTo(seoulBranch);
    }

    @Test
    @DisplayName("문서 타입별 결재선 정책 테스트")
    void testDocumentTypeSpecificApprovalPolicy() {
        // Given
        Document budgetDocument = createDocument(author, hqBranch);
        budgetDocument.setDocumentType("BUDGET");
        String policyType = "DOCUMENT_TYPE_SPECIFIC";
        
        // When
        List<ApprovalStep> approvalSteps = approvalPolicyService.createApprovalSteps(
            budgetDocument, policyType, null);
        
        // Then
        assertThat(approvalSteps).hasSize(3); // 예산 문서는 3단계 결재
        assertThat(approvalSteps.get(0).getApproverType()).isEqualTo(ApprovalStep.ApproverType.ROLE);
        assertThat(approvalSteps.get(1).getApproverType()).isEqualTo(ApprovalStep.ApproverType.ROLE);
        assertThat(approvalSteps.get(2).getApproverType()).isEqualTo(ApprovalStep.ApproverType.ROLE);
    }

    @Test
    @DisplayName("보안 등급별 결재선 정책 테스트")
    void testSecurityLevelSpecificApprovalPolicy() {
        // Given
        Document confidentialDocument = createDocument(author, hqBranch);
        confidentialDocument.setSecurityLevel(Document.SecurityLevel.CONFIDENTIAL);
        String policyType = "SECURITY_LEVEL_SPECIFIC";
        
        // When
        List<ApprovalStep> approvalSteps = approvalPolicyService.createApprovalSteps(
            confidentialDocument, policyType, null);
        
        // Then
        assertThat(approvalSteps).hasSize(4); // 기밀 문서는 4단계 결재
        assertThat(approvalSteps.get(0).getApproverType()).isEqualTo(ApprovalStep.ApproverType.ROLE);
        assertThat(approvalSteps.get(1).getApproverType()).isEqualTo(ApprovalStep.ApproverType.ROLE);
        assertThat(approvalSteps.get(2).getApproverType()).isEqualTo(ApprovalStep.ApproverType.ROLE);
        assertThat(approvalSteps.get(3).getApproverType()).isEqualTo(ApprovalStep.ApproverType.ROLE);
    }

    @Test
    @DisplayName("위임 가능한 결재선 정책 테스트")
    void testDelegatableApprovalPolicy() {
        // Given
        Document document = testDocument;
        String policyType = "DELEGATABLE";
        
        // When
        List<ApprovalStep> approvalSteps = approvalPolicyService.createApprovalSteps(
            document, policyType, null);
        
        // Then
        assertThat(approvalSteps).hasSize(2);
        assertThat(approvalSteps.get(0).getIsDelegatable()).isTrue();
        assertThat(approvalSteps.get(1).getIsDelegatable()).isTrue();
        assertThat(approvalSteps.get(0).getMaxDelegationLevel()).isEqualTo(2);
        assertThat(approvalSteps.get(1).getMaxDelegationLevel()).isEqualTo(2);
    }

    @Test
    @DisplayName("대결자 설정 정책 테스트")
    void testAlternateApproverPolicy() {
        // Given
        Document document = testDocument;
        String policyType = "ALTERNATE_APPROVER";
        
        // When
        List<ApprovalStep> approvalSteps = approvalPolicyService.createApprovalSteps(
            document, policyType, null);
        
        // Then
        assertThat(approvalSteps).hasSize(2);
        assertThat(approvalSteps.get(0).getAlternateApprover()).isNotNull();
        assertThat(approvalSteps.get(1).getAlternateApprover()).isNotNull();
    }

    @Test
    @DisplayName("복합 정책 테스트 (순차 + 조건부)")
    void testComplexApprovalPolicy() {
        // Given
        Document document = testDocument;
        String policyType = "COMPLEX";
        String condition = "amount > 5000000"; // 500만원 이상
        
        // When
        List<ApprovalStep> approvalSteps = approvalPolicyService.createApprovalSteps(
            document, policyType, condition);
        
        // Then
        assertThat(approvalSteps).hasSize(4);
        assertThat(approvalSteps.get(0).getIsConditional()).isTrue();
        assertThat(approvalSteps.get(1).getIsConditional()).isFalse();
        assertThat(approvalSteps.get(2).getIsConditional()).isFalse();
        assertThat(approvalSteps.get(3).getIsConditional()).isFalse();
    }

    @Test
    @DisplayName("정책 검증 실패 테스트")
    void testInvalidPolicyValidation() {
        // Given
        Document document = testDocument;
        String invalidPolicyType = "INVALID_POLICY";
        
        // When & Then
        assertThatThrownBy(() -> approvalPolicyService.createApprovalSteps(
            document, invalidPolicyType, null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("지원하지 않는 정책 타입입니다");
    }

    @Test
    @DisplayName("조건부 정책 조건 검증 테스트")
    void testConditionalPolicyConditionValidation() {
        // Given
        Document document = testDocument;
        String policyType = "CONDITIONAL";
        String invalidCondition = "invalid_condition_syntax";
        
        // When & Then
        assertThatThrownBy(() -> approvalPolicyService.createApprovalSteps(
            document, policyType, invalidCondition))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("잘못된 조건식입니다");
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
        // 역할 생성 또는 조회
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = Role.builder()
                            .name(roleName)
                            .description(roleName + " 역할")
                            .isActive(true)
                            .build();
                    return roleRepository.save(newRole);
                });
        
        User user = User.builder()
                .username(username)
                .firstName("테스트")
                .lastName("사용자")
                .baptismalName("요한")
                .email(username + "@brotherhood.com")
                .branch(branch)
                .isActive(true)
                .build();
        
        user = userRepository.save(user);
        
        // 사용자에 역할 할당은 UserRole 엔티티를 통해 처리
        // 테스트에서는 단순히 사용자만 반환
        return user;
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
