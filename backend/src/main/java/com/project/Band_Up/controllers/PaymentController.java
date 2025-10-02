package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.payment.PaymentDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @PostMapping("/url")
    public ResponseEntity<?> createUrl(PaymentDto paymentDto){

    }
}
