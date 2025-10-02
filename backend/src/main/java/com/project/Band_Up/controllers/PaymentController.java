package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.payment.PaymentDto;
import com.project.Band_Up.dtos.payment.VNpayDto;
import com.project.Band_Up.services.payment.PaymentService;
import com.project.Band_Up.utils.JwtUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/vnpay-callback")
    public ResponseEntity<?> getPaymentStatus(@RequestParam String vnp_TmnCode,
                                              @RequestParam long vnp_Amount,
                                              @RequestParam String vnp_BankCode,
                                              @RequestParam String vnp_BankTranNo,
                                              @RequestParam String vnp_CardType,
                                              @RequestParam long vnp_PayDate,
                                              @RequestParam String vnp_OrderInfo,
                                              @RequestParam long vnp_TransactionNo,
                                              @RequestParam long vnp_ResponseCode,
                                              @RequestParam long vnp_TransactionStatus,
                                              @RequestParam String vnp_TxnRef,
                                              @RequestParam String vnp_SecureHash){
        System.out.println(vnp_TmnCode);
        System.out.println(vnp_Amount);
        System.out.println(vnp_BankCode);
        System.out.println(vnp_BankTranNo);
        System.out.println(vnp_CardType);
        System.out.println(vnp_PayDate);
        System.out.println(vnp_OrderInfo);
        System.out.println(vnp_TransactionNo);
        System.out.println(vnp_ResponseCode);
        System.out.println(vnp_TransactionStatus);
        System.out.println(vnp_TxnRef);
        System.out.println(vnp_SecureHash);
        return ResponseEntity.ok().build();
    }

}
