package com.device.warehouse.service;

import com.device.warehouse.entity.Accessory;
import com.device.warehouse.repository.AccessoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@SuppressWarnings("null")
public class AccessoryService {
    @Autowired
    private AccessoryRepository accessoryRepository;

    public List<Accessory> getAllAccessories() {
        return accessoryRepository.findAll();
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
