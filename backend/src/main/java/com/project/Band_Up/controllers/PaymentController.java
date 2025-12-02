package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.payment.PaymentDto;
import com.project.Band_Up.dtos.payment.VNpayDto;
import com.project.Band_Up.enums.SubscriptionType;
import com.project.Band_Up.services.payment.PaymentService;
import com.project.Band_Up.utils.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.payos.model.webhooks.Webhook;

@RestController
@RequestMapping("/api/payment")
@Tag(name = "Payment", description = "Payment management APIs for subscription purchases using PayOS")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/url")
    @Operation(
            summary = "Create payment URL",
            description = "Creates a payment link for purchasing a subscription. The authenticated user will be charged based on the subscription type and lifetime option. Returns a PayOS payment link response."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Payment link created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid subscription type or parameters"),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "404", description = "Account not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error or payment gateway error")
    })
    public ResponseEntity<?> createUrl(
            @Parameter(description = "Authenticated user details", hidden = true)
            @AuthenticationPrincipal JwtUserDetails jwtUserDetails,
            @Parameter(description = "Type of subscription (e.g., BASIC, PREMIUM, PRO)", required = true)
            @RequestParam SubscriptionType subscriptionType,
            @Parameter(description = "Whether the subscription is lifetime (true) or time-limited (false)", required = true)
            @RequestParam boolean isLifeTime){
        return new ResponseEntity<>(
                paymentService.createPaymentLinkRequest(jwtUserDetails.getAccountId(),
                        subscriptionType, isLifeTime),
                HttpStatus.OK
        );
    }

    @PostMapping("/webhook")
    @Operation(
            summary = "PayOS payment webhook",
            description = "Receives webhook notifications from PayOS payment gateway when a payment is completed. " +
                    "This endpoint is called by PayOS to notify the system about payment status changes. " +
                    "The webhook data is verified and the subscription is activated for the user if payment is successful."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Webhook processed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid webhook data or signature verification failed"),
            @ApiResponse(responseCode = "500", description = "Internal server error while processing webhook")
    })
    public ResponseEntity<String> handleWebhook(
            @Parameter(description = "PayOS webhook payload containing payment information", required = true)
            @RequestBody Webhook webhook) {
        paymentService.handleWebhook(webhook);
        return new ResponseEntity<>(
                "OK",
                HttpStatus.OK
        );
    }

//    @GetMapping("/vnpay-callback")
//    public ResponseEntity<?> getPaymentStatus(@RequestParam String vnp_TmnCode,
//                                              @RequestParam long vnp_Amount,
//                                              @RequestParam String vnp_BankCode,
//                                              @RequestParam String vnp_BankTranNo,
//                                              @RequestParam String vnp_CardType,
//                                              @RequestParam long vnp_PayDate,
//                                              @RequestParam String vnp_OrderInfo,
//                                              @RequestParam long vnp_TransactionNo,
//                                              @RequestParam long vnp_ResponseCode,
//                                              @RequestParam long vnp_TransactionStatus,
//                                              @RequestParam String vnp_TxnRef,
//                                              @RequestParam String vnp_SecureHash){
//        System.out.println(vnp_TmnCode);
//        System.out.println(vnp_Amount);
//        System.out.println(vnp_BankCode);
//        System.out.println(vnp_BankTranNo);
//        System.out.println(vnp_CardType);
//        System.out.println(vnp_PayDate);
//        System.out.println(vnp_OrderInfo);
//        System.out.println(vnp_TransactionNo);
//        System.out.println(vnp_ResponseCode);
//        System.out.println(vnp_TransactionStatus);
//        System.out.println(vnp_TxnRef);
//        System.out.println(vnp_SecureHash);
//        return ResponseEntity.ok().build();
//    }

}
