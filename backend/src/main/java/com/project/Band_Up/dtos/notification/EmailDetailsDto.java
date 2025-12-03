package com.project.Band_Up.dtos.notification;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailDetailsDto {

    private String recipient;
    private String subject;
    private String msgBody;
    private String attachment;
    private String highlight;
    private String note;

    public EmailDetailsDto getRegisterOtpMailTemplate(String recipient, String otp) {
        EmailDetailsDto emailDetailsDto = new EmailDetailsDto();
        emailDetailsDto.setRecipient(recipient);
        emailDetailsDto.setSubject("BandUp Sign-in Verification");
        emailDetailsDto.setHighlight(otp);
        emailDetailsDto.setMsgBody("To complete the sign-in process; enter the 6-digit code in the original window:");
        emailDetailsDto.setNote("If you didn't attempt to sign in but received this email, or if the location doesn't match, please ignore this email. Don't share or forward the 6-digit code with anyone. Our customer service will never ask for it. Do not read this code out loud. Be cautious of phishing attempts and always verify the sender and domain (band-up-psi.vercel.app) before acting. If you are concerned about your account's safety, please visit our Help page to get in touch with us.");
        return emailDetailsDto;
    }

    public EmailDetailsDto getPasswordResetOtpMailTemplate(String recipient, String otp) {
        EmailDetailsDto emailDetailsDto = new EmailDetailsDto();
        emailDetailsDto.setRecipient(recipient);
        emailDetailsDto.setSubject("Reset your Band-Up password");
        emailDetailsDto.setHighlight(otp);
        emailDetailsDto.setMsgBody("To reset your password, please enter the following 6-digit code in the original window:");
        emailDetailsDto.setNote("If you didn't request a password reset, please ignore this email. Do not share or forward this code with anyone. Our customer service will never ask for it. Be cautious of phishing attempts and always verify the sender and domain (band-up-psi.vercel.app) before taking action. If you suspect unauthorized access, please change your account credentials immediately and contact our Help page.");
        return emailDetailsDto;
    }

}
