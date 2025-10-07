package com.project.Band_Up.controllers;

import com.project.Band_Up.services.media.MediaService;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/media", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "MEDIA API", description = "Các endpoint để quản lý tạo và kí url.")
@RequiredArgsConstructor
@Validated
@CrossOrigin
public class MediaController {
    private final MediaService mediaService;
    private final JwtUtil jwtUtil;

}
