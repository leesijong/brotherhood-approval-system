package com.brotherhood.approval.controller;

import com.brotherhood.approval.dto.BaseResponse;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 테스트 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @PostConstruct
    public void init() {
        log.info("=== TestController 초기화됨 ===");
    }
    
    @GetMapping
    public ResponseEntity<BaseResponse<String>> test() {
        log.info("TestController test() 메서드 호출됨");
        return ResponseEntity.ok(BaseResponse.success("테스트 성공", "TestController가 정상적으로 작동합니다."));
    }
}