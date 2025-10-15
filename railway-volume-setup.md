# Railway Volume 설정 가이드

## 방법 1: Railway 대시보드 (추천)

### 1. Volume 생성
1. https://railway.app 접속
2. 프로젝트 선택 → Backend 서비스 클릭
3. **Settings** → **Volumes** → **New Volume**
4. 설정:
   - **Volume Name**: `brotherhood-uploads`
   - **Mount Path**: `/app/uploads`
   - **Size**: `0.5GB` (무료)
5. **Add Volume** 클릭

### 2. 환경변수 설정
1. Backend 서비스 → **Variables** 탭
2. **New Variable** 클릭
3. 추가:
   ```
   UPLOAD_DIR=/app/uploads
   ```

### 3. 재배포
- Volume 추가 시 자동 재배포됩니다
- 또는 수동 재배포: **Deployments** → **Deploy**

---

## 방법 2: Railway CLI

### 1. CLI 설치 (PowerShell)
```powershell
# Windows
iwr https://railway.app/install.ps1 | iex

# 확인
railway --version
```

### 2. 로그인
```bash
railway login
```

### 3. 프로젝트 연결
```bash
cd C:\cckbm
railway link
```

### 4. Volume 생성 (CLI로는 불가, 대시보드 사용 필요)
현재 Railway CLI는 Volume 생성을 지원하지 않습니다.
대시보드에서 수동으로 생성해야 합니다.

### 5. 환경변수 설정
```bash
railway variables set UPLOAD_DIR=/app/uploads
```

---

## 확인 방법

### 1. Volume 마운트 확인
```bash
# Railway 대시보드 → Backend 서비스 → Settings → Volumes
# brotherhood-uploads가 /app/uploads에 마운트되어 있는지 확인
```

### 2. 환경변수 확인
```bash
# Railway 대시보드 → Backend 서비스 → Variables
# UPLOAD_DIR=/app/uploads 설정 확인
```

### 3. 파일 업로드 테스트
```bash
# 프론트엔드에서 문서에 파일 첨부
# Railway 로그에서 업로드 경로 확인:
# "첨부파일 업로드: documentId=xxx, filename=test.pdf"
```

### 4. Volume 사용량 확인
```bash
# Railway 대시보드 → 프로젝트 → Usage
# Storage 탭에서 Volume 사용량 확인
```

---

## 문제 해결

### Volume이 마운트되지 않는 경우
1. Volume 생성 후 최소 1회 재배포 필요
2. Mount Path가 `/app/uploads`로 정확히 설정되었는지 확인
3. 환경변수 `UPLOAD_DIR`가 올바르게 설정되었는지 확인

### 업로드 실패 시
1. Railway 로그 확인:
   ```bash
   railway logs
   ```
2. 디렉토리 권한 확인:
   - Railway Volume은 자동으로 올바른 권한 설정
3. 파일 크기 확인:
   - 최대 10MB (application.yml 설정)

### Volume이 가득 찬 경우
1. Railway 대시보드에서 사용량 확인
2. 불필요한 파일 삭제 (별도 관리 API 필요)
3. Volume 크기 증가 (유료 플랜 필요)

---

## 백업 및 복원

### Volume 백업 (Railway CLI)
```bash
# 현재 CLI는 Volume 백업을 지원하지 않음
# 대안: 주기적으로 파일을 S3나 다른 스토리지로 복사
```

### 수동 백업 방법
1. Railway 대시보드 → Backend 서비스 → Shell
2. 명령어 실행:
   ```bash
   tar -czf /tmp/backup.tar.gz /app/uploads
   # /tmp/backup.tar.gz 다운로드
   ```

---

## 비용 안내

### 무료 플랜
- **0.5GB** Volume 포함
- 추가 비용 없음

### Hobby 플랜 ($5/월)
- **5GB** Volume 포함
- 추가 비용: $0.25/GB/월

### Pro 플랜 ($20/월)
- **50GB** Volume 포함
- 추가 비용: $0.25/GB/월

---

## 다음 단계

- [ ] Railway 대시보드에서 Volume 생성
- [ ] 환경변수 `UPLOAD_DIR` 설정
- [ ] 재배포 확인
- [ ] 파일 업로드 테스트
- [ ] Volume 사용량 모니터링

