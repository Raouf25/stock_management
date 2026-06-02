package com.example.stock_management.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {
    @Value("${cors.allowedOrigins}")
    private String allowedOriginsStr;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        List<String> origins = new ArrayList<>(Arrays.asList(allowedOriginsStr.split(",")));
        origins.replaceAll(String::trim);
        config.setAllowedOriginPatterns(origins); // allow access from configured origins/patterns
        config.addAllowedHeader("*"); // allow access to any header
        config.addAllowedMethod("*"); // allow access to any HTTP method
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
