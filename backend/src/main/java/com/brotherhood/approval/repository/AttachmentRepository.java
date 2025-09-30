package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.Attachment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 첨부파일 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    
    /**
     * 문서별 첨부파일 조회
     */
    @Query("SELECT a FROM Attachment a WHERE a.document.id = :documentId")
    List<Attachment> findByDocumentId(@Param("documentId") UUID documentId);
    
    /**
     * 업로더별 첨부파일 조회
     */
    @Query("SELECT a FROM Attachment a WHERE a.uploadedBy.id = :uploaderId")
    Page<Attachment> findByUploaderId(@Param("uploaderId") String uploaderId, Pageable pageable);
    
    /**
     * 파일명으로 조회 (filename 필드 사용)
     */
    List<Attachment> findByFilename(String filename);
    
    /**
     * 파일명으로 단일 조회 (저장된 파일명)
     */
    Optional<Attachment> findByStoredFilename(String storedFilename);
    
    /**
     * MIME 타입별 첨부파일 조회
     */
    List<Attachment> findByMimeType(String mimeType);
    
    /**
     * 암호화된 첨부파일 조회
     */
    List<Attachment> findByIsEncryptedTrue();
    
    /**
     * 파일 크기 범위별 첨부파일 조회
     */
    @Query("SELECT a FROM Attachment a WHERE " +
           "a.fileSize BETWEEN :minSize AND :maxSize")
    List<Attachment> findByFileSizeRange(@Param("minSize") Long minSize, 
                                        @Param("maxSize") Long maxSize);
    
    /**
     * 첨부파일 검색 (파일명)
     */
    @Query("SELECT a FROM Attachment a WHERE " +
           "a.filename LIKE %:keyword% AND " +
           "a.document.id = :documentId")
    Page<Attachment> findByFilenameContainingAndDocumentId(@Param("keyword") String keyword,
                                                          @Param("documentId") UUID documentId,
                                                          Pageable pageable);
    
    /**
     * MIME 타입별 첨부파일 검색
     */
    @Query("SELECT a FROM Attachment a WHERE " +
           "a.mimeType LIKE %:mimeType% AND " +
           "a.document.id = :documentId")
    List<Attachment> findByMimeTypeContainingAndDocumentId(@Param("mimeType") String mimeType,
                                                          @Param("documentId") UUID documentId);
    
    /**
     * 문서별 첨부파일 수 조회
     */
    @Query("SELECT COUNT(a) FROM Attachment a WHERE a.document.id = :documentId")
    long countByDocumentId(@Param("documentId") UUID documentId);
    
    /**
     * 업로더별 첨부파일 수 조회
     */
    @Query("SELECT COUNT(a) FROM Attachment a WHERE a.uploadedBy.id = :uploaderId")
    long countByUploaderId(@Param("uploaderId") String uploaderId);
    
    /**
     * MIME 타입별 첨부파일 수 조회
     */
    long countByMimeType(String mimeType);
    
    /**
     * 암호화된 첨부파일 수 조회
     */
    long countByIsEncryptedTrue();
    
    /**
     * 문서별 총 첨부파일 크기 조회
     */
    @Query("SELECT SUM(a.fileSize) FROM Attachment a WHERE a.document.id = :documentId")
    Long sumFileSizeByDocumentId(@Param("documentId") UUID documentId);
    
    /**
     * 업로더별 총 첨부파일 크기 조회
     */
    @Query("SELECT SUM(a.fileSize) FROM Attachment a WHERE a.uploadedBy.id = :uploaderId")
    Long sumFileSizeByUploaderId(@Param("uploaderId") String uploaderId);
    
    /**
     * 체크섬으로 중복 파일 확인
     */
    boolean existsByChecksum(String checksum);
    
    /**
     * 체크섬으로 첨부파일 조회
     */
    Optional<Attachment> findByChecksum(String checksum);
    
    /**
     * 전체 첨부파일 크기 조회
     */
    @Query("SELECT SUM(a.fileSize) FROM Attachment a")
    Optional<Long> getTotalSize();
}

