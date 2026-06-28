package com.example.stock_management.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import com.example.stock_management.util.NumberUtils;

/**
 * Configuration Thymeleaf unifiée pour les templates PDF et Email.
 * Utilise SpringTemplateEngine (Spring EL) au lieu de TemplateEngine (OGNL).
 */
@Configuration
public class ThymeleafConfiguration {

    /**
     * Template resolver pour les PDFs (factures, bons de livraison).
     */
    @Bean(name = "pdfTemplateResolver")
    public ClassLoaderTemplateResolver pdfTemplateResolver() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("pdf-templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);
        resolver.setOrder(1);
        return resolver;
    }

    /**
     * SpringTemplateEngine pour les PDFs — utilise Spring EL (pas OGNL).
     * Marqué {@code @Primary} pour être le moteur par défaut injecté.
     */
    @Primary
    @Bean(name = "pdfTemplateEngine")
    public SpringTemplateEngine pdfTemplateEngine() {
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolver(pdfTemplateResolver());
        engine.setEnableSpringELCompiler(true);
        return engine;
    }

    /**
     * Template resolver pour les emails.
     * Préfixe "email-templates/" + nom du template + ".html"
     */
    @Bean(name = "emailTemplateResolver")
    public ClassLoaderTemplateResolver emailTemplateResolver() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("email-templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);
        resolver.setCheckExistence(true);
        resolver.setOrder(2);
        return resolver;
    }

    /**
     * SpringTemplateEngine dédié pour les emails — utilisé par EmailTemplateService.
     */
    @Bean(name = "emailTemplateEngine")
    public SpringTemplateEngine emailTemplateEngine() {
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolver(emailTemplateResolver());
        engine.setEnableSpringELCompiler(true);
        return engine;
    }

    @Bean
    public NumberUtils numberUtils() {
        return new NumberUtils();
    }

}
