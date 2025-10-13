package com.brotherhood.approval.service;

import com.brotherhood.approval.dto.approval.ApprovalActionRequest;
import com.brotherhood.approval.dto.approval.ApprovalHistoryDto;
import com.brotherhood.approval.dto.approval.ApprovalLineCreateRequest;
import com.brotherhood.approval.dto.approval.ApprovalLineDto;
import com.brotherhood.approval.dto.approval.ApprovalStepCreateRequest;
import com.brotherhood.approval.dto.approval.ApprovalStepDto;
import com.brotherhood.approval.entity.*;
import com.brotherhood.approval.mapper.ApprovalHistoryMapper;
import com.brotherhood.approval.mapper.ApprovalLineMapper;
import com.brotherhood.approval.mapper.ApprovalStepMapper;
import com.brotherhood.approval.repository.*;
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
 * 결재 서비스
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalService {
    
    private final ApprovalLineRepository approvalLineRepository;
    private final ApprovalStepRepository approvalStepRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final ApprovalLineMapper approvalLineMapper;
    private final ApprovalStepMapper approvalStepMapper;
    private final ApprovalHistoryMapper approvalHistoryMapper;
    
    /**
     * 결재선 생성
     */
    @Transactional
    public ApprovalLineDto createApprovalLine(ApprovalLineCreateRequest request, String createdById) {
        log.info("결재선 생성 요청: {}", request.getName());
        
        User createdBy = userRepository.findById(UUID.fromString(createdById))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + createdById));
        
        Document document = documentRepository.findById(UUID.fromString(request.getDocumentId()))
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + request.getDocumentId()));
        
        ApprovalLine approvalLine = approvalLineMapper.toEntity(request);
        approvalLine.setCreatedBy(createdBy);
        approvalLine.setDocument(document);
        
        ApprovalLine savedApprovalLine = approvalLineRepository.save(approvalLine);
        log.info("결재선 생성 완료: {}", savedApprovalLine.getId());
        
        // 결재단계 생성
        if (request.getApprovalSteps() != null && !request.getApprovalSteps().isEmpty()) {
            log.info("결재단계 생성 시작: {} 개의 단계", request.getApprovalSteps().size());
            for (ApprovalStepCreateRequest stepRequest : request.getApprovalSteps()) {
                stepRequest.setApprovalLineId(savedApprovalLine.getId().toString());
                addApprovalStep(stepRequest, createdById);
            }
            log.info("결재단계 생성 완료");
        }
        
        return approvalLineMapper.toDto(savedApprovalLine);
    }
    
    /**
     * 결재단계 추가
     */
    @Transactional
    public ApprovalStepDto addApprovalStep(ApprovalStepCreateRequest request, String createdById) {
        log.info("결재단계 추가 요청: {}", request.getApprovalLineId());
        
        ApprovalLine approvalLine = approvalLineRepository.findById(UUID.fromString(request.getApprovalLineId()))
                .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + request.getApprovalLineId()));
        
        User approver = userRepository.findById(UUID.fromString(request.getApproverId()))
                .orElseThrow(() -> new IllegalArgumentException("결재자를 찾을 수 없습니다: " + request.getApproverId()));
        
        ApprovalStep approvalStep = approvalStepMapper.toEntity(request);
        approvalStep.setApprovalLine(approvalLine);
        approvalStep.setApprover(approver);
        
        ApprovalStep savedApprovalStep = approvalStepRepository.save(approvalStep);
        
        log.info("결재단계 추가 완료: {}", savedApprovalStep.getId());
        return approvalStepMapper.toDto(savedApprovalStep);
    }
    
    /**
     * 결재선 조회
     */
    public Optional<ApprovalLineDto> getApprovalLineById(String id) {
        return approvalLineRepository.findById(UUID.fromString(id))
                .map(approvalLineMapper::toDto);
    }
    
    /**
     * 문서별 결재선 조회
     */
    public List<ApprovalLineDto> getApprovalLinesByDocument(String documentId) {
        return approvalLineRepository.findByDocumentId(UUID.fromString(documentId))
                .stream()
                .map(approvalLine -> {
                    ApprovalLineDto dto = approvalLineMapper.toDto(approvalLine);
                    // 결재단계 정보 조회
                    List<ApprovalStepDto> approvalSteps = getApprovalStepsByLine(approvalLine.getId().toString());
                    dto.setApprovalSteps(approvalSteps);
                    return dto;
                })
                .toList();
    }
    
    /**
     * 결재단계 조회
     */
    public Optional<ApprovalStepDto> getApprovalStepById(String id) {
        return approvalStepRepository.findById(UUID.fromString(id))
                .map(approvalStepMapper::toDto);
    }
    
    /**
     * 결재선별 결재단계 조회
     */
    public List<ApprovalStepDto> getApprovalStepsByLine(String approvalLineId) {
        return approvalStepRepository.findByApprovalLineIdOrderByStepOrder(UUID.fromString(approvalLineId))
                .stream()
                .map(approvalStepMapper::toDto)
                .toList();
    }
    
    /**
     * 결재 액션 수행
     */
    @Transactional
    public ApprovalHistoryDto performApprovalAction(ApprovalActionRequest request, String userId) {
        log.info("결재 액션 수행 요청: {} - {}", request.getAction(), request.getApprovalStepId());
        
        try {
            // 1. ApprovalStep 조회 (Lazy Loading 문제 해결을 위해 fetch join 사용)
            ApprovalStep approvalStep = approvalStepRepository.findById(UUID.fromString(request.getApprovalStepId()))
                    .orElseThrow(() -> new IllegalArgumentException("결재단계를 찾을 수 없습니다: " + request.getApprovalStepId()));
            
            // 2. User 조회
            User user = userRepository.findById(UUID.fromString(userId))
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
            
            // 3. 권한 확인 - Lazy Loading 문제 해결을 위해 별도 조회
            User approver = userRepository.findById(approvalStep.getApprover().getId())
                    .orElseThrow(() -> new IllegalArgumentException("결재자를 찾을 수 없습니다: " + approvalStep.getApprover().getId()));
            
            if (!approver.getId().equals(UUID.fromString(userId))) {
                throw new IllegalArgumentException("결재 권한이 없습니다");
            }
            
            // 4. ApprovalLine 조회
            ApprovalLine approvalLine = approvalLineRepository.findById(approvalStep.getApprovalLine().getId())
                    .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + approvalStep.getApprovalLine().getId()));
            
            // 5. Document 조회
            Document document = documentRepository.findById(approvalLine.getDocument().getId())
                    .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + approvalLine.getDocument().getId()));
            
            // 6. 필요한 정보 추출
            UUID documentId = document.getId();
            String documentTitle = document.getTitle();
            UUID approvalStepId = approvalStep.getId();
            UUID approverId = user.getId();
            String approverName = user.getFullName();
            String approverDisplayName = user.getDisplayName();
            
            // 7. 위임받을 사용자 정보 조회
            UUID delegatedToId = null;
            String delegatedToName = null;
            String delegatedToDisplayName = null;
            if (request.getDelegatedToId() != null) {
                User delegatedTo = userRepository.findById(UUID.fromString(request.getDelegatedToId())).orElse(null);
                if (delegatedTo != null) {
                    delegatedToId = delegatedTo.getId();
                    delegatedToName = delegatedTo.getFullName();
                    delegatedToDisplayName = delegatedTo.getDisplayName();
                }
            }
            
            // 8. ApprovalStep 상태 업데이트
            updateApprovalStepStatus(approvalStep, request.getAction());
            
            // 9. 문서 상태 업데이트 (반려사유 포함)
            updateDocumentStatus(documentId, request.getAction(), request.getComments());
            
            log.info("결재 액션 수행 완료: {} - {}", request.getAction(), approvalStep.getId());
            
            // 10. ApprovalHistory 저장
            ApprovalHistory approvalHistory = ApprovalHistory.builder()
                    .action(String.valueOf(request.getAction()))
                    .comment(request.getComments())
                    .ipAddress(request.getIpAddress())
                    .userAgent(request.getUserAgent())
                    .documentId(documentId)
                    .documentTitle(documentTitle)
                    .approvalStepId(approvalStepId)
                    .approverId(approverId)
                    .approverName(approverName)
                    .approverDisplayName(approverDisplayName)
                    .delegatedToId(delegatedToId)
                    .delegatedToName(delegatedToName)
                    .delegatedToDisplayName(delegatedToDisplayName)
                    .actionAt(LocalDateTime.now())
                    .build();
            
            ApprovalHistory savedHistory = approvalHistoryRepository.save(approvalHistory);
            log.info("ApprovalHistory 저장 완료: {}", savedHistory.getId());
            
            // 11. DTO 반환
            return approvalHistoryMapper.toDto(savedHistory);
                    
        } catch (Exception e) {
            log.error("결재 액션 수행 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("결재 액션 수행 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 결재 이력 조회
     */
    public List<ApprovalHistoryDto> getApprovalHistoryByDocument(String documentId) {
        return approvalHistoryRepository.findByDocumentIdOrderByActionAtDesc(UUID.fromString(documentId))
                .stream()
                .map(approvalHistoryMapper::toDto)
                .toList();
    }
    
    /**
     * 사용자별 결재 이력 조회
     */
    public Page<ApprovalHistoryDto> getApprovalHistoryByUser(String userId, Pageable pageable) {
        return approvalHistoryRepository.findByApproverIdOrderByActionAtDesc(UUID.fromString(userId), pageable)
                .map(approvalHistoryMapper::toDto);
    }
    
    /**
     * 결재 위임
     */
    @Transactional
    public ApprovalStepDto delegateApproval(String approvalStepId, String delegatedToId, String userId) {
        log.info("결재 위임 요청: {} -> {}", approvalStepId, delegatedToId);
        
        ApprovalStep approvalStep = approvalStepRepository.findById(UUID.fromString(approvalStepId))
                .orElseThrow(() -> new IllegalArgumentException("결재단계를 찾을 수 없습니다: " + approvalStepId));
        
        User delegatedTo = userRepository.findById(UUID.fromString(delegatedToId))
                .orElseThrow(() -> new IllegalArgumentException("위임받을 사용자를 찾을 수 없습니다: " + delegatedToId));
        
        // 권한 확인
        if (!approvalStep.getApprover().getId().equals(UUID.fromString(userId))) {
            throw new IllegalArgumentException("위임 권한이 없습니다");
        }
        
        // 위임 가능 여부 확인
        if (!approvalStep.getIsDelegatable()) {
            throw new IllegalArgumentException("위임할 수 없는 결재단계입니다");
        }
        
        approvalStep.setAlternateApprover(delegatedTo);
        ApprovalStep savedStep = approvalStepRepository.save(approvalStep);
        
        log.info("결재 위임 완료: {} -> {}", approvalStepId, delegatedToId);
        return approvalStepMapper.toDto(savedStep);
    }
    
    /**
     * ApprovalStep 상태 업데이트
     */
    private void updateApprovalStepStatus(ApprovalStep approvalStep, String action) {
        log.info("ApprovalStep 상태 업데이트: {} -> {}", approvalStep.getId(), action);
        
        // action이 "APPROVE", "REJECT", "DELEGATE" 중 하나인지 확인
        if ("APPROVE".equals(action)) {
            approvalStep.setStatus("APPROVED");
            approvalStep.setApprovedAt(LocalDateTime.now());
        } else if ("REJECT".equals(action)) {
            approvalStep.setStatus("REJECTED");
            approvalStep.setRejectedAt(LocalDateTime.now());
        } else if ("DELEGATE".equals(action)) {
            approvalStep.setStatus("DELEGATED");
            approvalStep.setDelegatedAt(LocalDateTime.now());
        } else {
            log.warn("알 수 없는 액션: {}", action);
            return;
        }
        
        approvalStepRepository.save(approvalStep);
        log.info("ApprovalStep 상태 업데이트 완료: {} -> {}", approvalStep.getId(), approvalStep.getStatus());
    }
    
    /**
     * 문서 상태 업데이트 (Lazy Loading 문제 해결, 반려사유 포함)
     */
    private void updateDocumentStatus(UUID documentId, String action, String comments) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + documentId));
        
        switch (String.valueOf(action)) {
            case "APPROVE" -> {
                // 모든 결재단계가 완료되었는지 확인
                if (isAllRequiredStepsCompleted(document)) {
                    document.setStatus("APPROVED");
                    document.setApprovedAt(LocalDateTime.now());
                    log.info("문서 승인 완료: {}", documentId);
                } else {
                    log.info("문서 승인 진행 중: {} (일부 결재단계 완료)", documentId);
                }
            }
            case "REJECT" -> {
                document.setStatus("REJECTED");
                document.setRejectedAt(LocalDateTime.now());
                document.setRejectionReason(comments);  // 반려사유 저장
                log.info("문서 반려: {} (사유: {})", documentId, comments);
            }
            case "RETURN" -> {
                document.setStatus("DRAFT");
                document.setSubmittedAt(null);
                log.info("문서 반송: {}", documentId);
            }
        }
        
        documentRepository.save(document);
    }
    
    /**
     * 모든 필수 결재단계 완료 여부 확인
     */
    private boolean isAllRequiredStepsCompleted(Document document) {
        // Lazy Loading 문제를 완전히 피하기 위해 documentId로 직접 조회
        UUID documentId = document.getId();
        
        // 해당 문서의 모든 결재선 조회
        List<ApprovalLine> approvalLines = approvalLineRepository.findByDocumentId(documentId);
        
        if (approvalLines == null || approvalLines.isEmpty()) {
            return false;
        }
        
        // 각 결재선의 필수 결재단계가 모두 APPROVED인지 확인
        for (ApprovalLine approvalLine : approvalLines) {
            List<ApprovalStep> steps = approvalStepRepository.findByApprovalLineIdOrderByStepOrder(approvalLine.getId());
            
            // 필수 결재단계가 모두 APPROVED인지 확인
            boolean allRequiredStepsApproved = steps.stream()
                    .filter(step -> step.getIsRequired())
                    .allMatch(step -> "APPROVED".equals(step.getStatus()));
            
            if (!allRequiredStepsApproved) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 결재선 삭제
     */
    @Transactional
    public void deleteApprovalLine(String id) {
        log.info("결재선 삭제 요청: {}", id);
        
        ApprovalLine approvalLine = approvalLineRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + id));
        
        approvalLineRepository.delete(approvalLine);
        log.info("결재선 삭제 완료: {}", id);
    }
    
    /**
     * 결재단계 삭제
     */
    @Transactional
    public void deleteApprovalStep(String id) {
        log.info("결재단계 삭제 요청: {}", id);
        
        ApprovalStep approvalStep = approvalStepRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("결재단계를 찾을 수 없습니다: " + id));
        
        approvalStepRepository.delete(approvalStep);
        log.info("결재단계 삭제 완료: {}", id);
    }
}
