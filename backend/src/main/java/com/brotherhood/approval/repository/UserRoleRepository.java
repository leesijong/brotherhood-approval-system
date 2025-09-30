package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 사용자-역할 매핑 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {
    
    /**
     * 사용자별 활성 역할 조회
     */
    List<UserRole> findByUserIdAndIsActiveTrue(UUID userId);
    
    /**
     * 역할별 활성 사용자 조회
     */
    List<UserRole> findByRoleIdAndIsActiveTrue(UUID roleId);
    
    /**
     * 사용자-역할 매핑 조회
     */
    Optional<UserRole> findByUserIdAndRoleId(UUID userId, UUID roleId);
    
    /**
     * 사용자-역할 매핑 존재 확인
     */
    boolean existsByUserIdAndRoleIdAndIsActiveTrue(UUID userId, UUID roleId);
    
    /**
     * 사용자의 특정 역할 확인
     */
    @Query("SELECT COUNT(ur) > 0 FROM UserRole ur WHERE ur.user.id = :userId AND ur.role.name = :roleName AND ur.isActive = true")
    boolean existsByUserIdAndRoleName(@Param("userId") UUID userId, @Param("roleName") String roleName);
    
    /**
     * 사용자의 모든 역할명 조회
     */
    @Query("SELECT r.name FROM Role r JOIN r.userRoles ur WHERE ur.user.id = :userId AND ur.isActive = true")
    List<String> findRoleNamesByUserId(@Param("userId") UUID userId);
    
    /**
     * 사용자별 활성 역할 수 조회
     */
    long countByUserIdAndIsActiveTrue(UUID userId);
}

