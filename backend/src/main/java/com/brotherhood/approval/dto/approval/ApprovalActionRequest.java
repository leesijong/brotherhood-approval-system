package com.brotherhood.approval.dto.approval;

import com.brotherhood.approval.entity.ApprovalStep;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 결재 액션 요청 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalActionRequest {
    
    @NotNull(message = "결재단계 ID는 필수입니다")
    private String approvalStepId;
    
    @NotNull(message = "결재 액션은 필수입니다")
    private ApprovalAction action;
    
    private String comments;
    private String ipAddress;
    private String userAgent;
    private String delegatedToId;
    
    public String getAction() {
        return action != null ? action.name() : null;
    }
    
    public String getApprovalStepId() {
        return approvalStepId;
    }
    
    public String getComment() {
        return comments;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public String getDelegatedToId() {
        return delegatedToId;
    }
    
    public enum ApprovalAction {
        APPROVE("승인"),
        REJECT("반려"),
        DELEGATE("위임");
        
        private final String description;
        
        ApprovalAction(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
        
        public String getStatus() {
            return switch (this) {
                case APPROVE -> "APPROVED";
                case REJECT -> "REJECTED";
                case DELEGATE -> "DELEGATED";
            };
        }
    }
}

