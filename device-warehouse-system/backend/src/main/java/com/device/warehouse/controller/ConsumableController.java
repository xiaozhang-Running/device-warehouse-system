package com.device.warehouse.controller;

import com.device.warehouse.entity.Consumable;
import com.device.warehouse.service.ConsumableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/consumables")
@CrossOrigin(origins = "*")
public class ConsumableController {
    @Autowired
    private ConsumableService consumableService;

    @GetMapping
    public List<Consumable> getAllConsumables() {
        return consumableService.getAllConsumables();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Consumable> getConsumableById(@PathVariable Long id) {
        Consumable consumable = consumableService.getConsumableById(id);
        if (consumable != null) {
            return ResponseEntity.ok(consumable);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createConsumable(@RequestBody Consumable consumable) {
        try {
            Consumable created = consumableService.createConsumable(consumable);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "耗材创建成功");
            response.put("data", created);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "创建失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateConsumable(@PathVariable Long id, @RequestBody Consumable consumable) {
        try {
            Consumable updated = consumableService.updateConsumable(id, consumable);
            if (updated != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "耗材更新成功");
                response.put("data", updated);
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "更新失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteConsumable(@PathVariable Long id) {
        try {
            consumableService.deleteConsumable(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "耗材已删除");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearAllConsumables() {
        try {
            consumableService.deleteAllConsumables();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "耗材数据已清空");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "清空失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
