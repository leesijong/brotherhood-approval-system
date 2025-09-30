package com.brotherhood.approval.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/**
 * 메서드 레벨 보안 설정
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Configuration
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class MethodSecurityConfig {
    
    // 메서드 레벨 보안 어노테이션 사용 가능:
    // @PreAuthorize, @PostAuthorize, @Secured, @RolesAllowed
}

