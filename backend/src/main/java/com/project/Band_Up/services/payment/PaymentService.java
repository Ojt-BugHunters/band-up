package com.project.Band_Up.services.payment;

import com.project.Band_Up.dtos.payment.PaymentDto;

import java.util.UUID;

public interface PaymentService {

    public String createPaymentUrl(PaymentDto paymentDto, UUID accountId);

}
