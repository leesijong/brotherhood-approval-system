package com.brotherhood.approval.mapper;

import com.brotherhood.approval.dto.comment.CommentDto;
import com.brotherhood.approval.dto.comment.CommentCreateRequest;
import com.brotherhood.approval.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * 댓글 매퍼
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CommentMapper {
    
    /**
     * 엔티티를 DTO로 변환
     */
    @Mapping(target = "documentId", source = "document.id")
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", source = "author.fullName")
    @Mapping(target = "authorDisplayName", source = "author.displayName")
    @Mapping(target = "parentCommentId", source = "parentComment.id")
    CommentDto toDto(Comment comment);
    
    /**
     * 엔티티 리스트를 DTO 리스트로 변환
     */
    List<CommentDto> toDtoList(List<Comment> comments);
    
    /**
     * 생성 요청을 엔티티로 변환
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isInternal", constant = "false")
    @Mapping(target = "isEdited", constant = "false")
    @Mapping(target = "replies", ignore = true)
    @Mapping(target = "document", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "parentComment", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Comment toEntity(CommentCreateRequest request);
    
    /**
     * 생성 요청으로 엔티티 업데이트
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isInternal", ignore = true)
    @Mapping(target = "replies", ignore = true)
    @Mapping(target = "isEdited", ignore = true)
    @Mapping(target = "document", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "parentComment", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(CommentCreateRequest request, @MappingTarget Comment comment);
}
