package com.brotherhood.approval.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

/**
 * Railway PostgreSQL 연결 설정
 * Railway의 DATABASE_URL을 Spring Boot 형식으로 변환
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2025-10-01
 */
@Slf4j
@Configuration
@Profile("prod")
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        // Railway DATABASE_URL이 있는 경우
        if (databaseUrl != null && !databaseUrl.isEmpty() && databaseUrl.startsWith("postgresql://")) {
            log.info("Railway PostgreSQL 감지됨. URL 변환 중...");
            
            try {
                // postgresql://user:password@host:port/database 파싱
                String urlWithoutProtocol = databaseUrl.replace("postgresql://", "");
                String[] parts = urlWithoutProtocol.split("@");
                
                if (parts.length == 2) {
                    String[] credentials = parts[0].split(":");
                    String username = credentials[0];
                    String password = credentials.length > 1 ? credentials[1] : "";
                    String hostAndDb = parts[1];
                    
                    // jdbc:postgresql://host:port/database 형식으로 재구성
                    String jdbcUrl = "jdbc:postgresql://" + hostAndDb;
                    
                    config.setJdbcUrl(jdbcUrl);
                    config.setUsername(username);
                    config.setPassword(password);
                    
                    log.info("변환된 JDBC URL: {}", jdbcUrl);
                    log.info("PostgreSQL 연결 정보 설정 완료: username={}", username);
                } else {
                    log.error("DATABASE_URL 형식이 올바르지 않습니다: {}", databaseUrl);
                    throw new IllegalArgumentException("Invalid DATABASE_URL format");
                }
            } catch (Exception e) {
                log.error("URL 파싱 중 오류 발생: {}", e.getMessage(), e);
                throw e;
            }
            
        } else {
            // DATABASE_URL이 없거나 PostgreSQL이 아닌 경우 H2 fallback
            log.warn("DATABASE_URL이 없거나 PostgreSQL 형식이 아닙니다. H2 인메모리 데이터베이스 사용");
            
            config.setJdbcUrl("jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
            config.setUsername("sa");
            config.setPassword("");
            config.setDriverClassName("org.h2.Driver");
        }
        
        // HikariCP 최적화 설정
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(5);
        config.setConnectionTimeout(30000); // 30초
        config.setIdleTimeout(600000); // 10분
        config.setMaxLifetime(1800000); // 30분
        config.setConnectionTestQuery("SELECT 1");
        
        return new HikariDataSource(config);
    }
}

