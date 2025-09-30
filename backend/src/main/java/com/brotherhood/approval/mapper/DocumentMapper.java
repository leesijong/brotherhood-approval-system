package com.brotherhood.approval.mapper;

import com.brotherhood.approval.dto.document.DocumentDto;
import com.brotherhood.approval.dto.document.DocumentCreateRequest;
import com.brotherhood.approval.dto.document.DocumentUpdateRequest;
import com.brotherhood.approval.entity.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * 문서 매퍼
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface DocumentMapper {
    
    /**
     * 엔티티를 DTO로 변환
     */
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", source = "author.fullName")
    @Mapping(target = "authorDisplayName", source = "author.displayName")
    @Mapping(target = "branchId", source = "branch.id")
    @Mapping(target = "branchName", source = "branch.name")
    @Mapping(target = "branchCode", source = "branch.code")
    @Mapping(target = "parentDocumentId", source = "parentDocument.id")
    @Mapping(target = "approvalLines", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    DocumentDto toDto(Document document);
    
    /**
     * 엔티티 리스트를 DTO 리스트로 변환
     */
    List<DocumentDto> toDtoList(List<Document> documents);
    
    /**
     * 생성 요청을 엔티티로 변환
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "documentType", source = "classification")
    @Mapping(target = "securityLevel", ignore = true)
    @Mapping(target = "priority", ignore = true)
    @Mapping(target = "documentNumber", ignore = true)
    @Mapping(target = "version", constant = "1")
    @Mapping(target = "isFinal", constant = "false")
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "approvedAt", ignore = true)
    @Mapping(target = "rejectedAt", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "parentDocument", ignore = true)
    @Mapping(target = "approvalLines", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    Document toEntity(DocumentCreateRequest request);
    
    /**
     * 업데이트 요청으로 엔티티 업데이트
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "securityLevel", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "documentNumber", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "isFinal", ignore = true)
    @Mapping(target = "rejectedAt", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "parentDocument", ignore = true)
    @Mapping(target = "approvalLines", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "approvedAt", ignore = true)
    @Mapping(target = "dueDate", source = "dueDate", dateFormat = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    void updateEntity(DocumentUpdateRequest request, @MappingTarget Document document);
}
