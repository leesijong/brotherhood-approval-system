package com.brotherhood.approval.service;

import com.brotherhood.approval.entity.ApprovalLine;
import com.brotherhood.approval.entity.ApprovalStep;
import com.brotherhood.approval.entity.Document;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.entity.Branch;
import com.brotherhood.approval.entity.Role;
import com.brotherhood.approval.repository.ApprovalLineRepository;
import com.brotherhood.approval.repository.ApprovalStepRepository;
import com.brotherhood.approval.repository.BranchRepository;
import com.brotherhood.approval.repository.UserRepository;
import com.brotherhood.approval.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 지사 교차 결재 서비스
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CrossBranchApprovalService {
    
    private final ApprovalLineRepository approvalLineRepository;
    private final ApprovalStepRepository approvalStepRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final NotificationService notificationService;
    
    /**
     * 교차 결재선 생성
     */
    @Transactional
    public ApprovalLine createCrossBranchApprovalLine(Document document, String targetBranchId, String approvalType) {
        log.info("교차 결재선 생성: documentId={}, targetBranchId={}, type={}", 
                document.getId(), targetBranchId, approvalType);
        
        Branch targetBranch = branchRepository.findById(UUID.fromString(targetBranchId))
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 지사 ID입니다: " + targetBranchId));
        
        ApprovalLine approvalLine = ApprovalLine.builder()
                .document(document)
                .name("교차 결재선 - " + targetBranch.getName())
                .description("지사 간 교차 결재")
                .isParallel(false)
                .isConditional(false)
                .createdBy(document.getAuthor())
                .build();
        
        ApprovalLine savedApprovalLine = approvalLineRepository.save(approvalLine);
        
        // 결재단계 생성
        List<ApprovalStep> approvalSteps = createCrossBranchApprovalSteps(savedApprovalLine, document, targetBranch, approvalType);
        approvalStepRepository.saveAll(approvalSteps);
        
        savedApprovalLine.setApprovalSteps(approvalSteps.stream().collect(java.util.stream.Collectors.toSet()));
        
        return savedApprovalLine;
    }
    
    /**
     * 병렬 교차 결재선 생성
     */
    @Transactional
    public List<ApprovalLine> createParallelCrossBranchApprovalLines(Document document, List<String> targetBranchIds, String approvalType) {
        log.info("병렬 교차 결재선 생성: documentId={}, targetBranchIds={}, type={}", 
                document.getId(), targetBranchIds, approvalType);
        
        List<ApprovalLine> approvalLines = new ArrayList<>();
        
        for (String targetBranchId : targetBranchIds) {
            ApprovalLine approvalLine = createCrossBranchApprovalLine(document, targetBranchId, approvalType);
            approvalLine.setIsParallel(true);
            approvalLineRepository.save(approvalLine);
            approvalLines.add(approvalLine);
        }
        
        return approvalLines;
    }
    
    /**
     * 조건부 교차 결재선 생성
     */
    @Transactional
    public ApprovalLine createConditionalCrossBranchApprovalLine(Document document, String targetBranchId, 
                                                               String condition, String approvalType) {
        log.info("조건부 교차 결재선 생성: documentId={}, targetBranchId={}, condition={}, type={}", 
                document.getId(), targetBranchId, condition, approvalType);
        
        ApprovalLine approvalLine = createCrossBranchApprovalLine(document, targetBranchId, approvalType);
        approvalLine.setIsConditional(true);
        approvalLine.setConditionExpression(condition);
        
        return approvalLineRepository.save(approvalLine);
    }
    
    /**
     * 교차 결재 권한 확인
     */
    public boolean hasCrossBranchApprovalPermission(User user, Document document, String targetBranchId) {
        // 작성자이거나 관리자여야 함
        if (!document.getAuthor().getId().equals(user.getId()) && 
            !hasRole(user, "ADMIN") && 
            !hasRole(user, "SUPER_ADMIN")) {
            return false;
        }
        
        // 대상 지사가 유효한지 확인
        Branch targetBranch = branchRepository.findById(UUID.fromString(targetBranchId)).orElse(null);
        if (targetBranch == null) {
            return false;
        }
        
        // 같은 지사가 아닌지 확인
        if (document.getBranch().getId().equals(targetBranchId)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 교차 결재 상태 조회
     */
    public String getCrossBranchApprovalStatus(String approvalLineId) {
        ApprovalLine approvalLine = approvalLineRepository.findById(UUID.fromString(approvalLineId))
                .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + approvalLineId));
        
        List<ApprovalStep> steps = approvalLine.getApprovalSteps().stream()
                .sorted((s1, s2) -> Integer.compare(s1.getStepOrder(), s2.getStepOrder()))
                .toList();
        
        if (steps.isEmpty()) {
            return "PENDING";
        }
        
        boolean allCompleted = steps.stream().allMatch(step -> step.getStatus() != null && step.getStatus().equals("COMPLETED"));
        boolean anyRejected = steps.stream().anyMatch(step -> step.getStatus() != null && step.getStatus().equals("REJECTED"));
        
        if (anyRejected) {
            return "REJECTED";
        } else if (allCompleted) {
            return "COMPLETED";
        } else {
            return "PENDING";
        }
    }
    
    /**
     * 완료된 결재단계 조회
     */
    public List<ApprovalStep> getCompletedApprovalSteps(String approvalLineId) {
        ApprovalLine approvalLine = approvalLineRepository.findById(UUID.fromString(approvalLineId))
                .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + approvalLineId));
        
        return approvalLine.getApprovalSteps().stream()
                .filter(step -> step.getStatus() != null && step.getStatus().equals("COMPLETED"))
                .sorted((s1, s2) -> Integer.compare(s1.getStepOrder(), s2.getStepOrder()))
                .toList();
    }
    
    /**
     * 대기 중인 결재단계 조회
     */
    public List<ApprovalStep> getPendingApprovalSteps(String approvalLineId) {
        ApprovalLine approvalLine = approvalLineRepository.findById(UUID.fromString(approvalLineId))
                .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + approvalLineId));
        
        return approvalLine.getApprovalSteps().stream()
                .filter(step -> step.getStatus() == null || step.getStatus().equals("PENDING"))
                .sorted((s1, s2) -> Integer.compare(s1.getStepOrder(), s2.getStepOrder()))
                .toList();
    }
    
    /**
     * 교차 결재 알림 전송
     */
    @Transactional
    public boolean sendCrossBranchApprovalNotification(String approvalLineId) {
        try {
            ApprovalLine approvalLine = approvalLineRepository.findById(UUID.fromString(approvalLineId))
                    .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + approvalLineId));
            
            List<ApprovalStep> pendingSteps = getPendingApprovalSteps(approvalLineId);
            
            for (ApprovalStep step : pendingSteps) {
                notificationService.sendNotification(
                    step.getApprover().getId().toString(),
                    "교차 결재 요청",
                    "새로운 교차 결재 요청이 있습니다.",
                    "APPROVAL_REQUEST"
                );
            }
            
            return true;
        } catch (Exception e) {
            log.error("교차 결재 알림 전송 실패", e);
            return false;
        }
    }
    
    /**
     * 교차 결재 위임
     */
    @Transactional
    public boolean delegateCrossBranchApproval(String approvalStepId, String delegatedToUserId) {
        try {
            ApprovalStep approvalStep = approvalStepRepository.findById(UUID.fromString(approvalStepId))
                    .orElseThrow(() -> new IllegalArgumentException("결재단계를 찾을 수 없습니다: " + approvalStepId));
            
            User delegatedToUser = userRepository.findById(UUID.fromString(delegatedToUserId))
                    .orElseThrow(() -> new IllegalArgumentException("위임받을 사용자를 찾을 수 없습니다: " + delegatedToUserId));
            
            approvalStep.setAlternateApprover(delegatedToUser);
            approvalStepRepository.save(approvalStep);
            
            // 위임 알림 전송
            notificationService.sendNotification(
                delegatedToUserId,
                "결재 위임",
                "결재가 위임되었습니다.",
                "APPROVAL_DELEGATION"
            );
            
            return true;
        } catch (Exception e) {
            log.error("교차 결재 위임 실패", e);
            return false;
        }
    }
    
    /**
     * 교차 결재 회수
     */
    @Transactional
    public boolean recallCrossBranchApproval(String approvalLineId, String userId) {
        try {
            ApprovalLine approvalLine = approvalLineRepository.findById(UUID.fromString(approvalLineId))
                    .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + approvalLineId));
            
            // 권한 확인
            if (!approvalLine.getCreatedBy().getId().equals(userId) && 
                !hasRole(userRepository.findById(UUID.fromString(userId)).orElse(null), "ADMIN")) {
                return false;
            }
            
            // 모든 결재단계를 취소 상태로 변경
            for (ApprovalStep step : approvalLine.getApprovalSteps()) {
                step.setStatus("RETURNED");
                approvalStepRepository.save(step);
            }
            
            return true;
        } catch (Exception e) {
            log.error("교차 결재 회수 실패", e);
            return false;
        }
    }
    
    /**
     * 교차 결재 통계 조회
     */
    public long getCrossBranchApprovalCount() {
        // TODO: 교차 결재 통계 구현 필요
        return 0L;
    }
    
    /**
     * 교차 결재 타입별 통계
     */
    public long getCrossBranchApprovalCountByType(String approvalType) {
        // TODO: 교차 결재 타입별 통계 구현 필요
        return 0L;
    }
    
    /**
     * 지사별 교차 결재 통계
     */
    public long getCrossBranchApprovalCountByBranch(String branchId) {
        // TODO: 지사별 교차 결재 통계 구현 필요
        return 0L;
    }
    
    /**
     * 교차 결재단계 생성
     */
    private List<ApprovalStep> createCrossBranchApprovalSteps(ApprovalLine approvalLine, Document document, 
                                                            Branch targetBranch, String approvalType) {
        List<ApprovalStep> steps = new ArrayList<>();
        
        switch (approvalType) {
            case "HQ_TO_BRANCH" -> {
                // 본원에서 지사로: 지사 매니저 -> 지사 이사
                User targetManager = findUserByRoleAndBranch("MANAGER", targetBranch);
                User targetDirector = findUserByRoleAndBranch("DIRECTOR", targetBranch);
                
                if (targetManager != null) {
                    steps.add(createApprovalStep(approvalLine, 1, targetManager, true, true, 1));
                }
                if (targetDirector != null) {
                    steps.add(createApprovalStep(approvalLine, 2, targetDirector, true, true, 1));
                }
            }
            case "BRANCH_TO_HQ" -> {
                // 지사에서 본원으로: 본원 매니저 -> 본원 이사
                User hqManager = findUserByRoleAndBranch("MANAGER", document.getBranch());
                User hqDirector = findUserByRoleAndBranch("DIRECTOR", document.getBranch());
                
                if (hqManager != null) {
                    steps.add(createApprovalStep(approvalLine, 1, hqManager, true, true, 1));
                }
                if (hqDirector != null) {
                    steps.add(createApprovalStep(approvalLine, 2, hqDirector, true, true, 1));
                }
            }
            case "BRANCH_TO_BRANCH" -> {
                // 지사 간: 본원 경유 -> 대상 지사
                User hqManager = findUserByRoleAndBranch("MANAGER", document.getBranch());
                User targetManager = findUserByRoleAndBranch("MANAGER", targetBranch);
                User targetDirector = findUserByRoleAndBranch("DIRECTOR", targetBranch);
                
                if (hqManager != null) {
                    steps.add(createApprovalStep(approvalLine, 1, hqManager, true, true, 1));
                }
                if (targetManager != null) {
                    steps.add(createApprovalStep(approvalLine, 2, targetManager, true, true, 1));
                }
                if (targetDirector != null) {
                    steps.add(createApprovalStep(approvalLine, 3, targetDirector, true, true, 1));
                }
            }
            case "PARALLEL_CROSS_BRANCH" -> {
                // 병렬 교차 결재: 각 지사별로 병렬 처리
                User targetManager = findUserByRoleAndBranch("MANAGER", targetBranch);
                User targetDirector = findUserByRoleAndBranch("DIRECTOR", targetBranch);
                
                if (targetManager != null) {
                    steps.add(createApprovalStep(approvalLine, 1, targetManager, false, true, 1));
                }
                if (targetDirector != null) {
                    steps.add(createApprovalStep(approvalLine, 1, targetDirector, false, true, 1));
                }
            }
            case "CONDITIONAL_CROSS_BRANCH" -> {
                // 조건부 교차 결재: 조건부 + 일반 결재
                User targetManager = findUserByRoleAndBranch("MANAGER", targetBranch);
                User targetDirector = findUserByRoleAndBranch("DIRECTOR", targetBranch);
                
                if (targetManager != null) {
                    ApprovalStep step = createApprovalStep(approvalLine, 1, targetManager, true, true, 1);
                    step.setIsConditional(true);
                    steps.add(step);
                }
                if (targetDirector != null) {
                    steps.add(createApprovalStep(approvalLine, 2, targetDirector, true, true, 1));
                }
            }
        }
        
        return steps;
    }
    
    /**
     * 역할별 사용자 찾기
     */
    private User findUserByRoleAndBranch(String roleName, Branch branch) {
        Optional<Role> role = roleRepository.findByName(roleName);
        if (role.isEmpty()) {
            return null;
        }
        
        return userRepository.findByRoleAndBranch(role.get(), branch)
                .stream()
                .findFirst()
                .orElse(null);
    }
    
    /**
     * 결재단계 생성
     */
    private ApprovalStep createApprovalStep(ApprovalLine approvalLine, int stepOrder, User approver, 
                                          boolean isRequired, boolean isDelegatable, int maxDelegationLevel) {
        return ApprovalStep.builder()
                .approvalLine(approvalLine)
                .stepOrder(stepOrder)
                .approver(approver)
                .approverType(ApprovalStep.ApproverType.PERSON)
                .isRequired(isRequired)
                .isDelegatable(isDelegatable)
                .maxDelegationLevel(maxDelegationLevel)
                .build();
    }
    
    /**
     * 사용자 역할 확인
     */
    private boolean hasRole(User user, String roleName) {
        if (user == null) {
            return false;
        }
        
        return user.getUserRoles().stream()
                .anyMatch(userRole -> userRole.getRole().getName().equals(roleName));
    }
}
