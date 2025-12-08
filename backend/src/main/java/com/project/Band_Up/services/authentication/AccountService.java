package com.project.Band_Up.services.authentication;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.dtos.authentication.AccountDtoResponse;
import com.project.Band_Up.utils.JwtUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseCookie;

import java.util.UUID;

public interface AccountService {

    public AccountDtoResponse registerByEmail(AccountDto account);

    public AccountDtoResponse loginByEmail(AccountDto account);

    public JwtUserDetails getAccountDetails(UUID accountId);

    public AccountDtoResponse verifyOtp(String inputOtp, String email);

    public void forgetPassword(String email);

    public boolean verifyForgetPassword(String inputOtp, String email);

    public Page<AccountDtoResponse> getAccounts(Pageable pageable);

    public AccountDtoResponse resetPassword(AccountDto accountDto, String inputOtp);

}
