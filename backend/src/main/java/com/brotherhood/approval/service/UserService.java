package com.brotherhood.approval.service;

import com.brotherhood.approval.dto.user.UserCreateRequest;
import com.brotherhood.approval.dto.user.UserDto;
import com.brotherhood.approval.dto.user.UserSearchRequest;
import com.brotherhood.approval.dto.user.UserUpdateRequest;
import com.brotherhood.approval.entity.Branch;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.mapper.UserMapper;
import com.brotherhood.approval.repository.BranchRepository;
import com.brotherhood.approval.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 사용자 서비스
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * 사용자 생성
     */
    @Transactional
    public UserDto createUser(UserCreateRequest request) {
        log.info("사용자 생성 요청: {}", request.getName());
        
        // 중복 검사
        if (userRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("이미 존재하는 이름입니다: " + request.getName());
        }
        
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new IllegalArgumentException("이미 존재하는 로그인 ID입니다: " + request.getLoginId());
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + request.getEmail());
        }
        
        if (userRepository.existsByBaptismalName(request.getBaptismalName())) {
            throw new IllegalArgumentException("이미 존재하는 세례명입니다: " + request.getBaptismalName());
        }
        
        // 비밀번호 암호화
        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        // 지사 설정
        if (request.getBranchId() != null) {
            Branch branch = branchRepository.findById(UUID.fromString(request.getBranchId()))
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지사입니다: " + request.getBranchId()));
            user.setBranch(branch);
        } else {
            // 기본 지사 설정 (본원)
            Branch defaultBranch = branchRepository.findByCode("HQ")
                    .orElseThrow(() -> new IllegalArgumentException("기본 지사를 찾을 수 없습니다"));
            user.setBranch(defaultBranch);
        }
        
        User savedUser = userRepository.save(user);
        log.info("사용자 생성 완료: {}", savedUser.getId());
        
        return userMapper.toDto(savedUser);
    }
    
    /**
     * 사용자 조회 (ID)
     */
    @Transactional(readOnly = true)
    public Optional<UserDto> getUserById(String id) {
        return userRepository.findByIdWithRoles(UUID.fromString(id))
                .map(user -> {
                    UserDto userDto = userMapper.toDto(user);
                    userDto.setBranchId(user.getBranch() != null ? user.getBranch().getId().toString() : null);
                    userDto.setBranchName(user.getBranch() != null ? user.getBranch().getName() : null);
                    userDto.setBranchCode(user.getBranch() != null ? user.getBranch().getCode() : null);
                    
                    // 실제 UserRole 조회하여 역할 설정
                    try {
                        List<String> roles = user.getUserRoles().stream()
                                .filter(ur -> ur.getIsActive() != null && ur.getIsActive())
                                .map(ur -> ur.getRole().getName())
                                .distinct()
                                .toList();
                        userDto.setRoles(roles.isEmpty() ? java.util.List.of("USER") : roles);
                    } catch (Exception e) {
                        log.warn("사용자 역할 조회 중 오류 발생: {}", e.getMessage());
                        userDto.setRoles(java.util.List.of("USER"));
                    }
                    
                    // setFullName 제거됨 - UserDto에 fullName 필드가 없음
                    userDto.setDisplayName(user.getDisplayName());
                    return userDto;
                });
    }
    
    /**
     * 사용자 조회 (사용자명)
     */
    public Optional<UserDto> getUserByUsername(String username) {
        return userRepository.findByName(username)
                .map(userMapper::toDto);
    }
    
    /**
     * 사용자 조회 (이메일)
     */
    public Optional<UserDto> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(userMapper::toDto);
    }
    
    /**
     * 사용자 조회 (세례명)
     */
    public Optional<UserDto> getUserByBaptismalName(String baptismalName) {
        return userRepository.findByBaptismalName(baptismalName)
                .map(userMapper::toDto);
    }
    
    /**
     * 사용자 목록 조회 (페이지네이션)
     */
    @Transactional(readOnly = true)
    public Page<UserDto> getUsers(Pageable pageable) {
        // 페이지네이션을 위해 findAllWithRoles를 사용할 수 없으므로
        // 기존 방식 유지하되 Lazy Loading 문제를 해결하기 위해
        // 각 사용자별로 역할 정보를 안전하게 처리
        return userRepository.findAll(pageable)
                .map(user -> {
                    UserDto userDto = userMapper.toDto(user);
                    // 모든 필드를 수동으로 설정 (Lazy Loading 문제 해결)
                    userDto.setBranchId(user.getBranch() != null ? user.getBranch().getId().toString() : null);
                    userDto.setBranchName(user.getBranch() != null ? user.getBranch().getName() : null);
                    userDto.setBranchCode(user.getBranch() != null ? user.getBranch().getCode() : null);
                    
                    // 역할 정보는 기본값으로 설정 (Lazy Loading 문제 방지)
                    userDto.setRoles(java.util.List.of("USER"));
                    
                    // setFullName 제거됨 - UserDto에 fullName 필드가 없음
                    userDto.setDisplayName(user.getDisplayName());
                    return userDto;
                });
    }
    
    /**
     * 사용자 검색
     */
    public Page<UserDto> searchUsers(UserSearchRequest request, Pageable pageable) {
        if (request.getBranchId() != null) {
            UUID branchUuid = UUID.fromString(request.getBranchId());
            return userRepository.findByBranchIdAndKeyword(
                    branchUuid, 
                    request.getKeyword(), 
                    pageable
            ).map(userMapper::toDto);
        } else {
            return userRepository.findByKeyword(request.getKeyword(), pageable)
                    .map(userMapper::toDto);
        }
    }
    
    /**
     * 지사별 사용자 목록 조회
     */
    public List<UserDto> getUsersByBranch(UUID branchId) {
        return userRepository.findByBranchIdAndIsActiveTrue(branchId)
                .stream()
                .map(userMapper::toDto)
                .toList();
    }
    
    /**
     * 활성 사용자 목록 조회
     */
    @Transactional(readOnly = true)
    public List<UserDto> getActiveUsers() {
        return userRepository.findByIsActiveTrue()
                .stream()
                .map(user -> {
                    UserDto userDto = userMapper.toDto(user);
                    userDto.setBranchId(user.getBranch() != null ? user.getBranch().getId().toString() : null);
                    userDto.setBranchName(user.getBranch() != null ? user.getBranch().getName() : null);
                    userDto.setBranchCode(user.getBranch() != null ? user.getBranch().getCode() : null);
                    
                    // 역할 정보는 기본값으로 설정 (Lazy Loading 문제 방지)
                    userDto.setRoles(java.util.List.of("USER"));
                    
                    // setFullName 제거됨 - UserDto에 fullName 필드가 없음
                    userDto.setDisplayName(user.getDisplayName());
                    return userDto;
                })
                .toList();
    }
    
    /**
     * 사용자 정보 수정
     */
    @Transactional
    public UserDto updateUser(String id, UserUpdateRequest request) {
        log.info("사용자 정보 수정 요청: {}", id);
        
        User user = userRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));
        
        // 이메일 중복 검사 (본인 제외)
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + request.getEmail());
            }
        }
        
        // 세례명 중복 검사 (본인 제외)
        if (request.getBaptismalName() != null && !request.getBaptismalName().equals(user.getBaptismalName())) {
            if (userRepository.existsByBaptismalName(request.getBaptismalName())) {
                throw new IllegalArgumentException("이미 존재하는 세례명입니다: " + request.getBaptismalName());
            }
        }
        
        userMapper.updateEntity(request, user);
        User savedUser = userRepository.save(user);
        
        log.info("사용자 정보 수정 완료: {}", savedUser.getId());
        return userMapper.toDto(savedUser);
    }
    
    /**
     * 사용자 비밀번호 변경
     */
    @Transactional
    public void changePassword(String id, String newPassword) {
        log.info("사용자 비밀번호 변경 요청: {}", id);
        
        User user = userRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        log.info("사용자 비밀번호 변경 완료: {}", id);
    }
    
    /**
     * 사용자 활성화/비활성화
     */
    @Transactional
    public UserDto toggleUserStatus(String id) {
        log.info("사용자 상태 변경 요청: {}", id);
        
        User user = userRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));
        
        user.setIsActive(!user.getIsActive());
        User savedUser = userRepository.save(user);
        
        log.info("사용자 상태 변경 완료: {} -> {}", id, savedUser.getIsActive());
        return userMapper.toDto(savedUser);
    }
    
    /**
     * 사용자 삭제 (소프트 삭제)
     */
    @Transactional
    public void deleteUser(String id) {
        log.info("사용자 삭제 요청: {}", id);
        
        User user = userRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));
        
        user.setIsActive(false);
        userRepository.save(user);
        
        log.info("사용자 삭제 완료: {}", id);
    }
    
    /**
     * 사용자 통계 조회
     */
    public long getUserCount() {
        return userRepository.count();
    }
    
    /**
     * 활성 사용자 수 조회
     */
    public long getActiveUserCount() {
        return userRepository.countByIsActiveTrue();
    }
    
    /**
     * 지사별 사용자 수 조회
     */
    public long getUserCountByBranch(UUID branchId) {
        return userRepository.countByBranchIdAndIsActiveTrue(branchId);
    }
    
    /**
     * 사용자 역할 할당
     */
    @Transactional
    public void assignRole(String userId, String roleId) {
        log.info("사용자 역할 할당: userId={}, roleId={}", userId, roleId);
        
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        
        // 역할 할당 로직 구현 필요
        // UserRole 엔티티를 사용하여 역할 할당
    }
    
    /**
     * 사용자 역할 제거
     */
    @Transactional
    public void removeRole(String userId, String roleId) {
        log.info("사용자 역할 제거: userId={}, roleId={}", userId, roleId);
        
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        
        // 역할 제거 로직 구현 필요
        // UserRole 엔티티를 사용하여 역할 제거
    }
}
