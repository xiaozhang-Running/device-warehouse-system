package com.device.warehouse.controller;

import com.device.warehouse.dto.ApiResponse;
import com.device.warehouse.entity.Device;
import com.device.warehouse.service.DeviceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 专用设备控制器
 * 提供设备CRUD和查询接口
 */
@RestController
@RequestMapping("/api/devices")
@CrossOrigin(origins = "*")
public class DeviceController {
    
    private static final Logger logger = LoggerFactory.getLogger(DeviceController.class);
    
    @Autowired
    private DeviceService deviceService;

    /**
     * 获取所有设备
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Device>>> getAllDevices(
            @RequestParam(required = false) String deviceName,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String usageStatus) {
        
        List<Device> devices;
        if (deviceName != null || brand != null || status != null || usageStatus != null) {
            devices = deviceService.getDevicesByFilters(deviceName, brand, status, usageStatus);
        } else {
            devices = deviceService.getAllDevices();
        }
        
        return ResponseEntity.ok(ApiResponse.success(devices));
    }

    /**
     * 根据ID获取设备
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Device>> getDeviceById(@PathVariable Long id) {
        Device device = deviceService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(device));
    }

    /**
     * 创建设备
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Device>> createDevice(@RequestBody Device device) {
        logger.info("创建设备: {}", device.getDeviceName());
        Device savedDevice = deviceService.save(device);
        return ResponseEntity.ok(ApiResponse.success("设备创建成功", savedDevice));
    }

    /**
     * 更新设备
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Device>> updateDevice(
            @PathVariable Long id, 
            @RequestBody Device device) {
        logger.info("更新设备: id={}", id);
        Device updatedDevice = deviceService.updateDevice(id, device);
        return ResponseEntity.ok(ApiResponse.success("设备更新成功", updatedDevice));
    }

    /**
     * 删除设备
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDevice(@PathVariable Long id) {
        logger.info("删除设备: id={}", id);
        deviceService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("设备删除成功", null));
    }

    /**
     * 根据状态获取设备
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Device>>> getDevicesByStatus(@PathVariable String status) {
        List<Device> devices = deviceService.getDevicesByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(devices));
    }

    /**
     * 根据使用状态获取设备
     */
    @GetMapping("/usage-status/{usageStatus}")
    public ResponseEntity<ApiResponse<List<Device>>> getDevicesByUsageStatus(@PathVariable String usageStatus) {
        List<Device> devices = deviceService.getDevicesByUsageStatus(usageStatus);
        return ResponseEntity.ok(ApiResponse.success(devices));
    }
}
