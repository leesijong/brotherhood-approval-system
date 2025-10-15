package com.brotherhood.approval.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

/**
 * JWT 토큰 생성 및 검증 유틸리티
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2025-10-15
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;

    public JwtTokenProvider(
            @Value("${jwt.secret:brotherhood-approval-system-secret-key-change-this-in-production-min-256-bits}") String secret,
            @Value("${jwt.access-token-validity:3600000}") long accessTokenValidity,
            @Value("${jwt.refresh-token-validity:86400000}") long refreshTokenValidity) {
        
        // 시크릿 키가 충분히 길지 않으면 패딩 추가
        String paddedSecret = secret;
        while (paddedSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            paddedSecret += secret;
        }
        
        this.secretKey = Keys.hmacShaKeyFor(paddedSecret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValidityInMilliseconds = accessTokenValidity;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidity;
        
        log.info("JwtTokenProvider 초기화 완료 - Access Token 유효기간: {}ms, Refresh Token 유효기간: {}ms", 
                accessTokenValidity, refreshTokenValidity);
    }

    /**
     * Access Token 생성
     */
    public String createAccessToken(String userId, String username, List<String> roles) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityInMilliseconds);

        return Jwts.builder()
                .subject(userId)
                .claim("username", username)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(validity)
                .signWith(secretKey)
                .compact();
    }

    /**
     * Refresh Token 생성
     */
    public String createRefreshToken(String userId) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidityInMilliseconds);

        return Jwts.builder()
                .subject(userId)
                .issuedAt(now)
                .expiration(validity)
                .signWith(secretKey)
                .compact();
    }

    /**
     * 토큰에서 사용자 ID 추출
     */
    public String getUserIdFromToken(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * 토큰에서 사용자명 추출
     */
    public String getUsernameFromToken(String token) {
        return getClaims(token).get("username", String.class);
    }

    /**
     * 토큰에서 역할 추출
     */
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        return getClaims(token).get("roles", List.class);
    }

    /**
     * 토큰 유효성 검증
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("토큰 검증 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 토큰에서 Claims 추출
     */
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 토큰 만료 시간 조회
     */
    public Date getExpirationDate(String token) {
        return getClaims(token).getExpiration();
    }

    /**
     * 토큰이 만료되었는지 확인
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDate(token);
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }
}

