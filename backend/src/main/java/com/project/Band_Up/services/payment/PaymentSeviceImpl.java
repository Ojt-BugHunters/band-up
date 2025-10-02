package com.project.Band_Up.services.payment;

import com.nimbusds.jose.shaded.gson.Gson;
import com.nimbusds.jose.shaded.gson.JsonObject;
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

    @Value("${VNP_TMNCODE}")
    private String VNP_TMNCODE;
    @Value("${VNP_SECRET}")
    private String VNP_SECRET;
    @Value("${VNP_URL}")
    private String VNP_URL;
    @Autowired
    private AccountRepository accountRepository;

    public String createPaymentUrl(PaymentDto paymentDto, UUID accountId){
        Account account = accountRepository.findById(accountId)
                .orElseThrow(()-> new ResourceNotFoundException("Account not found"));
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = paymentDto.getOrderInfo();
        String orderType = "250006";
        String vnp_TxnRef = Util.randomNumber(8);
        String vnp_IpAddr = paymentDto.getClientIp();

        int amount = Integer.parseInt(paymentDto.getAmount()) * 100;
        Map vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", VNP_TMNCODE);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "en");
        vnp_Params.put("vnp_ReturnUrl", paymentDto.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));

        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());

        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        //Add Params of 2.1.0 Version
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        //Billing
//        vnp_Params.put("vnp_Bill_Email", account.getEmail());
//        String fullName = (account.getName()).trim();
//        int idx = fullName.indexOf(' ');
//        String firstName = fullName.substring(0, idx);
//        String lastName = fullName.substring(fullName.lastIndexOf(' ') + 1);
//        vnp_Params.put("vnp_Bill_FirstName", firstName);
//        vnp_Params.put("vnp_Bill_LastName", lastName);
//        vnp_Params.put("vnp_Bill_Address", req.getParameter("txt_inv_addr1"));
//        vnp_Params.put("vnp_Bill_City", req.getParameter("txt_bill_city"));
//        vnp_Params.put("vnp_Bill_Country", req.getParameter("txt_bill_country"));
//        if (req.getParameter("txt_bill_state") != null && !req.getParameter("txt_bill_state").isEmpty()) {
//            vnp_Params.put("vnp_Bill_State", req.getParameter("txt_bill_state"));
//        }
//        // Invoice
//        vnp_Params.put("vnp_Inv_Phone", req.getParameter("txt_inv_mobile"));
//        vnp_Params.put("vnp_Inv_Email", req.getParameter("txt_inv_email"));
//        vnp_Params.put("vnp_Inv_Customer", req.getParameter("txt_inv_customer"));
//        vnp_Params.put("vnp_Inv_Address", req.getParameter("txt_inv_addr1"));
//        vnp_Params.put("vnp_Inv_Company", req.getParameter("txt_inv_company"));
//        vnp_Params.put("vnp_Inv_Taxcode", req.getParameter("txt_inv_taxcode"));
//        vnp_Params.put("vnp_Inv_Type", req.getParameter("cbo_inv_type"));
        //Build data to hash and querystring
        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        try {
            while (itr.hasNext()) {
                String fieldName = (String) itr.next();
                String fieldValue = (String) vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    //Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    //Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = Util.hmacSHA512(VNP_SECRET, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = VNP_URL + "?" + queryUrl;
        JsonObject job = new JsonObject();
        job.addProperty("code", "00");
        job.addProperty("message", "success");
        job.addProperty("data", paymentUrl);
        Gson gson = new Gson();
        return gson.toJson(job);
    }

}
