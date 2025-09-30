package com.brotherhood.approval.dto.search;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 검색 요청 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {
    
    private String keyword;
    private List<String> documentTypes;
    private List<String> securityLevels;
    private List<String> statuses;
    private List<String> priorities;
    private List<String> authorIds;
    private List<String> branchIds;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isUrgent;
    private Boolean isFinal;
    private String sortBy;
    private String sortDirection;
    private Integer page;
    private Integer size;
}
