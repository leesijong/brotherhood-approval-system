package com.brotherhood.approval.service;

import com.brotherhood.approval.entity.Document;
// Removed static import - using String constants
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.entity.Role;
import com.brotherhood.approval.entity.Branch;
import com.brotherhood.approval.repository.UserRepository;
import com.brotherhood.approval.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

/**
 * 접근 제어 서비스 (RBAC + ABAC)
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AccessControlService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogService auditLogService;
    
    /**
     * 사용자의 문서 접근 권한 확인
     */
    public boolean hasAccess(User user, Document document, String action) {
        return hasAccess(user, document, action, null);
    }
    
    /**
     * 사용자의 문서 접근 권한 확인 (IP 포함)
     */
    public boolean hasAccess(User user, Document document, String action, String clientIp) {
        if (user == null) {
            throw new IllegalArgumentException("사용자 정보가 필요합니다");
        }
        
        if (document == null) {
            throw new IllegalArgumentException("문서 정보가 필요합니다");
        }
        
        log.debug("접근 권한 확인: user={}, document={}, action={}, ip={}", 
                user.getName(), document.getId(), action, clientIp);
        
        // 1. RBAC (역할 기반 접근 제어) 확인
        if (!checkRoleBasedAccess(user, document, action)) {
            logAccess(user, document, action, clientIp, false, "역할 기반 접근 거부");
            return false;
        }
        
        // 2. ABAC (속성 기반 접근 제어) 확인
        if (!checkAttributeBasedAccess(user, document, action, clientIp)) {
            logAccess(user, document, action, clientIp, false, "속성 기반 접근 거부");
            return false;
        }
        
        // 3. 접근 허용
        logAccess(user, document, action, clientIp, true, "접근 허용");
        return true;
    }
    
    /**
     * 역할 기반 접근 제어 확인
     */
    private boolean checkRoleBasedAccess(User user, Document document, String action) {
        // 관리자는 모든 권한
        if (hasRole(user, "ADMIN") || hasRole(user, "SUPER_ADMIN")) {
            return true;
        }
        
        // 작성자는 자신의 문서에 대한 기본 권한
        if (document.getAuthor().getId().equals(user.getId())) {
            return checkAuthorPermissions(document, action);
        }
        
        // 결재자는 결재 권한
        if (action.equals("APPROVE") || action.equals("REJECT")) {
            return hasApprovalPermission(user, document);
        }
        
        // 읽기 권한은 지사별로 제한
        if (action.equals("READ")) {
            return checkReadPermission(user, document);
        }
        
        return false;
    }
    
    /**
     * 속성 기반 접근 제어 확인
     */
    private boolean checkAttributeBasedAccess(User user, Document document, String action, String clientIp) {
        // 1. 지사별 접근 제어
        if (!checkBranchAccess(user, document)) {
            return false;
        }
        
        // 2. 보안 등급별 접근 제어
        if (!checkSecurityLevelAccess(user, document)) {
            return false;
        }
        
        // 3. 문서 상태별 접근 제어
        if (!checkDocumentStatusAccess(user, document, action)) {
            return false;
        }
        
        // 4. 시간 기반 접근 제어
        if (!checkTimeBasedAccess()) {
            return false;
        }
        
        // 5. IP 기반 접근 제어
        if (clientIp != null && !checkIpBasedAccess(clientIp)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 작성자 권한 확인
     */
    private boolean checkAuthorPermissions(Document document, String action) {
        switch (action) {
            case "READ", "UPDATE", "DELETE" -> {
                // 초안 상태에서는 모든 권한
                return document.getStatus() == "DRAFT" ||
                       document.getStatus() == "REJECTED";
            }
            case "SUBMIT" -> {
                // 상신 권한
                return document.getStatus() == "DRAFT" ||
                       document.getStatus() == "REJECTED";
            }
            case "RECALL" -> {
                // 회수 권한 (상신된 문서만)
                return document.getStatus() == "PENDING";
            }
            default -> {
                return false;
            }
        }
    }
    
    /**
     * 결재 권한 확인
     */
    private boolean hasApprovalPermission(User user, Document document) {
        // 매니저 이상의 역할이 필요
        return hasRole(user, "MANAGER") || 
               hasRole(user, "DIRECTOR") || 
               hasRole(user, "ADMIN") || 
               hasRole(user, "SUPER_ADMIN");
    }
    
    /**
     * 읽기 권한 확인
     */
    private boolean checkReadPermission(User user, Document document) {
        // 같은 지사이거나 관리자
        return user.getBranch().getId().equals(document.getBranch().getId()) ||
               hasRole(user, "ADMIN") ||
               hasRole(user, "SUPER_ADMIN");
    }
    
    /**
     * 지사별 접근 제어
     */
    private boolean checkBranchAccess(User user, Document document) {
        // 같은 지사이거나 관리자
        return user.getBranch().getId().equals(document.getBranch().getId()) ||
               hasRole(user, "ADMIN") ||
               hasRole(user, "SUPER_ADMIN");
    }
    
    /**
     * 보안 등급별 접근 제어
     */
    private boolean checkSecurityLevelAccess(User user, Document document) {
        switch (document.getSecurityLevel()) {
            case "CONFIDENTIAL" -> {
                // 기밀 문서: 매니저 이상만 접근 가능
                return hasRole(user, "MANAGER") || 
                       hasRole(user, "DIRECTOR") || 
                       hasRole(user, "ADMIN") || 
                       hasRole(user, "SUPER_ADMIN");
            }
            case "GENERAL" -> {
                // 일반 문서: 모든 사용자 접근 가능
                return true;
            }
            default -> {
                return false;
            }
        }
    }
    
    /**
     * 문서 상태별 접근 제어
     */
    private boolean checkDocumentStatusAccess(User user, Document document, String action) {
        switch (document.getStatus()) {
            case "DRAFT" -> {
                // 초안: 작성자만 접근 가능
                return document.getAuthor().getId().equals(user.getId()) ||
                       hasRole(user, "ADMIN") ||
                       hasRole(user, "SUPER_ADMIN");
            }
            case "PENDING" -> {
                // 상신: 작성자, 결재자, 관리자 접근 가능
                return document.getAuthor().getId().equals(user.getId()) ||
                       hasApprovalPermission(user, document) ||
                       hasRole(user, "ADMIN") ||
                       hasRole(user, "SUPER_ADMIN");
            }
            case "APPROVED" -> {
                // 승인: 모든 사용자 읽기 가능
                return action.equals("READ") || hasRole(user, "ADMIN") || hasRole(user, "SUPER_ADMIN");
            }
            case "REJECTED" -> {
                // 반려: 작성자, 관리자만 접근 가능
                return document.getAuthor().getId().equals(user.getId()) ||
                       hasRole(user, "ADMIN") ||
                       hasRole(user, "SUPER_ADMIN");
            }
            default -> {
                return false;
            }
        }
    }
    
    /**
     * 시간 기반 접근 제어
     */
    private boolean checkTimeBasedAccess() {
        LocalTime currentTime = LocalTime.now();
        LocalTime businessStart = LocalTime.of(9, 0);
        LocalTime businessEnd = LocalTime.of(18, 0);
        
        // 평일 업무시간 내에만 접근 허용
        return currentTime.isAfter(businessStart) && currentTime.isBefore(businessEnd);
    }
    
    /**
     * IP 기반 접근 제어
     */
    private boolean checkIpBasedAccess(String clientIp) {
        // 허용된 IP 대역 확인
        List<String> allowedIpRanges = List.of(
            "192.168.1.0/24",
            "10.0.0.0/8",
            "172.16.0.0/12"
        );
        
        // 간단한 IP 체크 (실제로는 더 정교한 구현 필요)
        return allowedIpRanges.stream()
                .anyMatch(range -> clientIp.startsWith(range.split("/")[0].substring(0, 8)));
    }
    
    /**
     * 사용자 역할 확인
     */
    private boolean hasRole(User user, String roleName) {
        return user.getUserRoles().stream()
                .anyMatch(userRole -> userRole.getRole().getName().equals(roleName));
    }
    
    /**
     * 접근 로그 기록
     */
    private void logAccess(User user, Document document, String action, String clientIp, 
                          boolean success, String reason) {
        try {
            auditLogService.logAccess(
                user.getId().toString(),
                "DOCUMENT",
                document.getId().toString(),
                action,
                success,
                reason,
                clientIp
            );
        } catch (Exception e) {
            log.error("접근 로그 기록 중 오류 발생", e);
        }
    }
}
