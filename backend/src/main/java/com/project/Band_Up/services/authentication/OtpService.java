package com.project.Band_Up.services.authentication;

public interface OtpService {

    public void saveOtp(String email, String otp);

    public String getOtp(String email);

    public void deleteOtp(String email);

}
