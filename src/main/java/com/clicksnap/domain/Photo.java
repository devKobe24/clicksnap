package com.clicksnap.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * packageName    : com.clicksnap.domain
 * fileName       : Photo
 * author         : kobe
 * date           : 2026. 1. 8.
 * description    :
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2026. 1. 8.        kobe       최초 생성
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class) // 생성 시간 자동 관리
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 사용자가 다운로드할 때 쓸 원본 파일면 (필요 없다면 제외 가능)
    private String originalFileName;

    // 서버에 저장된 파일명 (UUID 적용됨)
    @Column(nullable = false)
    private String storedFileName;

    // 파일 접근 URL
    @Column(nullable = false)
    private String accessUrl;

    @CreatedDate
    private LocalDateTime createdDate;

    @Builder
    public Photo(String originalFileName, String storedFileName, String accessUrl) {
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.accessUrl = accessUrl;
    }
}
