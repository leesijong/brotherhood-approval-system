package com.brotherhood.approval.controller;

import com.brotherhood.approval.dto.BaseResponse;
import com.brotherhood.approval.dto.PageResponse;
import com.brotherhood.approval.dto.user.UserCreateRequest;
import com.brotherhood.approval.dto.user.UserDto;
import com.brotherhood.approval.dto.user.UserSearchRequest;
import com.brotherhood.approval.dto.user.UserUpdateRequest;
import com.brotherhood.approval.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

/**
 * 사용자 컨트롤러
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "사용자", description = "사용자 관리 관련 API")
public class UserController {
    
    private final UserService userService;
    
    @PostConstruct
    public void init() {
        log.info("=== UserController 초기화됨 ===");
        log.info("UserController 생성자 호출됨 - UserService 의존성 주입됨");
        log.info("=== UserController @PostConstruct 호출됨 ===");
        log.info("UserController 등록 완료");
    }
    
    /**
     * 사용자 생성
     */
    @PostMapping
    @Operation(summary = "사용자 생성", description = "새로운 사용자를 생성합니다.")
    public ResponseEntity<BaseResponse<UserDto>> createUser(@Valid @RequestBody UserCreateRequest request) {
        try {
            UserDto user = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(BaseResponse.success(user, "사용자가 성공적으로 생성되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("사용자 생성 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("사용자 생성 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 사용자 조회 (ID)
     */
    @GetMapping("/{id}")
    @Operation(summary = "사용자 조회", description = "ID로 사용자 정보를 조회합니다.")
    public ResponseEntity<BaseResponse<UserDto>> getUserById(@PathVariable String id) {
        try {
            Optional<UserDto> user = userService.getUserById(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(BaseResponse.success(user.get(), "사용자 정보를 조회했습니다"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("사용자 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("사용자 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 사용자 조회 (사용자명)
     */
    @GetMapping("/username/{username}")
    @Operation(summary = "사용자명으로 조회", description = "사용자명으로 사용자 정보를 조회합니다.")
    public ResponseEntity<BaseResponse<UserDto>> getUserByUsername(@PathVariable String username) {
        try {
            Optional<UserDto> user = userService.getUserByUsername(username);
            if (user.isPresent()) {
                return ResponseEntity.ok(BaseResponse.success(user.get(), "사용자 정보를 조회했습니다"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("사용자 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("사용자 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 사용자 목록 조회
     */
    @GetMapping
    @Operation(summary = "사용자 목록 조회", description = "사용자 목록을 페이지네이션으로 조회합니다.")
    public ResponseEntity<BaseResponse<PageResponse<UserDto>>> getUsers(Pageable pageable) {
        try {
            Page<UserDto> userPage = userService.getUsers(pageable);
            PageResponse<UserDto> response = PageResponse.of(userPage);
            return ResponseEntity.ok(BaseResponse.success(response, "사용자 목록을 조회했습니다"));
        } catch (Exception e) {
            log.error("사용자 목록 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("사용자 목록 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 사용자 검색
     */
    @PostMapping("/search")
    @Operation(summary = "사용자 검색", description = "키워드로 사용자를 검색합니다.")
    public ResponseEntity<BaseResponse<PageResponse<UserDto>>> searchUsers(
            @Valid @RequestBody UserSearchRequest request, Pageable pageable) {
        try {
            Page<UserDto> userPage = userService.searchUsers(request, pageable);
            PageResponse<UserDto> response = PageResponse.of(userPage);
            return ResponseEntity.ok(BaseResponse.success(response, "사용자 검색이 완료되었습니다"));
        } catch (Exception e) {
            log.error("사용자 검색 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("사용자 검색 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 지사별 사용자 목록 조회
     */
    @GetMapping("/branch/{branchId}")
    @Operation(summary = "지사별 사용자 조회", description = "특정 지사의 사용자 목록을 조회합니다.")
    public ResponseEntity<BaseResponse<List<UserDto>>> getUsersByBranch(@PathVariable String branchId) {
        try {
            UUID branchUuid = UUID.fromString(branchId);
            List<UserDto> users = userService.getUsersByBranch(branchUuid);
            return ResponseEntity.ok(BaseResponse.success(users, "지사별 사용자 목록을 조회했습니다"));
        } catch (Exception e) {
            log.error("지사별 사용자 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("지사별 사용자 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 활성 사용자 목록 조회
     */
    @GetMapping("/active")
    @Operation(summary = "활성 사용자 조회", description = "활성 상태인 사용자 목록을 조회합니다.")
    public ResponseEntity<BaseResponse<List<UserDto>>> getActiveUsers() {
        try {
            log.info("활성 사용자 조회 API 호출됨");
            List<UserDto> activeUsers = userService.getActiveUsers();
            log.info("활성 사용자 조회 완료: {}명", activeUsers.size());
            return ResponseEntity.ok(BaseResponse.success(activeUsers, "활성 사용자 목록을 조회했습니다"));
        } catch (Exception e) {
            log.error("활성 사용자 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("활성 사용자 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 사용자 정보 수정
     */
    @PutMapping("/{id}")
    @Operation(summary = "사용자 정보 수정", description = "사용자 정보를 수정합니다.")
    public ResponseEntity<BaseResponse<UserDto>> updateUser(
            @PathVariable String id, @Valid @RequestBody UserUpdateRequest request) {
        try {
            UserDto user = userService.updateUser(id, request);
            return ResponseEntity.ok(BaseResponse.success(user, "사용자 정보가 성공적으로 수정되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("사용자 정보 수정 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("사용자 정보 수정 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 사용자 비밀번호 변경
     */
    @PutMapping("/{id}/password")
    @Operation(summary = "비밀번호 변경", description = "사용자의 비밀번호를 변경합니다.")
    @PreAuthorize("hasRole('ADMIN') or @userService.getUserById(#id).get().getUsername() == authentication.name")
    public ResponseEntity<BaseResponse<Void>> changePassword(
            @PathVariable String id, @RequestBody @Parameter(description = "새 비밀번호") String newPassword) {
        try {
            userService.changePassword(id, newPassword);
            return ResponseEntity.ok(BaseResponse.success(null, "비밀번호가 성공적으로 변경되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("비밀번호 변경 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("비밀번호 변경 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 사용자 상태 변경
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "사용자 상태 변경", description = "사용자의 활성/비활성 상태를 변경합니다.")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<BaseResponse<UserDto>> toggleUserStatus(@PathVariable String id) {
        try {
            UserDto user = userService.toggleUserStatus(id);
            return ResponseEntity.ok(BaseResponse.success(user, "사용자 상태가 성공적으로 변경되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("사용자 상태 변경 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("사용자 상태 변경 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 사용자 삭제
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "사용자 삭제", description = "사용자를 삭제합니다.")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<BaseResponse<Void>> deleteUser(@PathVariable String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(BaseResponse.success(null, "사용자가 성공적으로 삭제되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("사용자 삭제 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("사용자 삭제 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 사용자 통계 조회
     */
    @GetMapping("/stats")
    @Operation(summary = "사용자 통계", description = "사용자 관련 통계를 조회합니다.")
    public ResponseEntity<BaseResponse<Object>> getUserStats() {
        try {
            long totalUserCount = userService.getUserCount();
            long activeUserCount = userService.getActiveUserCount();
            
            return ResponseEntity.ok(BaseResponse.success(
                    new Object() {
                        public final long totalUsers = totalUserCount;
                        public final long activeUsers = activeUserCount;
                    }, "사용자 통계를 조회했습니다"));
        } catch (Exception e) {
            log.error("사용자 통계 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("사용자 통계 조회 중 오류가 발생했습니다"));
        }
    }
}
