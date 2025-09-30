package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 댓글 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    
    /**
     * 문서별 댓글 조회 (최신순)
     */
    @Query("SELECT c FROM Comment c WHERE c.document.id = :documentId ORDER BY c.createdAt DESC")
    List<Comment> findByDocumentIdOrderByCreatedAtDesc(@Param("documentId") UUID documentId);
    
    /**
     * 문서별 댓글 조회 (페이지네이션)
     */
    @Query("SELECT c FROM Comment c WHERE c.document.id = :documentId ORDER BY c.createdAt DESC")
    Page<Comment> findByDocumentIdOrderByCreatedAtDesc(@Param("documentId") UUID documentId, Pageable pageable);
    
    /**
     * 작성자별 댓글 조회
     */
    @Query("SELECT c FROM Comment c WHERE c.author.id = :authorId")
    Page<Comment> findByAuthorId(@Param("authorId") String authorId, Pageable pageable);
    
    /**
     * 부모 댓글별 하위 댓글 조회
     */
    @Query("SELECT c FROM Comment c WHERE c.parentComment.id = :parentCommentId ORDER BY c.createdAt ASC")
    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(@Param("parentCommentId") String parentCommentId);
    
    /**
     * 문서별 최상위 댓글 조회 (부모 댓글이 없는 댓글)
     */
    @Query("SELECT c FROM Comment c WHERE c.document.id = :documentId AND c.parentComment IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findByDocumentIdAndParentCommentIdIsNullOrderByCreatedAtDesc(@Param("documentId") UUID documentId);
    
    /**
     * 내부 댓글만 조회
     */
    @Query("SELECT c FROM Comment c WHERE c.document.id = :documentId AND c.isInternal = true ORDER BY c.createdAt DESC")
    List<Comment> findByDocumentIdAndIsInternalTrueOrderByCreatedAtDesc(@Param("documentId") UUID documentId);
    
    /**
     * 외부 댓글만 조회
     */
    @Query("SELECT c FROM Comment c WHERE c.document.id = :documentId AND c.isInternal = false ORDER BY c.createdAt DESC")
    List<Comment> findByDocumentIdAndIsInternalFalseOrderByCreatedAtDesc(@Param("documentId") UUID documentId);
    
    /**
     * 수정된 댓글 조회
     */
    List<Comment> findByIsEditedTrue();
    
    /**
     * 댓글 검색 (내용)
     */
    @Query("SELECT c FROM Comment c WHERE " +
           "c.content LIKE %:keyword% AND " +
           "c.document.id = :documentId " +
           "ORDER BY c.createdAt DESC")
    Page<Comment> findByContentContainingAndDocumentId(@Param("keyword") String keyword,
                                                      @Param("documentId") UUID documentId,
                                                      Pageable pageable);
    
    /**
     * 문서별 댓글 수 조회
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.document.id = :documentId")
    long countByDocumentId(@Param("documentId") UUID documentId);
    
    /**
     * 작성자별 댓글 수 조회
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.author.id = :authorId")
    long countByAuthorId(@Param("authorId") String authorId);
    
    /**
     * 문서별 내부 댓글 수 조회
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.document.id = :documentId AND c.isInternal = true")
    long countByDocumentIdAndIsInternalTrue(@Param("documentId") UUID documentId);
    
    /**
     * 문서별 외부 댓글 수 조회
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.document.id = :documentId AND c.isInternal = false")
    long countByDocumentIdAndIsInternalFalse(@Param("documentId") UUID documentId);
    
    /**
     * 부모 댓글별 하위 댓글 수 조회
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.parentComment.id = :parentCommentId")
    long countByParentCommentId(@Param("parentCommentId") String parentCommentId);
}

