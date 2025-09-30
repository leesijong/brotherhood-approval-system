package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.Policy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 정책 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface PolicyRepository extends JpaRepository<Policy, UUID> {
    
    /**
     * 정책명으로 조회
     */
    Optional<Policy> findByName(String name);
    
    /**
     * 활성 정책만 조회
     */
    List<Policy> findByIsActiveTrue();
    
    /**
     * 정책 타입별 조회
     */
    List<Policy> findByPolicyType(String policyType);
    
    /**
     * 활성 정책 타입별 조회
     */
    List<Policy> findByPolicyTypeAndIsActiveTrue(String policyType);
    
    /**
     * 생성자별 정책 조회
     */
    @Query("SELECT p FROM Policy p WHERE p.createdBy.id = :createdById")
    Page<Policy> findByCreatedById(@Param("createdById") String createdById, Pageable pageable);
    
    /**
     * 정책 검색 (이름, 설명)
     */
    @Query("SELECT p FROM Policy p WHERE " +
           "(p.name LIKE %:keyword% OR p.description LIKE %:keyword%) AND " +
           "p.isActive = true")
    Page<Policy> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    
    /**
     * 유효한 정책 조회 (활성 정책만)
     */
    @Query("SELECT p FROM Policy p WHERE p.isActive = true")
    List<Policy> findValidPolicies();
    
    /**
     * 타입별 유효한 정책 조회
     */
    @Query("SELECT p FROM Policy p WHERE p.policyType = :policyType AND p.isActive = true")
    List<Policy> findValidPoliciesByType(@Param("policyType") String policyType);
    
    
    
    /**
     * 정책명 중복 확인
     */
    boolean existsByName(String name);
    
    /**
     * 활성 정책 수 조회
     */
    long countByIsActiveTrue();
    
    /**
     * 타입별 정책 수 조회
     */
    long countByPolicyType(String policyType);
    
    /**
     * 생성자별 정책 수 조회
     */
    @Query("SELECT COUNT(p) FROM Policy p WHERE p.createdBy.id = :createdById")
    long countByCreatedById(@Param("createdById") String createdById);
    
}

