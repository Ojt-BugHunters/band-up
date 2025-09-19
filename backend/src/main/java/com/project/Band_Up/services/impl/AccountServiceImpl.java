package com.project.Band_Up.services.impl;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.exceptions.AuthenticationFailedException;
import com.project.Band_Up.exceptions.EmailAlreadyExistedException;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.services.authentication.AccountService;
import com.project.Band_Up.utils.JwtUtil;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public ResponseCookie registerByEmail(AccountDto accountDto) {
        if (!accountRepository.existsByEmail(accountDto.getEmail())) {
            Account account = modelMapper.map(accountDto, Account.class);
            account.setPassword(passwordEncoder.encode(account.getPassword()));
            accountRepository.save(account);
            return JwtUtil.getCookie(JwtUtil.generateToken(accountDto));
        } else throw new EmailAlreadyExistedException(accountDto.getEmail());
    }

    @Override
    public ResponseCookie loginByEmail(AccountDto accountDto) {
        if (accountRepository.existsByEmail(accountDto.getEmail())) {
            Account account = accountRepository.findByEmail(accountDto.getEmail());
            if (passwordEncoder.matches(accountDto.getPassword(), account.getPassword())) {
                return JwtUtil.getCookie(JwtUtil.generateToken(accountDto));
            } else {
                throw new AuthenticationFailedException();
            }
        } else {
            throw new AuthenticationFailedException();
        }
    }
}
