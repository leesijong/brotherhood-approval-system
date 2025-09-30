package com.brotherhood.approval.dto.document;

import com.brotherhood.approval.entity.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 문서 검색 요청 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentSearchRequest {
    
    private String keyword;
    private String branchId;
    private String authorId;
    private String status;
    private String classification;
    private Boolean isUrgent;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    @Builder.Default
    private int page = 0;
    @Builder.Default
    private int size = 10;
    @Builder.Default
    private String sortBy = "createdAt";
    @Builder.Default
    private String sortDirection = "desc";
    
}
