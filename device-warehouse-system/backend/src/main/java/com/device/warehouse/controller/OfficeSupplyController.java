package com.device.warehouse.controller;

import com.device.warehouse.entity.OfficeSupply;
import com.device.warehouse.service.OfficeSupplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/office-supplies")
@CrossOrigin(origins = "*")
public class OfficeSupplyController {

    @Autowired
    private OfficeSupplyService officeSupplyService;

    @GetMapping
    public ResponseEntity<List<OfficeSupply>> getAllOfficeSupplies() {
        List<OfficeSupply> supplies = officeSupplyService.getAllOfficeSupplies();
        return ResponseEntity.ok(supplies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOfficeSupplyById(@PathVariable Long id) {
        OfficeSupply supply = officeSupplyService.getOfficeSupplyById(id);
        if (supply != null) {
            return ResponseEntity.ok(supply);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "办公用品不存在");
            return ResponseEntity.status(404).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createOfficeSupply(@RequestBody OfficeSupply officeSupply) {
        try {
            OfficeSupply created = officeSupplyService.createOfficeSupply(officeSupply);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "办公用品创建成功");
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
    public ResponseEntity<?> updateOfficeSupply(@PathVariable Long id, @RequestBody OfficeSupply officeSupply) {
        OfficeSupply updated = officeSupplyService.updateOfficeSupply(id, officeSupply);
        if (updated != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "办公用品更新成功");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "办公用品不存在");
            return ResponseEntity.status(404).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOfficeSupply(@PathVariable Long id) {
        try {
            officeSupplyService.deleteOfficeSupply(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "办公用品删除成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearAllOfficeSupplies() {
        try {
            officeSupplyService.deleteAllOfficeSupplies();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "所有办公用品数据已清空");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "清空失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<OfficeSupply>> searchByName(@RequestParam String name) {
        List<OfficeSupply> supplies = officeSupplyService.searchByName(name);
        return ResponseEntity.ok(supplies);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<OfficeSupply>> getByCategory(@PathVariable String category) {
        List<OfficeSupply> supplies = officeSupplyService.getByCategory(category);
        return ResponseEntity.ok(supplies);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OfficeSupply>> getByStatus(@PathVariable String status) {
        List<OfficeSupply> supplies = officeSupplyService.getByStatus(status);
        return ResponseEntity.ok(supplies);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<OfficeSupply>> getLowStockSupplies(@RequestParam(defaultValue = "10") Integer quantity) {
        List<OfficeSupply> supplies = officeSupplyService.getLowStockSupplies(quantity);
        return ResponseEntity.ok(supplies);
    }

    @GetMapping("/max-seqno")
    public ResponseEntity<Map<String, Object>> getMaxSeqNo() {
        Integer maxSeqNo = officeSupplyService.getMaxSeqNo();
        Map<String, Object> response = new HashMap<>();
        response.put("maxSeqNo", maxSeqNo);
        return ResponseEntity.ok(response);
    }
}
