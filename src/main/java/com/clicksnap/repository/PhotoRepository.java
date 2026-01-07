package com.clicksnap.repository;

import com.clicksnap.domain.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * packageName    : com.clicksnap.repository
 * fileName       : PhotoRepository
 * author         : kobe
 * date           : 2026. 1. 8.
 * description    :
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2026. 1. 8.        kobe       최초 생성
 */
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    // 기본적인 CRUD(save, findById 등)는 JpaRepository가 자동으로 제공합니다.
    // 추후 필요하다면 findByStoredFileName 같은 메소드를 추가할 수 있습니다.
}
