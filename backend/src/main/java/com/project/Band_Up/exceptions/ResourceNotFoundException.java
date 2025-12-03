package com.project.Band_Up.exceptions;

public class ResourceNotFoundException extends RuntimeException{
    public ResourceNotFoundException(String message) {
        super(message + " not found!");
    }
}
