package com.brotherhood.approval.service;

import com.brotherhood.approval.dto.audit.AuditLogDto;
import com.brotherhood.approval.entity.AuditLog;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.mapper.AuditLogMapper;
import com.brotherhood.approval.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 감사 로그 서비스
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {
    
    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;
    
    /**
     * 감사 로그 생성
     */
    @Transactional
    public AuditLogDto createAuditLog(String action, String resourceType, String resourceId, 
                                    String oldValues, String newValues, User user, 
                                    String ipAddress, String userAgent) {
        log.debug("감사 로그 생성: {} - {} - {}", action, resourceType, resourceId);
        
        UUID resourceIdUuid = null;
        try {
            resourceIdUuid = UUID.fromString(resourceId);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format for resourceId: {}", resourceId);
        }
        
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceIdUuid)
                .oldValues(oldValues)
                .newValues(newValues)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        
        AuditLog savedAuditLog = auditLogRepository.save(auditLog);
        return auditLogMapper.toDto(savedAuditLog);
    }
    
    /**
     * 감사 로그 저장
     */
    @Transactional
    public void saveAuditLog(AuditLog auditLog) {
        auditLogRepository.save(auditLog);
    }
    
    /**
     * 감사 로그 조회 (ID로)
     */
    public Optional<AuditLogDto> getAuditLogById(String id) {
        try {
            UUID uuid = UUID.fromString(id);
            return auditLogRepository.findById(uuid)
                    .map(auditLogMapper::toDto);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format for id: {}", id);
            return Optional.empty();
        }
    }
    
    /**
     * 감사 로그 조회 (페이징)
     */
    public Page<AuditLogDto> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable)
                .map(auditLogMapper::toDto);
    }
    
    /**
     * 사용자별 감사 로그 조회 (페이징)
     */
    public Page<AuditLogDto> getAuditLogsByUser(String userId, Pageable pageable) {
        return auditLogRepository.findByUserIdOrderByActionAtDesc(userId, pageable)
                .map(auditLogMapper::toDto);
    }
    
    /**
     * 리소스별 감사 로그 조회 (페이징)
     */
    public Page<AuditLogDto> getAuditLogsByResource(String resourceType, String resourceId, Pageable pageable) {
        try {
            UUID resourceIdUuid = UUID.fromString(resourceId);
            return auditLogRepository.findByResourceTypeAndResourceIdOrderByActionAtDesc(resourceType, resourceIdUuid, pageable)
                    .map(auditLogMapper::toDto);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format for resourceId: {}", resourceId);
            return Page.empty();
        }
    }
    
    /**
     * 액션별 감사 로그 조회 (페이징)
     */
    public Page<AuditLogDto> getAuditLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByActionOrderByActionAtDesc(action, pageable)
                .map(auditLogMapper::toDto);
    }
    
    /**
     * 기간별 감사 로그 조회 (페이징)
     */
    public Page<AuditLogDto> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findByActionAtBetweenOrderByActionAtDesc(startDate, endDate, pageable)
                .map(auditLogMapper::toDto);
    }
    
    /**
     * 감사 로그 생성 (간단한 버전)
     */
    @Transactional
    public AuditLog createSimpleAuditLog(String action, String resourceType, String resourceId, String ipAddress) {
        if (action == null || action.trim().isEmpty()) {
            throw new IllegalArgumentException("액션이 필요합니다");
        }
        if (resourceType == null || resourceType.trim().isEmpty()) {
            throw new IllegalArgumentException("리소스 타입이 필요합니다");
        }
        if (resourceId == null || resourceId.trim().isEmpty()) {
            throw new IllegalArgumentException("리소스 ID가 필요합니다");
        }
        
        UUID resourceIdUuid = null;
        try {
            resourceIdUuid = UUID.fromString(resourceId);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format for resourceId: {}", resourceId);
        }
        
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceIdUuid)
                .ipAddress(ipAddress)
                .build();
        
        return auditLogRepository.save(auditLog);
    }
    
    /**
     * 사용자별 감사 로그 조회 (리스트)
     */
    public List<AuditLog> getAuditLogsByUser(String userId) {
        return auditLogRepository.findByUserIdOrderByActionAtDesc(userId);
    }
    
    /**
     * 리소스별 감사 로그 조회 (리스트)
     */
    public List<AuditLog> getAuditLogsByResource(String resourceType, String resourceId) {
        try {
            UUID resourceIdUuid = UUID.fromString(resourceId);
            return auditLogRepository.findByResourceTypeAndResourceIdOrderByActionAtDesc(resourceType, resourceIdUuid);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format for resourceId: {}", resourceId);
            return List.of();
        }
    }
    
    /**
     * 액션별 감사 로그 조회 (리스트)
     */
    public List<AuditLog> getAuditLogsByAction(String action) {
        return auditLogRepository.findByActionOrderByActionAtDesc(action);
    }
    
    /**
     * 기간별 감사 로그 조회 (리스트)
     */
    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByActionAtBetweenOrderByActionAtDesc(startDate, endDate);
    }
    
    /**
     * 감사 로그 삭제
     */
    @Transactional
    public void deleteAuditLog(String id) {
        try {
            UUID uuid = UUID.fromString(id);
            auditLogRepository.deleteById(uuid);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format for id: {}", id);
        }
    }
    
    /**
     * 사용자별 감사 로그 삭제
     */
    @Transactional
    public void deleteAuditLogsByUser(String userId) {
        auditLogRepository.deleteByUserId(userId);
    }
    
    /**
     * 리소스별 감사 로그 삭제
     */
    @Transactional
    public void deleteAuditLogsByResource(String resourceType, String resourceId) {
        try {
            UUID resourceIdUuid = UUID.fromString(resourceId);
            auditLogRepository.deleteByResourceTypeAndResourceId(resourceType, resourceIdUuid);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format for resourceId: {}", resourceId);
        }
    }
    
    /**
     * 기간별 감사 로그 삭제
     */
    @Transactional
    public void deleteAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        auditLogRepository.deleteByActionAtBetween(startDate, endDate);
    }
    
    /**
     * 감사 로그 통계
     */
    public long getAuditLogCount() {
        return auditLogRepository.count();
    }
    
    /**
     * 사용자별 감사 로그 수
     */
    public long getAuditLogCountByUser(String userId) {
        return auditLogRepository.countByUserId(userId);
    }
    
    /**
     * 리소스별 감사 로그 수
     */
    public long getAuditLogCountByResource(String resourceType, String resourceId) {
        try {
            UUID resourceIdUuid = UUID.fromString(resourceId);
            return auditLogRepository.countByResourceTypeAndResourceId(resourceType, resourceIdUuid);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format for resourceId: {}", resourceId);
            return 0;
        }
    }
    
    /**
     * 액션별 감사 로그 수
     */
    public long getAuditLogCountByAction(String action) {
        return auditLogRepository.countByAction(action);
    }
    
    /**
     * 기간별 감사 로그 수
     */
    public long getAuditLogCountByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.countByActionAtBetween(startDate, endDate);
    }
    
    /**
     * 접근 로그 기록
     */
    @Transactional
    public void logAccess(String userId, String resourceType, String resourceId, 
                         String action, Boolean isSuccessful, String reason, String ipAddress) {
        UUID resourceIdUuid = null;
        try {
            resourceIdUuid = UUID.fromString(resourceId);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format for resourceId: {}", resourceId);
        }
        
        AuditLog auditLog = AuditLog.builder()
                .user(null) // TODO: User 조회 로직 추가 필요
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceIdUuid)
                .ipAddress(ipAddress)
                .actionAt(LocalDateTime.now())
                .isSuccessful(isSuccessful)
                .errorMessage(reason)
                .build();
        
        auditLogRepository.save(auditLog);
    }
}