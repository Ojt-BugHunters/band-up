package com.project.Band_Up.utils;

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
}
