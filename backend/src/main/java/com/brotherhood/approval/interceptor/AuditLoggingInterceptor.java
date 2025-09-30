package com.brotherhood.approval.interceptor;

import com.brotherhood.approval.entity.AuditLog;
import com.brotherhood.approval.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.UUID;

/**
 * 감사 로깅 인터셉터
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuditLoggingInterceptor implements HandlerInterceptor {
    
    private final AuditLogService auditLogService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 요청 시작 시간 기록
        request.setAttribute("startTime", System.currentTimeMillis());
        
        // 요청 정보 로깅
        logRequestInfo(request);
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        try {
            // 응답 시간 계산
            Long startTime = (Long) request.getAttribute("startTime");
            long duration = startTime != null ? System.currentTimeMillis() - startTime : 0;
            
            // 감사 로그 생성
            String action = determineAction(request);
            Map<String, Object> details = Map.of(
                "method", request.getMethod(),
                "uri", request.getRequestURI(),
                "status", response.getStatus(),
                "duration", duration,
                "userAgent", request.getHeader("User-Agent"),
                "ipAddress", getClientIpAddress(request)
            );
            
            if (ex != null) {
                details = Map.of(
                    "method", request.getMethod(),
                    "uri", request.getRequestURI(),
                    "status", response.getStatus(),
                    "duration", duration,
                    "userAgent", request.getHeader("User-Agent"),
                    "ipAddress", getClientIpAddress(request),
                    "errorMessage", ex.getMessage()
                );
            }
            
            logAuditEvent(request, action, details);
            
        } catch (Exception e) {
            log.error("감사 로깅 중 오류 발생", e);
        }
    }
    
    /**
     * 요청 정보 로깅
     */
    private void logRequestInfo(HttpServletRequest request) {
        log.debug("요청 시작: {} {} from {}", 
            request.getMethod(), 
            request.getRequestURI(), 
            getClientIpAddress(request));
    }
    
    /**
     * 액션 결정
     */
    private String determineAction(HttpServletRequest request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        
        if (uri.contains("/api/auth/login")) {
            return "LOGIN";
        } else if (uri.contains("/api/auth/logout")) {
            return "LOGOUT";
        } else if (uri.contains("/api/documents")) {
            return switch (method) {
                case "GET" -> "DOCUMENT_READ";
                case "POST" -> "DOCUMENT_CREATE";
                case "PUT" -> "DOCUMENT_UPDATE";
                case "DELETE" -> "DOCUMENT_DELETE";
                default -> "DOCUMENT_ACTION";
            };
        } else if (uri.contains("/api/users")) {
            return switch (method) {
                case "GET" -> "USER_READ";
                case "POST" -> "USER_CREATE";
                case "PUT" -> "USER_UPDATE";
                case "DELETE" -> "USER_DELETE";
                default -> "USER_ACTION";
            };
        } else if (uri.contains("/api/approvals")) {
            return switch (method) {
                case "GET" -> "APPROVAL_READ";
                case "POST" -> "APPROVAL_CREATE";
                case "PUT" -> "APPROVAL_UPDATE";
                case "DELETE" -> "APPROVAL_DELETE";
                default -> "APPROVAL_ACTION";
            };
        }
        
        return "UNKNOWN_ACTION";
    }
    
    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * 현재 사용자 ID 추출
     */
    private String getCurrentUserId(HttpServletRequest request) {
        // TODO: JWT 토큰에서 사용자 ID 추출 로직 구현
        return null;
    }
    
    /**
     * 리소스 타입 결정
     */
    private String determineResourceType(HttpServletRequest request) {
        String uri = request.getRequestURI();
        
        if (uri.contains("/api/auth")) {
            return "AUTH";
        } else if (uri.contains("/api/documents")) {
            return "DOCUMENT";
        } else if (uri.contains("/api/users")) {
            return "USER";
        } else if (uri.contains("/api/approvals")) {
            return "APPROVAL";
        }
        
        return "UNKNOWN";
    }
    
    /**
     * 리소스 ID 추출
     */
    private String extractResourceId(HttpServletRequest request) {
        String uri = request.getRequestURI();
        
        // URI에서 ID 추출 (예: /api/documents/123 -> 123)
        String[] pathSegments = uri.split("/");
        if (pathSegments.length > 0) {
            String lastSegment = pathSegments[pathSegments.length - 1];
            if (lastSegment.matches("\\d+") || lastSegment.matches("[0-9a-fA-F-]{36}")) {
                return lastSegment;
            }
        }
        
        return null;
    }
    
    /**
     * 감사 이벤트 로깅
     */
    private void logAuditEvent(HttpServletRequest request, String action, Map<String, Object> details) {
        try {
            String userId = getCurrentUserId(request);
            String resourceType = determineResourceType(request);
            String resourceIdStr = extractResourceId(request);
            UUID resourceId = null;
            try {
                resourceId = UUID.fromString(resourceIdStr);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid UUID format for resourceId: {}", resourceIdStr);
            }
            
            AuditLog auditLog = AuditLog.builder()
                    .user(null) // TODO: User 조회 로직 추가 필요
                    .action(action)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .ipAddress(getClientIpAddress(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .sessionId(request.getSession().getId())
                    .isSuccessful(true) // 기본적으로 성공으로 설정
                    .errorMessage(details != null ? (String) details.get("errorMessage") : null)
                    .oldValues(null) // 필요시 이전 값 설정
                    .newValues(details != null ? convertToJsonString(details) : null)
                    .build();
            
            auditLogService.saveAuditLog(auditLog);
            
        } catch (Exception e) {
            log.error("감사 로그 저장 중 오류 발생", e);
        }
    }
    
    /**
     * 객체를 JSON 문자열로 변환
     */
    private String convertToJsonString(Object obj) {
        try {
            // TODO: Jackson ObjectMapper 사용하여 JSON 변환
            return obj.toString();
        } catch (Exception e) {
            log.warn("JSON 변환 실패", e);
            return obj.toString();
        }
    }
}