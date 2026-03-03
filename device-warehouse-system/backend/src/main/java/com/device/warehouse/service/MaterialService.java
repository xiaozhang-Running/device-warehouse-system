package com.device.warehouse.service;

import com.device.warehouse.entity.Material;
import com.device.warehouse.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    public Material getMaterialById(Long id) {
        return materialRepository.findById(id).orElse(null);
    }

    public Material createMaterial(Material material) {
        return materialRepository.save(material);
    }

    public Material updateMaterial(Long id, Material material) {
        Material existingMaterial = materialRepository.findById(id).orElse(null);
        if (existingMaterial != null) {
            existingMaterial.setMaterialCode(material.getMaterialCode());
            existingMaterial.setMaterialName(material.getMaterialName());
            existingMaterial.setCategory(material.getCategory());
            existingMaterial.setSpecification(material.getSpecification());
            existingMaterial.setUnit(material.getUnit());
            existingMaterial.setQuantity(material.getQuantity());
            existingMaterial.setMinQuantity(material.getMinQuantity());
            existingMaterial.setMaxQuantity(material.getMaxQuantity());
            existingMaterial.setUnitPrice(material.getUnitPrice());
            existingMaterial.setSupplier(material.getSupplier());
            existingMaterial.setStorageLocation(material.getStorageLocation());
            existingMaterial.setStatus(material.getStatus());
            existingMaterial.setRemark(material.getRemark());
            return materialRepository.save(existingMaterial);
        }
        return null;
    }

    public void deleteMaterial(Long id) {
        materialRepository.deleteById(id);
    }
}