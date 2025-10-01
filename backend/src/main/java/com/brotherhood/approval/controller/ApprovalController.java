package com.brotherhood.approval.controller;

import com.brotherhood.approval.dto.BaseResponse;
import com.brotherhood.approval.dto.approval.*;
import com.brotherhood.approval.service.ApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 결재 컨트롤러
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
@Tag(name = "결재 관리", description = "결재 관련 API")
public class ApprovalController {
    
    private final ApprovalService approvalService;
    
    @PostConstruct
    public void init() {
        log.info("=== ApprovalController 초기화됨 ===");
        log.info("ApprovalController 빈 생성 완료");
        log.info("ApprovalController 매핑 준비 완료");
    }
    
    /**
     * 결재 컨트롤러 테스트
     */
    @GetMapping("/approvals/test")
    @Operation(summary = "결재 컨트롤러 테스트", description = "결재 컨트롤러가 정상 작동하는지 확인합니다.")
    public ResponseEntity<BaseResponse<String>> testApprovalController() {
        log.info("ApprovalController 테스트 엔드포인트 호출됨");
        return ResponseEntity.ok(BaseResponse.success("ApprovalController is working", "결재 컨트롤러가 정상 작동합니다"));
    }
    
    /**
     * 결재선 생성
     */
    @PostMapping("/approvals/lines")
    @Operation(summary = "결재선 생성", description = "새로운 결재선을 생성합니다.")
    public ResponseEntity<BaseResponse<ApprovalLineDto>> createApprovalLine(
            @RequestBody ApprovalLineCreateRequest request,
            @RequestHeader("X-User-Id") String userId) {
        log.info("결재선 생성 요청: {}", request.getName());
        ApprovalLineDto result = approvalService.createApprovalLine(request, userId);
        return ResponseEntity.ok(BaseResponse.success(result, "결재선이 성공적으로 생성되었습니다"));
    }
    
