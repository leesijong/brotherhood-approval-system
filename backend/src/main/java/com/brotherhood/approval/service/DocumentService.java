package com.brotherhood.approval.service;

import com.brotherhood.approval.dto.document.DocumentCreateRequest;
import com.brotherhood.approval.dto.document.DocumentDto;
import com.brotherhood.approval.dto.document.DocumentSearchRequest;
import com.brotherhood.approval.dto.document.DocumentUpdateRequest;
import com.brotherhood.approval.dto.approval.ApprovalLineCreateRequest;
import com.brotherhood.approval.entity.Branch;
import com.brotherhood.approval.entity.Document;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.entity.ApprovalLine;
import com.brotherhood.approval.entity.ApprovalStep;
import com.brotherhood.approval.entity.ApprovalHistory;
import com.brotherhood.approval.entity.Comment;
import com.brotherhood.approval.entity.Attachment;
import com.brotherhood.approval.mapper.DocumentMapper;
import com.brotherhood.approval.repository.BranchRepository;
import com.brotherhood.approval.repository.DocumentRepository;
import com.brotherhood.approval.repository.UserRepository;
import com.brotherhood.approval.repository.ApprovalLineRepository;
import com.brotherhood.approval.repository.ApprovalStepRepository;
import com.brotherhood.approval.repository.ApprovalHistoryRepository;
import com.brotherhood.approval.repository.CommentRepository;
import com.brotherhood.approval.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.UUID;

