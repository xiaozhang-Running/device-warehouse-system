package com.device.warehouse.controller;

import com.device.warehouse.entity.Device;
import com.device.warehouse.service.DeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/devices")
@CrossOrigin(origins = "*")
public class DeviceController {
    @Autowired
    private DeviceService deviceService;

    @GetMapping
    public List<Device> getAllDevices(
            @RequestParam(required = false) String deviceName,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String usageStatus) {
        if (deviceName != null || brand != null || status != null || usageStatus != null) {
            return deviceService.getDevicesByFilters(deviceName, brand, status, usageStatus);
        }
        return deviceService.getAllDevices();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Device> getDeviceById(@PathVariable Long id) {
        Device device = deviceService.getDeviceById(id);
        if (device != null) {
            return ResponseEntity.ok(device);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public Device createDevice(@RequestBody Device device) {
        return deviceService.createDevice(device);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Device> updateDevice(@PathVariable Long id, @RequestBody Device device) {
        Device updatedDevice = deviceService.updateDevice(id, device);
        if (updatedDevice != null) {
            return ResponseEntity.ok(updatedDevice);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearAllDevices() {
        try {
            deviceService.deleteAllDevices();
            return ResponseEntity.ok().body("{\"success\": true, \"message\": \"设备数据已清空\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"success\": false, \"message\": \"清空失败: " + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/empty-name")
    public ResponseEntity<?> getDevicesWithEmptyName() {
        try {
            List<Device> devices = deviceService.getDevicesWithEmptyName();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", devices.size());
            response.put("devices", devices);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "查询失败: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/empty-name")
    public ResponseEntity<?> deleteDevicesWithEmptyName() {
        try {
            int count = deviceService.deleteDevicesWithEmptyName();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "成功删除 " + count + " 条设备名称为空的数据");
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除失败: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PutMapping("/reset-status")
    public ResponseEntity<?> resetAllDevicesStatus() {
        try {
            int count = deviceService.resetAllDevicesToUnused();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "成功将 " + count + " 台设备状态重置为未使用");
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "重置失败: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}