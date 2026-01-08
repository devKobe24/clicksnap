// ==========================================
// 설정 값
// ==========================================
const PHOTO_COUNT = 4; // 찍을 매수
const COUNTDOWN_SEC = 5; // 카운트다운 초
const STRIP_BG_COLOR = "#040404ff"; // 프레임 색상 (검정)

// 필터 프리셋 정의
window.CLICKSNAP_FILTERS = {
  original: { name: "Original", filter: "none" },
  sharp: { name: "Clearly", filter: "contrast(1.2) saturate(1.1)" },
  mono: { name: "Monochrome", filter: "grayscale(100%)" },
  sepia: { name: "Sepia", filter: "sepia(85%)" },
  warm: { name: "Warm", filter: "brightness(1.05) saturate(1.25)" },
  cool: { name: "Cool", filter: "contrast(1.1) hue-rotate(180deg)" },
  vintage: { name: "Vintage", filter: "sepia(60%) contrast(1.1) saturate(1.15)" },
  fade: { name: "Fade", filter: "brightness(1.1) contrast(0.9) saturate(0.9)" },
  milk: { name: "Milk", filter: "brightness(1.15) saturate(0.85)" },
  film: { name: "Film", filter: "contrast(1.15) saturate(1.1) sepia(30%)" },
  retro: { name: "Retro", filter: "hue-rotate(15deg) contrast(1.2) saturate(1.3)" }
};

// DOM 요소 선택
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const countdownEl = document.getElementById("countdown");
const flashEl = document.getElementById("flash");
const resultArea = document.getElementById("resultArea");
const resultImg = document.getElementById("resultImg");
const downloadBtn = document.getElementById("downloadBtn");
const retakeBtn = document.getElementById("retakeBtn");
const filterBtn = document.getElementById("filterBtn");
const filterModal = document.getElementById("filterModal");
const closeFilterModal = document.getElementById("closeFilterModal");
const filterOptions = document.querySelectorAll(".filter-option");
const container = document.querySelector(".container");

let photos = []; // 찍은 사진 데이터를 저장할 배열
let selectedFilter = "original"; // 선택된 필터 (기본값: 원본)
let originalImageUrl = ""; // 원본 이미지 URL 저장

// 프레임 타입 (미니멀 스트립만 사용)
function getSelectedFrameType() {
  return "minimal";
}

// 비디오 컨테이너 크기 업데이트
function updateVideoContainerSize() {
  // 미니멀 스트립: 3:4 비율 유지, 프리뷰용으로 작게 표시 (450 x 600px)
  container.style.width = "450px";
  container.style.height = "600px";
}

// ==========================================
// 1. 초기화 및 이벤트 리스너
// ==========================================

// 페이지 로드 시 카메라 켜기
window.addEventListener("load", initCamera);

// 버튼 클릭 이벤트 연결
startBtn.addEventListener("click", startPhotoBooth);
downloadBtn.addEventListener("click", downloadPhoto);
retakeBtn.addEventListener("click", resetPhotoBooth);
filterBtn.addEventListener("click", openFilterModal);
closeFilterModal.addEventListener("click", closeFilterModalFunc);

// 필터 선택 이벤트
filterOptions.forEach((option) => {
  option.addEventListener("click", () => {
    selectedFilter = option.dataset.filter;
    updateFilterSelection();
    applyFilterToResultImage();
    closeFilterModalFunc();
  });
});

// 초기 로드 시 컨테이너 크기 설정 및 버튼 상태 초기화
window.addEventListener("load", () => {
  updateVideoContainerSize();
  downloadBtn.disabled = true; // 초기에는 비활성화
  retakeBtn.disabled = true; // 초기에는 비활성화
});

// ==========================================
// 2. 핵심 로직 함수들
// ==========================================

// 웹캠 시작
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
    });
    video.srcObject = stream;
  } catch (err) {
    alert("웹캠을 찾을 수 없거나 권한이 없습니다.");
    console.error(err);
  }
}

