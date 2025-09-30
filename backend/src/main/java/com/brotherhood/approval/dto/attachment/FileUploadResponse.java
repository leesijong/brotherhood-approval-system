package com.brotherhood.approval.dto.attachment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 파일 업로드 응답 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    
    private String id;
    private String filename;
    private String originalFilename;
    private Long fileSize;
    private String mimeType;
    private String documentId;
    private String uploadedById;
    private LocalDateTime uploadedAt;
    private String message;
    
    // AttachmentDto에서 FileUploadResponse로 변환하는 정적 메서드
    public static FileUploadResponse fromAttachmentDto(AttachmentDto attachmentDto) {
        return FileUploadResponse.builder()
                .id(attachmentDto.getId())
                .filename(attachmentDto.getFilename())
                .originalFilename(attachmentDto.getOriginalFilename())
                .fileSize(attachmentDto.getFileSize())
                .mimeType(attachmentDto.getMimeType())
                .documentId(attachmentDto.getDocumentId())
                .uploadedById(attachmentDto.getUploadedById())
                .uploadedAt(attachmentDto.getUploadedAt())
                .message("파일 업로드가 완료되었습니다.")
                .build();
    }
}

