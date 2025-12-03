package com.project.Band_Up.dtos.payment;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentDto {

    private String amount;
    private String clientIp;
    private String orderInfo;
    private String returnUrl;

}
