package com.brotherhood.approval;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 한국순교복자수도회 내부결재 시스템
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@SpringBootApplication(scanBasePackages = "com.brotherhood.approval")
@EnableJpaAuditing
public class ApprovalSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApprovalSystemApplication.class, args);
    }
}

