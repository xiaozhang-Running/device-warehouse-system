package com.device.warehouse.controller;

import com.device.warehouse.entity.Accessory;
import com.device.warehouse.service.AccessoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/accessories")
@CrossOrigin(origins = "*")
public class AccessoryController {
    @Autowired
    private AccessoryService accessoryService;

    @GetMapping
    public List<Accessory> getAllAccessories(
            @RequestParam(required = false) String accessoryName,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String usageStatus) {
        return accessoryService.getAllAccessories(accessoryName, brand, status, usageStatus);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Accessory> getAccessoryById(@PathVariable Long id) {
        Accessory accessory = accessoryService.getAccessoryById(id);
        if (accessory != null) {
            return ResponseEntity.ok(accessory);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createAccessory(@RequestBody Accessory accessory) {
        try {
            Accessory created = accessoryService.createAccessory(accessory);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "配件创建成功");
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
    public ResponseEntity<?> updateAccessory(@PathVariable Long id, @RequestBody Accessory accessory) {
        try {
            Accessory updated = accessoryService.updateAccessory(id, accessory);
            if (updated != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "配件更新成功");
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
    public ResponseEntity<?> deleteAccessory(@PathVariable Long id) {
        try {
            accessoryService.deleteAccessory(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "配件已删除");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearAllAccessories() {
        try {
            accessoryService.deleteAllAccessories();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "配件数据已清空");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "清空失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
