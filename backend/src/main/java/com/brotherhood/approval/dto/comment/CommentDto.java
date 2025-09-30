package com.brotherhood.approval.dto.comment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 댓글 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    
    private String id;
    private String content;
    private Boolean isInternal;
    private Boolean isEdited;
    private String documentId;
    private String authorId;
    private String authorName;
    private String authorDisplayName;
    private String parentCommentId;
    private List<CommentDto> replies;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

