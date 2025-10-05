package com.project.Band_Up.services.notification;

import com.project.Band_Up.dtos.notification.EmailDetailsDto;
import com.project.Band_Up.utils.Util;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.IOException;
import java.util.Random;
import java.util.UUID;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private TemplateEngine templateEngine;

    @Async
    public void sendOtpEmail(EmailDetailsDto emailDetailsDto) {
        try {
            Random random = new Random();
            Context context = new Context();
            context.setVariable("email", emailDetailsDto.getRecipient());
            context.setVariable("message", emailDetailsDto.getMsgBody());
            context.setVariable("subject", emailDetailsDto.getSubject());
            context.setVariable("title", UUID.randomUUID().toString());
            context.setVariable("note", emailDetailsDto.getNote());
            context.setVariable("highlight", emailDetailsDto.getHighlight());
            String htmlContent = templateEngine.process("mail/register-otp", context);
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(emailDetailsDto.getRecipient());
            helper.setSubject(String.format("%d - %s",random.nextInt(10000,99999), emailDetailsDto.getSubject()));
            helper.setText(htmlContent, true);
            helper.addInline("companyLogo", new ClassPathResource("images/logo-dark.png"));

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    @Async
    public void sendMailWithAttachment(EmailDetailsDto emailDetailsDto) {
        try {
    //        S3Object s3Object = s3Client.getObject(bucketName, key);
    //        InputStream inputStream = s3Object.getObjectContent();
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(emailDetailsDto.getRecipient());
            helper.setSubject(emailDetailsDto.getSubject());
            helper.setText(emailDetailsDto.getMsgBody(), true);
            helper.addAttachment("test.jpg", new ByteArrayDataSource(emailDetailsDto.getAttachment(), ""));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