    /**
     * 결재선 조회
     */
    @GetMapping("/approvals/lines/{id}")
    @Operation(summary = "결재선 조회", description = "ID로 결재선을 조회합니다.")
    public ResponseEntity<BaseResponse<ApprovalLineDto>> getApprovalLine(@PathVariable String id) {
        log.info("결재선 조회 요청: {}", id);
        return approvalService.getApprovalLineById(id)
                .map(dto -> ResponseEntity.ok(BaseResponse.success(dto, "결재선 조회 성공")))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 문서별 결재선 조회
     */
    @GetMapping("/approvals/lines/document/{documentId}")
    @Operation(summary = "문서별 결재선 조회", description = "문서의 모든 결재선을 조회합니다.")
    public ResponseEntity<BaseResponse<List<ApprovalLineDto>>> getApprovalLinesByDocument(@PathVariable String documentId) {
        log.info("문서별 결재선 조회 요청: {}", documentId);
        List<ApprovalLineDto> result = approvalService.getApprovalLinesByDocument(documentId);
        return ResponseEntity.ok(BaseResponse.success(result, "문서별 결재선 조회 성공"));
    }
    
    /**
     * 결재 액션 수행
     */
    @PostMapping("/approvals/actions")
    @Operation(summary = "결재 액션 수행", description = "승인, 반려, 반송 등의 결재 액션을 수행합니다.")
    public ResponseEntity<BaseResponse<ApprovalHistoryDto>> performApprovalAction(
            @RequestBody ApprovalActionRequest request,
            @RequestHeader("X-User-Id") String userId,
            HttpServletRequest httpRequest) {
        log.info("결재 액션 수행 요청: {} - {}", request.getAction(), request.getApprovalStepId());
        
        // IP 주소와 User-Agent 설정
        request.setIpAddress(getClientIpAddress(httpRequest));
        request.setUserAgent(httpRequest.getHeader("User-Agent"));
        
        ApprovalHistoryDto result = approvalService.performApprovalAction(request, userId);
        return ResponseEntity.ok(BaseResponse.success(result, "결재 액션이 성공적으로 수행되었습니다"));
    }
    
    /**
     * 결재 단계별 액션 수행 (프론트엔드 호환용)
     */
    @PostMapping("/approvals/steps/{stepId}/process")
    @Operation(summary = "결재 단계별 액션 수행", description = "특정 결재 단계에 대한 승인, 반려, 반송 등의 액션을 수행합니다.")
    public ResponseEntity<BaseResponse<ApprovalHistoryDto>> processApprovalStep(
            @PathVariable String stepId,
            @RequestBody ApprovalActionRequest request,
            @RequestHeader("X-User-Id") String userId,
            HttpServletRequest httpRequest) {
        log.info("결재 단계별 액션 수행 요청: {} - {}", stepId, request.getAction());
        
        // stepId를 request에 설정
        request.setApprovalStepId(stepId);
        
        // IP 주소와 User-Agent 설정
        request.setIpAddress(getClientIpAddress(httpRequest));
        request.setUserAgent(httpRequest.getHeader("User-Agent"));
        
        ApprovalHistoryDto result = approvalService.performApprovalAction(request, userId);
        return ResponseEntity.ok(BaseResponse.success(result, "결재 액션이 성공적으로 수행되었습니다"));
    }
    
    /**
     * 결재 이력 조회 (문서별)
     */
    @GetMapping("/approvals/history/document/{documentId}")
    @Operation(summary = "문서별 결재 이력 조회", description = "문서의 모든 결재 이력을 조회합니다.")
    public ResponseEntity<BaseResponse<List<ApprovalHistoryDto>>> getApprovalHistoryByDocument(@PathVariable String documentId) {
        log.info("문서별 결재 이력 조회 요청: {}", documentId);
        List<ApprovalHistoryDto> result = approvalService.getApprovalHistoryByDocument(documentId);
        return ResponseEntity.ok(BaseResponse.success(result, "문서별 결재 이력 조회 성공"));
    }
    
    /**
     * 결재 이력 조회 (사용자별)
     */
    @GetMapping("/approvals/history/user/{userId}")
    @Operation(summary = "사용자별 결재 이력 조회", description = "사용자의 모든 결재 이력을 조회합니다.")
    public ResponseEntity<BaseResponse<Page<ApprovalHistoryDto>>> getApprovalHistoryByUser(
            @PathVariable String userId,
            Pageable pageable) {
        log.info("사용자별 결재 이력 조회 요청: {}", userId);
        Page<ApprovalHistoryDto> result = approvalService.getApprovalHistoryByUser(userId, pageable);
        return ResponseEntity.ok(BaseResponse.success(result, "사용자별 결재 이력 조회 성공"));
    }
    
    /**
     * 내가 처리한 결재 이력 조회
     */
    @GetMapping("/approvals/my-processed")
    @Operation(summary = "내가 처리한 결재 이력 조회", description = "현재 사용자가 처리한 모든 결재 이력을 조회합니다.")
    public ResponseEntity<BaseResponse<Page<ApprovalHistoryDto>>> getMyProcessedApprovals(
            @RequestHeader("X-User-Id") String userId,
            Pageable pageable) {
        log.info("내가 처리한 결재 이력 조회 요청: {}", userId);
        Page<ApprovalHistoryDto> result = approvalService.getApprovalHistoryByUser(userId, pageable);
        return ResponseEntity.ok(BaseResponse.success(result, "내가 처리한 결재 이력 조회 성공"));
    }
    
    /**
     * 결재 위임
     */
    @PostMapping("/approvals/delegate/{approvalStepId}")
    @Operation(summary = "결재 위임", description = "결재 권한을 다른 사용자에게 위임합니다.")
    public ResponseEntity<BaseResponse<ApprovalStepDto>> delegateApproval(
            @PathVariable String approvalStepId,
            @RequestParam String delegatedToId,
            @RequestHeader("X-User-Id") String userId) {
        log.info("결재 위임 요청: {} -> {}", approvalStepId, delegatedToId);
        ApprovalStepDto result = approvalService.delegateApproval(approvalStepId, delegatedToId, userId);
        return ResponseEntity.ok(BaseResponse.success(result, "결재 위임이 성공적으로 완료되었습니다"));
    }
    
    /**
     * 결재선 삭제
     */
    @DeleteMapping("/approvals/lines/{id}")
    @Operation(summary = "결재선 삭제", description = "결재선을 삭제합니다.")
    public ResponseEntity<BaseResponse<Void>> deleteApprovalLine(@PathVariable String id) {
        log.info("결재선 삭제 요청: {}", id);
        approvalService.deleteApprovalLine(id);
        return ResponseEntity.ok(BaseResponse.success(null, "결재선이 성공적으로 삭제되었습니다"));
    }
    
    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
