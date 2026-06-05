package com.example.stock_management.configuration;

import com.microsoft.playwright.CLI;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class PlaywrightInstaller {

    /**
     * Installe Chromium au démarrage si ce n'est pas déjà fait.
     * Équivalent de : mvn exec:java ... "install chromium"
     */
    @PostConstruct
    public void installBrowsers() {
        try {
            log.info("Playwright: vérification/installation de Chromium...");
            CLI.main(new String[]{"install", "chromium"});
            log.info("Playwright: Chromium prêt.");
        } catch (Exception e) {
            log.error("Playwright: échec de l'installation de Chromium: {}", e.getMessage(), e);
            // Ne pas faire planter le démarrage de l'application
        }
    }
}