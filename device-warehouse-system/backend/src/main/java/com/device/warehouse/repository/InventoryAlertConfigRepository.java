package com.device.warehouse.repository;

import com.device.warehouse.entity.InventoryAlertConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryAlertConfigRepository extends JpaRepository<InventoryAlertConfig, Long> {
    Optional<InventoryAlertConfig> findByDeviceName(String deviceName);
}
