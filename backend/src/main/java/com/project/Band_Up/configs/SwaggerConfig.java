package com.project.Band_Up.configs;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("My API")
                        .description("Spring Boot REST API with Swagger")
                        .version("1.0.0"))
                .servers(List.of(
                        new Server().url("https://bandupdb.bughunters.site"),
                        new Server().url("http://localhost:8080")
                ));
    }
}
