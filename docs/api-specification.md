# API 명세서

## 기본 정보

- **Base URL**: `http://localhost:8080/api/v1`
- **인증 방식**: JWT Bearer Token
- **Content-Type**: `application/json`
- **문서화**: Swagger UI (`http://localhost:8080/swagger-ui.html`)

## 인증 API

### 1. 로그인
```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@cckbm.org",
      "firstName": "관리자",
      "lastName": "김",
      "branch": {
        "id": 1,
        "name": "본원",
        "code": "HQ"
      },
      "roles": ["ADMIN"]
    }
  }
}
```

### 2. 토큰 갱신
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

### 3. 로그아웃
```http
POST /auth/logout
Authorization: Bearer {token}
```

## 사용자 관리 API

### 1. 사용자 목록 조회
```http
GET /users?page=0&size=20&branchId=1&role=ADMIN
Authorization: Bearer {token}
```

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@cckbm.org",
        "firstName": "관리자",
        "lastName": "김",
        "branch": {
          "id": 1,
          "name": "본원",
          "code": "HQ"
        },
        "roles": ["ADMIN"],
        "isActive": true,
        "lastLoginAt": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "totalElements": 1,
      "totalPages": 1
    }
  }
}
```

### 2. 사용자 상세 조회
```http
GET /users/{userId}
Authorization: Bearer {token}
```

### 3. 사용자 생성
```http
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@cckbm.org",
  "password": "password123",
  "firstName": "새",
  "lastName": "사용자",
  "branchId": 1,
  "roleIds": [1, 2]
}
```

### 4. 사용자 수정
```http
PUT /users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "updated@cckbm.org",
  "firstName": "수정된",
  "lastName": "사용자",
  "branchId": 1,
  "roleIds": [1, 2],
  "isActive": true
}
```

## 문서 관리 API

### 1. 문서 목록 조회
```http
GET /documents?page=0&size=20&status=DRAFT&authorId=1&documentType=EXPENSE
Authorization: Bearer {token}
```

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "경비 신청서",
        "documentType": "EXPENSE",
        "status": "PENDING",
        "priority": "NORMAL",
        "securityLevel": "GENERAL",
        "author": {
          "id": 1,
          "username": "admin",
          "firstName": "관리자",
          "lastName": "김"
        },
        "branch": {
          "id": 1,
          "name": "본원",
          "code": "HQ"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "submittedAt": "2024-01-15T11:00:00Z",
        "currentStep": {
          "stepOrder": 1,
          "approver": {
            "id": 2,
            "firstName": "승인자",
            "lastName": "이"
          },
          "status": "PENDING"
        }
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "totalElements": 1,
      "totalPages": 1
    }
  }
}
```

