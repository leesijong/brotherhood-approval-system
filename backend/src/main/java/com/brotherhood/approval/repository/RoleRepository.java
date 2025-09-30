package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 역할 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    
    /**
     * 역할명으로 조회
     */
    Optional<Role> findByName(String name);
    
    /**
     * 활성 역할만 조회
     */
    List<Role> findByIsActiveTrue();
    
    /**
     * 역할명 중복 확인
     */
    boolean existsByName(String name);
    
    /**
     * 사용자별 역할 조회
     */
    @Query("SELECT r FROM Role r JOIN r.userRoles ur WHERE ur.user.id = :userId AND ur.isActive = true")
    List<Role> findByUserId(@Param("userId") String userId);
    
    /**
     * 활성 역할 수 조회
     */
    long countByIsActiveTrue();
}

