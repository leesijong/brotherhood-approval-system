package com.brotherhood.approval.service;

import com.brotherhood.approval.dto.auth.LoginRequest;
import com.brotherhood.approval.dto.auth.LoginResponse;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.repository.UserRepository;
import com.brotherhood.approval.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 인증 서비스 - JWT 기반 인증
 * 
 * @author Brotherhood Development Team
 * @version 4.0.0
 * @since 2025-10-15
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    /**
     * 사용자 로그인 - JWT 토큰 생성
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("사용자 로그인 시도: {}", request.getUsername());
        
        try {
            // 사용자 조회 (역할 정보 포함)
            log.info("로그인 ID로 사용자 조회 시도: {}", request.getUsername());
            User user = userRepository.findByLoginIdWithRoles(request.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다"));
            log.info("사용자 조회 성공: {}", user.getLoginId());
            
            if (!user.getIsActive()) {
                throw new IllegalArgumentException("비활성화된 사용자입니다");
            }
            
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다");
            }
            
            // 사용자 역할 조회
            List<String> roles = getUserRoles(user);
            log.info("사용자 역할: {}", roles);
            
            // JWT 토큰 생성
            String accessToken = jwtTokenProvider.createAccessToken(
                user.getId().toString(), 
                user.getLoginId(), 
                roles
            );
            String refreshToken = jwtTokenProvider.createRefreshToken(user.getId().toString());
            
            // 로그인 시간 업데이트
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
            
            log.info("사용자 로그인 성공: {} (역할: {})", user.getName(), roles);
            
            // Branch 정보 안전하게 조회
            String branchId = user.getBranch() != null ? user.getBranch().getId().toString() : null;
            String branchName = user.getBranch() != null ? user.getBranch().getName() : null;
            
            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(3600L) // 1시간
                .userInfo(LoginResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .username(user.getLoginId())
                        .email(user.getEmail())
                        .firstName(user.getName())
                        .lastName("")
                        .baptismalName(user.getBaptismalName())
                        .displayName(user.getName() + " (" + user.getBaptismalName() + ")")
                        .branchId(branchId)
                        .branchName(branchName)
                        .roles(roles)
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
     * 사용자 역할 조회
     */
    private List<String> getUserRoles(User user) {
        try {
            // UserRoles에서 역할 이름 추출
            if (user.getUserRoles() != null && !user.getUserRoles().isEmpty()) {
                List<String> roles = user.getUserRoles().stream()
                        .filter(ur -> ur.getIsActive())
                        .map(ur -> ur.getRole().getName())
                        .collect(Collectors.toList());
                
                if (!roles.isEmpty()) {
                    return roles;
                }
            }
            
            // 역할이 없으면 기본 USER 역할 부여
            log.warn("사용자 {}에게 할당된 역할이 없습니다. 기본 USER 역할 부여", user.getLoginId());
            return List.of("USER");
        } catch (Exception e) {
            log.error("사용자 역할 조회 중 오류 발생: {}", e.getMessage(), e);
            return List.of("USER");
        }
    }
}