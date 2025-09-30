package com.brotherhood.approval.controller;

import com.brotherhood.approval.dto.BaseResponse;
import com.brotherhood.approval.dto.attachment.AttachmentDto;
import com.brotherhood.approval.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
@Slf4j
public class AttachmentController {

    private final AttachmentService attachmentService;

    /**
     * 첨부파일 목록 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<AttachmentDto>> getAttachment(@PathVariable String id) {
        try {
            log.info("첨부파일 조회 요청: {}", id);
            // TODO: getAttachment 메서드 구현 필요
            return ResponseEntity.ok(BaseResponse.success(null, "첨부파일 조회 기능은 추후 구현됩니다."));
        } catch (Exception e) {
            log.error("첨부파일 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error("첨부파일 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 첨부파일 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteAttachment(@PathVariable String id) {
        try {
            log.info("첨부파일 삭제 요청: {}", id);
            attachmentService.deleteAttachment(id);
            return ResponseEntity.ok(BaseResponse.success(null, "첨부파일이 성공적으로 삭제되었습니다."));
        } catch (Exception e) {
            log.error("첨부파일 삭제 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error("첨부파일 삭제에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 첨부파일 통계 조회
     */
    @GetMapping("/stats")
    public ResponseEntity<BaseResponse<Object>> getAttachmentStats() {
        try {
            log.info("첨부파일 통계 조회 요청");
            long totalCount = attachmentService.getAttachmentCount();
            long totalSize = attachmentService.getTotalSize();
            
            var stats = new Object() {
                public final long count = totalCount;
                public final long size = totalSize;
                public final String formattedSize = formatFileSize(totalSize);
            };
            
            return ResponseEntity.ok(BaseResponse.success(stats, "첨부파일 통계를 조회했습니다."));
        } catch (Exception e) {
            log.error("첨부파일 통계 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(BaseResponse.error("첨부파일 통계 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
