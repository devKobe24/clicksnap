package com.clicksnap.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * packageName    : com.clicksnap.dto
 * fileName       : PhotoResponse
 * author         : kobe
 * date           : 2026. 1. 8.
 * description    : 파일 업로드 응답 DTO (DB 없이 사용)
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2026. 1. 8.        kobe       최초 생성
 */
@Getter
@AllArgsConstructor
public class PhotoResponse {
    private final String accessUrl; // 프론트에서 <img src="...">에 넣을 URL
}