// 촬영 프로세스 시작
async function startPhotoBooth() {
  startBtn.disabled = true;
  downloadBtn.disabled = true; // 사진 저장 버튼 비활성화
  retakeBtn.disabled = true; // 다시 찍기 버튼 비활성화
  resultArea.style.display = "none";
  photos = []; // 초기화

  for (let i = 1; i <= PHOTO_COUNT; i++) {
    await runCountdown();
    capturePhoto();
  }

  // 4장 다 찍으면 합성 시작
  createPhotoStrip();
}

// 카운트다운 로직
function runCountdown() {
  return new Promise((resolve) => {
    let count = COUNTDOWN_SEC;
    countdownEl.style.display = "block";
    countdownEl.innerText = count;

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownEl.innerText = count;
      } else {
        clearInterval(timer);
        countdownEl.style.display = "none";
        resolve(); // 카운트다운 끝
      }
    }, 1000);
  });
}

// 사진 찰칵 (메모리에 저장)
function capturePhoto() {
  // 플래시 효과
  flashEl.style.opacity = 1;
  setTimeout(() => (flashEl.style.opacity = 0), 100);

  // 미니멀 스트립용: 3:4 비율 고정 (900x1200)
  const w = 900;
  const h = 1200; // 3:4 비율 고정
  
  canvas.width = w;
  canvas.height = h;

  // 비디오의 원본 크기와 비율
  const videoWidth = video.videoWidth || 1280;
  const videoHeight = video.videoHeight || 720;
  const videoAspect = videoWidth / videoHeight;
  const targetAspect = w / h; // 3:4 = 0.75

  // 거울 모드 보정 (좌우 반전해서 그리기)
  ctx.save(); // 현재 상태 저장
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  
  // 비디오를 3:4 비율에 맞춰서 그리기 (크롭하여 중앙 정렬)
  if (videoAspect > targetAspect) {
    // 비디오가 더 넓음 - 높이에 맞춤
    const drawWidth = h * videoAspect;
    const drawX = (w - drawWidth) / 2;
    ctx.drawImage(video, drawX, 0, drawWidth, h);
  } else {
    // 비디오가 더 높음 - 너비에 맞춤
    const drawHeight = w / videoAspect;
    const drawY = (h - drawHeight) / 2;
    ctx.drawImage(video, 0, drawY, w, drawHeight);
  }
  
  ctx.restore(); // transform 상태 복원

  // 이미지 데이터 저장 (base64)
  photos.push(canvas.toDataURL("image/png"));
}

// 찰칵찰칵 스트립 만들기 (이미지 합성)
async function createPhotoStrip() {
  resultArea.style.display = "flex";

  // 미니멀 스트립만 사용
  await createMinimalStrip();

  // 캔버스를 data URL로 변환하여 직접 표시 (서버 업로드 불필요)
  const dataUrl = canvas.toDataURL("image/png");
  originalImageUrl = dataUrl; // 원본 이미지 URL 저장 (data URL)
  resultImg.src = dataUrl;

  // 버튼 활성화
  startBtn.disabled = false; // 다시 찍기 활성화
  downloadBtn.disabled = false; // 사진 저장 버튼 활성화
  retakeBtn.disabled = false; // 다시 찍기 버튼 활성화
  filterBtn.style.display = "block"; // 필터 고르기 버튼 표시
}

