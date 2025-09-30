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
        
        // API 경로는 정적 리소스가 아님을 명시
        registry.addResourceHandler("/api/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0);
    }
}

