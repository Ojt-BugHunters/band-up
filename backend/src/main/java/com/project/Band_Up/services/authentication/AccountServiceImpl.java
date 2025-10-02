package com.project.Band_Up.services.authentication;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.dtos.authentication.AccountDtoResponse;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.enums.Role;
import com.project.Band_Up.exceptions.AuthenticationFailedException;
import com.project.Band_Up.exceptions.EmailAlreadyExistedException;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.utils.JwtUserDetails;
import com.project.Band_Up.utils.JwtUtil;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.security.auth.login.AccountNotFoundException;
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
    public AccountDtoResponse registerByEmail(AccountDto accountDto) {
        if (!accountRepository.existsByEmail(accountDto.getEmail().toLowerCase())) {
            accountDto.setEmail(accountDto.getEmail().toLowerCase());
            Account account = modelMapper.map(accountDto, Account.class);
            account.setRole(Role.Member);
            account.setActive(true);
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
                throw new AuthenticationFailedException("Invalid email or password");
            }
        } else {
            throw new AuthenticationFailedException("Email not exist");
        }
    }

    @Override
    public JwtUserDetails getAccountDetails(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException(accountId.toString()));
        return new JwtUserDetails(accountId, account.getRole().toString());
    }
}