// 미니멀 스트립 생성
async function createMinimalStrip() {
  // 1. 단일컷: 900 x 1200px, 비율 3:4
  const photoW = 900;
  const photoH = 1200;
  
  // 2. 4컷 합성 결과
  // 캔버스: 1000 x 5200 px (세로형)
  const stripWidth = 1000;
  const stripHeight = 5200;
  
  // 사진 영역: 900 x 4800 px
  const photosAreaHeight = photoH * PHOTO_COUNT; // 1200 * 4 = 4800
  
  // 프레임 여백: 상/하/좌/우 각 50px 내외
  const padding = (stripWidth - photoW) / 2; // 좌우 여백 (50px씩)
  const topPadding = 50; // 상단 여백 50px
  const bottomPadding = stripHeight - photosAreaHeight - topPadding; // 하단 여백 (5200 - 4800 - 50 = 350px)

  canvas.width = stripWidth;
  canvas.height = stripHeight;

  // 캔버스 transform 상태 초기화
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // 배경: 검정색
  ctx.fillStyle = STRIP_BG_COLOR;
  ctx.fillRect(0, 0, stripWidth, stripHeight);

  // 모든 이미지를 로드
  const imagePromises = photos.map((photoData) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = photoData;
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.error("이미지 로드 실패");
        resolve(null);
      };
    });
  });

  const images = await Promise.all(imagePromises);

  // 사진 4장을 순서대로 그리기 (3:4 비율 고정, 900x1200)
  const photoStartY = topPadding; // 상단 여백 50px부터 시작
  images.forEach((img, index) => {
    if (img) {
      const photoY = photoStartY + index * photoH;
      // 사진 그리기 (3:4 비율 고정, 900x1200)
      ctx.drawImage(img, padding, photoY, photoW, photoH);
    }
  });

  // 사진 사이 구분선 그리기 (45px 두께)
  // 1-2, 2-3, 3-4 사이에 검정색 가로선 추가
  const lineThickness = 45; // 구분선 두께
  for (let i = 1; i < PHOTO_COUNT; i++) {
    const lineY = photoStartY + i * photoH;
    // 좌/우 여백과 같은 위치에서 전체 너비로 구분선 그리기
    ctx.fillStyle = STRIP_BG_COLOR; // 검정색
    ctx.fillRect(0, lineY, stripWidth, lineThickness); // 45px 두께의 구분선
  }

  // 하단 바 (검정색)
  const bottomBarY = stripHeight - bottomPadding;
  ctx.fillStyle = STRIP_BG_COLOR; // 검정색
  ctx.fillRect(0, bottomBarY, stripWidth, bottomPadding);

  // 하단 텍스트 (로고) - 하얀색
  ctx.fillStyle = "#ffffff"; // 하얀색
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CLICKSNAP", stripWidth / 2, stripHeight - 40);
}



// 사진 다운로드 함수 (OS/기기 무관하게 작동)
function downloadPhoto() {
  // 원본 이미지 URL에서 시작하여 선택된 필터를 적용하여 다운로드
  if (!originalImageUrl) {
    console.error("다운로드할 이미지가 없습니다.");
    return;
  }

  const preset = window.CLICKSNAP_FILTERS[selectedFilter];
  if (!preset) {
    console.error("유효하지 않은 필터입니다.");
    return;
  }

  // 원본 이미지를 로드하여 필터 적용
  const img = new Image();
  img.crossOrigin = "anonymous"; // CORS 문제 방지
  
  img.onload = () => {
    // 임시 캔버스 생성 (필터 적용용)
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.naturalWidth || img.width;
    tempCanvas.height = img.naturalHeight || img.height;
    const tempCtx = tempCanvas.getContext("2d");
    
    // 필터 적용
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.filter = preset.filter;
    tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.filter = "none";
    
    // blob 생성
    tempCanvas.toBlob((blob) => {
      if (!blob) {
        console.error("이미지를 생성할 수 없습니다.");
        return;
      }

      // 파일명 생성 (타임스탬프 포함)
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      const frameType = getSelectedFrameType();
      const filterName = selectedFilter !== "original" ? `-${selectedFilter}` : "";
      const filename = `clicksnap-${frameType}${filterName}-${timestamp}.png`;

      // 다운로드 링크 생성
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      
      // 모바일 환경에서도 작동하도록 처리
      document.body.appendChild(link);
      link.click();
      
      // 정리
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log("다운로드 완료:", filename);
    }, "image/png");
  };
  
  img.onerror = () => {
    console.error("이미지 로드 실패");
    // 로드 실패 시, resultImg의 현재 이미지 사용
    if (resultImg.src) {
      downloadFromResultImg();
    }
  };
  
  img.src = originalImageUrl;
}

