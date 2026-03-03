package com.device.warehouse.controller;

import com.device.warehouse.dto.InventorySummaryDTO;
import com.device.warehouse.entity.Inventory;
import com.device.warehouse.entity.InventoryAlertConfig;
import com.device.warehouse.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {
    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @GetMapping("/summary")
    public List<InventorySummaryDTO> getInventorySummary() {
        return inventoryService.getInventorySummary();
    }

    @GetMapping("/summary/search")
    public List<InventorySummaryDTO> searchInventorySummary(@RequestParam String keyword) {
        return inventoryService.searchInventorySummary(keyword);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getInventoryById(@PathVariable Long id) {
        Inventory inventory = inventoryService.getInventoryById(id).orElse(null);
        if (inventory != null) {
            return ResponseEntity.ok(inventory);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/device/{deviceId}")
    public List<Inventory> getInventoryByDevice(@PathVariable Long deviceId) {
        return inventoryService.getInventoryByDevice(deviceId);
    }

    @GetMapping("/warehouse/{warehouseId}")
    public List<Inventory> getInventoryByWarehouse(@PathVariable Long warehouseId) {
        return inventoryService.getInventoryByWarehouse(warehouseId);
    }

    @GetMapping("/low-stock")
    public List<Inventory> getLowStockInventory() {
        return inventoryService.getLowStockInventory();
    }

    @GetMapping("/over-stock")
    public List<Inventory> getOverStockInventory() {
        return inventoryService.getOverStockInventory();
    }

    @GetMapping("/search")
    public List<Inventory> searchInventory(@RequestParam String keyword) {
        return inventoryService.searchInventory(keyword);
    }

    @PostMapping
    public Inventory createInventory(@RequestBody Inventory inventory) {
        return inventoryService.createInventory(inventory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateInventory(@PathVariable Long id, @RequestBody Inventory inventory) {
        Inventory updatedInventory = inventoryService.updateInventory(id, inventory);
        if (updatedInventory != null) {
            return ResponseEntity.ok(updatedInventory);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/quantity")
    public ResponseEntity<?> updateInventoryQuantity(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Integer quantityChange = request.get("quantityChange");
            Inventory inventory = inventoryService.updateInventoryQuantity(id, quantityChange);
            if (inventory != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "库存数量更新成功");
                response.put("inventory", inventory);
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/update-status")
    public ResponseEntity<?> updateInventoryStatus() {
        try {
            inventoryService.updateInventoryStatus();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "库存状态更新成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "库存状态更新失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // 预警配置相关接口
    @GetMapping("/alert-configs")
    public List<InventoryAlertConfig> getAllAlertConfigs() {
        return inventoryService.getAllAlertConfigs();
    }

    @GetMapping("/alert-configs/{deviceName}")
    public ResponseEntity<InventoryAlertConfig> getAlertConfigByDeviceName(@PathVariable String deviceName) {
        InventoryAlertConfig config = inventoryService.getAlertConfigByDeviceName(deviceName).orElse(null);
        if (config != null) {
            return ResponseEntity.ok(config);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/alert-configs")
    public InventoryAlertConfig saveAlertConfig(@RequestBody InventoryAlertConfig config) {
        return inventoryService.saveAlertConfig(config);
    }

    @PutMapping("/alert-configs/{id}")
    public ResponseEntity<InventoryAlertConfig> updateAlertConfig(@PathVariable Long id, @RequestBody InventoryAlertConfig config) {
        config.setId(id);
        InventoryAlertConfig updatedConfig = inventoryService.saveAlertConfig(config);
        return ResponseEntity.ok(updatedConfig);
    }

    @DeleteMapping("/alert-configs/{id}")
    public ResponseEntity<Void> deleteAlertConfig(@PathVariable Long id) {
        inventoryService.deleteAlertConfig(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/warning")
    public List<InventorySummaryDTO> getWarningInventory() {
        return inventoryService.getWarningInventory();
    }
}
