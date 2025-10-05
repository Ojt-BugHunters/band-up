package com.project.Band_Up;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

import java.util.TimeZone;

@SpringBootApplication
@EnableCaching
public class BandUpApplication {

	public static void main(String[] args) {
		SpringApplication.run(BandUpApplication.class, args);
	}
}
