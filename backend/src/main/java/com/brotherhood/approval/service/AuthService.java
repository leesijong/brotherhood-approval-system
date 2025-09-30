package com.brotherhood.approval.service;

import com.brotherhood.approval.dto.auth.LoginRequest;
import com.brotherhood.approval.dto.auth.LoginResponse;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 인증 서비스 - 기본 Spring Security 사용
 * 
 * @author Brotherhood Development Team
 * @version 3.0.0
 * @since 2024-09-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * 사용자 로그인
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("사용자 로그인 시도: {}", request.getUsername());
        
        try {
            // 사용자 조회 (기본 정보만)
            log.info("로그인 ID로 사용자 조회 시도: {}", request.getUsername());
            User user = userRepository.findByLoginId(request.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다"));
            log.info("사용자 조회 성공: {}", user.getLoginId());
            
            if (!user.getIsActive()) {
                throw new IllegalArgumentException("비활성화된 사용자입니다");
            }
            
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다");
            }
            
            // 로그인 시간 업데이트
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
            
                log.info("사용자 로그인 성공: {}", user.getName());
            
            return LoginResponse.builder()
                    .accessToken("SESSION_BASED") // 세션 기반이므로 토큰 대신 세션 사용
                    .refreshToken("SESSION_BASED")
                    .tokenType("Session")
                    .expiresIn(3600L) // 1시간
                .userInfo(LoginResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .username(user.getLoginId())
                        .email(user.getEmail())
                        .firstName(user.getName())
                        .lastName("")
                        .baptismalName(user.getBaptismalName())
                        .displayName(user.getName() + " (" + user.getBaptismalName() + ")")
                        .branchId(null) // 임시로 null 설정
                        .branchName(null) // 임시로 null 설정
                        .roles(List.of("USER")) // 임시로 기본 역할 설정
                        .isActive(user.getIsActive())
                        .build())
                    .build();
                    
        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생: {}", e.getMessage(), e);
            throw new IllegalArgumentException("로그인 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 로그아웃
     */
    @Transactional
    public void logout() {
        log.info("사용자 로그아웃");
        // 세션 기반이므로 Spring Security가 자동으로 처리
    }
    
    /**
     * 사용자 역할 조회 (별도 쿼리 사용)
     */
    private List<String> getUserRoles(User user) {
        try {
            // 별도 쿼리로 역할 조회하여 Lazy Loading 문제 방지
            List<String> roles = userRepository.findRoleNamesByUserId(user.getId());
            return roles.isEmpty() ? List.of("USER") : roles;
        } catch (Exception e) {
            log.warn("사용자 역할 조회 중 오류 발생: {}", e.getMessage());
            return List.of("USER");
        }
    }
}