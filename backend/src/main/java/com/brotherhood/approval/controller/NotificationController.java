package com.brotherhood.approval.controller;

import com.brotherhood.approval.dto.BaseResponse;
import com.brotherhood.approval.dto.PageResponse;
import com.brotherhood.approval.dto.notification.NotificationDto;
import com.brotherhood.approval.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 알림 컨트롤러
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "알림", description = "알림 관리 관련 API")
public class NotificationController {
    
    private final NotificationService notificationService;
    
    /**
     * 사용자별 알림 조회
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "사용자별 알림 조회", description = "특정 사용자의 알림 목록을 조회합니다.")
    public ResponseEntity<BaseResponse<PageResponse<NotificationDto>>> getNotificationsByUser(
            @PathVariable String userId, Pageable pageable) {
        try {
            Page<NotificationDto> notificationPage = notificationService.getNotificationsByUser(userId, pageable);
            PageResponse<NotificationDto> response = PageResponse.of(notificationPage);
            return ResponseEntity.ok(BaseResponse.success(response, "사용자별 알림을 조회했습니다"));
        } catch (Exception e) {
            log.error("사용자별 알림 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("사용자별 알림 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 읽지 않은 알림 조회
     */
    @GetMapping("/user/{userId}/unread")
    @Operation(summary = "읽지 않은 알림 조회", description = "특정 사용자의 읽지 않은 알림을 조회합니다.")
    public ResponseEntity<BaseResponse<List<NotificationDto>>> getUnreadNotifications(@PathVariable String userId) {
        try {
            List<NotificationDto> notifications = notificationService.getUnreadNotifications(userId);
            return ResponseEntity.ok(BaseResponse.success(notifications, "읽지 않은 알림을 조회했습니다"));
        } catch (Exception e) {
            log.error("읽지 않은 알림 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("읽지 않은 알림 조회 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 알림 읽음 처리
     */
    @PutMapping("/{notificationId}/read")
    @Operation(summary = "알림 읽음 처리", description = "특정 알림을 읽음 처리합니다.")
    public ResponseEntity<BaseResponse<NotificationDto>> markAsRead(
            @PathVariable String notificationId, @RequestHeader("X-User-Id") String userId) {
        try {
            NotificationDto notification = notificationService.markAsRead(notificationId, userId);
            return ResponseEntity.ok(BaseResponse.success(notification, "알림이 읽음 처리되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("알림 읽음 처리 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("알림 읽음 처리 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 모든 알림 읽음 처리
     */
    @PutMapping("/user/{userId}/read-all")
    @Operation(summary = "모든 알림 읽음 처리", description = "특정 사용자의 모든 알림을 읽음 처리합니다.")
    public ResponseEntity<BaseResponse<Void>> markAllAsRead(@PathVariable String userId) {
        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(BaseResponse.success(null, "모든 알림이 읽음 처리되었습니다"));
        } catch (Exception e) {
            log.error("모든 알림 읽음 처리 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("모든 알림 읽음 처리 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 알림 삭제
     */
    @DeleteMapping("/{notificationId}")
    @Operation(summary = "알림 삭제", description = "특정 알림을 삭제합니다.")
    public ResponseEntity<BaseResponse<Void>> deleteNotification(
            @PathVariable String notificationId, @RequestHeader("X-User-Id") String userId) {
        try {
            notificationService.deleteNotification(notificationId, userId);
            return ResponseEntity.ok(BaseResponse.success(null, "알림이 성공적으로 삭제되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("알림 삭제 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("알림 삭제 중 오류가 발생했습니다"));
        }
    }
    
    /**
     * 알림 통계 조회
     */
    @GetMapping("/stats/user/{userId}")
    @Operation(summary = "알림 통계 조회", description = "특정 사용자의 알림 통계를 조회합니다.")
    public ResponseEntity<BaseResponse<Object>> getNotificationStats(@PathVariable String userId) {
        try {
            long totalNotificationCount = notificationService.getNotificationCount(userId);
            long unreadNotificationCount = notificationService.getUnreadNotificationCount(userId);
            
            return ResponseEntity.ok(BaseResponse.success(
                    new Object() {
                        public final long totalCount = totalNotificationCount;
                        public final long unreadCount = unreadNotificationCount;
                    }, "알림 통계를 조회했습니다"));
        } catch (Exception e) {
            log.error("알림 통계 조회 오류", e);
            return ResponseEntity.internalServerError()
                    .body(BaseResponse.error("알림 통계 조회 중 오류가 발생했습니다"));
        }
    }
}
