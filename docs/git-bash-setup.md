# Git Bash 설정 가이드

## 🖥️ **Git Bash 설치 및 설정**

### 1. Git Bash 설치 확인
```bash
# Git 버전 확인
git --version
# 예상 출력: git version 2.51.0.windows.1

# Git Bash 경로 확인
which git
# 예상 출력: /c/Program Files/Git/cmd/git.exe
```

### 2. Windows Terminal + Git Bash 설정 (권장)

#### Windows Terminal 설치
1. Microsoft Store에서 "Windows Terminal" 검색하여 설치
2. 또는 [GitHub 릴리스 페이지](https://github.com/microsoft/terminal/releases)에서 다운로드

#### Git Bash 프로필 추가
1. Windows Terminal 실행
2. `Ctrl + ,` (설정 열기)
3. "새 프로필" → "Git Bash" 선택
4. 설정:
   - **이름**: Git Bash
   - **명령줄**: `C:\Program Files\Git\bin\bash.exe`
   - **시작 디렉토리**: `C:\cckbm`
   - **아이콘**: Git 아이콘 선택

### 3. Git Bash 기본 설정

#### .bashrc 파일 설정
```bash
# Git Bash 홈 디렉토리로 이동
cd ~

# .bashrc 파일 생성/편집
nano .bashrc
```

다음 내용을 추가:
```bash
# Brotherhood Approval System 환경 설정
export PATH="$PATH:/c/gradle-8.5/bin"
export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-17.0.16.8-hotspot"
export PGCLIENTENCODING="UTF8"
export PGPASSWORD="postgres"

# Git Bash 인코딩 설정
export LANG=ko_KR.UTF-8
export LC_ALL=ko_KR.UTF-8

# 프로젝트 디렉토리로 이동
cd /c/cckbm

# 환영 메시지
echo "🚀 Brotherhood Approval System 개발 환경이 준비되었습니다!"
echo "📁 현재 위치: $(pwd)"
echo "☕ Java: $(java -version 2>&1 | head -n 1)"
echo "🗄️  PostgreSQL: $(psql --version)"
```

#### .bashrc 적용
```bash
# 현재 세션에 적용
source ~/.bashrc

# 또는 Git Bash 재시작
```

### 4. 프로젝트별 명령어 설정

#### 프로젝트 루트에 .bashrc 생성
```bash
# 프로젝트 루트로 이동
cd /c/cckbm

# 프로젝트별 .bashrc 생성
cat > .bashrc << 'EOF'
# Brotherhood Approval System 프로젝트 설정

# 프로젝트 루트로 이동
cd /c/cckbm

# 유용한 별칭 설정
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'

# 프로젝트 관련 명령어
alias backend='cd /c/cckbm/backend'
alias frontend='cd /c/cckbm/brotherhood'
alias db='cd /c/cckbm'

# 백엔드 실행
alias run-backend='cd /c/cckbm/backend && ./gradlew bootRun'
alias build-backend='cd /c/cckbm/backend && ./gradlew clean build'

# 프론트엔드 실행
alias run-frontend='cd /c/cckbm/brotherhood && npm run dev'
alias install-frontend='cd /c/cckbm/brotherhood && npm install'

# 데이터베이스 연결
alias connect-db='psql -U postgres -d approval_system_dev'

# 프로젝트 상태 확인
alias status='echo "=== 프로젝트 상태 ===" && echo "📁 현재 위치: $(pwd)" && echo "☕ Java: $(java -version 2>&1 | head -n 1)" && echo "🗄️  PostgreSQL: $(psql --version)"'

# 도움말
alias help='echo "=== Brotherhood Approval System 명령어 ===" && echo "backend: 백엔드 디렉토리로 이동" && echo "frontend: 프론트엔드 디렉토리로 이동" && echo "run-backend: 백엔드 실행" && echo "run-frontend: 프론트엔드 실행" && echo "connect-db: 데이터베이스 연결" && echo "status: 프로젝트 상태 확인"'

echo "🎯 Brotherhood Approval System 명령어가 준비되었습니다!"
echo "💡 'help' 명령어로 사용 가능한 명령어를 확인하세요."
EOF

# .bashrc 적용
source .bashrc
```

### 5. Git Bash 사용법

#### 기본 명령어
```bash
# 현재 위치 확인
pwd

# 디렉토리 목록 보기
ls -la

# 디렉토리 이동
cd /c/cckbm/backend

# 파일 편집 (nano 사용)
nano filename.txt

# 프로세스 확인
ps aux | grep java

# 포트 확인
netstat -tulpn | grep :8080
```

#### 프로젝트 실행
```bash
# 1. 백엔드 실행
run-backend

# 2. 새 터미널에서 프론트엔드 실행
run-frontend

# 3. 데이터베이스 연결
connect-db
```

### 6. 문제 해결

#### Git Bash가 느린 경우
```bash
# Git Bash 설정에서 "Fast startup" 비활성화
# 또는 다음 명령어로 확인
echo $MSYS
```

#### 한글 인코딩 문제
```bash
# 인코딩 설정 확인
echo $LANG
echo $LC_ALL

# UTF-8로 설정
export LANG=ko_KR.UTF-8
export LC_ALL=ko_KR.UTF-8
```

#### 경로 문제
```bash
# Windows 경로를 Unix 스타일로 변환
# C:\cckbm → /c/cckbm
# C:\Program Files → /c/Program\ Files
```

### 7. 유용한 팁

#### 탭 완성 설정
```bash
# .bashrc에 추가
bind 'set completion-ignore-case on'
bind 'set show-all-if-ambiguous on'
```

#### 히스토리 검색
```bash
# Ctrl + R: 명령어 히스토리 검색
# Ctrl + S: 순방향 검색
# Ctrl + G: 검색 취소
```

#### 멀티라인 명령어
```bash
# 백슬래시(\)로 명령어 연결
cd /c/cckbm/backend && \
./gradlew clean build && \
./gradlew bootRun
```

이제 Git Bash를 사용하여 Brotherhood Approval System을 효율적으로 개발할 수 있습니다! 🚀

