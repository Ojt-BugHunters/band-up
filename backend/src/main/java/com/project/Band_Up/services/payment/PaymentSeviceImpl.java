package com.project.Band_Up.services.payment;

import com.nimbusds.jose.shaded.gson.Gson;
import com.nimbusds.jose.shaded.gson.JsonObject;
import com.project.Band_Up.configs.VNpayConfig;
import com.project.Band_Up.dtos.payment.PaymentDto;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Subscriptions;
import com.project.Band_Up.enums.SubscriptionType;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.SubscriptionRepository;
import com.project.Band_Up.utils.Util;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;

@Service
public class PaymentSeviceImpl implements PaymentService{

    @Value("${FRONTEND_URL}")
    private String FRONTEND_URL;
    @Value("${BACKEND_URL}")
    private String BACKEND_URL;
    @Value("${PAYOS_CLIENT_ID}")
    private String PAYOS_CLIENT_ID;
    @Value("${PAYOS_API_KEY}")
    private String PAYOS_API_KEY;
    @Value("${PAYOS_CHECKSUM_KEY}")
    private String PAYOS_CHECKSUM_KEY;

    @Autowired
    private RedisTemplate<String,Subscriptions> subscriptionRedisTemplate;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Override
    public CreatePaymentLinkResponse createPaymentLinkRequest(UUID accountId,
                                                              SubscriptionType subscriptionType,
                                                              boolean isLifeTime) {
        PayOS payOS = new PayOS(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);
        CreatePaymentLinkRequest paymentRequest = CreatePaymentLinkRequest.builder()
                .orderCode(System.currentTimeMillis() / 1000)
                .amount(isLifeTime ?  2600000L : 395000L)
                .description("Thanh toán đơn hàng")
                .cancelUrl(FRONTEND_URL + "/payment/cancel")
                .returnUrl(FRONTEND_URL + "/payment/success")
                .build();
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Subscriptions subscriptions = Subscriptions.builder()
                .account(Account.builder().id(accountId).build())
                .subscriptionType(subscriptionType)
                .isLifeTime(isLifeTime)
                .build();
        if (!subscriptions.isLifeTime()) {
            subscriptions.setStartDate(LocalDate.now());
            subscriptions.setEndDate(LocalDate.now().plusMonths(3));
        }
        subscriptionRedisTemplate.opsForValue().set("payment_order_" + paymentRequest.getOrderCode(), subscriptions);
        return payOS.paymentRequests().create(paymentRequest);
    }

    @Override
    public void handleWebhook(Webhook webhook) {
        try {
            PayOS payOS = new PayOS(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);
            WebhookData data = payOS.webhooks().verify(webhook);
            Subscriptions subscriptions = subscriptionRedisTemplate.opsForValue().get("payment_order_" + data.getOrderCode());
            if(subscriptions != null) {
                // Account account = subscriptions.getAccount();
                UUID accountId = subscriptions.getAccount().getId();
                Account account = accountRepository.findById(accountId)
                        .orElseThrow(() -> new EntityNotFoundException("Account not found"));
                account.getSubscriptions().add(subscriptions);
                accountRepository.save(account);
            } else {
                System.out.println("Subscription not found in Redis for order code: " + data.getOrderCode());
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


//    @Value("${VNP_SECRET}")
//    private String VNP_SECRET;
//    @Value("${VNP_URL}")
//    private String VNP_URL;
//    @Autowired
//    private AccountRepository accountRepository;
//    @Autowired
//    private VNpayConfig  vnpayConfig;
//
//    public String createPaymentUrl(PaymentDto paymentDto, UUID accountId){
//        Account account = accountRepository.findById(accountId)
//                .orElseThrow(()-> new ResourceNotFoundException("Account not found"));
//
//        long amount = Integer.parseInt(paymentDto.getAmount()) * 100L;
//        String bankCode = null;
//        Map<String, String> vnpParamsMap = vnpayConfig.getVNPayConfig();
//        vnpParamsMap.put("vnp_Amount", String.valueOf(amount));
//        if (bankCode != null && !bankCode.isEmpty()) {
//            vnpParamsMap.put("vnp_BankCode", bankCode);
//        }
//        vnpParamsMap.put("vnp_IpAddr", paymentDto.getClientIp());
//        //build query url
//        String queryUrl = Util.getPaymentURL(vnpParamsMap, true);
//        String hashData = Util.getPaymentURL(vnpParamsMap, false);
//        String vnpSecureHash = Util.hmacSHA512(VNP_SECRET, hashData);
//        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
//        String paymentUrl = VNP_URL + "?" + queryUrl;
//        return paymentUrl;
//    }

}
