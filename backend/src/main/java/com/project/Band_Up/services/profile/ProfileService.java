package com.project.Band_Up.services.profile;

import com.project.Band_Up.dtos.profile.AvatarCreateRequest;
import com.project.Band_Up.dtos.profile.AvatarDto;
import com.project.Band_Up.dtos.profile.AvtName;
import com.project.Band_Up.dtos.profile.ProfileDto;
import java.util.UUID;

public interface ProfileService {
    ProfileDto updateProfile(ProfileDto profile, UUID accountId);

    // --- Avatar ---
    AvatarDto createAvatarPresignedUrl(AvatarCreateRequest request, UUID accountId);
    AvatarDto  saveAvatar(String key, UUID accountId);
    AvatarDto getAvatar(UUID accountId);
    AvtName getAvatarName(UUID accountId);
}
