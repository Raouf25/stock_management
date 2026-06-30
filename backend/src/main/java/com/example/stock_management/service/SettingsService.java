package com.example.stock_management.service;

import com.example.stock_management.model.AppSetting;
import com.example.stock_management.repository.SettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsService {

    private static final String KEY_TAX_RATE = "tax_rate";
    private static final double DEFAULT_TAX_RATE = 19.0;

    private final SettingsRepository settingsRepository;

    /**
     * Retourne tous les paramètres sous forme de Map clé→valeur.
     */
    public Map<String, String> getAll() {
        List<AppSetting> all = settingsRepository.findAll();
        Map<String, String> result = new LinkedHashMap<>();
        for (AppSetting setting : all) {
            result.put(setting.getSettingKey(), setting.getSettingValue());
        }
        return result;
    }

    /**
     * Met à jour (ou crée) les paramètres passés en entrée et retourne l'état complet.
     */
    @Transactional
    public Map<String, String> update(Map<String, String> settings) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            AppSetting setting = settingsRepository.findBySettingKey(entry.getKey())
                    .orElseGet(() -> {
                        AppSetting newSetting = new AppSetting();
                        newSetting.setSettingKey(entry.getKey());
                        return newSetting;
                    });
            setting.setSettingValue(entry.getValue());
            settingsRepository.save(setting);
        }
        log.info("Settings updated: {} keys", settings.size());
        return getAll();
    }

    /**
     * Retourne la valeur d'un paramètre par sa clé, ou null si absent.
     */
    public String getValue(String key) {
        return settingsRepository.findBySettingKey(key)
                .map(AppSetting::getSettingValue)
                .orElse(null);
    }

    /**
     * Retourne le taux de TVA configuré (en %).
     * Utilisé par BillService ou tout autre service ayant besoin du taux fiscal.
     */
    public double getTaxRate() {
        String value = getValue(KEY_TAX_RATE);
        if (value == null || value.isBlank()) {
            return DEFAULT_TAX_RATE;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            log.warn("Invalid tax_rate setting value '{}', using default {}", value, DEFAULT_TAX_RATE);
            return DEFAULT_TAX_RATE;
        }
    }
}
