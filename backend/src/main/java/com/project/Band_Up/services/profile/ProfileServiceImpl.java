package com.project.Band_Up.services.profile;

import com.project.Band_Up.dtos.profile.ProfileDto;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ProfileServiceImpl implements ProfileService {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private ModelMapper modelMapper;

    @Override
    public ProfileDto updateProfile(ProfileDto profile, UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException(accountId.toString()));
        account.setName(profile.getName());
        account.setAddress(profile.getAddress());
        account.setBirthday(profile.getBirthday());
        account.setGender(profile.getGender());
        account.setPhone(profile.getPhone());
        account = accountRepository.save(account);
        return modelMapper.map(account, ProfileDto.class);
    }
}
