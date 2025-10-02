package com.project.Band_Up.services.payment;

import com.nimbusds.jose.shaded.gson.Gson;
import com.nimbusds.jose.shaded.gson.JsonObject;
import com.project.Band_Up.configs.VNpayConfig;
import com.project.Band_Up.dtos.payment.PaymentDto;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.utils.Util;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class PaymentSeviceImpl implements PaymentService{

    @Value("${VNP_SECRET}")
    private String VNP_SECRET;
    @Value("${VNP_URL}")
    private String VNP_URL;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private VNpayConfig  vnpayConfig;

    public String createPaymentUrl(PaymentDto paymentDto, UUID accountId){
        Account account = accountRepository.findById(accountId)
                .orElseThrow(()-> new ResourceNotFoundException("Account not found"));

        long amount = Integer.parseInt(paymentDto.getAmount()) * 100L;
        String bankCode = null;
        Map<String, String> vnpParamsMap = vnpayConfig.getVNPayConfig();
        vnpParamsMap.put("vnp_Amount", String.valueOf(amount));
        if (bankCode != null && !bankCode.isEmpty()) {
            vnpParamsMap.put("vnp_BankCode", bankCode);
        }
        vnpParamsMap.put("vnp_IpAddr", paymentDto.getClientIp());
        //build query url
        String queryUrl = Util.getPaymentURL(vnpParamsMap, true);
        String hashData = Util.getPaymentURL(vnpParamsMap, false);
        String vnpSecureHash = Util.hmacSHA512(VNP_SECRET, hashData);
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        String paymentUrl = VNP_URL + "?" + queryUrl;
        return paymentUrl;
    }

}
