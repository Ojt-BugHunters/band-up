package com.project.Band_Up.services.authentication;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.dtos.authentication.AccountDtoResponse;
import org.springframework.http.ResponseCookie;

public interface AccountService {
    AccountDtoResponse registerByEmail(AccountDto account);
    AccountDtoResponse loginByEmail(AccountDto account);
}
