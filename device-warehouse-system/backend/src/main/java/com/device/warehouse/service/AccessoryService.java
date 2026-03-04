package com.device.warehouse.service;

import com.device.warehouse.entity.Accessory;
import com.device.warehouse.repository.AccessoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class AccessoryService {
    @Autowired
    private AccessoryRepository accessoryRepository;

    public List<Accessory> getAllAccessories() {
        return accessoryRepository.findAll();
    }

    public List<Accessory> getAllAccessories(String accessoryName, String brand, String status, String usageStatus) {
        List<Accessory> allAccessories = accessoryRepository.findAll();
        
        return allAccessories.stream()
            .filter(accessory -> {
                // 筛选名称（模糊匹配）
                if (accessoryName != null && !accessoryName.isEmpty()) {
                    if (accessory.getAccessoryName() == null || 
                        !accessory.getAccessoryName().toLowerCase().contains(accessoryName.toLowerCase())) {
                        return false;
                    }
                }
                // 筛选品牌（模糊匹配）
                if (brand != null && !brand.isEmpty()) {
                    if (accessory.getBrand() == null || 
                        !accessory.getBrand().toLowerCase().contains(brand.toLowerCase())) {
                        return false;
                    }
                }
                // 筛选设备状态（精确匹配）
                if (status != null && !status.isEmpty()) {
                    if (accessory.getStatus() == null || !accessory.getStatus().equals(status)) {
                        return false;
                    }
                }
                // 筛选使用状态（精确匹配）
                if (usageStatus != null && !usageStatus.isEmpty()) {
                    if (accessory.getUsageStatus() == null || !accessory.getUsageStatus().equals(usageStatus)) {
                        return false;
                    }
                }
                return true;
            })
            .collect(Collectors.toList());
    }

    public Accessory getAccessoryById(Long id) {
        return accessoryRepository.findById(id).orElse(null);
    }

    public Accessory createAccessory(Accessory accessory) {
        return accessoryRepository.save(accessory);
    }

    public Accessory updateAccessory(Long id, Accessory accessory) {
        Accessory existingAccessory = accessoryRepository.findById(id).orElse(null);
        if (existingAccessory != null) {
            existingAccessory.setSeqNo(accessory.getSeqNo());
            existingAccessory.setAccessoryName(accessory.getAccessoryName());
            existingAccessory.setBrand(accessory.getBrand());
            existingAccessory.setModelSpec(accessory.getModelSpec());
            existingAccessory.setQuantity(accessory.getQuantity());
            existingAccessory.setUnit(accessory.getUnit());
            existingAccessory.setInUseQuantity(accessory.getInUseQuantity());
            existingAccessory.setRemainingQuantity(accessory.getRemainingQuantity());
            existingAccessory.setImageUrl(accessory.getImageUrl());
            existingAccessory.setRemark(accessory.getRemark());
            return accessoryRepository.save(existingAccessory);
        }
        return null;
    }

    public void deleteAccessory(Long id) {
        accessoryRepository.deleteById(id);
    }

    public void deleteAllAccessories() {
        accessoryRepository.deleteAll();
    }
}
