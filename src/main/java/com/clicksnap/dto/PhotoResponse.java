package com.clicksnap.dto;

import com.clicksnap.domain.Photo;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * packageName    : com.clicksnap.dto
 * fileName       : PhotoResponse
 * author         : kobe
 * date           : 2026. 1. 8.
 * description    :
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2026. 1. 8.        kobe       최초 생성
 */
@Getter
public class PhotoResponse {
    private final Long id;
    private final String accessUrl; // 프론트에서 <img src="...">에 넣을 URL
    private final LocalDateTime createdDate;

    // Entity -> DTO 변환 생성자
    public PhotoResponse(Photo photo) {
        this.id = photo.getId();
        this.accessUrl = photo.getAccessUrl();
        this.createdDate = photo.getCreatedDate();
    }
}
