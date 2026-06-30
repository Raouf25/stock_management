package com.example.stock_management.repository;

import com.example.stock_management.model.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SettingsRepository extends JpaRepository<AppSetting, Long> {
    Optional<AppSetting> findBySettingKey(String settingKey);
}
