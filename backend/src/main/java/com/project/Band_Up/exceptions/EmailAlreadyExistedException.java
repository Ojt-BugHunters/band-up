package com.project.Band_Up.exceptions;

public class EmailAlreadyExistedException extends RuntimeException{
    public EmailAlreadyExistedException(String message){
        super(message + " existed!");
    }
}
