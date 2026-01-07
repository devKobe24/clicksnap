package com.clicksnap.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * packageName    : com.clicksnap.service
 * fileName       : FileSystemStorageService
 * author         : kobe
 * date           : 2026. 1. 8.
 * description    :
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2026. 1. 8.        kobe       최초 생성
 */

@Slf4j
@Service
public class FileSystemStorageService implements StorageService {

    // application.yml에서 설정한 경로를 가져옵니다.
    @Value("${file.upload-dir}")
    private String uploadDir;

    // 파일 업로드 경로 객체
    private Path rootLocation;

    /**
     * Bean 생성 시점에 업로드 폴더가 존재하는지 확인하고, 없으면 생성합니다.
     */
    @PostConstruct
    public void init() {
        try {
            // 경로가 비어있으면 기본값 설정
            if (StringUtils.hasText(uploadDir)) {
                this.rootLocation = Paths.get(uploadDir);
            } else {
                this.rootLocation = Paths.get("uploads");
            }

            Files.createDirectories(rootLocation);
            log.info("업로드 디렉토리가 준비되었습니다: {}", rootLocation.toAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("업로드 폴더를 생성할 수 없습니다.", e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("빈 파일은 저장할 수 없습니다.");
        }

        // 1. 원본 파일명 보호 (Path Traversal 공격 방지용 정제)
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            // 2. 파일명 중복 방지를 위한 UUID 생성
            // 예: image.png -> 550e8400-e29b....png
            String extension = getFileExtension(originalFilename);
            String storedFileName = UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);

            // 3. 저장 경로 설정
            Path destinationFile = this.rootLocation.resolve(Paths.get(storedFileName))
                    .normalize().toAbsolutePath();

            // 4. 보안 체크: 저장하려는 경로가 설정된 rootLocation 내부에 있는지 확인
            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                throw new RuntimeException("현재 디렉토리 밖에는 저장할 수 없습니다.");
            }

            // 5. 파일 저장 (기존 파일이 있으면 덮어쓰기)
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return storedFileName;

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패: " + originalFilename, e);
        }
    }

    // 파일 확장자 추출 유틸리티 메소드
    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < fileName.length() -1) {
            return fileName.substring(dotIndex + 1);
        }
        return "";
    }
}
