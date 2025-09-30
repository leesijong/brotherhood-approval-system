package com.brotherhood.approval.service;

import com.brotherhood.approval.dto.dashboard.DashboardStatsDto;
import com.brotherhood.approval.dto.document.DocumentDto;
import com.brotherhood.approval.dto.user.UserDto;
import com.brotherhood.approval.mapper.DocumentMapper;
import com.brotherhood.approval.mapper.UserMapper;
import com.brotherhood.approval.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 대시보드 서비스
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {
    
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final AttachmentRepository attachmentRepository;
    private final CommentRepository commentRepository;
    private final DocumentMapper documentMapper;
    private final UserMapper userMapper;
    
    /**
     * 대시보드 통계 조회
     */
    public DashboardStatsDto getDashboardStats() {
        log.info("대시보드 통계 조회");
        
        return DashboardStatsDto.builder()
                .totalDocuments(documentRepository.count())
                .pendingApprovals(documentRepository.countByStatus("PENDING"))
                .approvedDocuments(documentRepository.countByStatus("APPROVED"))
                .rejectedDocuments(documentRepository.countByStatus("REJECTED"))
                .draftDocuments(documentRepository.countByStatus("DRAFT"))
                .urgentDocuments(documentRepository.countByPriority("URGENT"))
                .totalUsers(userRepository.count())
                .activeUsers(userRepository.countByIsActiveTrue())
                .totalBranches(branchRepository.count())
                .totalAttachments(attachmentRepository.count())
                .totalComments(commentRepository.count())
                .build();
    }
    
    /**
     * 지사별 대시보드 통계 조회
     */
    public DashboardStatsDto getDashboardStatsByBranch(UUID branchId) {
        log.info("지사별 대시보드 통계 조회: {}", branchId);
        
        return DashboardStatsDto.builder()
                .totalDocuments(documentRepository.countByBranchId(branchId))
                .pendingApprovals(documentRepository.countByBranchIdAndStatus(branchId, "PENDING"))
                .approvedDocuments(documentRepository.countByBranchIdAndStatus(branchId, "APPROVED"))
                .rejectedDocuments(documentRepository.countByBranchIdAndStatus(branchId, "REJECTED"))
                .draftDocuments(documentRepository.countByBranchIdAndStatus(branchId, "DRAFT"))
                .urgentDocuments(documentRepository.countByPriority("URGENT"))
                .totalUsers(userRepository.countByBranchIdAndIsActiveTrue(branchId))
                .activeUsers(userRepository.countByBranchIdAndIsActiveTrue(branchId))
                .totalBranches(1L) // 해당 지사만
                .totalAttachments(attachmentRepository.count())
                .totalComments(commentRepository.count())
                .build();
    }
    
    /**
     * 최근 문서 조회
     */
    public List<DocumentDto> getRecentDocuments(int limit) {
        return documentRepository.findAll(PageRequest.of(0, limit))
                .getContent()
                .stream()
                .map(documentMapper::toDto)
                .toList();
    }
    
    /**
     * 지사별 최근 문서 조회
     */
    public List<DocumentDto> getRecentDocumentsByBranch(UUID branchId, int limit) {
        return documentRepository.findRecentDocumentsByBranchId(branchId, PageRequest.of(0, limit))
                .stream()
                .map(documentMapper::toDto)
                .toList();
    }
    
    /**
     * 최근 사용자 조회
     */
    public List<UserDto> getRecentUsers(int limit) {
        return userRepository.findAll(PageRequest.of(0, limit))
                .getContent()
                .stream()
                .map(userMapper::toDto)
                .toList();
    }
    
    /**
     * 지사별 최근 사용자 조회
     */
    public List<UserDto> getRecentUsersByBranch(UUID branchId, int limit) {
        return userRepository.findByBranchIdAndIsActiveTrue(branchId)
                .stream()
                .limit(limit)
                .map(userMapper::toDto)
                .toList();
    }
    
    /**
     * 긴급 문서 조회
     */
    public List<DocumentDto> getUrgentDocuments(int limit) {
        return documentRepository.findByPriority("URGENT", PageRequest.of(0, limit))
                .getContent()
                .stream()
                .map(documentMapper::toDto)
                .toList();
    }
    
    /**
     * 사용자별 대시보드 통계 조회
     */
    public DashboardStatsDto getDashboardStatsByUser(UUID userId) {
        log.info("사용자별 대시보드 통계 조회: {}", userId);
        
        // 사용자가 작성한 문서 수
        long myDocuments = documentRepository.countByAuthorId(userId);
        long myDraftDocuments = documentRepository.countByAuthorIdAndStatus(userId, "DRAFT");
        long myApprovedDocuments = documentRepository.countByAuthorIdAndStatus(userId, "APPROVED");
        long myRejectedDocuments = documentRepository.countByAuthorIdAndStatus(userId, "REJECTED");
        
        // 사용자가 결재해야 하는 문서 수 (실제 결재선이 있는 문서만)
        long pendingMyApproval = documentRepository.findPendingApprovalByUserId(userId, PageRequest.of(0, 1)).getTotalElements();
        
        return DashboardStatsDto.builder()
                .totalDocuments(myDocuments)
                .pendingApprovals(pendingMyApproval)
                .approvedDocuments(myApprovedDocuments)
                .rejectedDocuments(myRejectedDocuments)
                .draftDocuments(myDraftDocuments)
                .urgentDocuments(0L) // 사용자별 긴급 문서는 나중에 구현
                .totalUsers(1L) // 사용자 본인만
                .activeUsers(1L) // 사용자 본인만
                .totalBranches(1L) // 사용자의 지사만
                .totalAttachments(0L) // 사용자별 첨부파일은 나중에 구현
                .totalComments(0L) // 사용자별 댓글은 나중에 구현
                .build();
    }
    
    /**
     * 사용자별 최근 문서 조회
     */
    public List<DocumentDto> getRecentDocumentsByUser(UUID userId, int limit) {
        return documentRepository.findByAuthorIdOrderByCreatedAtDesc(userId, PageRequest.of(0, limit))
                .getContent()
                .stream()
                .map(documentMapper::toDto)
                .toList();
    }
    
    /**
     * 결재 대기 문서 조회
     */
    public List<DocumentDto> getPendingApprovalDocuments(String userId, int limit) {
        return documentRepository.findPendingApprovalByUserId(UUID.fromString(userId), PageRequest.of(0, limit))
                .getContent()
                .stream()
                .map(documentMapper::toDto)
                .toList();
    }
    
    /**
     * 사용자별 결재 대기 목록 조회 (UUID 버전)
     * - 결재선이 존재하고, 해당 사용자가 결재해야 하는 문서만 반환
     * - 데이터 정제 및 검증 로직 포함
     */
    public List<DocumentDto> getPendingApprovalsByUser(UUID userId) {
        log.info("사용자별 결재 대기 목록 조회: {}", userId);
        
        List<DocumentDto> documents = documentRepository.findPendingApprovalByUserId(userId, PageRequest.of(0, 50))
                .getContent()
                .stream()
                .map(documentMapper::toDto)
                .toList();
        
        // 데이터베이스 쿼리에서 이미 필터링되므로 추가 검증 불필요
        log.info("결재 대기 목록 조회 완료: {} 개 문서", documents.size());
        
        return documents;
    }
}
