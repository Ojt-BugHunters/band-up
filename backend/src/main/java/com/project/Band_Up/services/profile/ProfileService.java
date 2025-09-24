package com.project.Band_Up.services.profile;

import com.project.Band_Up.dtos.profile.ProfileDto;

import java.util.UUID;

public interface ProfileService {
    ProfileDto updateProfile(ProfileDto profile, UUID accountId);
}
