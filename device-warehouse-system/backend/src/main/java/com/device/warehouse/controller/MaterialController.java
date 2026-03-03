package com.device.warehouse.controller;

import com.device.warehouse.entity.Material;
import com.device.warehouse.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/materials")
@CrossOrigin(origins = "*")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @GetMapping
    public ResponseEntity<List<Material>> getAllMaterials() {
        List<Material> materials = materialService.getAllMaterials();
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMaterialById(@PathVariable Long id) {
        Material material = materialService.getMaterialById(id);
        if (material != null) {
            return ResponseEntity.ok(material);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "原材料不存在");
            return ResponseEntity.status(404).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createMaterial(@RequestBody Material material) {
        try {
            System.out.println("创建原材料: " + material.getMaterialName());
            Material createdMaterial = materialService.createMaterial(material);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "原材料创建成功");
            response.put("data", createdMaterial);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("创建原材料失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "创建失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMaterial(@PathVariable Long id, @RequestBody Material material) {
        try {
            Material updatedMaterial = materialService.updateMaterial(id, material);
            if (updatedMaterial != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "原材料更新成功");
                response.put("data", updatedMaterial);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "原材料不存在");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "更新失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long id) {
        try {
            materialService.deleteMaterial(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "原材料已删除");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}