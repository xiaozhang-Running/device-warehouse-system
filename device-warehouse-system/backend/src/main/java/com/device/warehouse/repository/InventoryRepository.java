package com.device.warehouse.repository;

import com.device.warehouse.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    Optional<Inventory> findByDeviceIdAndWarehouseId(Long deviceId, Long warehouseId);
    
    List<Inventory> findByDeviceId(Long deviceId);
    
    List<Inventory> findByWarehouseId(Long warehouseId);
    
    List<Inventory> findByStatus(String status);
    
    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.minQuantity")
    List<Inventory> findLowStockInventory();
    
    @Query("SELECT i FROM Inventory i WHERE i.quantity >= i.maxQuantity")
    List<Inventory> findOverStockInventory();
    
    @Query("SELECT i FROM Inventory i WHERE i.deviceName LIKE %:keyword% OR i.deviceCode LIKE %:keyword% OR i.warehouseName LIKE %:keyword%")
    List<Inventory> searchInventory(@Param("keyword") String keyword);
}