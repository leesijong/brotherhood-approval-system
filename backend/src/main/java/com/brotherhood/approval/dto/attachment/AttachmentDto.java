package com.brotherhood.approval.dto.attachment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 첨부파일 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDto {
    
    private String id;
    private String filename;
    private String originalFilename;
    private String filePath;
    private Long fileSize;
    private String mimeType;
    private String checksum;
    private Boolean isEncrypted;
    private String encryptionKeyId;
    private String documentId;
    private String uploadedById;
    private String uploadedByName;
    private String uploadedByDisplayName;
    private LocalDateTime uploadedAt;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Getter 메서드들 추가
    public String getDescription() {
        return description;
    }
    
    public String getDocumentId() {
        return documentId;
    }
    
    public String getUploadedById() {
        return uploadedById;
    }
    
    public String getFilename() {
        return filename;
    }
    
    public String getOriginalFilename() {
        return originalFilename;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public String getMimeType() {
        return mimeType;
    }
    
    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}

