package com.project.Band_Up.services.authentication;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.dtos.authentication.AccountDtoResponse;
import com.project.Band_Up.utils.JwtUserDetails;
import org.springframework.http.ResponseCookie;

import java.util.UUID;

public interface AccountService {
    AccountDtoResponse registerByEmail(AccountDto account);
    AccountDtoResponse loginByEmail(AccountDto account);
    public JwtUserDetails getAccountDetails(UUID accountId);
}
