package com.roomsafar.room_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI roomServiceAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Roomsafar Room Service API")
                        .description("API documentation for Roomsafar Room Microservice")
                        .version("1.0.0"));
    }
}
