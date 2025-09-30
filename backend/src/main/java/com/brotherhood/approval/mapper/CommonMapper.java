package com.brotherhood.approval.mapper;

import com.brotherhood.approval.dto.dashboard.DashboardStatsDto;
import com.brotherhood.approval.dto.notification.NotificationDto;
import com.brotherhood.approval.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * 공통 매퍼
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CommonMapper {
    
    /**
     * 알림 엔티티를 DTO로 변환
     */
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "documentId", source = "document.id")
    @Mapping(target = "documentTitle", source = "document.title")
    NotificationDto toNotificationDto(Notification notification);
    
    /**
     * 알림 엔티티 리스트를 DTO 리스트로 변환
     */
    List<NotificationDto> toNotificationDtoList(List<Notification> notifications);
    
    /**
     * 대시보드 통계 DTO 생성 (서비스에서 직접 생성)
     */
    default DashboardStatsDto createDashboardStats() {
        return DashboardStatsDto.builder().build();
    }
}
