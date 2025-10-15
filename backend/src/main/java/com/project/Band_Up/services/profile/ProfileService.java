package com.project.Band_Up.services.profile;

import com.project.Band_Up.dtos.profile.AvatarDto;
import com.project.Band_Up.dtos.profile.ProfileDto;
import java.util.UUID;

public interface ProfileService {
    ProfileDto updateProfile(ProfileDto profile, UUID accountId);

    // --- Avatar ---
    AvatarDto createAvatarPresignedUrl(String fileName, String contentType, UUID accountId);
    AvatarDto  saveAvatar(String key, UUID accountId);
    AvatarDto getAvatar(UUID accountId);
}
