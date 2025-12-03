package com.project.Band_Up.services.notification;

import com.project.Band_Up.dtos.notification.EmailDetailsDto;
import jakarta.mail.MessagingException;

import java.io.IOException;

public interface EmailService {

    public void sendOtpEmail(EmailDetailsDto emailDetailsDto);

    public void sendMailWithAttachment(EmailDetailsDto emailDetailsDto);

}
