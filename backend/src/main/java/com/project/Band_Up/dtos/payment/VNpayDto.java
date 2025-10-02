package com.project.Band_Up.dtos.payment;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VNpayDto {

     String vnp_TmnCode;
     long vnp_Amount;
     String vnp_BankCode;
     String vnp_BankTranNo;
     String vnp_CardType;
     String vnp_PayDate;
     String vnp_OrderInfo;
     String vnp_TransactionNo;
     String vnp_TransactionCode;
     String vnp_TransactionStatus;
     String vnp_TxnRef;
     String vnp_SecureHash;

}
