package com.brotherhood.approval.dto.file;

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
    
    private String fileId;
    private String filename;
    private String originalFilename;
    private String filePath;
    private Long fileSize;
    private String mimeType;
    private String checksum;
    private Boolean isEncrypted;
    private String encryptionKeyId;
    private LocalDateTime uploadedAt;
    private String uploadUrl;
    private String downloadUrl;
}
