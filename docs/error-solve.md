# 오류 해결 기록

## 1. 결재 대기 목록 데이터 정제 문제

**오류 제목**: 결재선이 지정되지 않은 문서가 결재 대기 목록에 표시되는 문제

**발생한 예외처리사항 및 오류내역**:
- 결재선이 없는 문서가 `PENDING` 상태로 남아있어 결재 대기 목록에 표시됨
- `DocumentRepository.findPendingApprovalByUserId` 쿼리가 결재선 존재 여부를 확인하지 않음
- 프론트엔드에서 로컬 필터링으로 처리하려 했으나 백엔드 데이터 자체에 문제가 있음

**수정한 방식**:
1. **백엔드 수정**:
   - `DocumentRepository.findPendingApprovalByUserId` 쿼리를 서브쿼리와 `DISTINCT`를 사용하여 수정
   - 결재선이 존재하고 해당 사용자에게 대기 중인 결재단계가 있는 문서만 조회하도록 변경
   - `DocumentService.cleanUpDocumentsWithoutApprovalLines` 메서드 추가하여 관리자용 정리 API 제공

2. **프론트엔드 수정**:
   - `dashboardApi.getPendingApprovals()` API 호출로 변경
   - 로컬 필터링 로직 제거

**날짜**: 2025-09-30

**대상 기능**: 결재 대기 목록 조회

---

## 2. 문서 승인 상태 업데이트 문제

**오류 제목**: 문서 승인 후 개별 결재단계 상태가 업데이트되지 않는 문제

**발생한 예외처리사항 및 오류내역**:
- 문서 상세 화면에서 승인 버튼 클릭 시 `ApprovalStep` 상태가 `PENDING`으로 남아있음
- `DocumentService.approveDocument()`에서 문서 상태만 `APPROVED`로 변경하고 개별 결재단계는 업데이트하지 않음
- 승인 진행상황이 "대기중"으로 표시되는 문제

**수정한 방식**:
1. **백엔드 수정**:
   - `ApprovalService.updateApprovalStepStatus` 메서드 추가
   - `ApprovalStep` 상태를 `APPROVED`, `REJECTED`, `DELEGATED`로 업데이트
   - `approvedAt`, `rejectedAt`, `delegatedAt` 타임스탬프 설정
   - `ApprovalService.performApprovalAction`에서 개별 결재단계 상태 업데이트 로직 추가

2. **프론트엔드 수정**:
   - `ApprovalProgress` 컴포넌트에서 `documentStatus`를 고려한 완료 상태 로직 수정
   - 중복 결재단계 제거 로직 추가 (고유한 결재자별로 그룹화)

**날짜**: 2025-09-30

**대상 기능**: 문서 승인 처리

---

## 3. 승인 진행상황 표시 오류

**오류 제목**: 결재선 1명인 경우 1/6으로 잘못 표시되는 문제

**발생한 예외처리사항 및 오류내역**:
- 백엔드에서 중복된 `ApprovalStep` 데이터 반환
- 프론트엔드에서 중복 제거 없이 전체 결재단계 수 계산
- 결재선 1명인데 1/6으로 표시되는 문제

**수정한 방식**:
1. **프론트엔드 수정**:
   - `ApprovalProgress` 컴포넌트에서 고유한 결재자별로 그룹화하는 로직 추가
   - `uniqueApprovers` Map을 사용하여 중복 제거
   - `APPROVED` 상태 우선순위 적용
   - `uniqueSteps`를 사용하여 정확한 진행상황 계산

**날짜**: 2025-09-30

**대상 기능**: 승인 진행상황 표시

---

## 4. 404 Not Found 오류

**오류 제목**: `/api/approvals/steps/{stepId}/process` 엔드포인트 누락

**발생한 예외처리사항 및 오류내역**:
- 프론트엔드에서 개별 결재단계별 승인 API 호출 시 404 오류 발생
- `ApprovalController`에 해당 엔드포인트가 존재하지 않음
- 문서 상세 화면에서 승인/반려 버튼 클릭 시 오류 발생

**수정한 방식**:
1. **백엔드 수정**:
   - `ApprovalController`에 `/approvals/steps/{stepId}/process` POST 엔드포인트 추가
   - `ApprovalService.performApprovalAction` 메서드와 연결
   - `ApprovalActionRequest`에 `approvalStepId` 설정 로직 추가

**날짜**: 2025-09-30

**대상 기능**: 개별 결재단계 승인 처리

---

## 5. Lazy Loading 문제

**오류 제목**: `Illegal pop() with non-matching JdbcValuesSourceProcessingState` 오류

**발생한 예외처리사항 및 오류내역**:
- JPA/Hibernate Lazy Loading으로 인한 `LazyInitializationException` 발생
- 트랜잭션 범위 밖에서 연관 엔티티 접근 시 오류
- `document.getApprovalLines()` 접근 시 Lazy Loading 문제 발생

**수정한 방식**:
1. **백엔드 수정**:
   - `ApprovalService.performApprovalAction`에서 모든 연관 엔티티를 별도 쿼리로 조회
   - `ApprovalLine`, `Document`, `User` 엔티티를 명시적으로 조회하여 Lazy Loading 회피
   - `isAllRequiredStepsCompleted` 메서드에서 `document.getApprovalLines()` 대신 `approvalLineRepository.findByDocumentId()` 사용
   - `@Transactional` 어노테이션으로 트랜잭션 범위 명확화
   - try-catch 블록으로 예외 처리 강화

**날짜**: 2025-09-30

**대상 기능**: 결재 액션 수행

---

## 6. 프론트엔드 undefined 오류

**오류 제목**: `Cannot read properties of undefined (reading 'length')` 오류

**발생한 예외처리사항 및 오류내역**:
- 문서 데이터 업데이트 후 `document.tags`, `document.comments`, `attachments` 배열이 `undefined`가 됨
- React 컴포넌트에서 `.length` 속성 접근 시 오류 발생
- 문서 상세 화면이 렌더링되지 않는 문제

**수정한 방식**:
1. **프론트엔드 수정**:
   - `document.tags && document.tags.length > 0`로 안전한 접근
   - `attachments && attachments.length > 0`로 안전한 접근
   - `document.comments ? document.comments.length : 0`로 안전한 접근
   - `document.comments && document.comments.map()`로 안전한 접근

**날짜**: 2025-09-30

**대상 기능**: 문서 상세 화면 렌더링

---

## 해결된 주요 문제 요약

1. **데이터 정제**: 결재선이 없는 문서가 결재 대기 목록에 표시되는 문제 해결
2. **상태 업데이트**: 개별 결재단계 상태 업데이트 로직 추가
3. **진행상황 표시**: 중복 제거 로직으로 정확한 승인 진행상황 표시
4. **API 엔드포인트**: 누락된 개별 결재단계 승인 API 추가
5. **Lazy Loading**: JPA Lazy Loading 문제 완전 해결
6. **프론트엔드 안정성**: undefined 접근 오류 방지

모든 문제가 해결되어 결재 시스템이 정상적으로 작동합니다.
