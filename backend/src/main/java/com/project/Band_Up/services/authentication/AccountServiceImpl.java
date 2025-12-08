package com.project.Band_Up.services.authentication;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.dtos.authentication.AccountDtoResponse;
import com.project.Band_Up.dtos.notification.EmailDetailsDto;
import com.project.Band_Up.dtos.subscription.SubscriptionDtoResponse;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.enums.Role;
import com.project.Band_Up.exceptions.AuthenticationFailedException;
import com.project.Band_Up.exceptions.EmailAlreadyExistedException;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.services.notification.EmailService;
import com.project.Band_Up.utils.JwtUserDetails;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Random;
import java.util.UUID;


@Service
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;
    @Autowired
    private OtpService otpService;
    @Autowired
    private RedisTemplate<String, Account> accountRedisTemplate;


    @Override
    public AccountDtoResponse registerByEmail(AccountDto accountDto) {
        if (!accountRepository.existsByEmail(accountDto.getEmail().toLowerCase())) {
            Random random = new Random();
            accountDto.setEmail(accountDto.getEmail().toLowerCase());
            Account account = modelMapper.map(accountDto, Account.class);
            account.setRole(Role.Member);
            account.setActive(true);
            account.setPassword(passwordEncoder.encode(account.getPassword()));
            String otp = String.valueOf(random.nextInt(100000,999999));
            otpService.saveOtp("otp:"+account.getEmail().toLowerCase(), otp);
            EmailDetailsDto emailDetailsDto = new EmailDetailsDto();
            emailDetailsDto = emailDetailsDto.getRegisterOtpMailTemplate(account.getEmail(), otp);
            emailService.sendOtpEmail(emailDetailsDto);
            accountRedisTemplate.opsForValue().set("signup:user:"+account.getEmail().toLowerCase(),
                    account, Duration.ofMinutes(15));
            AccountDtoResponse response = modelMapper.map(account, AccountDtoResponse.class);
            response.setSubscription(getTopActiveSubscription(account));
            return response;
        } else throw new EmailAlreadyExistedException(accountDto.getEmail());
    }

    @Override
    public AccountDtoResponse loginByEmail(AccountDto accountDto) {
        if (accountRepository.existsByEmail(accountDto.getEmail().toLowerCase())) {
            accountDto.setEmail(accountDto.getEmail().toLowerCase());
            Account account = accountRepository.findByEmail(accountDto.getEmail());
            if (passwordEncoder.matches(accountDto.getPassword(), account.getPassword())) {
                AccountDtoResponse response = modelMapper.map(account, AccountDtoResponse.class);
                response.setSubscription(getTopActiveSubscription(account));
                return response;
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

    @Override
    public AccountDtoResponse verifyOtp(String inputOtp, String email) {
        String savedOtp = otpService.getOtp("otp:"+email.toLowerCase());
        if(savedOtp != null && savedOtp.equals(inputOtp)) {
            Account account = accountRedisTemplate.opsForValue().getAndDelete("signup:user:"+email.toLowerCase());
            if(account != null) {
                account = accountRepository.save(account);
                AccountDtoResponse response = modelMapper.map(account, AccountDtoResponse.class);
                response.setSubscription(getTopActiveSubscription(account));
                return response;
            }
        } else throw new AuthenticationFailedException("Invalid OTP");
        return null;
    }

    @Override
    public void forgetPassword(String email) {
        if(accountRepository.existsByEmail(email.toLowerCase())) {
            Random random = new Random();
            String otp = String.valueOf(random.nextInt(100000,999999));
            otpService.saveOtp("otp:"+email.toLowerCase(), otp);
            EmailDetailsDto emailDetailsDto = new EmailDetailsDto();
            emailDetailsDto = emailDetailsDto.getPasswordResetOtpMailTemplate(email, otp);
            emailService.sendOtpEmail(emailDetailsDto);
        } else throw new ResourceNotFoundException(email);
    }

    @Override
    public boolean verifyForgetPassword(String inputOtp, String email) {
        String savedOtp = otpService.getOtp("otp:"+email.toLowerCase());
        if(savedOtp == null ||  !savedOtp.equals(inputOtp)) throw new AuthenticationFailedException("Invalid OTP");
        return true;
    }

    @Override
    public AccountDtoResponse resetPassword(AccountDto accountDto, String inputOtp) {
        String savedOtp = otpService.getOtp("otp:"+accountDto.getEmail().toLowerCase());
        if(savedOtp == null ||  !savedOtp.equals(inputOtp)) throw new AuthenticationFailedException("Invalid OTP");
        Account account = accountRepository.findByEmail(accountDto.getEmail().toLowerCase());
        if (account != null) {
            account.setPassword(passwordEncoder.encode(accountDto.getPassword()));
            accountRepository.save(account);
            AccountDtoResponse response = modelMapper.map(account, AccountDtoResponse.class);
            response.setSubscription(getTopActiveSubscription(account));
            return response;
        } else throw new ResourceNotFoundException(accountDto.getEmail());
    }

    @Override
    public Page<AccountDtoResponse> getAccounts(Pageable pageable) {
        Page<Account> accountPage = accountRepository.findAll(pageable);
        return accountPage.map(account -> {
            AccountDtoResponse response = modelMapper.map(account, AccountDtoResponse.class);
            // Convert all non-admin roles to Member
            if (response.getRole() != Role.Admin) {
                response.setRole(Role.Member);
            }
            response.setSubscription(getTopActiveSubscription(account));
            return response;
        });
    }

    /**
     * Get the top active subscription for an account
     * Returns the subscription that is still valid (not expired) or lifetime
     * Ordered by creation date descending (most recent first)
     */
    private SubscriptionDtoResponse getTopActiveSubscription(Account account) {
        if (account.getSubscriptions() == null || account.getSubscriptions().isEmpty()) {
            return null;
        }

        LocalDate today = LocalDate.now();

        return account.getSubscriptions().stream()
                .filter(sub -> sub.isLifeTime() || (sub.getEndDate() != null && !sub.getEndDate().isBefore(today)))
                .sorted((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()))
                .findFirst()
                .map(subscription -> modelMapper.map(subscription, SubscriptionDtoResponse.class))
                .orElse(null);
    }
}

