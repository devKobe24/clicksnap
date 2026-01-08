# 📸 ClickSnap - 찰칵찰칵

웹캠을 이용한 4컷 사진 촬영 서비스

## ✨ 주요 기능

- 🎥 **웹캠 촬영**: 실시간 웹캠으로 4장의 사진 연속 촬영
- ⏱️ **카운트다운**: 5초 카운트다운으로 촬영 준비 시간 제공
- 🎨 **다양한 필터**: 11가지 감성 필터 제공
    - Original, Clearly, Monochrome, Sepia, Warm, Cool
    - Vintage, Fade, Milk, Film, Retro
- 🖼️ **4컷 합성**: 촬영한 4장의 사진을 자동으로 세로형 스트립으로 합성
- 💾 **사진 저장**: 완성된 4컷 사진을 PNG 형식으로 다운로드
- 🔄 **다시 찍기**: 마음에 들지 않으면 언제든 다시 촬영 가능

## 🛠️ 기술 스택

### Backend
- **Java 17**
- **Spring Boot 3.3.5**
- **Gradle 9.2.1**

### Frontend
- **HTML5 / CSS3**
- **Vanilla JavaScript**
- **Canvas API**
- **MediaStream API**

### 주요 라이브러리
- Spring Boot Web
- Spring Boot Validation
- Lombok
- Spring Boot DevTools

## 📁 프로젝트 구조

```
clicksnap/
├── src/
│   ├── main/
│   │   ├── java/com/clicksnap/
│   │   │   ├── config/
│   │   │   │   └── WebConfig.java              # CORS 및 정적 리소스 설정
│   │   │   ├── controller/
│   │   │   │   └── PhotoController.java        # 사진 업로드 API
│   │   │   ├── dto/
│   │   │   │   └── PhotoResponse.java          # 응답 DTO
│   │   │   ├── service/
│   │   │   │   ├── PhotoService.java           # 사진 처리 비즈니스 로직
│   │   │   │   ├── StorageService.java         # 파일 저장 인터페이스
│   │   │   │   └── FileSystemStorageService.java  # 파일 시스템 저장 구현체
│   │   │   └── ClicksnapApplication.java       # 메인 애플리케이션
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── css/style.css               # 스타일시트
│   │       │   ├── js/script.js                # 메인 JavaScript
│   │       │   └── index.html                  # 메인 페이지
│   │       └── application.yml                 # 애플리케이션 설정
│   └── test/
│       └── java/com/clicksnap/
│           └── ClicksnapApplicationTests.java
├── build.gradle
└── README.md
```

## 🚀 설치 및 실행

### 사전 요구사항
- Java 17 이상
- Gradle 9.2.1 이상
- 웹캠이 있는 환경

### 1. 프로젝트 클론
```bash
git clone [repository-url]
cd clicksnap
```

### 2. 애플리케이션 설정
`src/main/resources/` 디렉토리에 `application-dev.yml` 파일을 생성하세요:

```yaml
file:
  upload-dir: ./uploads  # 파일 저장 경로
```

### 3. 빌드 및 실행
```bash
# Gradle을 이용한 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun
```

### 4. 브라우저 접속
```
http://localhost:8080
```

## 📡 API 명세

### 사진 업로드
사진 파일을 서버에 업로드합니다.

**Endpoint**
```
POST /api/photos
```

**Request**
- Content-Type: `multipart/form-data`
- Parameter: `image` (MultipartFile)

**Response**
```json
{
  "accessUrl": "/images/550e8400-e29b-41d4-a716-446655440000.png"
}
```

**HTTP Status**
- `201 Created`: 업로드 성공
- `400 Bad Request`: 잘못된 요청

## 🎯 주요 기능 상세

### 1. 웹캠 촬영 프로세스
```
카메라 권한 요청 → 촬영 시작 → 5초 카운트다운 → 1컷 촬영 
→ 5초 카운트다운 → 2컷 촬영 → ... → 4컷 완료 → 자동 합성
```

### 2. 사진 합성 규격
- **단일 컷**: 900 x 1200px (3:4 비율)
- **최종 스트립**: 1000 x 5200px (세로형)
- **사진 영역**: 900 x 4800px (4컷)
- **프레임 여백**: 상/하/좌/우 50px
- **구분선**: 45px (검정색)

### 3. 필터 시스템
- **Canvas Filter API** 지원 브라우저에서는 CSS Filter 문법 사용
- **미지원 브라우저**에서는 픽셀 단위 필터링 fallback 제공
- 모든 주요 브라우저 호환 (Chrome, Safari, Firefox, Edge)

### 4. 파일 저장
- **저장 경로**: `./uploads` (설정 가능)
- **파일명**: UUID 기반 중복 방지
- **보안**: Path Traversal 공격 방지
- **용량 제한**: 최대 10MB

## 🔧 설정 옵션

### application.yml
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB        # 단일 파일 최대 크기
      max-request-size: 10MB     # 전체 요청 최대 크기

file:
  upload-dir: ./uploads           # 업로드 디렉토리
  access-url-prefix: /images/     # 파일 접근 URL 접두사
```

### CORS 설정 (WebConfig.java)
```java
.allowedOrigins("http://localhost:3000", "http://127.0.0.1:5500")
.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
```

## 🎨 커스터마이징

### 촬영 설정 변경
`src/main/resources/static/js/script.js`에서 다음 값을 수정할 수 있습니다:

```javascript
const PHOTO_COUNT = 4;           // 촬영 매수 (기본: 4컷)
const COUNTDOWN_SEC = 5;         // 카운트다운 시간 (기본: 5초)
const STRIP_BG_COLOR = "#040404ff"; // 프레임 색상
```

### 새로운 필터 추가
```javascript
window.CLICKSNAP_FILTERS = {
  // ... 기존 필터들
  custom: { 
    name: "Custom", 
    filter: "brightness(1.2) contrast(1.1)" 
  }
};
```

## 🐛 트러블슈팅

### 웹캠이 작동하지 않는 경우
- 브라우저에서 카메라 권한을 허용했는지 확인
- HTTPS 환경이 아닌 경우 `localhost`에서만 작동

### 업로드 파일 크기 초과
- `application.yml`에서 `max-file-size` 설정 확인

### CORS 에러 발생
- `WebConfig.java`의 `allowedOrigins`에 프론트엔드 주소 추가

## 📝 개발 정보

### 빌드 정보
- **Group**: com.clicksnap
- **Artifact**: clicksnap
- **Version**: 0.0.1-SNAPSHOT
- **Build File**: click-snap-2.0.1.jar

### 라이센스
이 프로젝트는 [라이센스 명시] 하에 배포됩니다.

---
