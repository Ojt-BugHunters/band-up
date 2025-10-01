package com.project.Band_Up.services.authentication;

import com.project.Band_Up.entities.Account;
import com.project.Band_Up.enums.Gender;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.utils.JwtUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacebookUserService extends DefaultOAuth2UserService {

    @Autowired
    private AccountRepository accountRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {
        System.out.println("test");
        OAuth2User oAuth2User = super.loadUser(request);

        Account account = Account.builder()
                .email(oAuth2User.getAttribute("email"))
                .name(oAuth2User.getAttribute("name"))
                .gender(oAuth2User.getAttribute("gender").equals("male")? Gender.Male : Gender.Female)
                .build();
        System.out.println(account.getEmail());
        System.out.println(account.getName());
        System.out.println(account.getGender());
        Account existedAccount = accountRepository.findByEmail(oAuth2User.getAttribute("email"));
        if (existedAccount != null) {
            existedAccount.setGender(account.getGender());
            existedAccount.setName(oAuth2User.getAttribute("name"));
            account = accountRepository.save(existedAccount);
        } else account = accountRepository.save(account);
        return new JwtUserDetails(account.getId(),account.getRole().toString());
    }
}
