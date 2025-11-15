package com.project.Band_Up;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class BandUpApplication {

	public static void main(String[] args) {
		SpringApplication.run(BandUpApplication.class, args);
	}
}
