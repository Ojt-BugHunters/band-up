package com.project.Band_Up.services.authentication;

import com.project.Band_Up.dtos.authentication.AccountDto;
import org.springframework.http.ResponseCookie;

public interface AccountService {
    ResponseCookie registerByEmail(AccountDto account);
    ResponseCookie loginByEmail(AccountDto account);
}
