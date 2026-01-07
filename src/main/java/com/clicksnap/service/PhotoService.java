package com.clicksnap.service;

import com.clicksnap.domain.Photo;
import com.clicksnap.dto.PhotoResponse;
import com.clicksnap.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
@Transactional(readOnly = true)
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final StorageService storageService; // 인터페이스 주입 (유연성 !)

    // 파일 접근 URL의 접두사 (예: /images/)
    // application.yml에서 설정할 값입니다.
    @Value("${file.access-url-prefix}")
    private String accessUrlPrefix;

    @Transactional
    public PhotoResponse uploadPhoto(MultipartFile file) {
        // 1. 물리적 파일 저장 (StorageService 위임)
        String storedFileName = storageService.store(file);

        // 2. 접근 URL 생성 (예: /images/uuid-filename.png)
        String accessUrl = accessUrlPrefix + storedFileName;

        // 3. DB 메타데이터 저장
        Photo photo = Photo.builder()
                .originalFileName(file.getOriginalFilename())
                .storedFileName(storedFileName)
                .accessUrl(accessUrl)
                .build();

        Photo savePhoto = photoRepository.save(photo);

        // 4. 응답 DTO 변환
        return new PhotoResponse(savePhoto);
    }
}
