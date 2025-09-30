package com.brotherhood.approval.service;

import com.brotherhood.approval.entity.ApprovalStep;
import com.brotherhood.approval.entity.Document;
// Removed static import - using String constants
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.entity.Branch;
import com.brotherhood.approval.entity.Role;
import com.brotherhood.approval.repository.UserRepository;
import com.brotherhood.approval.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 결재선 정책 서비스
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalPolicyService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    
    /**
     * 결재선 정책에 따라 결재단계 생성
     */
    public List<ApprovalStep> createApprovalSteps(Document document, String policyType, String condition) {
        log.info("결재선 정책 생성 시작: documentId={}, policyType={}, condition={}", 
                document.getId(), policyType, condition);
        
        return switch (policyType) {
            case "SEQUENTIAL" -> createSequentialApprovalSteps(document);
            case "PARALLEL" -> createParallelApprovalSteps(document);
            case "CONDITIONAL" -> createConditionalApprovalSteps(document, condition);
            case "BRANCH_SPECIFIC" -> createBranchSpecificApprovalSteps(document);
            case "DOCUMENT_TYPE_SPECIFIC" -> createDocumentTypeSpecificApprovalSteps(document);
            case "SECURITY_LEVEL_SPECIFIC" -> createSecurityLevelSpecificApprovalSteps(document);
            case "DELEGATABLE" -> createDelegatableApprovalSteps(document);
            case "ALTERNATE_APPROVER" -> createAlternateApproverApprovalSteps(document);
            case "COMPLEX" -> createComplexApprovalSteps(document, condition);
            default -> throw new IllegalArgumentException("지원하지 않는 정책 타입입니다: " + policyType);
        };
    }
    
    /**
     * 순차 결재선 생성
     */
    private List<ApprovalStep> createSequentialApprovalSteps(Document document) {
        List<ApprovalStep> steps = new ArrayList<>();
        
        // 1단계: 매니저
        User manager = findUserByRole("MANAGER", document.getBranch());
        if (manager != null) {
            steps.add(createApprovalStep(1, manager, true, true, 1));
        }
        
        // 2단계: 이사
        User director = findUserByRole("DIRECTOR", document.getBranch());
        if (director != null) {
            steps.add(createApprovalStep(2, director, true, true, 1));
        }
        
        return steps;
    }
    
    /**
     * 병렬 결재선 생성
     */
    private List<ApprovalStep> createParallelApprovalSteps(Document document) {
        List<ApprovalStep> steps = new ArrayList<>();
        
        // 병렬 결재자들 (같은 순서)
        User manager = findUserByRole("MANAGER", document.getBranch());
        User director = findUserByRole("DIRECTOR", document.getBranch());
        
        if (manager != null) {
            steps.add(createApprovalStep(1, manager, false, true, 1));
        }
        if (director != null) {
            steps.add(createApprovalStep(1, director, false, true, 1));
        }
        
        return steps;
    }
    
    /**
     * 조건부 결재선 생성
     */
    private List<ApprovalStep> createConditionalApprovalSteps(Document document, String condition) {
        if (condition == null || condition.trim().isEmpty()) {
            throw new IllegalArgumentException("조건부 정책에는 조건이 필요합니다");
        }
        
        // 조건 검증 (간단한 예시)
        if (!isValidCondition(condition)) {
            throw new IllegalArgumentException("잘못된 조건식입니다: " + condition);
        }
        
        List<ApprovalStep> steps = new ArrayList<>();
        
        // 조건부 1단계
        User manager = findUserByRole("MANAGER", document.getBranch());
        if (manager != null) {
            ApprovalStep step = createApprovalStep(1, manager, true, true, 1);
            step.setIsConditional(true);
            step.setConditionExpression(condition);
            steps.add(step);
        }
        
        // 일반 2단계
        User director = findUserByRole("DIRECTOR", document.getBranch());
        if (director != null) {
            steps.add(createApprovalStep(2, director, true, true, 1));
        }
        
        // 일반 3단계
        User admin = findUserByRole("ADMIN", document.getBranch());
        if (admin != null) {
            steps.add(createApprovalStep(3, admin, true, true, 1));
        }
        
        return steps;
    }
    
    /**
     * 지사별 결재선 생성
     */
    private List<ApprovalStep> createBranchSpecificApprovalSteps(Document document) {
        List<ApprovalStep> steps = new ArrayList<>();
        Branch branch = document.getBranch();
        
        if ("HQ".equals(branch.getCode())) {
            // 본원: 3단계 결재
            User manager = findUserByRole("MANAGER", branch);
            User director = findUserByRole("DIRECTOR", branch);
            User admin = findUserByRole("ADMIN", branch);
            
            if (manager != null) steps.add(createApprovalStep(1, manager, true, true, 1));
            if (director != null) steps.add(createApprovalStep(2, director, true, true, 1));
            if (admin != null) steps.add(createApprovalStep(3, admin, true, true, 1));
        } else {
            // 지사: 2단계 결재
            User manager = findUserByRole("MANAGER", branch);
            User director = findUserByRole("DIRECTOR", branch);
            
            if (manager != null) steps.add(createApprovalStep(1, manager, true, true, 1));
            if (director != null) steps.add(createApprovalStep(2, director, true, true, 1));
        }
        
        return steps;
    }
    
    /**
     * 문서 타입별 결재선 생성
     */
    private List<ApprovalStep> createDocumentTypeSpecificApprovalSteps(Document document) {
        List<ApprovalStep> steps = new ArrayList<>();
        
        switch (document.getDocumentType()) {
            case "BUDGET" -> {
                // 예산 문서: 3단계 결재
                User manager = findUserByRole("MANAGER", document.getBranch());
                User director = findUserByRole("DIRECTOR", document.getBranch());
                User admin = findUserByRole("ADMIN", document.getBranch());
                
                if (manager != null) steps.add(createApprovalStep(1, manager, true, true, 1));
                if (director != null) steps.add(createApprovalStep(2, director, true, true, 1));
                if (admin != null) steps.add(createApprovalStep(3, admin, true, true, 1));
            }
            case "HR" -> {
                // 인사 문서: 2단계 결재
                User manager = findUserByRole("MANAGER", document.getBranch());
                User director = findUserByRole("DIRECTOR", document.getBranch());
                
                if (manager != null) steps.add(createApprovalStep(1, manager, true, true, 1));
                if (director != null) steps.add(createApprovalStep(2, director, true, true, 1));
            }
            default -> {
                // 일반 문서: 2단계 결재
                User manager = findUserByRole("MANAGER", document.getBranch());
                User director = findUserByRole("DIRECTOR", document.getBranch());
                
                if (manager != null) steps.add(createApprovalStep(1, manager, true, true, 1));
                if (director != null) steps.add(createApprovalStep(2, director, true, true, 1));
            }
        }
        
        return steps;
    }
    
    /**
     * 보안 등급별 결재선 생성
     */
    private List<ApprovalStep> createSecurityLevelSpecificApprovalSteps(Document document) {
        List<ApprovalStep> steps = new ArrayList<>();
        
        switch (document.getSecurityLevel()) {
            case "CONFIDENTIAL" -> {
                // 기밀 문서: 4단계 결재
                User manager = findUserByRole("MANAGER", document.getBranch());
                User director = findUserByRole("DIRECTOR", document.getBranch());
                User admin = findUserByRole("ADMIN", document.getBranch());
                User superAdmin = findUserByRole("SUPER_ADMIN", document.getBranch());
                
                if (manager != null) steps.add(createApprovalStep(1, manager, true, true, 1));
                if (director != null) steps.add(createApprovalStep(2, director, true, true, 1));
                if (admin != null) steps.add(createApprovalStep(3, admin, true, true, 1));
                if (superAdmin != null) steps.add(createApprovalStep(4, superAdmin, true, true, 1));
            }
            case "GENERAL" -> {
                // 내부 문서: 3단계 결재
                User manager = findUserByRole("MANAGER", document.getBranch());
                User director = findUserByRole("DIRECTOR", document.getBranch());
                User admin = findUserByRole("ADMIN", document.getBranch());
                
                if (manager != null) steps.add(createApprovalStep(1, manager, true, true, 1));
                if (director != null) steps.add(createApprovalStep(2, director, true, true, 1));
                if (admin != null) steps.add(createApprovalStep(3, admin, true, true, 1));
            }
            default -> {
                // 일반 문서: 2단계 결재
                User manager = findUserByRole("MANAGER", document.getBranch());
                User director = findUserByRole("DIRECTOR", document.getBranch());
                
                if (manager != null) steps.add(createApprovalStep(1, manager, true, true, 1));
                if (director != null) steps.add(createApprovalStep(2, director, true, true, 1));
            }
        }
        
        return steps;
    }
    
    /**
     * 위임 가능한 결재선 생성
     */
    private List<ApprovalStep> createDelegatableApprovalSteps(Document document) {
        List<ApprovalStep> steps = new ArrayList<>();
        
        User manager = findUserByRole("MANAGER", document.getBranch());
        User director = findUserByRole("DIRECTOR", document.getBranch());
        
        if (manager != null) {
            ApprovalStep step = createApprovalStep(1, manager, true, true, 2);
            step.setIsDelegatable(true);
            step.setMaxDelegationLevel(2);
            steps.add(step);
        }
        
        if (director != null) {
            ApprovalStep step = createApprovalStep(2, director, true, true, 2);
            step.setIsDelegatable(true);
            step.setMaxDelegationLevel(2);
            steps.add(step);
        }
        
        return steps;
    }
    
    /**
     * 대결자 설정 결재선 생성
     */
    private List<ApprovalStep> createAlternateApproverApprovalSteps(Document document) {
        List<ApprovalStep> steps = new ArrayList<>();
        
        User manager = findUserByRole("MANAGER", document.getBranch());
        User director = findUserByRole("DIRECTOR", document.getBranch());
        User alternateManager = findUserByRole("MANAGER", document.getBranch()); // 대결자
        
        if (manager != null) {
            ApprovalStep step = createApprovalStep(1, manager, true, true, 1);
            step.setAlternateApprover(alternateManager);
            steps.add(step);
        }
        
        if (director != null) {
            ApprovalStep step = createApprovalStep(2, director, true, true, 1);
            step.setAlternateApprover(manager); // 이사의 대결자는 매니저
            steps.add(step);
        }
        
        return steps;
    }
    
    /**
     * 복합 정책 결재선 생성
     */
    private List<ApprovalStep> createComplexApprovalSteps(Document document, String condition) {
        List<ApprovalStep> steps = new ArrayList<>();
        
        // 조건부 1단계
        User manager = findUserByRole("MANAGER", document.getBranch());
        if (manager != null) {
            ApprovalStep step = createApprovalStep(1, manager, true, true, 1);
            step.setIsConditional(true);
            step.setConditionExpression(condition);
            steps.add(step);
        }
        
        // 일반 2단계
        User director = findUserByRole("DIRECTOR", document.getBranch());
        if (director != null) {
            steps.add(createApprovalStep(2, director, true, true, 1));
        }
        
        // 일반 3단계
        User admin = findUserByRole("ADMIN", document.getBranch());
        if (admin != null) {
            steps.add(createApprovalStep(3, admin, true, true, 1));
        }
        
        // 일반 4단계
        User superAdmin = findUserByRole("SUPER_ADMIN", document.getBranch());
        if (superAdmin != null) {
            steps.add(createApprovalStep(4, superAdmin, true, true, 1));
        }
        
        return steps;
    }
    
    /**
     * 역할별 사용자 찾기
     */
    private User findUserByRole(String roleName, Branch branch) {
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
    private ApprovalStep createApprovalStep(int stepOrder, User approver, boolean isRequired, 
                                          boolean isDelegatable, int maxDelegationLevel) {
        return ApprovalStep.builder()
                .stepOrder(stepOrder)
                .approver(approver)
                .approverType(ApprovalStep.ApproverType.PERSON)
                .isRequired(isRequired)
                .isDelegatable(isDelegatable)
                .maxDelegationLevel(maxDelegationLevel)
                .build();
    }
    
    /**
     * 조건식 검증
     */
    private boolean isValidCondition(String condition) {
        // 간단한 조건식 검증 (실제로는 더 복잡한 파싱이 필요)
        return condition.matches(".*[a-zA-Z_][a-zA-Z0-9_]*\\s*[><=!]+\\s*\\d+.*");
    }
}
