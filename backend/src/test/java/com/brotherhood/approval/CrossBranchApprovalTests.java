package com.brotherhood.approval;

import com.brotherhood.approval.entity.ApprovalLine;
import com.brotherhood.approval.entity.ApprovalStep;
import com.brotherhood.approval.entity.Document;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.entity.Branch;
import com.brotherhood.approval.entity.Role;
import com.brotherhood.approval.service.CrossBranchApprovalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * 지사 교차 결재 시나리오 테스트
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CrossBranchApprovalTests {

    @Autowired
    private CrossBranchApprovalService crossBranchApprovalService;

    private User hqAuthor;
    private User seoulManager;
    private User busanManager;
    private User hqDirector;
    private User seoulDirector;
    private User busanDirector;
    private Branch hqBranch;
    private Branch seoulBranch;
    private Branch busanBranch;
    private Document crossBranchDocument;

    @BeforeEach
    void setUp() {
        // 테스트 데이터 설정
        hqBranch = createBranch("HQ", "본원", "서울");
        seoulBranch = createBranch("SEOUL", "서울지사", "서울");
        busanBranch = createBranch("BUSAN", "부산지사", "부산");
        
        hqAuthor = createUser("hq_author", "본원작성자", hqBranch, "USER");
        seoulManager = createUser("seoul_manager", "서울매니저", seoulBranch, "MANAGER");
        busanManager = createUser("busan_manager", "부산매니저", busanBranch, "MANAGER");
        hqDirector = createUser("hq_director", "본원이사", hqBranch, "DIRECTOR");
        seoulDirector = createUser("seoul_director", "서울이사", seoulBranch, "DIRECTOR");
        busanDirector = createUser("busan_director", "부산이사", busanBranch, "DIRECTOR");
        
        crossBranchDocument = createDocument(hqAuthor, hqBranch);
    }

    @Test
    @DisplayName("본원에서 지사로 결재 요청 테스트")
    void testHqToBranchApprovalRequest() {
        // Given
        Document document = crossBranchDocument;
        String targetBranchId = seoulBranch.getId();
        
        // When
        ApprovalLine approvalLine = crossBranchApprovalService.createCrossBranchApprovalLine(
            document, targetBranchId, "HQ_TO_BRANCH");
        
        // Then
        assertThat(approvalLine).isNotNull();
        assertThat(approvalLine.getDocument()).isEqualTo(document);
        assertThat(approvalLine.getIsParallel()).isFalse();
        assertThat(approvalLine.getIsConditional()).isFalse();
        
        List<ApprovalStep> steps = approvalLine.getApprovalSteps().stream().toList();
        assertThat(steps).hasSize(2);
        assertThat(steps.get(0).getApprover().getBranch()).isEqualTo(seoulBranch);
        assertThat(steps.get(1).getApprover().getBranch()).isEqualTo(seoulBranch);
    }

    @Test
    @DisplayName("지사에서 본원으로 결재 요청 테스트")
    void testBranchToHqApprovalRequest() {
        // Given
        Document seoulDocument = createDocument(seoulManager, seoulBranch);
        String targetBranchId = hqBranch.getId();
        
        // When
        ApprovalLine approvalLine = crossBranchApprovalService.createCrossBranchApprovalLine(
            seoulDocument, targetBranchId, "BRANCH_TO_HQ");
        
        // Then
        assertThat(approvalLine).isNotNull();
        assertThat(approvalLine.getDocument()).isEqualTo(seoulDocument);
        
        List<ApprovalStep> steps = approvalLine.getApprovalSteps().stream().toList();
        assertThat(steps).hasSize(2);
        assertThat(steps.get(0).getApprover().getBranch()).isEqualTo(hqBranch);
        assertThat(steps.get(1).getApprover().getBranch()).isEqualTo(hqBranch);
    }

    @Test
    @DisplayName("지사 간 교차 결재 요청 테스트")
    void testBranchToBranchApprovalRequest() {
        // Given
        Document seoulDocument = createDocument(seoulManager, seoulBranch);
        String targetBranchId = busanBranch.getId();
        
        // When
        ApprovalLine approvalLine = crossBranchApprovalService.createCrossBranchApprovalLine(
            seoulDocument, targetBranchId, "BRANCH_TO_BRANCH");
        
        // Then
        assertThat(approvalLine).isNotNull();
        assertThat(approvalLine.getDocument()).isEqualTo(seoulDocument);
        
        List<ApprovalStep> steps = approvalLine.getApprovalSteps().stream().toList();
        assertThat(steps).hasSize(3); // 본원 경유 + 대상 지사
        assertThat(steps.get(0).getApprover().getBranch()).isEqualTo(hqBranch); // 본원 경유
        assertThat(steps.get(1).getApprover().getBranch()).isEqualTo(busanBranch); // 대상 지사
        assertThat(steps.get(2).getApprover().getBranch()).isEqualTo(busanBranch); // 대상 지사
    }

    @Test
    @DisplayName("병렬 교차 결재 테스트")
    void testParallelCrossBranchApproval() {
        // Given
        Document document = crossBranchDocument;
        List<String> targetBranchIds = List.of(seoulBranch.getId(), busanBranch.getId());
        
        // When
        List<ApprovalLine> approvalLines = crossBranchApprovalService.createParallelCrossBranchApprovalLines(
            document, targetBranchIds, "PARALLEL_CROSS_BRANCH");
        
        // Then
        assertThat(approvalLines).hasSize(2);
        
        // 서울지사 결재선
        ApprovalLine seoulLine = approvalLines.stream()
            .filter(line -> line.getApprovalSteps().stream()
                .anyMatch(step -> step.getApprover().getBranch().equals(seoulBranch)))
            .findFirst().orElse(null);
        assertThat(seoulLine).isNotNull();
        assertThat(seoulLine.getIsParallel()).isTrue();
        
        // 부산지사 결재선
        ApprovalLine busanLine = approvalLines.stream()
            .filter(line -> line.getApprovalSteps().stream()
                .anyMatch(step -> step.getApprover().getBranch().equals(busanBranch)))
            .findFirst().orElse(null);
        assertThat(busanLine).isNotNull();
        assertThat(busanLine.getIsParallel()).isTrue();
    }

    @Test
    @DisplayName("조건부 교차 결재 테스트")
    void testConditionalCrossBranchApproval() {
        // Given
        Document document = crossBranchDocument;
        String targetBranchId = seoulBranch.getId();
        String condition = "amount > 1000000"; // 100만원 이상
        
        // When
        ApprovalLine approvalLine = crossBranchApprovalService.createConditionalCrossBranchApprovalLine(
            document, targetBranchId, condition, "CONDITIONAL_CROSS_BRANCH");
        
        // Then
        assertThat(approvalLine).isNotNull();
        assertThat(approvalLine.getIsConditional()).isTrue();
        assertThat(approvalLine.getConditionExpression()).isEqualTo(condition);
        
        List<ApprovalStep> steps = approvalLine.getApprovalSteps().stream().toList();
        assertThat(steps).hasSize(3); // 조건부 + 일반 결재
        assertThat(steps.get(0).getIsConditional()).isTrue();
        assertThat(steps.get(1).getIsConditional()).isFalse();
        assertThat(steps.get(2).getIsConditional()).isFalse();
    }

    @Test
    @DisplayName("교차 결재 권한 검증 테스트")
    void testCrossBranchApprovalPermission() {
        // Given
        Document document = crossBranchDocument;
        String targetBranchId = seoulBranch.getId();
        
        // When
        boolean hasPermission = crossBranchApprovalService.hasCrossBranchApprovalPermission(
            hqAuthor, document, targetBranchId);
        
        // Then
        assertThat(hasPermission).isTrue();
    }

    @Test
    @DisplayName("교차 결재 권한 부족 테스트")
    void testCrossBranchApprovalPermissionDenied() {
        // Given
        Document document = crossBranchDocument;
        String targetBranchId = seoulBranch.getId();
        User unauthorizedUser = createUser("unauthorized", "권한없는사용자", hqBranch, "USER");
        
        // When
        boolean hasPermission = crossBranchApprovalService.hasCrossBranchApprovalPermission(
            unauthorizedUser, document, targetBranchId);
        
        // Then
        assertThat(hasPermission).isFalse();
    }

    @Test
    @DisplayName("교차 결재 상태 추적 테스트")
    void testCrossBranchApprovalStatusTracking() {
        // Given
        Document document = crossBranchDocument;
        String targetBranchId = seoulBranch.getId();
        
        ApprovalLine approvalLine = crossBranchApprovalService.createCrossBranchApprovalLine(
            document, targetBranchId, "HQ_TO_BRANCH");
        
        // When
        String status = crossBranchApprovalService.getCrossBranchApprovalStatus(approvalLine.getId());
        
        // Then
        assertThat(status).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("교차 결재 진행 상황 조회 테스트")
    void testCrossBranchApprovalProgress() {
        // Given
        Document document = crossBranchDocument;
        String targetBranchId = seoulBranch.getId();
        
        ApprovalLine approvalLine = crossBranchApprovalService.createCrossBranchApprovalLine(
            document, targetBranchId, "HQ_TO_BRANCH");
        
        // When
        List<ApprovalStep> completedSteps = crossBranchApprovalService.getCompletedApprovalSteps(approvalLine.getId());
        List<ApprovalStep> pendingSteps = crossBranchApprovalService.getPendingApprovalSteps(approvalLine.getId());
        
        // Then
        assertThat(completedSteps).isEmpty();
        assertThat(pendingSteps).hasSize(2);
    }

    @Test
    @DisplayName("교차 결재 알림 테스트")
    void testCrossBranchApprovalNotification() {
        // Given
        Document document = crossBranchDocument;
        String targetBranchId = seoulBranch.getId();
        
        ApprovalLine approvalLine = crossBranchApprovalService.createCrossBranchApprovalLine(
            document, targetBranchId, "HQ_TO_BRANCH");
        
        // When
        boolean notificationSent = crossBranchApprovalService.sendCrossBranchApprovalNotification(
            approvalLine.getId());
        
        // Then
        assertThat(notificationSent).isTrue();
    }

    @Test
    @DisplayName("교차 결재 위임 테스트")
    void testCrossBranchApprovalDelegation() {
        // Given
        Document document = crossBranchDocument;
        String targetBranchId = seoulBranch.getId();
        
        ApprovalLine approvalLine = crossBranchApprovalService.createCrossBranchApprovalLine(
            document, targetBranchId, "HQ_TO_BRANCH");
        
        ApprovalStep firstStep = approvalLine.getApprovalSteps().stream()
            .min((s1, s2) -> Integer.compare(s1.getStepOrder(), s2.getStepOrder()))
            .orElse(null);
        
        // When
        boolean delegated = crossBranchApprovalService.delegateCrossBranchApproval(
            firstStep.getId(), busanManager.getId());
        
        // Then
        assertThat(delegated).isTrue();
        assertThat(firstStep.getAlternateApprover()).isEqualTo(busanManager);
    }

    @Test
    @DisplayName("교차 결재 회수 테스트")
    void testCrossBranchApprovalRecall() {
        // Given
        Document document = crossBranchDocument;
        String targetBranchId = seoulBranch.getId();
        
        ApprovalLine approvalLine = crossBranchApprovalService.createCrossBranchApprovalLine(
            document, targetBranchId, "HQ_TO_BRANCH");
        
        // When
        boolean recalled = crossBranchApprovalService.recallCrossBranchApproval(
            approvalLine.getId(), hqAuthor.getId());
        
        // Then
        assertThat(recalled).isTrue();
        String status = crossBranchApprovalService.getCrossBranchApprovalStatus(approvalLine.getId());
        assertThat(status).isEqualTo("RECALLED");
    }

    @Test
    @DisplayName("교차 결재 통계 테스트")
    void testCrossBranchApprovalStatistics() {
        // Given
        Document document = crossBranchDocument;
        String targetBranchId = seoulBranch.getId();
        
        crossBranchApprovalService.createCrossBranchApprovalLine(
            document, targetBranchId, "HQ_TO_BRANCH");
        
        // When
        long totalCount = crossBranchApprovalService.getCrossBranchApprovalCount();
        long hqToBranchCount = crossBranchApprovalService.getCrossBranchApprovalCountByType("HQ_TO_BRANCH");
        long seoulBranchCount = crossBranchApprovalService.getCrossBranchApprovalCountByBranch(seoulBranch.getId());
        
        // Then
        assertThat(totalCount).isGreaterThan(0);
        assertThat(hqToBranchCount).isGreaterThan(0);
        assertThat(seoulBranchCount).isGreaterThan(0);
    }

    @Test
    @DisplayName("교차 결재 예외 상황 테스트")
    void testCrossBranchApprovalException() {
        // Given
        Document document = crossBranchDocument;
        String invalidBranchId = "invalid-branch-id";
        
        // When & Then
        assertThatThrownBy(() -> crossBranchApprovalService.createCrossBranchApprovalLine(
            document, invalidBranchId, "HQ_TO_BRANCH"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("유효하지 않은 지사 ID입니다");
    }

    @Test
    @DisplayName("교차 결재 성능 테스트")
    void testCrossBranchApprovalPerformance() {
        // Given
        Document document = crossBranchDocument;
        String targetBranchId = seoulBranch.getId();
        
        long startTime = System.currentTimeMillis();
        
        // When
        for (int i = 0; i < 100; i++) {
            crossBranchApprovalService.createCrossBranchApprovalLine(
                document, targetBranchId, "HQ_TO_BRANCH");
        }
        
        long endTime = System.currentTimeMillis();
        
        // Then
        long duration = endTime - startTime;
        assertThat(duration).isLessThan(5000); // 5초 이내 완료
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
        Role role = Role.builder()
                .name(roleName)
                .description(roleName + " 역할")
                .isActive(true)
                .build();
        
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
                .title("교차 결재 테스트 문서")
                .content("교차 결재 테스트 내용")
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
