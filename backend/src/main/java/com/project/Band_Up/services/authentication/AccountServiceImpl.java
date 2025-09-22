package com.project.Band_Up.services.authentication;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.dtos.authentication.AccountDtoResponse;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.exceptions.AuthenticationFailedException;
import com.project.Band_Up.exceptions.EmailAlreadyExistedException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.utils.JwtUtil;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public AccountDtoResponse registerByEmail(AccountDto accountDto) {
        if (!accountRepository.existsByEmail(accountDto.getEmail().toLowerCase())) {
            accountDto.setEmail(accountDto.getEmail().toLowerCase());
            Account account = modelMapper.map(accountDto, Account.class);
            account.setPassword(passwordEncoder.encode(account.getPassword()));
            accountRepository.save(account);
            return modelMapper.map(account, AccountDtoResponse.class);
        } else throw new EmailAlreadyExistedException(accountDto.getEmail());
    }

    @Override
    public AccountDtoResponse loginByEmail(AccountDto accountDto) {
        if (accountRepository.existsByEmail(accountDto.getEmail().toLowerCase())) {
            accountDto.setEmail(accountDto.getEmail().toLowerCase());
            Account account = accountRepository.findByEmail(accountDto.getEmail());
            if (passwordEncoder.matches(accountDto.getPassword(), account.getPassword())) {
                return modelMapper.map(account, AccountDtoResponse.class);
            } else {
                throw new AuthenticationFailedException();
            }
        } else {
            throw new AuthenticationFailedException();
        }
    }
}
