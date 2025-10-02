package com.project.Band_Up.utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Random;

public class Util {

    public static String randomNumber(int length){
        Random random = new Random();

        StringBuilder strNumber = null;
        for (int i = 0; i < 8; i++) {
            int number = 10_000_000 + random.nextInt(90_000_000);
            strNumber.append(String.valueOf(number));
        }
        return strNumber.toString();
    }

    public static String hmacSHA512(String key, String data) {
        try {
            // Create HmacSHA512 instance
            Mac hmacSHA512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA512"
            );
            hmacSHA512.init(secretKeySpec);

            // Calculate the HMAC
            byte[] hashBytes = hmacSHA512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            // Convert to hex string
            StringBuilder hashHex = new StringBuilder();
            for (byte b : hashBytes) {
                hashHex.append(String.format("%02x", b & 0xff));
            }
            return hashHex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error while generating HMAC SHA512 hash", e);
        }
    }
}
