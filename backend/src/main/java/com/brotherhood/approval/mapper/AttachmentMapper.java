package com.brotherhood.approval.mapper;

import com.brotherhood.approval.dto.attachment.AttachmentDto;
import com.brotherhood.approval.entity.Attachment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * 첨부파일 매퍼
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AttachmentMapper {
    
    /**
     * 엔티티를 DTO로 변환
     */
    @Mapping(target = "documentId", source = "document.id")
    @Mapping(target = "uploadedById", source = "uploadedBy.id")
    @Mapping(target = "uploadedByName", source = "uploadedBy.fullName")
    @Mapping(target = "uploadedByDisplayName", source = "uploadedBy.displayName")
    @Mapping(target = "originalFilename", source = "filename")
    @Mapping(target = "checksum", ignore = true)
    @Mapping(target = "isEncrypted", ignore = true)
    @Mapping(target = "encryptionKeyId", ignore = true)
    @Mapping(target = "description", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    AttachmentDto toDto(Attachment attachment);
    
    /**
     * 엔티티 리스트를 DTO 리스트로 변환
     */
    List<AttachmentDto> toDtoList(List<Attachment> attachments);
}
