package com.clicksnap.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * packageName    : com.clicksnap.service
 * fileName       : StorageService
 * author         : kobe
 * date           : 2026. 1. 8.
 * description    :
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2026. 1. 8.        kobe       최초 생성
 */
public interface StorageService {
    // 파일을 물리적으로 저장하고, 저장된 파일명(또는 경로)을 반환
    String store(MultipartFile file);
}
