package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.Branch;
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
 * 지사 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID> {
    
    /**
     * 지사 코드로 조회
     */
    Optional<Branch> findByCode(String code);
    
    /**
     * 활성 지사만 조회
     */
    List<Branch> findByIsActiveTrue();
    
    /**
     * 지사명으로 검색
     */
    @Query("SELECT b FROM Branch b WHERE " +
           "(b.name LIKE %:keyword% OR b.code LIKE %:keyword%) AND b.isActive = true")
    Page<Branch> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * 지사 코드 중복 확인
     */
    boolean existsByCode(String code);
    
    /**
     * 활성 지사 수 조회
     */
    long countByIsActiveTrue();
    
    /**
     * 지사별 사용자 수 조회
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.branch.id = :branchId AND u.isActive = true")
    long countActiveUsersByBranchId(@Param("branchId") UUID branchId);
}

