package com.clicksnap.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * packageName    : com.clicksnap.config
 * fileName       : WebConfig
 * author         : kobe
 * date           : 2026. 1. 8.
 * description    :
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2026. 1. 8.        kobe       최초 생성
 */

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.access-url-prefix}")
    private String accessUrlPrefix;

    /**
     * 1. 정적 리소스 핸들러 설정
     * 역할: URL 경로(/images/**)와 실제 파일 경로(./uploads/)를 매핑합니다.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 접근 URL 패턴 만들기 (예: /images/**)
        // accessUrlPrefix가 "/images/"라면 -> "/images/**"
        String resourcePattern = accessUrlPrefix + "**";

        // 실제 파일 저장 경로 가져오기
        // 운영체제(Windows/Mac)에 상관없이 안전하게 경로를 URI로 변환합니다.
        // 예: file:///Users/kobe/project/clicksnap/uploads/
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        String resourceLocation = uploadPath.toUri().toString();

        registry.addResourceHandler(resourcePattern)
                .addResourceLocations(resourceLocation);
    }

    /**
     * 2. CORS 설정
     * 역할: 프론트엔드 개발 서버(localhost:3000 등)에서의 접근을 허용합니다.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 엔드포인트에 대해
                .allowedOrigins("http://localhost:3000", "http://127.0.0.1:5500") // 허용할 프론트엔드 주소
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true) // 쿠키/세션 인증 허용 여부
                .maxAge(3600);
    }
}
