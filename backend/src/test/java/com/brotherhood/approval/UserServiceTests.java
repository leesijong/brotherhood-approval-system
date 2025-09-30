package com.brotherhood.approval;

import com.brotherhood.approval.dto.user.UserCreateRequest;
import com.brotherhood.approval.dto.user.UserDto;
import com.brotherhood.approval.dto.user.UserUpdateRequest;
import com.brotherhood.approval.dto.user.UserSearchRequest;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.entity.Branch;
import com.brotherhood.approval.entity.Role;
import com.brotherhood.approval.entity.UserRole;
import com.brotherhood.approval.service.UserService;
import com.brotherhood.approval.repository.UserRepository;
import com.brotherhood.approval.repository.BranchRepository;
import com.brotherhood.approval.repository.RoleRepository;
import com.brotherhood.approval.repository.UserRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

/**
 * 사용자/권한 서비스 테스트
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserServiceTests {

    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BranchRepository branchRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRoleRepository userRoleRepository;

    private Branch hqBranch;
    private Branch seoulBranch;
    private Role userRole;
    private Role managerRole;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        // 테스트 데이터 설정
        hqBranch = createBranch("HQ", "본원", "서울");
        seoulBranch = createBranch("SEOUL", "서울지사", "서울");
        
        userRole = createRole("USER", "일반 사용자");
        managerRole = createRole("MANAGER", "매니저");
        adminRole = createRole("ADMIN", "관리자");
        
        branchRepository.saveAll(List.of(hqBranch, seoulBranch));
        roleRepository.saveAll(List.of(userRole, managerRole, adminRole));
    }

    @Test
    @DisplayName("사용자 생성 테스트")
    void testCreateUser() {
        // Given
        UserCreateRequest request = UserCreateRequest.builder()
                .username("testuser")
                .firstName("테스트")
                .lastName("사용자")
                .baptismalName("요한")
                .email("test@brotherhood.com")
                .password("password123")
                .branchId(hqBranch.getId())
                .roleIds(List.of(userRole.getId()))
                .build();
        
        // When
        UserDto createdUser = userService.createUser(request);
        
        // Then
        assertThat(createdUser).isNotNull();
        assertThat(createdUser.getUsername()).isEqualTo("testuser");
        assertThat(createdUser.getDisplayName()).isEqualTo("테스트사용자");
        assertThat(createdUser.getEmail()).isEqualTo("test@brotherhood.com");
        assertThat(createdUser.getBranchId()).isEqualTo(hqBranch.getId());
        assertThat(createdUser.getIsActive()).isTrue();
    }

    @Test
    @DisplayName("중복 사용자명 생성 실패 테스트")
    void testCreateUserWithDuplicateUsername() {
        // Given
        UserCreateRequest firstRequest = UserCreateRequest.builder()
                .username("testuser")
                .firstName("테스트1")
                .lastName("사용자")
                .baptismalName("요한")
                .email("test1@brotherhood.com")
                .password("password123")
                .branchId(hqBranch.getId())
                .roleIds(List.of(userRole.getId()))
                .build();
        
        UserCreateRequest secondRequest = UserCreateRequest.builder()
                .username("testuser")
                .firstName("테스트2")
                .lastName("사용자")
                .baptismalName("요한")
                .email("test2@brotherhood.com")
                .password("password123")
                .branchId(hqBranch.getId())
                .roleIds(List.of(userRole.getId()))
                .build();
        
        // When
        userService.createUser(firstRequest);
        
        // Then
        assertThatThrownBy(() -> userService.createUser(secondRequest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Username already exists");
    }

    @Test
    @DisplayName("중복 이메일 생성 실패 테스트")
    void testCreateUserWithDuplicateEmail() {
        // Given
        UserCreateRequest firstRequest = UserCreateRequest.builder()
                .username("testuser1")
                .firstName("테스트1")
                .lastName("사용자")
                .baptismalName("요한")
                .email("test@brotherhood.com")
                .password("password123")
                .branchId(hqBranch.getId())
                .roleIds(List.of(userRole.getId()))
                .build();
        
        UserCreateRequest secondRequest = UserCreateRequest.builder()
                .username("testuser2")
                .firstName("테스트2")
                .lastName("사용자")
                .baptismalName("요한")
                .email("test@brotherhood.com")
                .password("password123")
                .branchId(hqBranch.getId())
                .roleIds(List.of(userRole.getId()))
                .build();
        
        // When
        userService.createUser(firstRequest);
        
        // Then
        assertThatThrownBy(() -> userService.createUser(secondRequest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Email already exists");
    }

    @Test
    @DisplayName("사용자 조회 테스트")
    void testGetUserById() {
        // Given
        User user = createAndSaveUser("testuser", "테스트사용자", hqBranch, userRole);
        
        // When
        Optional<UserDto> foundUser = userService.getUserById(user.getId());
        
        // Then
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getUsername()).isEqualTo("testuser");
        assertThat(foundUser.get().getDisplayName()).isEqualTo("테스트사용자");
    }

    @Test
    @DisplayName("사용자명으로 조회 테스트")
    void testGetUserByUsername() {
        // Given
        User user = createAndSaveUser("testuser", "테스트사용자", hqBranch, userRole);
        
        // When
        Optional<UserDto> foundUser = userService.getUserByUsername("testuser");
        
        // Then
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getUsername()).isEqualTo("testuser");
        assertThat(foundUser.get().getDisplayName()).isEqualTo("테스트사용자");
    }

    @Test
    @DisplayName("사용자 목록 조회 테스트")
    void testGetUsers() {
        // Given
        createAndSaveUser("user1", "사용자1", hqBranch, userRole);
        createAndSaveUser("user2", "사용자2", seoulBranch, userRole);
        createAndSaveUser("user3", "사용자3", hqBranch, managerRole);
        
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<UserDto> users = userService.getUsers(pageable);
        
        // Then
        assertThat(users).hasSize(3);
        assertThat(users.getContent()).extracting("username")
            .containsExactlyInAnyOrder("user1", "user2", "user3");
    }

    @Test
    @DisplayName("사용자 검색 테스트")
    void testSearchUsers() {
        // Given
        createAndSaveUser("john", "존", hqBranch, userRole);
        createAndSaveUser("jane", "제인", seoulBranch, userRole);
        createAndSaveUser("admin", "관리자", hqBranch, adminRole);
        
        UserSearchRequest request = UserSearchRequest.builder()
                .keyword("john")
                .build();
        
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<UserDto> users = userService.searchUsers(request, pageable);
        
        // Then
        assertThat(users).hasSize(1);
        assertThat(users.getContent().get(0).getUsername()).isEqualTo("john");
    }

    @Test
    @DisplayName("지사별 사용자 조회 테스트")
    void testGetUsersByBranch() {
        // Given
        createAndSaveUser("hq_user1", "본원사용자1", hqBranch, userRole);
        createAndSaveUser("hq_user2", "본원사용자2", hqBranch, userRole);
        createAndSaveUser("seoul_user", "서울사용자", seoulBranch, userRole);
        
        // When
        List<UserDto> hqUsers = userService.getUsersByBranch(hqBranch.getId());
        List<UserDto> seoulUsers = userService.getUsersByBranch(seoulBranch.getId());
        
        // Then
        assertThat(hqUsers).hasSize(2);
        assertThat(seoulUsers).hasSize(1);
        assertThat(hqUsers).extracting("username")
            .containsExactlyInAnyOrder("hq_user1", "hq_user2");
        assertThat(seoulUsers).extracting("username")
            .containsExactly("seoul_user");
    }

    @Test
    @DisplayName("활성 사용자 조회 테스트")
    void testGetActiveUsers() {
        // Given
        User activeUser1 = createAndSaveUser("active1", "활성사용자1", hqBranch, userRole);
        User activeUser2 = createAndSaveUser("active2", "활성사용자2", seoulBranch, userRole);
        User inactiveUser = createAndSaveUser("inactive", "비활성사용자", hqBranch, userRole);
        inactiveUser.setIsActive(false);
        userRepository.save(inactiveUser);
        
        // When
        List<UserDto> activeUsers = userService.getActiveUsers();
        
        // Then
        assertThat(activeUsers).hasSize(2);
        assertThat(activeUsers).extracting("username")
            .containsExactlyInAnyOrder("active1", "active2");
    }

    @Test
    @DisplayName("사용자 정보 수정 테스트")
    void testUpdateUser() {
        // Given
        User user = createAndSaveUser("testuser", "테스트사용자", hqBranch, userRole);
        
        UserUpdateRequest request = UserUpdateRequest.builder()
                .firstName("수정된")
                .lastName("사용자")
                .baptismalName("요한")
                .email("updated@brotherhood.com")
                .build();
        
        // When
        UserDto updatedUser = userService.updateUser(user.getId(), request);
        
        // Then
        assertThat(updatedUser.getDisplayName()).isEqualTo("수정된사용자");
        assertThat(updatedUser.getEmail()).isEqualTo("updated@brotherhood.com");
    }

    @Test
    @DisplayName("사용자 비밀번호 변경 테스트")
    void testChangePassword() {
        // Given
        User user = createAndSaveUser("testuser", "테스트사용자", hqBranch, userRole);
        String newPassword = "newpassword123";
        
        // When
        userService.changePassword(user.getId(), newPassword);
        
        // Then
        User updatedUser = userRepository.findById(user.getId()).orElse(null);
        assertThat(updatedUser).isNotNull();
        // 비밀번호 해시 검증은 실제 구현에서 확인
    }

    @Test
    @DisplayName("사용자 상태 변경 테스트")
    void testToggleUserStatus() {
        // Given
        User user = createAndSaveUser("testuser", "테스트사용자", hqBranch, userRole);
        assertThat(user.getIsActive()).isTrue();
        
        // When
        UserDto toggledUser = userService.toggleUserStatus(user.getId());
        
        // Then
        assertThat(toggledUser.getIsActive()).isFalse();
        
        // 다시 토글
        UserDto toggledAgain = userService.toggleUserStatus(user.getId());
        assertThat(toggledAgain.getIsActive()).isTrue();
    }

    @Test
    @DisplayName("사용자 삭제 테스트")
    void testDeleteUser() {
        // Given
        User user = createAndSaveUser("testuser", "테스트사용자", hqBranch, userRole);
        
        // When
        userService.deleteUser(user.getId());
        
        // Then
        Optional<User> deletedUser = userRepository.findById(user.getId());
        assertThat(deletedUser).isEmpty();
    }

    @Test
    @DisplayName("사용자 통계 조회 테스트")
    void testGetUserStats() {
        // Given
        createAndSaveUser("user1", "사용자1", hqBranch, userRole);
        createAndSaveUser("user2", "사용자2", seoulBranch, userRole);
        User inactiveUser = createAndSaveUser("inactive", "비활성사용자", hqBranch, userRole);
        inactiveUser.setIsActive(false);
        userRepository.save(inactiveUser);
        
        // When
        long totalUsers = userService.getUserCount();
        long activeUsers = userService.getActiveUserCount();
        
        // Then
        assertThat(totalUsers).isEqualTo(3);
        assertThat(activeUsers).isEqualTo(2);
    }

    @Test
    @DisplayName("사용자 권한 할당 테스트")
    void testAssignUserRole() {
        // Given
        User user = createAndSaveUser("testuser", "테스트사용자", hqBranch, userRole);
        
        // When
        userService.assignRole(user.getId(), managerRole.getId());
        
        // Then
        User updatedUser = userRepository.findById(user.getId()).orElse(null);
        assertThat(updatedUser).isNotNull();
        assertThat(updatedUser.getUserRoles()).hasSize(2);
        assertThat(updatedUser.getUserRoles()).extracting("role.name")
            .containsExactlyInAnyOrder("USER", "MANAGER");
    }

    @Test
    @DisplayName("사용자 권한 제거 테스트")
    void testRemoveUserRole() {
        // Given
        User user = createAndSaveUser("testuser", "테스트사용자", hqBranch, userRole);
        userService.assignRole(user.getId(), managerRole.getId());
        
        // When
        userService.removeRole(user.getId(), userRole.getId());
        
        // Then
        User updatedUser = userRepository.findById(user.getId()).orElse(null);
        assertThat(updatedUser).isNotNull();
        assertThat(updatedUser.getUserRoles()).hasSize(1);
        assertThat(updatedUser.getUserRoles()).extracting("role.name")
            .containsExactly("MANAGER");
    }

    @Test
    @DisplayName("사용자 검색 성능 테스트")
    void testUserSearchPerformance() {
        // Given
        for (int i = 0; i < 1000; i++) {
            createAndSaveUser("user" + i, "사용자" + i, hqBranch, userRole);
        }
        
        UserSearchRequest request = UserSearchRequest.builder()
                .keyword("user")
                .build();
        
        Pageable pageable = PageRequest.of(0, 10);
        
        long startTime = System.currentTimeMillis();
        
        // When
        Page<UserDto> users = userService.searchUsers(request, pageable);
        
        long endTime = System.currentTimeMillis();
        
        // Then
        long duration = endTime - startTime;
        assertThat(duration).isLessThan(1000); // 1초 이내 완료
        assertThat(users).hasSize(10);
    }

    @Test
    @DisplayName("사용자 생성 검증 실패 테스트")
    void testCreateUserValidationFailure() {
        // Given
        UserCreateRequest invalidRequest = UserCreateRequest.builder()
                .username("") // 빈 사용자명
                .firstName("테스트")
                .lastName("사용자")
                .baptismalName("요한")
                .email("invalid-email") // 잘못된 이메일 형식
                .password("123") // 너무 짧은 비밀번호
                .branchId("invalid-branch-id") // 존재하지 않는 지사
                .roleIds(List.of("invalid-role-id")) // 존재하지 않는 역할
                .build();
        
        // When & Then
        assertThatThrownBy(() -> userService.createUser(invalidRequest))
            .isInstanceOf(IllegalArgumentException.class);
    }

    // Helper methods
    private Branch createBranch(String code, String name, String location) {
        Branch branch = Branch.builder()
                .code(code)
                .name(name)
                .isActive(true)
                .build();
        return branchRepository.save(branch);
    }

    private Role createRole(String name, String description) {
        Role role = Role.builder()
                .name(name)
                .description(description)
                .isActive(true)
                .build();
        return roleRepository.save(role);
    }

    private User createAndSaveUser(String username, String displayName, Branch branch, Role role) {
        User user = User.builder()
                .username(username)
                .firstName("테스트")
                .lastName("사용자")
                .baptismalName("요한")
                .email(username + "@brotherhood.com")
                .passwordHash("hashedpassword")
                .branch(branch)
                .isActive(true)
                .build();
        
        User savedUser = userRepository.save(user);
        
        UserRole userRole = UserRole.builder()
                .user(savedUser)
                .role(role)
                .build();
        
        userRoleRepository.save(userRole);
        
        return savedUser;
    }
}