/**
 * 문서 서비스
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentService {
    
    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final DocumentNumberService documentNumberService;
    private final ApprovalService approvalService;
    private final ApprovalLineRepository approvalLineRepository;
    private final ApprovalStepRepository approvalStepRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;
    
    /**
     * 문서 생성
     */
    @Transactional
    public DocumentDto createDocument(DocumentCreateRequest request, String authorId) {
        log.info("문서 생성 요청: {}", request.getTitle());
        
        User author = userRepository.findById(UUID.fromString(authorId))
                .orElseThrow(() -> new IllegalArgumentException("작성자를 찾을 수 없습니다: " + authorId));
        
        Document document = documentMapper.toEntity(request);
        document.setAuthor(author);
        
        // branchId가 제공되지 않은 경우 작성자의 지사 사용
        if (request.getBranchId() != null) {
            Branch branch = branchRepository.findById(UUID.fromString(request.getBranchId()))
                    .orElseThrow(() -> new IllegalArgumentException("지사를 찾을 수 없습니다: " + request.getBranchId()));
            document.setBranch(branch);
        } else {
            document.setBranch(author.getBranch());
        }
        
        // 문서번호 생성
        String documentNumber = documentNumberService.generateDocumentNumber(document.getDocumentType());
        document.setDocumentNumber(documentNumber);
        
        Document savedDocument = documentRepository.save(document);
        log.info("문서 생성 완료: {} (번호: {})", savedDocument.getId(), documentNumber);
        
        // 결재선 생성 (있는 경우)
        if (request.getApprovalLines() != null && !request.getApprovalLines().isEmpty()) {
            log.info("결재선 생성 시작: {} 개의 결재선", request.getApprovalLines().size());
            for (ApprovalLineCreateRequest approvalLineRequest : request.getApprovalLines()) {
                approvalLineRequest.setDocumentId(savedDocument.getId().toString());
                approvalService.createApprovalLine(approvalLineRequest, authorId);
            }
            log.info("결재선 생성 완료");
        }
        
        return documentMapper.toDto(savedDocument);
    }
    
    /**
     * 문서 조회 (ID)
     */
    public Optional<DocumentDto> getDocumentById(String id) {
        return documentRepository.findById(UUID.fromString(id))
                .map(document -> {
                    DocumentDto documentDto = documentMapper.toDto(document);
                    // 결재선 정보 추가
                    documentDto.setApprovalLines(approvalService.getApprovalLinesByDocument(id));
                    return documentDto;
                });
    }
    
    /**
     * 문서 조회 (문서번호)
     */
    public Optional<DocumentDto> getDocumentByNumber(String documentNumber) {
        return documentRepository.findByDocumentNumber(documentNumber)
                .map(documentMapper::toDto);
    }
    
    /**
     * 문서 목록 조회 (페이지네이션)
     */
    public Page<DocumentDto> getDocuments(Pageable pageable) {
        return documentRepository.findAll(pageable)
                .map(documentMapper::toDto);
    }
    
    /**
     * 작성자별 문서 목록 조회
     */
    public Page<DocumentDto> getDocumentsByAuthor(String authorId, Pageable pageable) {
        UUID authorUuid = UUID.fromString(authorId);
        return documentRepository.findByAuthorId(authorUuid, pageable)
                .map(documentMapper::toDto);
    }
    
    /**
     * 지사별 문서 목록 조회
     */
    public Page<DocumentDto> getDocumentsByBranch(UUID branchId, Pageable pageable) {
        return documentRepository.findByBranchId(branchId, pageable)
                .map(documentMapper::toDto);
    }
    
    /**
     * 상태별 문서 목록 조회
     */
    public Page<DocumentDto> getDocumentsByStatus(String status, Pageable pageable) {
        return documentRepository.findByStatus(status, pageable)
                .map(documentMapper::toDto);
    }
    
    /**
     * 문서 검색
     */
    public Page<DocumentDto> searchDocuments(DocumentSearchRequest request, Pageable pageable) {
        if (request.getBranchId() != null) {
            UUID branchUuid = UUID.fromString(request.getBranchId());
            return documentRepository.findByKeywordAndBranchId(
                    request.getKeyword(), 
                    branchUuid, 
                    pageable
            ).map(documentMapper::toDto);
        } else {
            // 전체 검색 로직 구현 필요
            return documentRepository.findAll(pageable)
                    .map(documentMapper::toDto);
        }
    }
    
    /**
     * 결재 참여자별 문서 조회
     */
    public Page<DocumentDto> getDocumentsByApprover(String approverId, Pageable pageable) {
        return documentRepository.findByApproverId(approverId, pageable)
                .map(documentMapper::toDto);
    }
    
    /**
     * 결재 대기 문서 조회
     * - 결재선이 존재하고, 해당 사용자가 결재해야 하는 문서만 반환
     */
    public Page<DocumentDto> getPendingApprovalDocuments(String userId, Pageable pageable) {
        log.info("결재 대기 문서 조회: userId={}", userId);
        
        Page<Document> documentPage = documentRepository.findPendingApprovalByUserId(UUID.fromString(userId), pageable);
        
        // 데이터 정제: 결재선이 없는 문서 필터링
        List<DocumentDto> filteredDocuments = documentPage.getContent()
                .stream()
                .map(documentMapper::toDto)
                .filter(doc -> {
                    // 결재선이 존재하는지 확인
                    if (doc.getApprovalLines() == null || doc.getApprovalLines().isEmpty()) {
                        log.warn("결재선이 없는 문서 발견: {} (ID: {})", doc.getTitle(), doc.getId());
                        return false;
                    }
                    
                    // 해당 사용자가 결재해야 하는 단계가 있는지 확인
                    boolean hasPendingStep = doc.getApprovalLines().stream()
                            .anyMatch(approvalLine -> 
                                approvalLine.getApprovalSteps() != null &&
                                approvalLine.getApprovalSteps().stream()
                                        .anyMatch(step -> 
                                            step.getApproverId() != null &&
                                            step.getApproverId().equals(userId) &&
                                            "PENDING".equals(step.getStatus())
                                        )
                            );
                    
                    if (!hasPendingStep) {
                        log.warn("사용자가 결재해야 하는 단계가 없는 문서: {} (ID: {})", doc.getTitle(), doc.getId());
                        return false;
                    }
                    
                    return true;
                })
                .toList();
        
        log.info("결재 대기 문서 조회 완료: {} 개 문서 (필터링 전: {} 개)", 
                filteredDocuments.size(), documentPage.getContent().size());
        
        // 필터링된 결과를 Page로 변환
        return new org.springframework.data.domain.PageImpl<>(
                filteredDocuments, 
                pageable, 
                filteredDocuments.size()
        );
    }
    
    /**
     * 최근 문서 조회 (지사별)
     */
    public List<DocumentDto> getRecentDocumentsByBranch(UUID branchId, Pageable pageable) {
        return documentRepository.findRecentDocumentsByBranchId(branchId, pageable)
                .stream()
                .map(documentMapper::toDto)
                .toList();
    }
    
    /**
     * 데이터 정제: 결재선이 없는 PENDING 상태 문서를 DRAFT로 변경
     */
    @Transactional
    public void cleanUpDocumentsWithoutApprovalLines() {
        log.info("결재선이 없는 PENDING 상태 문서 정제 시작");
        
        // PENDING 상태인 모든 문서 조회
        List<Document> pendingDocuments = documentRepository.findByStatus("PENDING", PageRequest.of(0, 1000))
                .getContent();
        
        int cleanedCount = 0;
        for (Document document : pendingDocuments) {
            // 결재선이 없는 문서인지 확인
            if (document.getApprovalLines() == null || document.getApprovalLines().isEmpty()) {
                log.warn("결재선이 없는 PENDING 문서 발견: {} (ID: {}) - DRAFT로 변경", 
                        document.getTitle(), document.getId());
                
                document.setStatus("DRAFT");
                documentRepository.save(document);
                cleanedCount++;
            }
        }
        
        log.info("문서 정제 완료: {} 개 문서를 DRAFT로 변경", cleanedCount);
    }
    
    /**
     * 문서의 결재선 존재 여부 검증
     */
    private boolean hasValidApprovalLines(DocumentDto document) {
        return document.getApprovalLines() != null && 
               !document.getApprovalLines().isEmpty() &&
               document.getApprovalLines().stream()
                       .anyMatch(approvalLine -> 
                           approvalLine.getApprovalSteps() != null && 
                           !approvalLine.getApprovalSteps().isEmpty()
                       );
    }
    
    /**
     * 사용자가 결재해야 하는 단계가 있는지 확인
     */
    private boolean hasPendingStepForUser(DocumentDto document, String userId) {
        return document.getApprovalLines().stream()
                .anyMatch(approvalLine -> 
                    approvalLine.getApprovalSteps() != null &&
                    approvalLine.getApprovalSteps().stream()
                            .anyMatch(step -> 
                                step.getApproverId() != null &&
                                step.getApproverId().equals(userId) &&
                                "PENDING".equals(step.getStatus())
                            )
                );
    }
    
    /**
     * 문서 정보 수정
     */
    @Transactional
    public DocumentDto updateDocument(String id, DocumentUpdateRequest request, String userId) {
        log.info("문서 정보 수정 요청: {}", id);
        
        Document document = documentRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + id));
        
        // 권한 확인 (작성자만 수정 가능) - 임시 비활성화
        log.info("문서 작성자 ID: {}, 요청자 ID: {}", document.getAuthor().getId().toString(), userId);
        // if (!document.getAuthor().getId().toString().equals(userId)) {
        //     throw new IllegalArgumentException("문서를 수정할 권한이 없습니다");
        // }
        
        // 상태 확인 (초안 상태만 수정 가능)
        log.info("문서 상태 확인: {} (예상: DRAFT)", document.getStatus());
        // if (!"DRAFT".equals(document.getStatus())) {
        //     throw new IllegalArgumentException("수정 가능한 상태가 아닙니다. 현재 상태: " + document.getStatus());
        // }
        
        documentMapper.updateEntity(request, document);
        Document savedDocument = documentRepository.save(document);
        
        log.info("문서 정보 수정 완료: {}", savedDocument.getId());
        return documentMapper.toDto(savedDocument);
    }
    
    /**
     * 문서 상신
     */
    @Transactional
    public DocumentDto submitDocument(String id, String userId) {
        log.info("문서 상신 요청: {}", id);
        
        Document document = documentRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + id));
        
        // 권한 확인 (임시 비활성화)
        log.info("문서 작성자 ID: {}, 요청자 ID: {}", document.getAuthor().getId().toString(), userId);
        // if (!document.getAuthor().getId().toString().equals(userId)) {
        //     throw new IllegalArgumentException("문서를 상신할 권한이 없습니다");
        // }
        
        // 상태 확인
        log.info("문서 현재 상태: '{}', 비교 대상: 'DRAFT'", document.getStatus());
        if (!"DRAFT".equals(document.getStatus())) {
            throw new IllegalArgumentException("상신 가능한 상태가 아닙니다. 현재 상태: " + document.getStatus());
        }
        
        document.setStatus("PENDING");
        document.setSubmittedAt(LocalDateTime.now());
        
        Document savedDocument = documentRepository.save(document);
        
        log.info("문서 상신 완료: {}", savedDocument.getId());
        return documentMapper.toDto(savedDocument);
    }
    
    /**
     * 문서 승인
     */
    @Transactional
    public DocumentDto approveDocument(String id, String userId) {
        log.info("문서 승인 요청: {}", id);
        
        Document document = documentRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + id));
        
        // 권한 확인 - 승인자는 문서 작성자와 달라야 함
        if (document.getAuthor().getId().toString().equals(userId)) {
            throw new IllegalArgumentException("자신이 작성한 문서는 승인할 수 없습니다");
        }
        
        // 상태 확인
        if (!"PENDING".equals(document.getStatus())) {
            throw new IllegalArgumentException("승인 가능한 상태가 아닙니다. 현재 상태: " + document.getStatus());
        }
        
        document.setStatus("APPROVED");
        document.setApprovedAt(LocalDateTime.now());
        
        Document savedDocument = documentRepository.save(document);
        
        log.info("문서 승인 완료: {} (승인자: {})", savedDocument.getId(), userId);
        return documentMapper.toDto(savedDocument);
    }
    
    /**
     * 문서 반려
     */
    @Transactional
    public DocumentDto rejectDocument(String id, String rejectionReason, String userId) {
        log.info("문서 반려 요청: {}", id);
        
        Document document = documentRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + id));
        
        // 권한 확인 - 반려자는 문서 작성자와 달라야 함
        if (document.getAuthor().getId().toString().equals(userId)) {
            throw new IllegalArgumentException("자신이 작성한 문서는 반려할 수 없습니다");
        }
        
        // 상태 확인
        if (!"PENDING".equals(document.getStatus())) {
            throw new IllegalArgumentException("반려 가능한 상태가 아닙니다. 현재 상태: " + document.getStatus());
        }
        
        document.setStatus("REJECTED");
        document.setRejectedAt(LocalDateTime.now());
        document.setRejectionReason(rejectionReason);
        
        Document savedDocument = documentRepository.save(document);
        
        log.info("문서 반려 완료: {} (사유: {}, 반려자: {})", savedDocument.getId(), rejectionReason, userId);
        return documentMapper.toDto(savedDocument);
    }
    
    /**
     * 문서 회수
     */
    @Transactional
    public DocumentDto recallDocument(String id, String userId) {
        log.info("문서 회수 요청: {}", id);
        
        Document document = documentRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + id));
        
        // 권한 확인
        if (!document.getAuthor().getId().toString().equals(userId)) {
            throw new IllegalArgumentException("문서를 회수할 권한이 없습니다");
        }
        
        // 상태 확인
        if (!"PENDING".equals(document.getStatus())) {
            throw new IllegalArgumentException("회수 가능한 상태가 아닙니다. 현재 상태: " + document.getStatus());
        }
        
        document.setStatus("DRAFT");
        document.setSubmittedAt(null);
        
        Document savedDocument = documentRepository.save(document);
        
        log.info("문서 회수 완료: {}", savedDocument.getId());
        return documentMapper.toDto(savedDocument);
    }
    
    /**
     * 문서 상태 복원 (테스트용)
     */
    @Transactional
    public DocumentDto restoreDocument(String id, String userId) {
        log.info("문서 상태 복원 요청: {}", id);
        
        Document document = documentRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + id));
        
        // 반려된 문서를 PENDING 상태로 복원
        if ("REJECTED".equals(document.getStatus())) {
            document.setStatus("PENDING");
            document.setRejectionReason(null);  // 반려사유 제거
            document.setRejectedAt(null);       // 반려일 제거
            document.setApprovedAt(null);       // 승인일 제거 (혹시 있을 경우)
            
            Document savedDocument = documentRepository.save(document);
            
            log.info("문서 상태 복원 완료: {} (REJECTED -> PENDING)", savedDocument.getId());
            return documentMapper.toDto(savedDocument);
        } else {
            throw new IllegalArgumentException("복원 가능한 상태가 아닙니다. 현재 상태: " + document.getStatus());
        }
    }
    
    /**
     * 문서 삭제
     */
    @Transactional
    public void deleteDocument(String documentId, String userId) {
        log.info("문서 삭제 요청: documentId={}, userId={}", documentId, userId);
        
        UUID documentUuid = UUID.fromString(documentId);
        UUID userUuid = UUID.fromString(userId);
        
        // 사용자 존재 확인
        User user = userRepository.findById(userUuid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        
        // 문서 조회 (권한 확인을 위해)
        Document document = documentRepository.findById(documentUuid)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + documentId));
        
        // 삭제 권한 확인
        if (!hasDeletePermission(document, user)) {
            throw new IllegalArgumentException("문서를 삭제할 권한이 없습니다.");
        }
        
        // 삭제 가능한 상태인지 확인
        if (!isDeletableStatus(document)) {
            throw new IllegalArgumentException("현재 상태에서는 문서를 삭제할 수 없습니다. 상태: " + document.getStatus());
        }
        
        try {
            log.info("문서 삭제 프로세스 시작: documentId={}", documentId);
            
            // 1. 결재 이력 삭제 (ApprovalHistory 먼저 삭제)
            try {
                List<ApprovalHistory> approvalHistories = approvalHistoryRepository.findByDocumentIdOrderByActionAtDesc(documentUuid);
                if (approvalHistories != null && !approvalHistories.isEmpty()) {
                    log.info("결재 이력 삭제: {} 개", approvalHistories.size());
                    approvalHistoryRepository.deleteAll(approvalHistories);
                }
            } catch (Exception e) {
                log.warn("결재 이력 삭제 중 오류: {}", e.getMessage());
            }
            
            // 2. 결재단계 삭제 (ApprovalStep 삭제)
            try {
                List<ApprovalLine> approvalLines = approvalLineRepository.findByDocumentId(documentUuid);
                if (approvalLines != null && !approvalLines.isEmpty()) {
                    log.info("결재선 발견: {} 개", approvalLines.size());
                    for (ApprovalLine approvalLine : approvalLines) {
                        List<ApprovalStep> approvalSteps = approvalStepRepository.findByApprovalLineIdOrderByStepOrder(approvalLine.getId());
                        if (approvalSteps != null && !approvalSteps.isEmpty()) {
                            log.info("결재단계 삭제: {} 개", approvalSteps.size());
                            approvalStepRepository.deleteAll(approvalSteps);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("결재단계 삭제 중 오류: {}", e.getMessage());
            }
            
            // 3. 결재선 삭제 (ApprovalLine 삭제)
            try {
                List<ApprovalLine> approvalLines = approvalLineRepository.findByDocumentId(documentUuid);
                if (approvalLines != null && !approvalLines.isEmpty()) {
                    log.info("결재선 삭제: {} 개", approvalLines.size());
                    approvalLineRepository.deleteAll(approvalLines);
                }
            } catch (Exception e) {
                log.warn("결재선 삭제 중 오류: {}", e.getMessage());
            }
            
            // 4. 댓글 삭제 (Comment 삭제)
            try {
                List<Comment> comments = commentRepository.findByDocumentIdOrderByCreatedAtDesc(documentUuid);
                if (comments != null && !comments.isEmpty()) {
                    log.info("댓글 삭제: {} 개", comments.size());
                    commentRepository.deleteAll(comments);
                }
            } catch (Exception e) {
                log.warn("댓글 삭제 중 오류: {}", e.getMessage());
            }
            
            // 5. 첨부파일 삭제 (Attachment 삭제)
            try {
                List<Attachment> attachments = attachmentRepository.findByDocumentId(documentUuid);
                if (attachments != null && !attachments.isEmpty()) {
                    log.info("첨부파일 삭제: {} 개", attachments.size());
                    attachmentRepository.deleteAll(attachments);
                }
            } catch (Exception e) {
                log.warn("첨부파일 삭제 중 오류: {}", e.getMessage());
            }
            
            // 6. 문서 삭제 (Document 삭제)
            try {
                documentRepository.deleteById(documentUuid);
                log.info("문서 삭제 완료: {}", documentId);
            } catch (Exception e) {
                log.error("문서 삭제 실패: {}", e.getMessage(), e);
                throw new RuntimeException("문서 삭제에 실패했습니다: " + e.getMessage(), e);
            }
            
        } catch (Exception e) {
            log.error("문서 삭제 중 오류 발생: documentId={}, error={}", documentId, e.getMessage(), e);
            throw new RuntimeException("문서 삭제 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 문서 통계 조회
     */
    public long getDocumentCount() {
        return documentRepository.count();
    }
    
    /**
     * 상태별 문서 수 조회
     */
    public long getDocumentCountByStatus(String status) {
        return documentRepository.countByStatus(status);
    }
    
    /**
     * 작성자별 문서 수 조회
     */
    public long getDocumentCountByAuthor(String authorId) {
        UUID authorUuid = UUID.fromString(authorId);
        return documentRepository.countByAuthorId(authorUuid);
    }
    
    /**
     * 지사별 문서 수 조회
     */
    public long getDocumentCountByBranch(UUID branchId) {
        return documentRepository.countByBranchId(branchId);
    }
    
    /**
     * 최근 문서 조회
     */
    public List<DocumentDto> getRecentDocuments(int limit) {
        return documentRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(documentMapper::toDto)
                .toList();
    }
    
    /**
     * 문서 접근 권한 확인
     */
    public boolean hasAccess(String userId, String documentId, String action) {
        Document document = documentRepository.findById(UUID.fromString(documentId))
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + documentId));
        
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        
        // 작성자이거나 관리자이면 접근 가능
        if (document.getAuthor().getId().equals(userId)) {
            return true;
        }
        
        // 관리자 권한 확인
        boolean isAdmin = user.getUserRoles().stream()
                .anyMatch(userRole -> userRole.getRole().getName().equals("ADMIN") || 
                                   userRole.getRole().getName().equals("SUPER_ADMIN"));
        
        if (isAdmin) {
            return true;
        }
        
        // 같은 지사이면 읽기 권한
        if (action.equals("READ") && document.getBranch().getId().equals(user.getBranch().getId())) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 문서 삭제 권한 확인
     */
    private boolean hasDeletePermission(Document document, User user) {
        // 작성자이면 삭제 가능
        if (document.getAuthor().getId().equals(user.getId())) {
            return true;
        }
        
        // 관리자이면 삭제 가능
        boolean isAdmin = user.getUserRoles().stream()
                .anyMatch(userRole -> userRole.getRole().getName().equals("ADMIN") || 
                                   userRole.getRole().getName().equals("SUPER_ADMIN"));
        
        return isAdmin;
    }
    
    /**
     * 문서 삭제 가능 상태 확인
     */
    private boolean isDeletableStatus(Document document) {
        String status = document.getStatus();
        
        // 삭제 가능한 상태: DRAFT, REJECTED
        return "DRAFT".equals(status) || "REJECTED".equals(status);
    }
    
    /**
     * 책임수도자용 문서 조회 (지사 내 모든 문서)
     */
    public Page<DocumentDto> getDocumentsByBranchAndUser(String userId, Pageable pageable) {
        // 사용자의 지사 ID 조회
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
        
        UUID branchId = user.getBranch().getId();
        
        // 지사 내 모든 문서 조회
        return documentRepository.findByBranchId(branchId, pageable)
                .map(documentMapper::toDto);
    }
    
    /**
     * 중간관리수도자용 문서 조회 (본인 작성 + 결재해야 하는 문서)
     */
    public Page<DocumentDto> getDocumentsForMiddleManager(String userId, Pageable pageable) {
        UUID userUuid = UUID.fromString(userId);
        
        // 1. 본인이 작성한 문서만 반환 (결재 문서는 추후 구현)
        Page<Document> myDocuments = documentRepository.findByAuthorId(userUuid, pageable);
        
        return myDocuments.map(documentMapper::toDto);
    }
    
    /**
     * 일반수도자용 문서 조회 (본인 작성 + 참여 문서)
     */
    public Page<DocumentDto> getDocumentsForGeneralUser(String userId, Pageable pageable) {
        UUID userUuid = UUID.fromString(userId);
        
        // 1. 본인이 작성한 문서만 반환 (참여 문서는 추후 구현)
        Page<Document> myDocuments = documentRepository.findByAuthorId(userUuid, pageable);
        
        return myDocuments.map(documentMapper::toDto);
    }
}
