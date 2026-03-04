package com.device.warehouse.service;

import com.device.warehouse.entity.OfficeSupply;
import com.device.warehouse.repository.OfficeSupplyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@SuppressWarnings("null")
public class OfficeSupplyService {
    @Autowired
    private OfficeSupplyRepository officeSupplyRepository;

    public List<OfficeSupply> getAllOfficeSupplies() {
        return officeSupplyRepository.findAll();
    }

    public OfficeSupply getOfficeSupplyById(Long id) {
        return officeSupplyRepository.findById(id).orElse(null);
    }

    public OfficeSupply createOfficeSupply(OfficeSupply officeSupply) {
        return officeSupplyRepository.save(officeSupply);
    }

    public OfficeSupply updateOfficeSupply(Long id, OfficeSupply officeSupply) {
        OfficeSupply existingSupply = officeSupplyRepository.findById(id).orElse(null);
        if (existingSupply != null) {
            existingSupply.setSeqNo(officeSupply.getSeqNo());
            existingSupply.setSupplyName(officeSupply.getSupplyName());
            existingSupply.setCategory(officeSupply.getCategory());
            existingSupply.setBrand(officeSupply.getBrand());
            existingSupply.setModelSpec(officeSupply.getModelSpec());
            existingSupply.setQuantity(officeSupply.getQuantity());
            existingSupply.setUnit(officeSupply.getUnit());
            existingSupply.setMinStock(officeSupply.getMinStock());
            existingSupply.setLocation(officeSupply.getLocation());
            existingSupply.setSupplier(officeSupply.getSupplier());
            existingSupply.setPrice(officeSupply.getPrice());
            existingSupply.setStatus(officeSupply.getStatus());
            existingSupply.setRemark(officeSupply.getRemark());
            existingSupply.setImageUrl(officeSupply.getImageUrl());
            return officeSupplyRepository.save(existingSupply);
        }
        return null;
    }

    public void deleteOfficeSupply(Long id) {
        officeSupplyRepository.deleteById(id);
    }

    public void deleteAllOfficeSupplies() {
        officeSupplyRepository.deleteAll();
    }

    public List<OfficeSupply> searchByName(String name) {
        return officeSupplyRepository.findBySupplyNameContaining(name);
    }

    public List<OfficeSupply> getByCategory(String category) {
        return officeSupplyRepository.findByCategory(category);
    }

    public List<OfficeSupply> getByStatus(String status) {
        return officeSupplyRepository.findByStatus(status);
    }

    public List<OfficeSupply> getLowStockSupplies(Integer quantity) {
        return officeSupplyRepository.findByQuantityLessThanEqual(quantity);
    }

    public Integer getMaxSeqNo() {
        List<OfficeSupply> supplies = officeSupplyRepository.findAll();
        return supplies.stream()
            .map(OfficeSupply::getSeqNo)
            .filter(seqNo -> seqNo != null)
            .max(Integer::compareTo)
            .orElse(0);
    }
}
