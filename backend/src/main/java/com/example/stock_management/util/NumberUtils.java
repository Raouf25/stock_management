package com.example.stock_management.util;

import java.text.DecimalFormat;

public class NumberUtils {

    public String formatDecimal(double number, int minFractionDigits, int maxFractionDigits) {
        DecimalFormat decimalFormat = new DecimalFormat();
        decimalFormat.setMinimumFractionDigits(minFractionDigits);
        decimalFormat.setMaximumFractionDigits(maxFractionDigits);
        return decimalFormat.format(number);
    }
}