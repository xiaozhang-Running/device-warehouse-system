package com.device.warehouse.service;

import com.device.warehouse.entity.Consumable;
import com.device.warehouse.repository.ConsumableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@SuppressWarnings("null")
public class ConsumableService {
    @Autowired
    private ConsumableRepository consumableRepository;

    public List<Consumable> getAllConsumables() {
        return consumableRepository.findAll();
    }

    public Consumable getConsumableById(Long id) {
        return consumableRepository.findById(id).orElse(null);
    }

    public Consumable createConsumable(Consumable consumable) {
        return consumableRepository.save(consumable);
    }

    public Consumable updateConsumable(Long id, Consumable consumable) {
        Consumable existingConsumable = consumableRepository.findById(id).orElse(null);
        if (existingConsumable != null) {
            existingConsumable.setSeqNo(consumable.getSeqNo());
            existingConsumable.setConsumableName(consumable.getConsumableName());
            existingConsumable.setBrand(consumable.getBrand());
            existingConsumable.setModelSpec(consumable.getModelSpec());
            existingConsumable.setQuantity(consumable.getQuantity());
            existingConsumable.setUnit(consumable.getUnit());
            existingConsumable.setImageUrl(consumable.getImageUrl());
            existingConsumable.setRemark(consumable.getRemark());
            return consumableRepository.save(existingConsumable);
        }
        return null;
    }

    public void deleteConsumable(Long id) {
        consumableRepository.deleteById(id);
    }

    public void deleteAllConsumables() {
        consumableRepository.deleteAll();
    }
}
