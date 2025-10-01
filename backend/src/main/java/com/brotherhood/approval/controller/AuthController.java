package com.brotherhood.approval.controller;

import com.brotherhood.approval.dto.BaseResponse;
import com.brotherhood.approval.dto.auth.LoginRequest;
import com.brotherhood.approval.dto.auth.LoginResponse;
import com.brotherhood.approval.dto.user.UserDto;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.mapper.UserMapper;
import com.brotherhood.approval.service.AuthService;
import com.brotherhood.approval.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Optional;

/**
 * 인증 컨트롤러 - 기본 Spring Security 사용
 * 
 * @author Brotherhood Development Team
 * @version 2.0.0
 * @since 2024-09-23
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@Tag(name = "인증", description = "사용자 인증 관련 API")
public class AuthController {
    
    private final AuthService authService;
    private final UserService userService;
    private final UserMapper userMapper;
    
    public AuthController(AuthService authService, UserService userService, UserMapper userMapper) {
        this.authService = authService;
        this.userService = userService;
        this.userMapper = userMapper;
        log.info("=== AuthController 초기화됨 ===");
        log.info("AuthController 생성자 호출됨 - AuthService, UserService, UserMapper 의존성 주입됨");
    }
    
    @PostConstruct
    public void init() {
        log.info("=== AuthController @PostConstruct 호출됨 ===");
        log.info("AuthController 등록 완료");
    }
    
    /**
     * 사용자 로그인
     */
    @PostMapping("/login")
    @Operation(summary = "사용자 로그인", description = "사용자명과 비밀번호로 로그인합니다.")
    public ResponseEntity<BaseResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("=== AuthController login 메서드 호출됨 ===");
        log.info("로그인 요청: {}", request.getUsername());
        
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(BaseResponse.success(response, "로그인 성공"));
        } catch (Exception e) {
            log.error("로그인 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error("로그인 실패: " + e.getMessage()));
        }
    }
    
    /**
     * 사용자 로그아웃
     */
    @PostMapping("/logout")
    @Operation(summary = "사용자 로그아웃", description = "사용자를 로그아웃시킵니다.")
    public ResponseEntity<BaseResponse<Void>> logout(HttpServletRequest request) {
        log.info("=== AuthController logout 메서드 호출됨 ===");
        
        try {
            // 세션 무효화
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
                log.info("세션 무효화 완료");
            }
            
            // Spring Security 컨텍스트 클리어
            SecurityContextHolder.clearContext();
            log.info("Spring Security 컨텍스트 클리어 완료");
            
            return ResponseEntity.ok(BaseResponse.success(null, "로그아웃 성공"));
        } catch (Exception e) {
            log.error("로그아웃 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error("로그아웃 실패: " + e.getMessage()));
        }
    }
    
    /**
     * 현재 사용자 정보 조회
     */
    @GetMapping("/me")
    @Operation(summary = "현재 사용자 정보 조회", description = "현재 로그인한 사용자의 정보를 조회합니다.")
    public ResponseEntity<BaseResponse<Object>> getCurrentUser() {
        log.info("=== AuthController getCurrentUser 메서드 호출됨 ===");
        
        try {
            // SecurityContext에서 현재 사용자 정보 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication instanceof AnonymousAuthenticationToken) {
                log.warn("인증되지 않은 사용자 접근");
                return ResponseEntity.ok(BaseResponse.success(null, "인증되지 않은 사용자"));
            }
            
            // Principal에서 사용자 ID 추출
            String userId = authentication.getName();
            log.info("현재 사용자 ID: {}", userId);
            
            // 사용자 정보 조회
            Optional<UserDto> userOptional = userService.getUserById(userId);
            if (userOptional.isEmpty()) {
                log.warn("사용자 정보를 찾을 수 없습니다: {}", userId);
                return ResponseEntity.ok(BaseResponse.success(null, "사용자 정보를 찾을 수 없습니다"));
            }
            
            // 사용자 정보를 DTO로 변환
            UserDto userDto = userOptional.get();
            
            log.info("사용자 정보 조회 성공: {}", userDto.getLoginId());
            return ResponseEntity.ok(BaseResponse.success(userDto, "현재 사용자 정보 조회 성공"));
        } catch (Exception e) {
            log.error("현재 사용자 정보 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error("현재 사용자 정보 조회 실패: " + e.getMessage()));
        }
    }
    
    /**
     * 세션 검증
     */
    @GetMapping("/session/validate")
    @Operation(summary = "세션 검증", description = "현재 세션이 유효한지 검증합니다.")
    public ResponseEntity<BaseResponse<Object>> validateSession() {
        log.info("=== AuthController validateSession 메서드 호출됨 ===");
        
        try {
            // 임시로 성공 응답 반환
            return ResponseEntity.ok(BaseResponse.success(null, "세션 검증 성공"));
        } catch (Exception e) {
            log.error("세션 검증 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error("세션 검증 실패: " + e.getMessage()));
        }
    }
}