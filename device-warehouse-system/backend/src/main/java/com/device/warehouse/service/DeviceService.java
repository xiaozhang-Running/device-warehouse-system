package com.device.warehouse.service;

import com.device.warehouse.entity.Device;
import com.device.warehouse.repository.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 专用设备服务类
 * 提供设备查询、创建、更新、删除等功能
 * 
 * @author Warehouse Management System
 * @version 1.0
 */
@Service
@SuppressWarnings("null")
public class DeviceService {
    @Autowired
    private DeviceRepository deviceRepository;
    
    @Autowired
    private com.device.warehouse.repository.DeviceImageRepository deviceImageRepository;

    /**
     * 获取所有设备列表
     * 优化：使用批量查询获取图片数量，避免N+1查询问题
     * 
     * @return 设备列表（包含图片数量）
     */
    public List<Device> getAllDevices() {
        List<Device> devices = deviceRepository.findAll();
        
        // 批量获取图片数量，避免N+1查询
        if (!devices.isEmpty()) {
            List<String> deviceNames = devices.stream()
                .map(Device::getDeviceName)
                .distinct()
                .collect(Collectors.toList());
            
            List<Map<String, Object>> imageCounts = deviceImageRepository.countImagesByDeviceNames(deviceNames);
            Map<String, Integer> countMap = imageCounts.stream()
                .collect(Collectors.toMap(
                    m -> (String) m.get("deviceName"),
                    m -> ((Number) m.get("count")).intValue(),
                    (v1, v2) -> v1
                ));
            
            devices.forEach(device -> {
                device.setImageCount(countMap.getOrDefault(device.getDeviceName(), 0));
            });
        }
        
        return devices;
    }

    /**
     * 根据条件筛选设备
     * 优化：使用批量查询获取图片数量，避免N+1查询问题
     * 
     * @param deviceName 设备名称
     * @param brand 品牌
     * @param status 状态
     * @param usageStatus 使用状态
     * @return 筛选后的设备列表
     */
    public List<Device> getDevicesByFilters(String deviceName, String brand, String status, String usageStatus) {
        List<Device> devices = deviceRepository.findByFilters(deviceName, brand, status, usageStatus);
        
        // 批量获取图片数量，避免N+1查询
        if (!devices.isEmpty()) {
            List<String> deviceNames = devices.stream()
                .map(Device::getDeviceName)
                .distinct()
                .collect(Collectors.toList());
            
            List<Map<String, Object>> imageCounts = deviceImageRepository.countImagesByDeviceNames(deviceNames);
            Map<String, Integer> countMap = imageCounts.stream()
                .collect(Collectors.toMap(
                    m -> (String) m.get("deviceName"),
                    m -> ((Number) m.get("count")).intValue(),
                    (v1, v2) -> v1
                ));
            
            devices.forEach(device -> {
                device.setImageCount(countMap.getOrDefault(device.getDeviceName(), 0));
            });
        }
        
        return devices;
    }

    /**
     * 根据ID获取设备
     * @param id 设备ID
     * @return 设备对象
     */
    public Device getDeviceById(Long id) {
        return deviceRepository.findById(id).orElse(null);
    }

    /**
     * 创建设备
     * @param device 设备对象
     * @return 创建后的设备
     */
    public Device createDevice(Device device) {
        return deviceRepository.save(device);
    }

    /**
     * 更新设备
     * @param id 设备ID
     * @param device 设备对象
     * @return 更新后的设备
     */
    public Device updateDevice(Long id, Device device) {
        Device existingDevice = deviceRepository.findById(id).orElse(null);
        if (existingDevice != null) {
            existingDevice.setDeviceCode(device.getDeviceCode());
            existingDevice.setDeviceName(device.getDeviceName());
            existingDevice.setBrand(device.getBrand());
            existingDevice.setModelSpec(device.getModelSpec());
            existingDevice.setSnCode(device.getSnCode());
            existingDevice.setQuantity(device.getQuantity());
            existingDevice.setUnit(device.getUnit());
            existingDevice.setOtherAccessories(device.getOtherAccessories());
            existingDevice.setStatus(device.getStatus());
            existingDevice.setUsageStatus(device.getUsageStatus());
            existingDevice.setRemark(device.getRemark());
            existingDevice.setImageUrl(device.getImageUrl());
            return deviceRepository.save(existingDevice);
        }
        return null;
    }

    /**
     * 删除设备
     * @param id 设备ID
     */
    public void deleteDevice(Long id) {
        deviceRepository.deleteById(id);
    }

    /**
     * 清空所有设备数据
     */
    public void deleteAllDevices() {
        deviceImageRepository.deleteAll();
        deviceRepository.deleteAll();
    }

    /**
     * 获取设备名称为空的设备
     * @return 设备列表
     */
    public List<Device> getDevicesWithEmptyName() {
        return deviceRepository.findByEmptyDeviceName();
    }

    /**
     * 删除设备名称为空的设备
     * @return 删除数量
     */
    public int deleteDevicesWithEmptyName() {
        List<Device> emptyDevices = deviceRepository.findByEmptyDeviceName();
        int count = emptyDevices.size();
        deviceRepository.deleteAll(emptyDevices);
        return count;
    }

    /**
     * 将所有设备的使用状态设置为"未使用"
     * @return 更新的设备数量
     */
    public int resetAllDevicesToUnused() {
        List<Device> allDevices = deviceRepository.findAll();
        int count = 0;
        for (Device device : allDevices) {
            if (device.getUsageStatus() == null || !device.getUsageStatus().equals("未使用")) {
                device.setUsageStatus("未使用");
                deviceRepository.save(device);
                count++;
            }
        }
        return count;
    }
}