### 2. 문서 상세 조회
```http
GET /documents/{documentId}
Authorization: Bearer {token}
```

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "경비 신청서",
    "content": "문서 내용...",
    "documentType": "EXPENSE",
    "status": "PENDING",
    "priority": "NORMAL",
    "securityLevel": "GENERAL",
    "version": 1,
    "author": {
      "id": 1,
      "username": "admin",
      "firstName": "관리자",
      "lastName": "김"
    },
    "branch": {
      "id": 1,
      "name": "본원",
      "code": "HQ"
    },
    "approvalLines": [
      {
        "id": 1,
        "name": "기본 결재선",
        "type": "SEQUENTIAL",
        "status": "PENDING",
        "steps": [
          {
            "id": 1,
            "stepOrder": 1,
            "approver": {
              "id": 2,
              "firstName": "승인자",
              "lastName": "이"
            },
            "stepType": "REVIEW",
            "status": "PENDING",
            "startedAt": "2024-01-15T11:00:00Z",
            "dueDate": "2024-01-17T18:00:00Z"
          }
        ]
      }
    ],
    "comments": [
      {
        "id": 1,
        "content": "검토 의견입니다.",
        "author": {
          "id": 2,
          "firstName": "승인자",
          "lastName": "이"
        },
        "commentType": "REVIEW",
        "isInternal": false,
        "createdAt": "2024-01-15T14:30:00Z"
      }
    ],
    "attachments": [
      {
        "id": 1,
        "filename": "receipt.pdf",
        "originalName": "영수증.pdf",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "uploadedBy": {
          "id": 1,
          "firstName": "관리자",
          "lastName": "김"
        },
        "uploadedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T14:30:00Z",
    "submittedAt": "2024-01-15T11:00:00Z"
  }
}
```

### 3. 문서 생성
```http
POST /documents
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "새 문서",
  "content": "문서 내용",
  "documentType": "GENERAL",
  "priority": "NORMAL",
  "securityLevel": "GENERAL",
  "approvalLineId": 1
}
```

### 4. 문서 수정
```http
PUT /documents/{documentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "수정된 문서",
  "content": "수정된 내용",
  "priority": "HIGH"
}
```

### 5. 문서 상신
```http
POST /documents/{documentId}/submit
Authorization: Bearer {token}
```

### 6. 문서 회수
```http
POST /documents/{documentId}/recall
Authorization: Bearer {token}
```

## 결재 관리 API

### 1. 결재 처리
```http
POST /approvals/{stepId}/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "APPROVE", // APPROVE, REJECT, RETURN
  "comments": "승인합니다.",
  "isInternal": false
}
```

### 2. 결재선 조회
```http
GET /approvals/lines?documentId=1
Authorization: Bearer {token}
```

### 3. 결재 이력 조회
```http
GET /approvals/history?documentId=1
Authorization: Bearer {token}
```

## 댓글 관리 API

### 1. 댓글 목록 조회
```http
GET /comments?documentId=1
Authorization: Bearer {token}
```

### 2. 댓글 생성
```http
POST /comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "documentId": 1,
  "content": "댓글 내용",
  "commentType": "GENERAL",
  "isInternal": false,
  "parentId": null
}
```

### 3. 댓글 수정
```http
PUT /comments/{commentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "수정된 댓글 내용"
}
```

### 4. 댓글 삭제
```http
DELETE /comments/{commentId}
Authorization: Bearer {token}
```

## 첨부파일 관리 API

### 1. 파일 업로드
```http
POST /attachments/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary file data]
documentId: 1
```

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "filename": "uploaded_file.pdf",
    "originalName": "원본파일.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. 파일 다운로드
```http
GET /attachments/{attachmentId}/download
Authorization: Bearer {token}
```

### 3. 파일 삭제
```http
DELETE /attachments/{attachmentId}
Authorization: Bearer {token}
```

## 대시보드 API

### 1. 대시보드 통계
```http
GET /dashboard/stats
Authorization: Bearer {token}
```

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "myDocuments": {
      "draft": 5,
      "pending": 3,
      "approved": 12,
      "rejected": 2
    },
    "pendingApprovals": {
      "review": 2,
      "approve": 1,
      "overdue": 0
    },
    "recentActivities": [
      {
        "id": 1,
        "action": "DOCUMENT_CREATED",
        "description": "새 문서를 생성했습니다.",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 2. 알림 목록
```http
GET /notifications?page=0&size=20&unreadOnly=true
Authorization: Bearer {token}
```

## 관리자 API

### 1. 지사 관리
```http
GET /admin/branches
POST /admin/branches
PUT /admin/branches/{branchId}
DELETE /admin/branches/{branchId}
Authorization: Bearer {token}
```

### 2. 역할 관리
```http
GET /admin/roles
POST /admin/roles
PUT /admin/roles/{roleId}
DELETE /admin/roles/{roleId}
Authorization: Bearer {token}
```

### 3. 정책 관리
```http
GET /admin/policies
POST /admin/policies
PUT /admin/policies/{policyId}
DELETE /admin/policies/{policyId}
Authorization: Bearer {token}
```

### 4. 감사 로그 조회
```http
GET /admin/audit-logs?page=0&size=20&userId=1&action=LOGIN&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}
```

## 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "요청이 성공적으로 처리되었습니다.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      {
        "field": "email",
        "message": "이메일 형식이 올바르지 않습니다."
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 에러 코드

| 코드 | HTTP 상태 | 설명 |
|------|-----------|------|
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `UNAUTHORIZED` | 401 | 인증 실패 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `CONFLICT` | 409 | 리소스 충돌 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

## 페이지네이션

모든 목록 API는 다음 파라미터를 지원합니다:

- `page`: 페이지 번호 (0부터 시작)
- `size`: 페이지 크기 (기본값: 20)
- `sort`: 정렬 필드 (예: `createdAt,desc`)

## 필터링

문서 목록 API는 다음 필터를 지원합니다:

- `status`: 문서 상태 (DRAFT, PENDING, APPROVED, REJECTED)
- `documentType`: 문서 유형 (GENERAL, EXPENSE, CONTRACT, etc.)
- `authorId`: 작성자 ID
- `branchId`: 지사 ID
- `priority`: 우선순위 (LOW, NORMAL, HIGH, URGENT)
- `securityLevel`: 보안 등급 (GENERAL, CONFIDENTIAL, SECRET, TOP_SECRET)
- `startDate`: 시작 날짜 (ISO 8601)
- `endDate`: 종료 날짜 (ISO 8601)

이 API 명세서는 로컬 개발 환경에서 구현할 REST API의 기본 구조를 정의합니다. 실제 구현 시 세부사항은 조정될 수 있습니다.
