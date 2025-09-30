package com.brotherhood.approval;

import com.brotherhood.approval.dto.document.DocumentCreateRequest;
import com.brotherhood.approval.dto.document.DocumentDto;
import com.brotherhood.approval.dto.document.DocumentSearchRequest;
import com.brotherhood.approval.dto.document.DocumentUpdateRequest;
import com.brotherhood.approval.entity.Document;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.entity.Branch;
import com.brotherhood.approval.entity.Role;
import com.brotherhood.approval.service.DocumentService;
import com.brotherhood.approval.service.DocumentNumberService;
import com.brotherhood.approval.repository.DocumentRepository;
import com.brotherhood.approval.repository.UserRepository;
import com.brotherhood.approval.repository.BranchRepository;
import com.brotherhood.approval.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

/**
 * 문서 관리 서비스 테스트
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DocumentServiceTests {

    @Autowired
    private DocumentService documentService;
    
    @Autowired
    private DocumentNumberService documentNumberService;
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BranchRepository branchRepository;
    
    @Autowired
    private RoleRepository roleRepository;

    private User author;
    private User manager;
    private User otherUser;
    private Branch hqBranch;
    private Branch seoulBranch;
    private Role userRole;
    private Role managerRole;

    @BeforeEach
    void setUp() {
        // 테스트 데이터 설정
        hqBranch = createBranch("HQ", "본원", "서울");
        seoulBranch = createBranch("SEOUL", "서울지사", "서울");
        
        userRole = createRole("USER", "일반 사용자");
        managerRole = createRole("MANAGER", "매니저");
        
        author = createUser("author", "작성자", hqBranch, userRole);
        manager = createUser("manager", "매니저", hqBranch, managerRole);
        otherUser = createUser("other", "다른사용자", hqBranch, userRole);
        
        branchRepository.saveAll(List.of(hqBranch, seoulBranch));
        roleRepository.saveAll(List.of(userRole, managerRole));
        userRepository.saveAll(List.of(author, manager, otherUser));
    }

    @Test
    @DisplayName("문서 생성 테스트")
    void testCreateDocument() {
        // Given
        DocumentCreateRequest request = DocumentCreateRequest.builder()
                .title("테스트 문서")
                .content("테스트 내용")
                .build();
        
        // When
        DocumentDto createdDocument = documentService.createDocument(request, author.getId());
        
        // Then
        assertThat(createdDocument).isNotNull();
        assertThat(createdDocument.getTitle()).isEqualTo("테스트 문서");
        assertThat(createdDocument.getContent()).isEqualTo("테스트 내용");
        assertThat(createdDocument.getAuthorId()).isEqualTo(author.getId());
        assertThat(createdDocument.getBranchId()).isEqualTo(hqBranch.getId());
        assertThat(createdDocument.getStatus()).isEqualTo("DRAFT");
        assertThat(createdDocument.getVersion()).isEqualTo(1);
        assertThat(createdDocument.getIsFinal()).isFalse();
        assertThat(createdDocument.getDocumentNumber()).isNotBlank();
    }

    @Test
    @DisplayName("문서 조회 테스트")
    void testGetDocumentById() {
        // Given
        Document document = createAndSaveDocument("테스트 문서", "테스트 내용", author, hqBranch);
        
        // When
        Optional<DocumentDto> foundDocument = documentService.getDocumentById(document.getId());
        
        // Then
        assertThat(foundDocument).isPresent();
        assertThat(foundDocument.get().getTitle()).isEqualTo("테스트 문서");
        assertThat(foundDocument.get().getContent()).isEqualTo("테스트 내용");
    }

    @Test
    @DisplayName("문서번호로 조회 테스트")
    void testGetDocumentByNumber() {
        // Given
        Document document = createAndSaveDocument("테스트 문서", "테스트 내용", author, hqBranch);
        String documentNumber = document.getDocumentNumber();
        
        // When
        Optional<DocumentDto> foundDocument = documentService.getDocumentByNumber(documentNumber);
        
        // Then
        assertThat(foundDocument).isPresent();
        assertThat(foundDocument.get().getDocumentNumber()).isEqualTo(documentNumber);
    }

    @Test
    @DisplayName("문서 목록 조회 테스트")
    void testGetDocuments() {
        // Given
        createAndSaveDocument("문서1", "내용1", author, hqBranch);
        createAndSaveDocument("문서2", "내용2", author, hqBranch);
        createAndSaveDocument("문서3", "내용3", author, seoulBranch);
        
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<DocumentDto> documents = documentService.getDocuments(pageable);
        
        // Then
        assertThat(documents).hasSize(3);
        assertThat(documents.getContent()).extracting("title")
            .containsExactlyInAnyOrder("문서1", "문서2", "문서3");
    }

    @Test
    @DisplayName("작성자별 문서 조회 테스트")
    void testGetDocumentsByAuthor() {
        // Given
        createAndSaveDocument("작성자1문서", "내용1", author, hqBranch);
        createAndSaveDocument("작성자1문서2", "내용2", author, hqBranch);
        createAndSaveDocument("다른사용자문서", "내용3", otherUser, hqBranch);
        
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<DocumentDto> authorDocuments = documentService.getDocumentsByAuthor(author.getId(), pageable);
        
        // Then
        assertThat(authorDocuments).hasSize(2);
        assertThat(authorDocuments.getContent()).extracting("title")
            .containsExactlyInAnyOrder("작성자1문서", "작성자1문서2");
    }

    @Test
    @DisplayName("지사별 문서 조회 테스트")
    void testGetDocumentsByBranch() {
        // Given
        createAndSaveDocument("본원문서1", "내용1", author, hqBranch);
        createAndSaveDocument("본원문서2", "내용2", author, hqBranch);
        createAndSaveDocument("서울문서", "내용3", author, seoulBranch);
        
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<DocumentDto> hqDocuments = documentService.getDocumentsByBranch(hqBranch.getId(), pageable);
        Page<DocumentDto> seoulDocuments = documentService.getDocumentsByBranch(seoulBranch.getId(), pageable);
        
        // Then
        assertThat(hqDocuments).hasSize(2);
        assertThat(seoulDocuments).hasSize(1);
        assertThat(hqDocuments.getContent()).extracting("title")
            .containsExactlyInAnyOrder("본원문서1", "본원문서2");
        assertThat(seoulDocuments.getContent()).extracting("title")
            .containsExactly("서울문서");
    }

    @Test
    @DisplayName("상태별 문서 조회 테스트")
    void testGetDocumentsByStatus() {
        // Given
        Document draftDoc = createAndSaveDocument("초안문서", "내용1", author, hqBranch);
        Document pendingDoc = createAndSaveDocument("상신문서", "내용2", author, hqBranch);
        pendingDoc.setStatus("PENDING");
        documentRepository.save(pendingDoc);
        
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<DocumentDto> draftDocuments = documentService.getDocumentsByStatus("DRAFT", pageable);
        Page<DocumentDto> pendingDocuments = documentService.getDocumentsByStatus("PENDING", pageable);
        
        // Then
        assertThat(draftDocuments).hasSize(1);
        assertThat(pendingDocuments).hasSize(1);
        assertThat(draftDocuments.getContent().get(0).getTitle()).isEqualTo("초안문서");
        assertThat(pendingDocuments.getContent().get(0).getTitle()).isEqualTo("상신문서");
    }

    @Test
    @DisplayName("문서 검색 테스트")
    void testSearchDocuments() {
        // Given
        createAndSaveDocument("테스트 문서", "테스트 내용", author, hqBranch);
        createAndSaveDocument("샘플 문서", "샘플 내용", author, hqBranch);
        createAndSaveDocument("예제 문서", "예제 내용", author, hqBranch);
        
        DocumentSearchRequest request = DocumentSearchRequest.builder()
                .keyword("테스트")
                .build();
        
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<DocumentDto> documents = documentService.searchDocuments(request, pageable);
        
        // Then
        assertThat(documents).hasSize(1);
        assertThat(documents.getContent().get(0).getTitle()).isEqualTo("테스트 문서");
    }

    @Test
    @DisplayName("결재 대기 문서 조회 테스트")
    void testGetPendingApprovalDocuments() {
        // Given
        Document pendingDoc = createAndSaveDocument("결재대기문서", "내용", author, hqBranch);
        pendingDoc.setStatus("PENDING");
        documentRepository.save(pendingDoc);
        
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<DocumentDto> pendingDocuments = documentService.getPendingApprovalDocuments(manager.getId(), pageable);
        
        // Then
        assertThat(pendingDocuments).hasSize(1);
        assertThat(pendingDocuments.getContent().get(0).getTitle()).isEqualTo("결재대기문서");
    }

    @Test
    @DisplayName("최근 문서 조회 테스트")
    void testGetRecentDocuments() {
        // Given
        createAndSaveDocument("문서1", "내용1", author, hqBranch);
        createAndSaveDocument("문서2", "내용2", author, hqBranch);
        createAndSaveDocument("문서3", "내용3", author, hqBranch);
        
        // When
        List<DocumentDto> recentDocuments = documentService.getRecentDocuments(2);
        
        // Then
        assertThat(recentDocuments).hasSize(2);
    }

    @Test
    @DisplayName("문서 정보 수정 테스트")
    void testUpdateDocument() {
        // Given
        Document document = createAndSaveDocument("원본문서", "원본내용", author, hqBranch);
        
        DocumentUpdateRequest request = DocumentUpdateRequest.builder()
                .title("수정된문서")
                .content("수정된내용")
                .build();
        
        // When
        DocumentDto updatedDocument = documentService.updateDocument(document.getId(), request, author.getId());
        
        // Then
        assertThat(updatedDocument.getTitle()).isEqualTo("수정된문서");
        assertThat(updatedDocument.getContent()).isEqualTo("수정된내용");
    }

    @Test
    @DisplayName("문서 상신 테스트")
    void testSubmitDocument() {
        // Given
        Document document = createAndSaveDocument("상신문서", "내용", author, hqBranch);
        
        // When
        DocumentDto submittedDocument = documentService.submitDocument(document.getId(), author.getId());
        
        // Then
        assertThat(submittedDocument.getStatus()).isEqualTo("PENDING");
        assertThat(submittedDocument.getSubmittedAt()).isNotNull();
    }

    @Test
    @DisplayName("문서 승인 테스트")
    void testApproveDocument() {
        // Given
        Document document = createAndSaveDocument("승인문서", "내용", author, hqBranch);
        document.setStatus("PENDING");
        documentRepository.save(document);
        
        // When
        DocumentDto approvedDocument = documentService.approveDocument(document.getId(), manager.getId());
        
        // Then
        assertThat(approvedDocument.getStatus()).isEqualTo("APPROVED");
        assertThat(approvedDocument.getApprovedAt()).isNotNull();
    }

    @Test
    @DisplayName("문서 반려 테스트")
    void testRejectDocument() {
        // Given
        Document document = createAndSaveDocument("반려문서", "내용", author, hqBranch);
        document.setStatus("PENDING");
        documentRepository.save(document);
        
        String rejectionReason = "내용 부족";
        
        // When
        DocumentDto rejectedDocument = documentService.rejectDocument(document.getId(), rejectionReason, manager.getId());
        
        // Then
        assertThat(rejectedDocument.getStatus()).isEqualTo("REJECTED");
        assertThat(rejectedDocument.getRejectionReason()).isEqualTo(rejectionReason);
    }

    @Test
    @DisplayName("문서 회수 테스트")
    void testRecallDocument() {
        // Given
        Document document = createAndSaveDocument("회수문서", "내용", author, hqBranch);
        document.setStatus("PENDING");
        documentRepository.save(document);
        
        // When
        DocumentDto recalledDocument = documentService.recallDocument(document.getId(), author.getId());
        
        // Then
        assertThat(recalledDocument.getStatus()).isEqualTo("DRAFT");
        assertThat(recalledDocument.getStatus()).isEqualTo("DRAFT");
    }

    @Test
    @DisplayName("문서 삭제 테스트")
    void testDeleteDocument() {
        // Given
        Document document = createAndSaveDocument("삭제문서", "내용", author, hqBranch);
        
        // When
        documentService.deleteDocument(document.getId(), author.getId());
        
        // Then
        Optional<Document> deletedDocument = documentRepository.findById(document.getId());
        assertThat(deletedDocument).isEmpty();
    }

    @Test
    @DisplayName("문서 통계 조회 테스트")
    void testGetDocumentStats() {
        // Given
        createAndSaveDocument("문서1", "내용1", author, hqBranch);
        Document pendingDoc = createAndSaveDocument("문서2", "내용2", author, hqBranch);
        pendingDoc.setStatus("PENDING");
        documentRepository.save(pendingDoc);
        
        Document approvedDoc = createAndSaveDocument("문서3", "내용3", author, hqBranch);
        approvedDoc.setStatus("APPROVED");
        documentRepository.save(approvedDoc);
        
        // When
        long totalCount = documentService.getDocumentCount();
        long draftCount = documentService.getDocumentCountByStatus("DRAFT");
        long pendingCount = documentService.getDocumentCountByStatus("PENDING");
        long approvedCount = documentService.getDocumentCountByStatus("APPROVED");
        
        // Then
        assertThat(totalCount).isEqualTo(3);
        assertThat(draftCount).isEqualTo(1);
        assertThat(pendingCount).isEqualTo(1);
        assertThat(approvedCount).isEqualTo(1);
    }

    @Test
    @DisplayName("문서 버전 관리 테스트")
    void testDocumentVersionManagement() {
        // Given
        Document document = createAndSaveDocument("버전문서", "내용1", author, hqBranch);
        assertThat(document.getVersion()).isEqualTo(1);
        
        // When
        DocumentUpdateRequest request = DocumentUpdateRequest.builder()
                .title("버전문서")
                .content("내용2")
                .build();
        
        DocumentDto updatedDocument = documentService.updateDocument(document.getId(), request, author.getId());
        
        // Then
        assertThat(updatedDocument.getVersion()).isEqualTo(2);
    }

    @Test
    @DisplayName("문서 접근 권한 테스트")
    void testDocumentAccessPermission() {
        // Given
        Document document = createAndSaveDocument("권한문서", "내용", author, hqBranch);
        
        // When
        boolean authorAccess = documentService.hasAccess(author.getId(), document.getId(), "READ");
        boolean otherUserAccess = documentService.hasAccess(otherUser.getId(), document.getId(), "READ");
        boolean managerAccess = documentService.hasAccess(manager.getId(), document.getId(), "READ");
        
        // Then
        assertThat(authorAccess).isTrue();
        assertThat(otherUserAccess).isFalse();
        assertThat(managerAccess).isTrue();
    }

    @Test
    @DisplayName("문서 검색 성능 테스트")
    void testDocumentSearchPerformance() {
        // Given
        for (int i = 0; i < 1000; i++) {
            createAndSaveDocument("문서" + i, "내용" + i, author, hqBranch);
        }
        
        DocumentSearchRequest request = DocumentSearchRequest.builder()
                .keyword("문서")
                .build();
        
        Pageable pageable = PageRequest.of(0, 10);
        
        long startTime = System.currentTimeMillis();
        
        // When
        Page<DocumentDto> documents = documentService.searchDocuments(request, pageable);
        
        long endTime = System.currentTimeMillis();
        
        // Then
        long duration = endTime - startTime;
        assertThat(duration).isLessThan(2000); // 2초 이내 완료
        assertThat(documents).hasSize(10);
    }

    @Test
    @DisplayName("문서 생성 검증 실패 테스트")
    void testCreateDocumentValidationFailure() {
        // Given
        DocumentCreateRequest invalidRequest = DocumentCreateRequest.builder()
                .title("") // 빈 제목
                .content("내용")
                .build();
        
        // When & Then
        assertThatThrownBy(() -> documentService.createDocument(invalidRequest, author.getId()))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("문서 상태 변경 권한 테스트")
    void testDocumentStatusChangePermission() {
        // Given
        Document document = createAndSaveDocument("상태문서", "내용", author, hqBranch);
        
        // When & Then
        // 작성자가 아닌 사용자가 상신 시도
        assertThatThrownBy(() -> documentService.submitDocument(document.getId(), otherUser.getId()))
            .isInstanceOf(SecurityException.class);
        
        // 작성자가 상신
        assertThatCode(() -> documentService.submitDocument(document.getId(), author.getId()))
            .doesNotThrowAnyException();
    }

    // Helper methods
    private Branch createBranch(String code, String name, String location) {
        Branch branch = Branch.builder()
                .code(code)
                .name(name)
                .isActive(true)
                .build();
        return branchRepository.save(branch);
    }

    private Role createRole(String name, String description) {
        Role role = Role.builder()
                .name(name)
                .description(description)
                .isActive(true)
                .build();
        return roleRepository.save(role);
    }

    private User createUser(String username, String displayName, Branch branch, Role role) {
        User user = User.builder()
                .username(username)
                .firstName("테스트")
                .lastName("사용자")
                .baptismalName("요한")
                .email(username + "@brotherhood.com")
                .passwordHash("hashedpassword")
                .branch(branch)
                .isActive(true)
                .build();
        
        user = userRepository.save(user);
        
        // 사용자에 역할 할당은 UserRole 엔티티를 통해 처리
        // 테스트에서는 단순히 사용자만 반환
        return user;
    }

    private Document createAndSaveDocument(String title, String content, User author, Branch branch) {
        Document document = Document.builder()
                .title(title)
                .content(content)
                .author(author)
                .branch(branch)
                .status("DRAFT")
                .isFinal(false)
                .version(1)
                .documentNumber(documentNumberService.generateDocumentNumber("GENERAL"))
                .build();
        
        return documentRepository.save(document);
    }
}
