package com.brotherhood.approval.controller;

import com.brotherhood.approval.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 헬스 체크 컨트롤러
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@RestController
@RequestMapping("")
@Tag(name = "헬스 체크", description = "시스템 상태 확인 API")
public class HealthController {
    
    /**
     * 헬스 체크
     */
    @GetMapping("/health")
    @Operation(summary = "헬스 체크", description = "시스템 상태를 확인합니다.")
    public ResponseEntity<BaseResponse<Map<String, Object>>> health() {
        try {
            Map<String, Object> healthData = new HashMap<>();
            healthData.put("status", "UP");
            healthData.put("timestamp", LocalDateTime.now());
            healthData.put("service", "Brotherhood Approval System");
            healthData.put("version", "1.0.0");
            
            return ResponseEntity.ok(BaseResponse.success(healthData, "시스템이 정상적으로 작동 중입니다"));
        } catch (Exception e) {
            log.error("헬스 체크 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("시스템 상태 확인 중 오류가 발생했습니다"));
        }
    }
}
