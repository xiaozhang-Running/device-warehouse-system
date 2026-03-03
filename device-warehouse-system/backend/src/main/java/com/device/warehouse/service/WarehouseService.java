package com.device.warehouse.service;

import com.device.warehouse.entity.Warehouse;
import com.device.warehouse.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
public class WarehouseService {
    @Autowired
    private WarehouseRepository warehouseRepository;

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Warehouse getWarehouseById(Long id) {
        return warehouseRepository.findById(id).orElse(null);
    }

    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    public Warehouse updateWarehouse(Long id, Warehouse warehouse) {
        Warehouse existingWarehouse = warehouseRepository.findById(id).orElse(null);
        if (existingWarehouse != null) {
            existingWarehouse.setName(warehouse.getName());
            existingWarehouse.setCode(warehouse.getCode());
            existingWarehouse.setAddress(warehouse.getAddress());
            existingWarehouse.setCapacity(warehouse.getCapacity());
            existingWarehouse.setCurrentCount(warehouse.getCurrentCount());
            existingWarehouse.setManager(warehouse.getManager());
            existingWarehouse.setContactPhone(warehouse.getContactPhone());
            existingWarehouse.setRemark(warehouse.getRemark());
            existingWarehouse.setStatus(warehouse.getStatus());
            return warehouseRepository.save(existingWarehouse);
        }
        return null;
    }

    public void deleteWarehouse(Long id) {
        warehouseRepository.deleteById(id);
    }
}
