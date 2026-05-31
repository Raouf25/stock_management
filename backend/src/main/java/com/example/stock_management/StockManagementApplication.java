package com.example.stock_management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.thymeleaf.ThymeleafAutoConfiguration;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(exclude = ThymeleafAutoConfiguration.class)
@EnableAsync
public class StockManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(StockManagementApplication.class, args);
    }

}
