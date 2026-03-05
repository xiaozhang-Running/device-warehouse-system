package com.device.warehouse.service;

import com.device.warehouse.entity.Device;
import com.device.warehouse.exception.BusinessException;
import com.device.warehouse.exception.ResourceNotFoundException;
import com.device.warehouse.repository.DeviceRepository;
import com.device.warehouse.repository.DeviceImageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 专用设备服务类
 * 提供设备查询、创建、更新、删除等功能
 * 
 * @author Warehouse Management System
 * @version 2.0
 */
@Service
public class DeviceService extends BaseService<Device, Long> {
    
    private static final Logger logger = LoggerFactory.getLogger(DeviceService.class);
    
    @Autowired
    private DeviceRepository deviceRepository;
    
    @Autowired
    private DeviceImageRepository deviceImageRepository;
    
    @Override
    protected JpaRepository<Device, Long> getRepository() {
        return deviceRepository;
    }
    
    @Override
    protected String getEntityName() {
        return "专用设备";
    }
    
    /**
     * 获取所有设备列表
     * 优化：使用批量查询获取图片数量，避免N+1查询问题
     * 
     * @return 设备列表（包含图片数量）
     */
    public List<Device> getAllDevices() {
        List<Device> devices = deviceRepository.findAll();
        populateImageCounts(devices);
        return devices;
    }
    
    /**
     * 根据条件筛选设备
     * 
     * @param deviceName 设备名称
     * @param brand 品牌
     * @param status 状态
     * @param usageStatus 使用状态
     * @return 筛选后的设备列表
     */
    public List<Device> getDevicesByFilters(String deviceName, String brand, String status, String usageStatus) {
        List<Device> devices = deviceRepository.findByFilters(deviceName, brand, status, usageStatus);
        populateImageCounts(devices);
        return devices;
    }
    
    /**
     * 根据状态获取设备
     * 
     * @param status 状态
     * @return 设备列表
     */
    public List<Device> getDevicesByStatus(String status) {
        return deviceRepository.findByStatus(status);
    }
    
    /**
     * 根据使用状态获取设备
     * 
     * @param usageStatus 使用状态
     * @return 设备列表
     */
    public List<Device> getDevicesByUsageStatus(String usageStatus) {
        return deviceRepository.findByUsageStatus(usageStatus);
    }
    
    /**
     * 创建设备
     * 
     * @param device 设备对象
     * @return 创建后的设备
     */
    @Override
    @Transactional
    public Device save(Device device) {
        // 验证设备编码唯一性
        if (device.getId() == null) {
            deviceRepository.findByDeviceCode(device.getDeviceCode())
                .ifPresent(existing -> {
                    throw new BusinessException("设备编码 '" + device.getDeviceCode() + "' 已存在");
                });
            device.setCreatedAt(LocalDateTime.now());
        }
        device.setUpdatedAt(LocalDateTime.now());
        
        Device savedDevice = super.save(device);
        logger.info("设备已保存: {} ({})", savedDevice.getDeviceName(), savedDevice.getDeviceCode());
        return savedDevice;
    }
    
    /**
     * 更新设备
     * 
     * @param id 设备ID
     * @param device 设备对象
     * @return 更新后的设备
     */
    @Transactional
    public Device updateDevice(Long id, Device device) {
        Device existingDevice = findById(id);
        
        // 如果修改了设备编码，检查新编码是否已存在
        if (!existingDevice.getDeviceCode().equals(device.getDeviceCode())) {
            deviceRepository.findByDeviceCode(device.getDeviceCode())
                .ifPresent(d -> {
                    if (!d.getId().equals(id)) {
                        throw new BusinessException("设备编码 '" + device.getDeviceCode() + "' 已存在");
                    }
                });
        }
        
        // 更新字段
        existingDevice.setDeviceName(device.getDeviceName());
        existingDevice.setDeviceCode(device.getDeviceCode());
        existingDevice.setSnCode(device.getSnCode());
        existingDevice.setBrand(device.getBrand());
        existingDevice.setModelSpec(device.getModelSpec());
        existingDevice.setUnit(device.getUnit());
        existingDevice.setCompany(device.getCompany());
        existingDevice.setLocation(device.getLocation());
        existingDevice.setStatus(device.getStatus());
        existingDevice.setUsageStatus(device.getUsageStatus());
        existingDevice.setOtherAccessories(device.getOtherAccessories());
        existingDevice.setRemark(device.getRemark());
        existingDevice.setImageUrl(device.getImageUrl());
        existingDevice.setUpdatedAt(LocalDateTime.now());
        
        Device updatedDevice = super.save(existingDevice);
        logger.info("设备已更新: {} ({})", updatedDevice.getDeviceName(), updatedDevice.getDeviceCode());
        return updatedDevice;
    }
    
    /**
     * 删除设备
     * 
     * @param id 设备ID
     */
    @Override
    @Transactional
    public void deleteById(Long id) {
        Device device = findById(id);
        super.deleteById(id);
        logger.info("设备已删除: {} ({})", device.getDeviceName(), device.getDeviceCode());
    }
    
    /**
     * 批量填充图片数量
     * 优化：使用批量查询避免N+1问题
     * 
     * @param devices 设备列表
     */
    private void populateImageCounts(List<Device> devices) {
        if (devices.isEmpty()) {
            return;
        }
        
        try {
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
            
            devices.forEach(device -> 
                device.setImageCount(countMap.getOrDefault(device.getDeviceName(), 0))
            );
        } catch (Exception e) {
            logger.warn("获取图片数量失败: {}", e.getMessage());
            // 不影响主流程，图片数量保持为null
        }
    }
}
