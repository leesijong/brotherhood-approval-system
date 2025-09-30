package com.brotherhood.approval.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 대시보드 통계 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    
    private Long totalDocuments;
    private Long pendingApprovals;
    private Long approvedDocuments;
    private Long rejectedDocuments;
    private Long draftDocuments;
    private Long urgentDocuments;
    private Long totalUsers;
    private Long activeUsers;
    private Long totalBranches;
    private Long totalAttachments;
    private Long totalComments;
}
