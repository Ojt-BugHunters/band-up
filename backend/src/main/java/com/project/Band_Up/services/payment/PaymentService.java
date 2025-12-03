package com.project.Band_Up.services.payment;

import com.project.Band_Up.dtos.payment.PaymentDto;
import com.project.Band_Up.enums.SubscriptionType;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.Webhook;

import java.util.UUID;

public interface PaymentService {

//    public String createPaymentUrl(PaymentDto paymentDto, UUID accountId);
    public CreatePaymentLinkResponse createPaymentLinkRequest(UUID accountId,
                                                              SubscriptionType subscriptionType,
                                                              boolean isLifeTime);

    public void handleWebhook(Webhook webhook);

}
