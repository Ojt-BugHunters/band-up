package com.project.Band_Up.repositories;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.entities.Account;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    boolean existsByEmail(String email);

    Account findByEmail(String email);

    Account findFirstByEmail(String email);


    boolean existsByEmailAndPassword(@Email String email, @Min(6) @Max(200) @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]") String password);
}