// resultImg의 현재 이미지를 다운로드하는 헬퍼 함수
function downloadFromResultImg() {
  const img = new Image();
  // data URL은 CORS 문제가 없으므로 crossOrigin 설정 불필요
  
  img.onload = () => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.naturalWidth || img.width;
    tempCanvas.height = img.naturalHeight || img.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(img, 0, 0);
    
    tempCanvas.toBlob((blob) => {
      if (!blob) {
        console.error("이미지를 생성할 수 없습니다.");
        return;
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      const frameType = getSelectedFrameType();
      const filterName = selectedFilter !== "original" ? `-${selectedFilter}` : "";
      const filename = `clicksnap-${frameType}${filterName}-${timestamp}.png`;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    }, "image/png");
  };
  
  img.src = resultImg.src;
}

// Data URL을 다운로드하는 헬퍼 함수
function downloadDataURL(dataURL) {
  try {
    // Data URL을 Blob으로 변환
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    
    // 파일명 생성
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const frameType = getSelectedFrameType();
    const filterName = selectedFilter !== "original" ? `-${selectedFilter}` : "";
    const filename = `clicksnap-${frameType}${filterName}-${timestamp}.png`;
    
    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log("다운로드 완료:", filename);
  } catch (err) {
    console.error("다운로드 중 오류 발생:", err);
  }
}

// 다시 찍기 기능 (초기 상태로 복귀)
function resetPhotoBooth() {
  // 사진 배열 초기화
  photos = [];
  
  // 결과 영역 숨기기
  resultArea.style.display = "none";
  
  // 버튼 상태 초기화
  startBtn.disabled = false; // 촬영 시작 버튼 활성화
  downloadBtn.disabled = true; // 사진 저장 버튼 비활성화
  
  // 이미지 소스 초기화
  resultImg.src = "";
  originalImageUrl = ""; // 원본 이미지 URL 초기화
  selectedFilter = "original"; // 필터 초기화
  
  // 필터 버튼 숨기기
  filterBtn.style.display = "none";
  
  // 카운트다운 숨기기 (혹시 보이는 경우를 대비)
  countdownEl.style.display = "none";
  
  console.log("다시 찍기 준비 완료");
}

// 필터 모달 열기
function openFilterModal() {
  filterModal.style.display = "flex";
  updateFilterSelection();
}

// 필터 모달 닫기
function closeFilterModalFunc() {
  filterModal.style.display = "none";
}

// 선택된 필터 표시 업데이트
function updateFilterSelection() {
  filterOptions.forEach((option) => {
    if (option.dataset.filter === selectedFilter) {
      option.classList.add("active");
    } else {
      option.classList.remove("active");
    }
  });
}

// 완성된 사진에 필터 적용 (ctx.filter 사용)
function applyFilterToResultImage() {
  if (!originalImageUrl) {
    return;
  }

  const preset = window.CLICKSNAP_FILTERS[selectedFilter];
  if (!preset) {
    return;
  }

  // 원본 이미지를 새로운 Image 객체로 로드 (왜곡 방지)
  const img = new Image();
  // data URL은 CORS 문제가 없으므로 crossOrigin 설정 불필요
  
  img.onload = () => {
    // 이미지의 원본 크기 사용 (왜곡 방지)
    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;
    
    // 임시 캔버스 생성 (필터 적용용)
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = imgWidth;
    tempCanvas.height = imgHeight;
    const tempCtx = tempCanvas.getContext("2d");
    
    // 필터 적용
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.filter = preset.filter;
    tempCtx.drawImage(img, 0, 0, imgWidth, imgHeight);
    tempCtx.filter = "none";
    
    // 필터가 적용된 이미지로 교체
    resultImg.src = tempCanvas.toDataURL("image/png");
  };
  
  img.onerror = () => {
    console.error("이미지 로드 실패");
    // 로드 실패 시 원본 이미지 URL로 다시 시도
    if (resultImg.src && resultImg.src !== originalImageUrl) {
      // resultImg가 data URL인 경우, 원본으로 복원 후 재시도
      resultImg.src = originalImageUrl;
    }
  };
  
  // 원본 이미지 URL에서 로드
  img.src = originalImageUrl;
}

