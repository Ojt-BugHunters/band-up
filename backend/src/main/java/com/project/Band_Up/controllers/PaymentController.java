package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.payment.PaymentDto;
import com.project.Band_Up.services.payment.PaymentService;
import com.project.Band_Up.utils.JwtUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/url")
    public ResponseEntity<?> createUrl(PaymentDto paymentDto,
                                       @AuthenticationPrincipal JwtUserDetails jwtUserDetails){
        return new ResponseEntity<>(
                paymentService.createPaymentUrl(paymentDto, jwtUserDetails.getAccountId()),
                HttpStatus.OK
        );
    }
}
