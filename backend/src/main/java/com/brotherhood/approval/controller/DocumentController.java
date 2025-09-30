package com.brotherhood.approval.controller;

import com.brotherhood.approval.dto.BaseResponse;
import com.brotherhood.approval.dto.PageResponse;
import com.brotherhood.approval.dto.document.DocumentCreateRequest;
import com.brotherhood.approval.dto.document.DocumentDto;
import com.brotherhood.approval.dto.document.DocumentSearchRequest;
import com.brotherhood.approval.dto.document.DocumentUpdateRequest;
import com.brotherhood.approval.dto.attachment.AttachmentDto;
import com.brotherhood.approval.dto.attachment.FileUploadResponse;
import com.brotherhood.approval.entity.Attachment;
import com.brotherhood.approval.service.DocumentService;
import com.brotherhood.approval.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

/**
 * 문서 컨트롤러
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
@Tag(name = "문서", description = "문서 관리 관련 API")
public class DocumentController {
    
    private final DocumentService documentService;
    private final AttachmentService attachmentService;
    
    @PostConstruct
    public void init() {
        log.info("=== DocumentController 초기화됨 ===");
        log.info("DocumentController 생성자 호출됨 - DocumentService 의존성 주입됨");
        log.info("DocumentService null 체크: {}", documentService != null ? "정상" : "NULL");
        log.info("=== DocumentController 초기화 완료 ===");
    }
    
    /**
     * 문서 생성
     */
    @PostMapping
    @Operation(summary = "문서 생성", description = "새로운 문서를 생성합니다.")
    public ResponseEntity<BaseResponse<DocumentDto>> createDocument(
            @Valid @RequestBody DocumentCreateRequest request,
            @RequestHeader("X-User-Id") String authorId) {
        try {
            DocumentDto document = documentService.createDocument(request, authorId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(BaseResponse.success(document, "문서가 성공적으로 생성되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("문서 생성 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("문서 생성 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 조회 (ID)
     */
    @GetMapping("/{id}")
    @Operation(summary = "문서 조회", description = "ID로 문서 정보를 조회합니다.")
    public ResponseEntity<BaseResponse<DocumentDto>> getDocumentById(@PathVariable String id) {
        try {
            Optional<DocumentDto> document = documentService.getDocumentById(id);
            if (document.isPresent()) {
                return ResponseEntity.ok(BaseResponse.success(document.get(), "문서 정보를 조회했습니다"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("문서 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("문서 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 조회 (문서번호)
     */
    @GetMapping("/number/{documentNumber}")
    @Operation(summary = "문서번호로 조회", description = "문서번호로 문서 정보를 조회합니다.")
    public ResponseEntity<BaseResponse<DocumentDto>> getDocumentByNumber(@PathVariable String documentNumber) {
        try {
            Optional<DocumentDto> document = documentService.getDocumentByNumber(documentNumber);
            if (document.isPresent()) {
                return ResponseEntity.ok(BaseResponse.success(document.get(), "문서 정보를 조회했습니다"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("문서 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("문서 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 목록 조회 (역할별 접근 제어)
     */
    @GetMapping
    @Operation(summary = "문서 목록 조회", description = "사용자 역할에 따라 접근 가능한 문서 목록을 조회합니다.")
    public ResponseEntity<BaseResponse<PageResponse<DocumentDto>>> getDocuments(
            @RequestParam(required = false) String authorId,
            @RequestParam(required = false) String status,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Roles") String userRoles,
            Pageable pageable) {
        try {
            Page<DocumentDto> documentPage;
            
            // 사용자 역할에 따른 접근 제어
            if (userRoles.contains("SUPERIOR")) {
                // 장상: 모든 문서 조회
                if (authorId != null && !authorId.trim().isEmpty()) {
                    documentPage = documentService.getDocumentsByAuthor(authorId, pageable);
                } else if (status != null && !status.trim().isEmpty()) {
                    documentPage = documentService.getDocumentsByStatus(status, pageable);
                } else {
                    documentPage = documentService.getDocuments(pageable);
                }
            } else if (userRoles.contains("RESPONSIBLE")) {
                // 책임수도자: 지사 내 모든 문서 조회
                documentPage = documentService.getDocumentsByBranchAndUser(userId, pageable);
            } else if (userRoles.contains("MIDDLE_MANAGER")) {
                // 중간관리수도자: 본인 작성 + 결재해야 하는 문서
                documentPage = documentService.getDocumentsForMiddleManager(userId, pageable);
            } else {
                // 일반수도자: 본인 작성 + 참여 문서만
                documentPage = documentService.getDocumentsForGeneralUser(userId, pageable);
            }
            
            PageResponse<DocumentDto> response = PageResponse.of(documentPage);
            return ResponseEntity.ok(BaseResponse.success(response, "문서 목록을 조회했습니다"));
        } catch (Exception e) {
            log.error("문서 목록 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("문서 목록 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 작성자별 문서 목록 조회
     */
    @GetMapping("/author/{authorId}")
    @Operation(summary = "작성자별 문서 조회", description = "특정 작성자의 문서 목록을 조회합니다.")
    public ResponseEntity<BaseResponse<PageResponse<DocumentDto>>> getDocumentsByAuthor(
            @PathVariable String authorId, Pageable pageable) {
        try {
            Page<DocumentDto> documentPage = documentService.getDocumentsByAuthor(authorId, pageable);
            PageResponse<DocumentDto> response = PageResponse.of(documentPage);
            return ResponseEntity.ok(BaseResponse.success(response, "작성자별 문서 목록을 조회했습니다"));
        } catch (Exception e) {
            log.error("작성자별 문서 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("작성자별 문서 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 지사별 문서 목록 조회
     */
    @GetMapping("/branch/{branchId}")
    @Operation(summary = "지사별 문서 조회", description = "특정 지사의 문서 목록을 조회합니다.")
    public ResponseEntity<BaseResponse<PageResponse<DocumentDto>>> getDocumentsByBranch(
            @PathVariable String branchId, Pageable pageable) {
        try {
            UUID branchUuid = UUID.fromString(branchId);
            Page<DocumentDto> documentPage = documentService.getDocumentsByBranch(branchUuid, pageable);
            PageResponse<DocumentDto> response = PageResponse.of(documentPage);
            return ResponseEntity.ok(BaseResponse.success(response, "지사별 문서 목록을 조회했습니다"));
        } catch (Exception e) {
            log.error("지사별 문서 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("지사별 문서 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 상태별 문서 목록 조회
     */
    @GetMapping("/status/{status}")
    @Operation(summary = "상태별 문서 조회", description = "특정 상태의 문서 목록을 조회합니다.")
    public ResponseEntity<BaseResponse<PageResponse<DocumentDto>>> getDocumentsByStatus(
            @PathVariable String status, Pageable pageable) {
        try {
            Page<DocumentDto> documentPage = documentService.getDocumentsByStatus(status, pageable);
            PageResponse<DocumentDto> response = PageResponse.of(documentPage);
            return ResponseEntity.ok(BaseResponse.success(response, "상태별 문서 목록을 조회했습니다"));
        } catch (Exception e) {
            log.error("상태별 문서 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("상태별 문서 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 검색
     */
    @PostMapping("/search")
    @Operation(summary = "문서 검색", description = "키워드로 문서를 검색합니다.")
    public ResponseEntity<BaseResponse<PageResponse<DocumentDto>>> searchDocuments(
            @Valid @RequestBody DocumentSearchRequest request, Pageable pageable) {
        try {
            Page<DocumentDto> documentPage = documentService.searchDocuments(request, pageable);
            PageResponse<DocumentDto> response = PageResponse.of(documentPage);
            return ResponseEntity.ok(BaseResponse.success(response, "문서 검색이 완료되었습니다"));
        } catch (Exception e) {
            log.error("문서 검색 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("문서 검색 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 결재 대기 문서 조회
     */
    @GetMapping("/pending-approval/{userId}")
    @Operation(summary = "결재 대기 문서 조회", description = "특정 사용자의 결재 대기 문서를 조회합니다.")
    public ResponseEntity<BaseResponse<PageResponse<DocumentDto>>> getPendingApprovalDocuments(
            @PathVariable String userId, Pageable pageable) {
        try {
            Page<DocumentDto> documentPage = documentService.getPendingApprovalDocuments(userId, pageable);
            PageResponse<DocumentDto> response = PageResponse.of(documentPage);
            return ResponseEntity.ok(BaseResponse.success(response, "결재 대기 문서를 조회했습니다"));
        } catch (Exception e) {
            log.error("결재 대기 문서 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("결재 대기 문서 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 최근 문서 조회
     */
    @GetMapping("/recent")
    @Operation(summary = "최근 문서 조회", description = "최근 생성된 문서를 조회합니다.")
    public ResponseEntity<BaseResponse<List<DocumentDto>>> getRecentDocuments(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<DocumentDto> documents = documentService.getRecentDocuments(limit);
            return ResponseEntity.ok(BaseResponse.success(documents, "최근 문서를 조회했습니다"));
        } catch (Exception e) {
            log.error("최근 문서 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("최근 문서 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 정보 수정
     */
    @PutMapping("/{id}")
    @Operation(summary = "문서 정보 수정", description = "문서 정보를 수정합니다.")
    public ResponseEntity<BaseResponse<DocumentDto>> updateDocument(
            @PathVariable String id, 
            @Valid @RequestBody DocumentUpdateRequest request,
            @RequestHeader("X-User-Id") String userId) {
        try {
            log.info("문서 수정 컨트롤러 호출: id={}, userId={}", id, userId);
            log.info("요청 데이터: title={}, content={}, documentType={}, priority={}", 
                    request.getTitle(), request.getContent(), request.getDocumentType(), request.getPriority());
            
            DocumentDto document = documentService.updateDocument(id, request, userId);
            return ResponseEntity.ok(BaseResponse.success(document, "문서 정보가 성공적으로 수정되었습니다"));
        } catch (IllegalArgumentException e) {
            log.error("문서 수정 IllegalArgumentException: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("문서 정보 수정 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("문서 정보 수정 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 상신
     */
    @PostMapping("/{id}/submit")
    @Operation(summary = "문서 상신", description = "문서를 상신합니다.")
    public ResponseEntity<BaseResponse<DocumentDto>> submitDocument(
            @PathVariable String id, @RequestHeader("X-User-Id") String userId) {
        try {
            DocumentDto document = documentService.submitDocument(id, userId);
            return ResponseEntity.ok(BaseResponse.success(document, "문서가 성공적으로 상신되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("문서 상신 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("문서 상신 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 승인
     */
    @PostMapping("/{id}/approve")
    @Operation(summary = "문서 승인", description = "문서를 승인합니다.")
    public ResponseEntity<BaseResponse<DocumentDto>> approveDocument(
            @PathVariable String id, @RequestHeader("X-User-Id") String userId) {
        try {
            DocumentDto document = documentService.approveDocument(id, userId);
            return ResponseEntity.ok(BaseResponse.success(document, "문서가 성공적으로 승인되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("문서 승인 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("문서 승인 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 반려
     */
    @PostMapping("/{id}/reject")
    @Operation(summary = "문서 반려", description = "문서를 반려합니다.")
    public ResponseEntity<BaseResponse<DocumentDto>> rejectDocument(
            @PathVariable String id, 
            @RequestBody @Parameter(description = "반려 사유") String rejectionReason,
            @RequestHeader("X-User-Id") String userId) {
        try {
            DocumentDto document = documentService.rejectDocument(id, rejectionReason, userId);
            return ResponseEntity.ok(BaseResponse.success(document, "문서가 성공적으로 반려되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("문서 반려 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("문서 반려 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 회수
     */
    @PostMapping("/{id}/recall")
    @Operation(summary = "문서 회수", description = "상신된 문서를 회수합니다.")
    public ResponseEntity<BaseResponse<DocumentDto>> recallDocument(
            @PathVariable String id, @RequestHeader("X-User-Id") String userId) {
        try {
            DocumentDto document = documentService.recallDocument(id, userId);
            return ResponseEntity.ok(BaseResponse.success(document, "문서가 성공적으로 회수되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("문서 회수 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("문서 회수 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 삭제
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "문서 삭제", description = "문서를 삭제합니다. 작성자 또는 관리자만 삭제 가능하며, DRAFT 또는 REJECTED 상태만 삭제 가능합니다.")
    public ResponseEntity<BaseResponse<Void>> deleteDocument(
            @PathVariable String id, @RequestHeader("X-User-Id") String userId) {
        try {
            documentService.deleteDocument(id, userId);
            return ResponseEntity.ok(BaseResponse.success(null, "문서가 성공적으로 삭제되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("문서 삭제 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("문서 삭제 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 통계 조회
     */
    @GetMapping("/stats")
    @Operation(summary = "문서 통계", description = "문서 관련 통계를 조회합니다.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<Object>> getDocumentStats() {
        try {
            long totalDocCount = documentService.getDocumentCount();
            long draftDocCount = documentService.getDocumentCountByStatus("DRAFT");
            long pendingDocCount = documentService.getDocumentCountByStatus("PENDING");
            long approvedDocCount = documentService.getDocumentCountByStatus("APPROVED");
            long rejectedDocCount = documentService.getDocumentCountByStatus("REJECTED");
            
            return ResponseEntity.ok(BaseResponse.success(
                    new Object() {
                        public final long totalDocuments = totalDocCount;
                        public final long draftDocuments = draftDocCount;
                        public final long pendingDocuments = pendingDocCount;
                        public final long approvedDocuments = approvedDocCount;
                        public final long rejectedDocuments = rejectedDocCount;
                    }, "문서 통계를 조회했습니다"));
        } catch (Exception e) {
            log.error("문서 통계 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("문서 통계 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 첨부파일 업로드
     */
    @PostMapping("/{id}/attachments/upload")
    @Operation(summary = "문서 첨부파일 업로드", description = "문서에 첨부파일을 업로드합니다.")
    public ResponseEntity<BaseResponse<FileUploadResponse>> uploadAttachment(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-Id") String userId) {
        try {
            FileUploadResponse response = attachmentService.uploadFile(file, id, userId);
            return ResponseEntity.ok(BaseResponse.success(response, "첨부파일이 성공적으로 업로드되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("첨부파일 업로드 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("첨부파일 업로드 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 문서 첨부파일 목록 조회
     */
    @GetMapping("/{id}/attachments")
    @Operation(summary = "문서 첨부파일 목록 조회", description = "문서에 첨부된 파일 목록을 조회합니다.")
    public ResponseEntity<BaseResponse<List<AttachmentDto>>> getDocumentAttachments(@PathVariable String id) {
        try {
            List<AttachmentDto> attachments = attachmentService.getAttachmentsByDocumentId(id);
            return ResponseEntity.ok(BaseResponse.success(attachments, "첨부파일 목록을 조회했습니다"));
        } catch (Exception e) {
            log.error("첨부파일 목록 조회 오류", e);
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error("첨부파일 목록 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 첨부파일 삭제
     */
    @DeleteMapping("/attachments/{attachmentId}")
    @Operation(summary = "첨부파일 삭제", description = "첨부파일을 삭제합니다.")
    public ResponseEntity<BaseResponse<Void>> deleteAttachment(@PathVariable String attachmentId) {
        try {
            attachmentService.deleteAttachment(attachmentId);
            return ResponseEntity.ok(BaseResponse.success(null, "첨부파일이 성공적으로 삭제되었습니다"));
        } catch (Exception e) {
            log.error("첨부파일 삭제 오류", e);
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error("첨부파일 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 첨부파일 다운로드
     */
    @GetMapping("/attachments/{attachmentId}/download")
    @Operation(summary = "첨부파일 다운로드", description = "첨부파일을 다운로드합니다.")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable String attachmentId) {
        try {
            Attachment attachment = attachmentService.getAttachmentById(attachmentId);
            Path filePath = Paths.get(attachmentService.getUploadDir(), attachment.getStoredFilename());
            
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getOriginalFilename() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, attachment.getMimeType())
                    .body(resource);
        } catch (Exception e) {
            log.error("첨부파일 다운로드 오류", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 첨부파일 테스트 엔드포인트
     */
    @GetMapping("/attachments/test")
    @Operation(summary = "첨부파일 테스트", description = "첨부파일 기능이 정상적으로 작동하는지 테스트합니다.")
    public ResponseEntity<BaseResponse<String>> testAttachment() {
        return ResponseEntity.ok(BaseResponse.success("Attachment functionality is working!", "첨부파일 기능이 정상적으로 작동합니다"));
    }
    
    /**
     * 데이터 정제: 결재선이 없는 PENDING 상태 문서를 DRAFT로 변경
     */
    @PostMapping("/cleanup")
    @Operation(summary = "데이터 정제", description = "결재선이 없는 PENDING 상태 문서를 DRAFT로 변경합니다.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<String>> cleanupDocuments() {
        try {
            documentService.cleanUpDocumentsWithoutApprovalLines();
            return ResponseEntity.ok(BaseResponse.success("데이터 정제가 완료되었습니다", "결재선이 없는 PENDING 상태 문서가 DRAFT로 변경되었습니다"));
        } catch (Exception e) {
            log.error("데이터 정제 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("데이터 정제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
}
