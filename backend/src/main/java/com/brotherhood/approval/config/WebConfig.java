package com.brotherhood.approval.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 설정
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-22
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 정적 리소스 경로를 명시적으로 설정
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        
        registry.addResourceHandler("/public/**")
                .addResourceLocations("classpath:/public/");
        
        // API 경로는 리소스 핸들러에서 제외 (Controller가 처리)
        // registry.addResourceHandler("/api/**") 제거!
    }
}

