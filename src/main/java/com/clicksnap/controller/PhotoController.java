package com.clicksnap.controller;

import com.clicksnap.dto.PhotoResponse;
import com.clicksnap.service.PhotoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * packageName    : com.clicksnap.controller
 * fileName       : PhotoController
 * author         : kobe
 * date           : 2026. 1. 8.
 * description    :
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2026. 1. 8.        kobe       최초 생성
 */
@Slf4j
@RestController
@RequestMapping("/api/photos") // 공통 URL Prefix
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    /**
     * 사진 업로드 API
     * [POST] /api/photos
     * @param file 프론트엔드에서 formData에 담아 보낸 파일 객체 (Key: "image)
     * @return 저장된 사진 접근 URL
     */
    @PostMapping
    public ResponseEntity<PhotoResponse> uploadPhoto(@RequestParam("image")MultipartFile file) {
        log.info("이미지 업로드 요청 받음: 파일명 = {}, 크기 = {}", file.getOriginalFilename(), file.getSize());

        // 1. 서비스 호출 (핵심 로직)
        PhotoResponse response = photoService.uploadPhoto(file);

        // 2. 결과 반환
        // 리로스가 생성되었으므로 HTTP Status 201(Created)를 리턴하는 것이 RESTful 원칙에 맞습니다.
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
