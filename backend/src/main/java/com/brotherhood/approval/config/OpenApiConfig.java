package com.brotherhood.approval.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 설정
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Configuration
public class OpenApiConfig {

    @Value("${spring.application.name:approval-system}")
    private String applicationName;

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort + "/api")
                                .description("개발 서버"),
                        new Server()
                                .url("https://api.brotherhood-approval.com/api")
                                .description("운영 서버")
                ))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("Bearer Authentication", createAPIKeyScheme()));
    }

    private Info apiInfo() {
        return new Info()
                .title("한국순교복자수도회 결재 시스템 API")
                .description("""
                        한국순교복자수도회의 전자결재 시스템 API 문서입니다.
                        
                        ## 주요 기능
                        - 사용자 인증 및 권한 관리
                        - 문서 생성, 수정, 삭제, 검색
                        - 결재선 설정 및 결재 프로세스 관리
                        - 첨부파일 업로드/다운로드
                        - 알림 및 대시보드
                        
                        ## 인증
                        JWT 토큰을 사용한 인증이 필요합니다.
                        로그인 후 받은 토큰을 Authorization 헤더에 포함하여 요청하세요.
                        
                        ```
                        Authorization: Bearer <your-jwt-token>
                        ```
                        
                        ## 권한
                        - **ADMIN**: 모든 기능 접근 가능
                        - **MANAGER**: 결재선 설정, 사용자 관리 가능
                        - **USER**: 기본 사용자 기능
                        
                        ## 응답 형식
                        모든 API는 표준화된 응답 형식을 사용합니다:
                        
                        ```json
                        {
                          "success": true,
                          "message": "성공 메시지",
                          "data": { ... },
                          "errorCode": null,
                          "timestamp": "2024-09-17T10:30:00"
                        }
                        ```
                        """)
                .version("1.0.0")
                .contact(new Contact()
                        .name("Brotherhood Development Team")
                        .email("dev@brotherhood-approval.com")
                        .url("https://brotherhood-approval.com"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));
    }

    private SecurityScheme createAPIKeyScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .bearerFormat("JWT")
                .scheme("bearer")
                .description("JWT 토큰을 입력하세요. 로그인 API를 통해 토큰을 발급받을 수 있습니다.");
    }
}
