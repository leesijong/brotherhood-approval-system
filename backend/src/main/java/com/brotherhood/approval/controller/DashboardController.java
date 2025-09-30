package com.brotherhood.approval.controller;

import com.brotherhood.approval.dto.BaseResponse;
import com.brotherhood.approval.dto.dashboard.DashboardStatsDto;
import com.brotherhood.approval.dto.document.DocumentDto;
import com.brotherhood.approval.dto.user.UserDto;
import com.brotherhood.approval.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 대시보드 컨트롤러
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "대시보드", description = "대시보드 관련 API")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    /**
     * 대시보드 통계 조회 (관리자용)
     */
    @GetMapping("/stats")
    @Operation(summary = "대시보드 통계 조회", description = "전체 시스템의 통계 정보를 조회합니다.")
    public ResponseEntity<BaseResponse<DashboardStatsDto>> getDashboardStats() {
        try {
            DashboardStatsDto stats = dashboardService.getDashboardStats();
            return ResponseEntity.ok(BaseResponse.success(stats, "대시보드 통계를 조회했습니다"));
        } catch (Exception e) {
            log.error("대시보드 통계 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("대시보드 통계 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 사용자별 대시보드 통계 조회
     */
    @GetMapping("/stats/user/{userId}")
    @Operation(summary = "사용자별 대시보드 통계 조회", description = "특정 사용자의 통계 정보를 조회합니다.")
    public ResponseEntity<BaseResponse<DashboardStatsDto>> getDashboardStatsByUser(@PathVariable String userId) {
        try {
            UUID userUuid = UUID.fromString(userId);
            DashboardStatsDto stats = dashboardService.getDashboardStatsByUser(userUuid);
            return ResponseEntity.ok(BaseResponse.success(stats, "사용자별 대시보드 통계를 조회했습니다"));
        } catch (Exception e) {
            log.error("사용자별 대시보드 통계 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("사용자별 대시보드 통계 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 지사별 대시보드 통계 조회
     */
    @GetMapping("/stats/branch/{branchId}")
    @Operation(summary = "지사별 대시보드 통계 조회", description = "특정 지사의 통계 정보를 조회합니다.")
    public ResponseEntity<BaseResponse<DashboardStatsDto>> getDashboardStatsByBranch(@PathVariable String branchId) {
        try {
            UUID branchUuid = UUID.fromString(branchId);
            DashboardStatsDto stats = dashboardService.getDashboardStatsByBranch(branchUuid);
            return ResponseEntity.ok(BaseResponse.success(stats, "지사별 대시보드 통계를 조회했습니다"));
        } catch (Exception e) {
            log.error("지사별 대시보드 통계 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("지사별 대시보드 통계 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 최근 문서 조회 (전체)
     */
    @GetMapping("/recent-documents")
    @Operation(summary = "최근 문서 조회", description = "최근 생성된 문서를 조회합니다.")
    public ResponseEntity<BaseResponse<List<DocumentDto>>> getRecentDocuments(
            @RequestParam(defaultValue = "10") @Parameter(description = "조회할 문서 수") int limit) {
        try {
            List<DocumentDto> documents = dashboardService.getRecentDocuments(limit);
            return ResponseEntity.ok(BaseResponse.success(documents, "최근 문서를 조회했습니다"));
        } catch (Exception e) {
            log.error("최근 문서 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("최근 문서 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 사용자별 최근 문서 조회
     */
    @GetMapping("/recent-documents/user/{userId}")
    @Operation(summary = "사용자별 최근 문서 조회", description = "특정 사용자와 관련된 최근 문서를 조회합니다.")
    public ResponseEntity<BaseResponse<List<DocumentDto>>> getRecentDocumentsByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") @Parameter(description = "조회할 문서 수") int limit) {
        try {
            UUID userUuid = UUID.fromString(userId);
            List<DocumentDto> documents = dashboardService.getRecentDocumentsByUser(userUuid, limit);
            return ResponseEntity.ok(BaseResponse.success(documents, "사용자별 최근 문서를 조회했습니다"));
        } catch (Exception e) {
            log.error("사용자별 최근 문서 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("사용자별 최근 문서 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 지사별 최근 문서 조회
     */
    @GetMapping("/recent-documents/branch/{branchId}")
    @Operation(summary = "지사별 최근 문서 조회", description = "특정 지사의 최근 문서를 조회합니다.")
    public ResponseEntity<BaseResponse<List<DocumentDto>>> getRecentDocumentsByBranch(
            @PathVariable String branchId,
            @RequestParam(defaultValue = "10") @Parameter(description = "조회할 문서 수") int limit) {
        try {
            UUID branchUuid = UUID.fromString(branchId);
            List<DocumentDto> documents = dashboardService.getRecentDocumentsByBranch(branchUuid, limit);
            return ResponseEntity.ok(BaseResponse.success(documents, "지사별 최근 문서를 조회했습니다"));
        } catch (Exception e) {
            log.error("지사별 최근 문서 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("지사별 최근 문서 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 최근 사용자 조회
     */
    @GetMapping("/recent-users")
    @Operation(summary = "최근 사용자 조회", description = "최근 등록된 사용자를 조회합니다.")
    public ResponseEntity<BaseResponse<List<UserDto>>> getRecentUsers(
            @RequestParam(defaultValue = "10") @Parameter(description = "조회할 사용자 수") int limit) {
        try {
            List<UserDto> users = dashboardService.getRecentUsers(limit);
            return ResponseEntity.ok(BaseResponse.success(users, "최근 사용자를 조회했습니다"));
        } catch (Exception e) {
            log.error("최근 사용자 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("최근 사용자 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 지사별 최근 사용자 조회
     */
    @GetMapping("/recent-users/branch/{branchId}")
    @Operation(summary = "지사별 최근 사용자 조회", description = "특정 지사의 최근 사용자를 조회합니다.")
    public ResponseEntity<BaseResponse<List<UserDto>>> getRecentUsersByBranch(
            @PathVariable String branchId,
            @RequestParam(defaultValue = "10") @Parameter(description = "조회할 사용자 수") int limit) {
        try {
            UUID branchUuid = UUID.fromString(branchId);
            List<UserDto> users = dashboardService.getRecentUsersByBranch(branchUuid, limit);
            return ResponseEntity.ok(BaseResponse.success(users, "지사별 최근 사용자를 조회했습니다"));
        } catch (Exception e) {
            log.error("지사별 최근 사용자 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("지사별 최근 사용자 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 사용자별 결재 대기 목록 조회
     */
    @GetMapping("/pending-approvals")
    @Operation(summary = "결재 대기 목록 조회", description = "사용자가 결재해야 하는 문서 목록을 조회합니다.")
    public ResponseEntity<BaseResponse<List<DocumentDto>>> getPendingApprovals(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Roles") String userRoles) {
        try {
            UUID userUuid = UUID.fromString(userId);
            List<DocumentDto> pendingApprovals = dashboardService.getPendingApprovalsByUser(userUuid);
            return ResponseEntity.ok(BaseResponse.success(pendingApprovals, "결재 대기 목록을 조회했습니다"));
        } catch (Exception e) {
            log.error("결재 대기 목록 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("결재 대기 목록 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 긴급 문서 조회
     */
    @GetMapping("/urgent-documents")
    @Operation(summary = "긴급 문서 조회", description = "긴급으로 처리해야 할 문서를 조회합니다.")
    public ResponseEntity<BaseResponse<List<DocumentDto>>> getUrgentDocuments(
            @RequestParam(defaultValue = "10") @Parameter(description = "조회할 문서 수") int limit) {
        try {
            List<DocumentDto> documents = dashboardService.getUrgentDocuments(limit);
            return ResponseEntity.ok(BaseResponse.success(documents, "긴급 문서를 조회했습니다"));
        } catch (Exception e) {
            log.error("긴급 문서 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("긴급 문서 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 결재 대기 문서 조회
     */
    @GetMapping("/pending-approval/{userId}")
    @Operation(summary = "결재 대기 문서 조회", description = "특정 사용자의 결재 대기 문서를 조회합니다.")
    public ResponseEntity<BaseResponse<List<DocumentDto>>> getPendingApprovalDocuments(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") @Parameter(description = "조회할 문서 수") int limit) {
        try {
            List<DocumentDto> documents = dashboardService.getPendingApprovalDocuments(userId, limit);
            return ResponseEntity.ok(BaseResponse.success(documents, "결재 대기 문서를 조회했습니다"));
        } catch (Exception e) {
            log.error("결재 대기 문서 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("결재 대기 문서 조회 중 오류가 발생했습니다"));
        }
    }
}
