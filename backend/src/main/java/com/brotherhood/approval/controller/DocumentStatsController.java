package com.brotherhood.approval.controller;

import com.brotherhood.approval.dto.BaseResponse;
import com.brotherhood.approval.dto.stats.DocumentStatsResponse;
import com.brotherhood.approval.service.DocumentStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 문서 통계 컨트롤러
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2025-10-15
 */
@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class DocumentStatsController {
    
    private final DocumentStatsService documentStatsService;
    
    /**
     * 문서 통계 조회
     */
    @GetMapping("/documents")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<BaseResponse<DocumentStatsResponse>> getDocumentStats() {
        try {
            log.info("문서 통계 API 호출");
            
            DocumentStatsResponse stats = documentStatsService.getDocumentStats();
            
            return ResponseEntity.ok(BaseResponse.<DocumentStatsResponse>builder()
                    .success(true)
                    .message("문서 통계 조회 성공")
                    .data(stats)
                    .build());
                    
        } catch (Exception e) {
            log.error("문서 통계 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(BaseResponse.<DocumentStatsResponse>builder()
                            .success(false)
                            .message("문서 통계 조회 실패: " + e.getMessage())
                            .build());
        }
    }
}
