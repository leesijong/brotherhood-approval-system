package com.brotherhood.approval.service;

import com.brotherhood.approval.dto.attachment.AttachmentDto;
import com.brotherhood.approval.dto.attachment.FileUploadResponse;
import com.brotherhood.approval.entity.Attachment;
import com.brotherhood.approval.entity.Document;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.mapper.AttachmentMapper;
import com.brotherhood.approval.repository.AttachmentRepository;
import com.brotherhood.approval.repository.DocumentRepository;
import com.brotherhood.approval.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 첨부파일 서비스
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttachmentService {
    
    private final AttachmentRepository attachmentRepository;
    private final AttachmentMapper attachmentMapper;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;
    
    @Value("${file.max-size:10485760}")
    private long maxFileSize;
    
    /**
     * 첨부파일 업로드
     */
    @Transactional
    public AttachmentDto uploadAttachment(String documentId, MultipartFile file, String uploadedById) {
        log.info("첨부파일 업로드: documentId={}, filename={}", documentId, file.getOriginalFilename());
        
        // 파일 크기 검증
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("파일 크기가 너무 큽니다. 최대 " + (maxFileSize / 1024 / 1024) + "MB까지 허용됩니다.");
        }
        
        // 파일명 검증
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("파일명이 올바르지 않습니다.");
        }
        
        // 업로드 디렉토리 생성
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            try {
                Files.createDirectories(uploadPath);
            } catch (IOException e) {
                log.error("업로드 디렉토리 생성 실패", e);
                throw new RuntimeException("파일 업로드 디렉토리를 생성할 수 없습니다.", e);
            }
        }
        
        // 고유 파일명 생성
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(uniqueFilename);
        
        // 파일 저장
        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("파일 저장 실패", e);
            throw new RuntimeException("파일을 저장할 수 없습니다.", e);
        }
        
        // 체크섬 계산
        String checksum;
        try {
            checksum = calculateChecksum(filePath);
        } catch (Exception e) {
            log.error("체크섬 계산 실패", e);
            throw new RuntimeException("파일 체크섬을 계산할 수 없습니다.", e);
        }
        
        // 엔티티 조회
        Document document = documentRepository.findById(UUID.fromString(documentId))
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + documentId));
        
        User uploadedBy = userRepository.findById(UUID.fromString(uploadedById))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + uploadedById));
        
        // 첨부파일 엔티티 생성
        Attachment attachment = Attachment.builder()
                .filename(originalFilename)
                .originalFilename(originalFilename)
                .storedFilename(uniqueFilename)
                .filePath(filePath.toString())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .checksum(checksum)
                .document(document)
                .uploadedBy(uploadedBy)
                .uploadedAt(LocalDateTime.now())
                .build();
        
        Attachment savedAttachment = attachmentRepository.save(attachment);
        log.info("첨부파일 업로드 완료: {}", savedAttachment.getId());
        
        return attachmentMapper.toDto(savedAttachment);
    }
    
    /**
     * 파일 업로드 (단일)
     */
    @Transactional
    public FileUploadResponse uploadFile(MultipartFile file, String documentId, String userId) {
        AttachmentDto attachmentDto = uploadAttachment(documentId, file, userId);
        
        return FileUploadResponse.builder()
                .id(attachmentDto.getId())
                .filename(attachmentDto.getFilename())
                .fileSize(attachmentDto.getFileSize())
                .mimeType(attachmentDto.getMimeType())
                .uploadedAt(attachmentDto.getUploadedAt())
                .uploadedById(attachmentDto.getUploadedById())
                .build();
    }
    
    /**
     * 다중 파일 업로드
     */
    @Transactional
    public List<FileUploadResponse> uploadMultipleFiles(List<MultipartFile> files, String documentId, String userId) {
        List<FileUploadResponse> responses = new ArrayList<>();
        
        for (MultipartFile file : files) {
            AttachmentDto attachmentDto = uploadAttachment(documentId, file, userId);
            responses.add(FileUploadResponse.builder()
                    .id(attachmentDto.getId())
                    .filename(attachmentDto.getFilename())
                    .fileSize(attachmentDto.getFileSize())
                    .mimeType(attachmentDto.getMimeType())
                    .uploadedAt(attachmentDto.getUploadedAt())
                    .uploadedById(attachmentDto.getUploadedById())
                    .build());
        }
        
        return responses;
    }
    
    
    /**
     * 문서별 첨부파일 목록 조회
     */
    public List<AttachmentDto> getAttachmentsByDocument(String documentId) {
        return attachmentRepository.findByDocumentId(UUID.fromString(documentId))
                .stream()
                .map(attachmentMapper::toDto)
                .toList();
    }
    
    /**
     * 파일 다운로드
     */
    public Resource downloadFile(String id) {
        Attachment attachment = attachmentRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + id));
        
        try {
            Path filePath = Paths.get(attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("파일을 읽을 수 없습니다: " + attachment.getFilename());
            }
        } catch (Exception e) {
            log.error("파일 다운로드 오류", e);
            throw new RuntimeException("파일을 다운로드할 수 없습니다.", e);
        }
    }
    
    /**
     * 파일 미리보기
     */
    public Resource previewFile(String id) {
        return downloadFile(id);
    }
    
    /**
     * 첨부파일 삭제
     */
    @Transactional
    public void deleteAttachment(String id, String userId) {
        Attachment attachment = attachmentRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + id));
        
        // 권한 확인 (업로더만 삭제 가능)
        if (!attachment.getUploadedBy().getId().toString().equals(userId)) {
            throw new IllegalArgumentException("첨부파일을 삭제할 권한이 없습니다");
        }
        
        // 파일 삭제
        try {
            Path filePath = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("파일 삭제 실패", e);
        }
        
        // 데이터베이스에서 삭제
        attachmentRepository.delete(attachment);
        log.info("첨부파일 삭제 완료: {}", id);
    }
    
    /**
     * 첨부파일 정보 수정
     */
    @Transactional
    public AttachmentDto updateAttachment(String id, AttachmentDto request, String userId) {
        Attachment attachment = attachmentRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + id));
        
        // 권한 확인
        if (!attachment.getUploadedBy().getId().toString().equals(userId)) {
            throw new IllegalArgumentException("첨부파일을 수정할 권한이 없습니다");
        }
        
        // 파일명 수정
        if (request.getFilename() != null && !request.getFilename().trim().isEmpty()) {
            attachment.setFilename(request.getFilename().trim());
        }
        
        Attachment savedAttachment = attachmentRepository.save(attachment);
        log.info("첨부파일 정보 수정 완료: {}", id);
        
        return attachmentMapper.toDto(savedAttachment);
    }
    
    /**
     * 첨부파일 삭제
     */
    @Transactional
    public void deleteAttachment(String id) {
        Attachment attachment = attachmentRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + id));

        try {
            // 파일 시스템에서 파일 삭제
            Path filePath = Paths.get(uploadDir, attachment.getStoredFilename());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("파일 시스템에서 파일 삭제 완료: {}", filePath);
            }

            // 데이터베이스에서 첨부파일 정보 삭제
            attachmentRepository.delete(attachment);
            log.info("데이터베이스에서 첨부파일 정보 삭제 완료: {}", id);

        } catch (IOException e) {
            log.error("파일 삭제 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("파일 삭제 중 오류가 발생했습니다", e);
        }
    }


    /**
     * 첨부파일 ID로 조회
     */
    public Attachment getAttachmentById(String id) {
        return attachmentRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + id));
    }

    /**
     * 업로드 디렉토리 경로 반환
     */
    public String getUploadDir() {
        return uploadDir;
    }

    /**
     * 문서별 첨부파일 목록 조회
     */
    public List<AttachmentDto> getAttachmentsByDocumentId(String documentId) {
        List<Attachment> attachments = attachmentRepository.findByDocumentId(UUID.fromString(documentId));
        return attachments.stream()
                .map(attachmentMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * 첨부파일 개수 조회
     */
    public long getAttachmentCount() {
        return attachmentRepository.count();
    }
    
    /**
     * 전체 파일 크기 조회
     */
    public long getTotalSize() {
        return attachmentRepository.getTotalSize().orElse(0L);
    }
    
    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";
    }
    
    /**
     * 파일 체크섬 계산
     */
    private String calculateChecksum(Path filePath) throws IOException, NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        try (java.io.InputStream fis = Files.newInputStream(filePath)) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                md.update(buffer, 0, bytesRead);
            }
        }
        byte[] digest = md.digest();
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}