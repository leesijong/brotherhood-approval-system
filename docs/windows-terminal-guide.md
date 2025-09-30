# Windows Terminal 사용 가이드

## Windows Terminal 설치 및 설정

### 1. Windows Terminal 설치
- **Microsoft Store**에서 "Windows Terminal" 검색 후 설치
- 또는 [GitHub 릴리스](https://github.com/microsoft/terminal/releases)에서 다운로드

### 2. Windows Terminal 실행
```bash
# Windows Terminal 실행
wt

# 특정 디렉토리에서 PowerShell 실행
wt powershell -NoExit -Command "cd C:\cckbm"

# 여러 탭으로 실행
wt -p "PowerShell" -p "Command Prompt"
```

### 3. 프로젝트별 설정

#### Brotherhood 프로젝트용 설정
```bash
# 백엔드 실행 (PowerShell)
wt powershell -NoExit -Command "cd C:\cckbm\backend; gradle bootRun"

# 프론트엔드 실행 (PowerShell)
wt powershell -NoExit -Command "cd C:\cckbm\brotherhood; npm run dev"

# 동시 실행 (두 개 탭)
wt powershell -NoExit -Command "cd C:\cckbm\backend; gradle bootRun" ; wt powershell -NoExit -Command "cd C:\cckbm\brotherhood; npm run dev"
```

### 4. Windows Terminal 단축키

| 단축키 | 기능 |
|--------|------|
| `Ctrl + Shift + T` | 새 탭 열기 |
| `Ctrl + Shift + W` | 현재 탭 닫기 |
| `Ctrl + Tab` | 다음 탭으로 이동 |
| `Ctrl + Shift + Tab` | 이전 탭으로 이동 |
| `Alt + F4` | Windows Terminal 종료 |
| `Ctrl + Shift + +` | 폰트 크기 증가 |
| `Ctrl + Shift + -` | 폰트 크기 감소 |
| `Ctrl + Shift + 0` | 폰트 크기 초기화 |

### 5. 프로필 설정

#### PowerShell 프로필
```json
{
  "guid": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}",
  "name": "PowerShell",
  "commandline": "powershell.exe",
  "startingDirectory": "C:\\cckbm",
  "fontFace": "Cascadia Code",
  "fontSize": 12
}
```

#### Command Prompt 프로필
```json
{
  "guid": "{0caa0dad-35be-5f56-a8ff-afceeeaa6101}",
  "name": "Command Prompt",
  "commandline": "cmd.exe",
  "startingDirectory": "C:\\cckbm",
  "fontFace": "Consolas",
  "fontSize": 12
}
```

### 6. 개발 워크플로우

#### 백엔드 개발
```bash
# Windows Terminal에서 백엔드 실행
wt powershell -NoExit -Command "cd C:\cckbm\backend; gradle bootRun"
```

#### 프론트엔드 개발
```bash
# Windows Terminal에서 프론트엔드 실행
wt powershell -NoExit -Command "cd C:\cckbm\brotherhood; npm run dev"
```

#### 동시 개발
```bash
# 백엔드와 프론트엔드를 동시에 실행
wt powershell -NoExit -Command "cd C:\cckbm\backend; gradle bootRun" ; wt powershell -NoExit -Command "cd C:\cckbm\brotherhood; npm run dev"
```

### 7. 문제 해결

#### PowerShell 출력 문제 해결
- Windows Terminal은 PowerShell의 출력 버퍼링 문제를 자동으로 해결
- 실시간 출력이 정상적으로 표시됨
- 긴 명령어 실행 시에도 대기 상태 없이 진행

#### 성능 최적화
- Windows Terminal은 GPU 가속을 사용하여 빠른 렌더링
- 대용량 출력도 부드럽게 처리
- 메모리 사용량 최적화

### 8. 추가 기능

#### 탭 제목 설정
```bash
# 탭 제목 설정
wt powershell -NoExit -Command "cd C:\cckbm\backend; $Host.UI.RawUI.WindowTitle = 'Backend - Brotherhood'"
```

#### 색상 테마 변경
- Windows Terminal 설정에서 다양한 색상 테마 선택 가능
- 다크/라이트 모드 지원
- 커스텀 색상 설정 가능

### 9. 권장 설정

#### 개발용 설정
- **폰트**: Cascadia Code (코드 가독성 최적화)
- **폰트 크기**: 12pt
- **색상 테마**: Campbell Powershell (기본)
- **시작 디렉토리**: C:\cckbm

#### 디버깅용 설정
- **폰트**: Consolas (고정폭)
- **폰트 크기**: 11pt
- **색상 테마**: Solarized Dark
- **시작 디렉토리**: C:\cckbm

## 결론

Windows Terminal을 사용하면:
- ✅ PowerShell 출력 문제 해결
- ✅ 멀티탭 지원으로 효율적인 개발
- ✅ GPU 가속으로 빠른 렌더링
- ✅ 커스터마이징 가능한 UI
- ✅ 향상된 사용자 경험

앞으로 모든 터미널 작업은 Windows Terminal을 사용하시면 됩니다!
