package com.project.Band_Up.exceptions;

public class AuthenticationFailedException extends RuntimeException {
    public AuthenticationFailedException() {
        super("Invalid email or password");
    }
}