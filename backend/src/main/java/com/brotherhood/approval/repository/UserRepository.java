package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.entity.Role;
import com.brotherhood.approval.entity.Branch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 사용자 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    /**
     * 이름으로 사용자 조회
     */
    Optional<User> findByName(String name);
    
    /**
     * 로그인 ID로 사용자 조회 (기본 정보만)
     */
    @Query("SELECT u FROM User u WHERE u.loginId = :loginId")
    Optional<User> findByLoginId(@Param("loginId") String loginId);
    
    /**
     * 로그인 ID로 사용자 조회 (역할 정보 포함)
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.userRoles ur LEFT JOIN FETCH ur.role r WHERE u.loginId = :loginId")
    Optional<User> findByLoginIdWithRoles(@Param("loginId") String loginId);
    
    /**
     * 이름으로 사용자 조회 (역할 정보 포함)
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.userRoles ur LEFT JOIN FETCH ur.role r WHERE u.name = :name")
    Optional<User> findByNameWithRoles(@Param("name") String name);
    
    /**
     * ID로 사용자 조회 (역할 정보 포함)
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.userRoles ur LEFT JOIN FETCH ur.role r WHERE u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") UUID id);
    
    /**
     * 모든 사용자 조회 (역할 정보 포함)
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.userRoles ur LEFT JOIN FETCH ur.role r")
    List<User> findAllWithRoles();
    
    /**
     * 이메일로 사용자 조회
     */
    Optional<User> findByEmail(String email);
    
    /**
     * 세례명으로 사용자 조회
     */
    Optional<User> findByBaptismalName(String baptismalName);
    
    /**
     * 활성 사용자만 조회
     */
    List<User> findByIsActiveTrue();
    
    /**
     * 지사별 활성 사용자 조회
     */
    List<User> findByBranchIdAndIsActiveTrue(UUID branchId);
    
    /**
     * 이름 또는 이메일로 검색
     */
    @Query("SELECT u FROM User u WHERE " +
           "(u.name LIKE %:keyword% OR u.email LIKE %:keyword% OR " +
           "u.baptismalName LIKE %:keyword%) AND u.isActive = true")
    Page<User> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * 지사별 사용자 검색
     */
    @Query("SELECT u FROM User u WHERE u.branch.id = :branchId AND " +
           "(u.name LIKE %:keyword% OR u.email LIKE %:keyword% OR " +
           "u.baptismalName LIKE %:keyword%) AND u.isActive = true")
    Page<User> findByBranchIdAndKeyword(@Param("branchId") UUID branchId, 
                                       @Param("keyword") String keyword, 
                                       Pageable pageable);
    
    /**
     * 이름 중복 확인
     */
    boolean existsByName(String name);
    
    /**
     * 로그인 ID 중복 확인
     */
    boolean existsByLoginId(String loginId);
    
    /**
     * 이메일 중복 확인
     */
    boolean existsByEmail(String email);
    
    /**
     * 세례명 중복 확인
     */
    boolean existsByBaptismalName(String baptismalName);
    
    /**
     * 지사별 사용자 수 조회
     */
    long countByBranchIdAndIsActiveTrue(UUID branchId);
    
    /**
     * 활성 사용자 수 조회
     */
    long countByIsActiveTrue();
    
    /**
     * 역할과 지사별 사용자 조회
     */
    @Query("SELECT u FROM User u " +
           "JOIN u.userRoles ur " +
           "WHERE ur.role = :role AND u.branch = :branch")
    List<User> findByRoleAndBranch(@Param("role") Role role, @Param("branch") Branch branch);
    
    /**
     * 역할별 사용자 조회
     */
    @Query("SELECT u FROM User u " +
           "JOIN u.userRoles ur " +
           "WHERE ur.role.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);
    
    /**
     * 지사별 역할별 사용자 조회
     */
    @Query("SELECT u FROM User u " +
           "JOIN u.userRoles ur " +
           "WHERE ur.role.name = :roleName AND u.branch.id = :branchId")
    List<User> findByRoleNameAndBranchId(@Param("roleName") String roleName, @Param("branchId") UUID branchId);
    
    
    /**
     * 비활성 사용자 조회
     */
    List<User> findByIsActiveFalse();
    
    /**
     * 마지막 로그인 기간별 사용자 조회
     */
    @Query("SELECT u FROM User u WHERE " +
           "u.lastLoginAt BETWEEN :startDate AND :endDate")
    List<User> findByLastLoginAtBetween(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);
    
    /**
     * 사용자 ID로 역할명 조회 (Lazy Loading 문제 해결용)
     */
    @Query("SELECT DISTINCT r.name FROM User u " +
           "JOIN u.userRoles ur " +
           "JOIN ur.role r " +
           "WHERE u.id = :userId AND ur.isActive = true")
    List<String> findRoleNamesByUserId(@Param("userId") UUID userId);
}

