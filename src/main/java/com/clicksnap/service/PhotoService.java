package com.clicksnap.service;

import com.clicksnap.dto.PhotoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * packageName    : com.clicksnap.service
 * fileName       : PhotoService
 * author         : kobe
 * date           : 2026. 1. 8.
 * description    :
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2026. 1. 8.        kobe       최초 생성
 */

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final StorageService storageService; // 인터페이스 주입 (유연성 !)

    // 파일 접근 URL의 접두사 (예: /images/)
    // application.yml에서 설정할 값입니다.
    @Value("${file.access-url-prefix}")
    private String accessUrlPrefix;

    public PhotoResponse uploadPhoto(MultipartFile file) {
        // 1. 물리적 파일 저장 (StorageService 위임)
        String storedFileName = storageService.store(file);

        // 2. 접근 URL 생성 (예: /images/uuid-filename.png)
        String accessUrl = accessUrlPrefix + storedFileName;

        // 3. 응답 DTO 반환 (DB 저장 없이 URL만 반환)
        return new PhotoResponse(accessUrl);
    }
}
