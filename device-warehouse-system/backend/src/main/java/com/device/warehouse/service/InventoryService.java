package com.device.warehouse.service;

import com.device.warehouse.dto.InventorySummaryDTO;
import com.device.warehouse.entity.Device;
import com.device.warehouse.entity.Accessory;
import com.device.warehouse.entity.Consumable;
import com.device.warehouse.entity.Inventory;
import com.device.warehouse.entity.InventoryAlertConfig;
import com.device.warehouse.repository.DeviceRepository;
import com.device.warehouse.repository.AccessoryRepository;
import com.device.warehouse.repository.ConsumableRepository;
import com.device.warehouse.repository.InventoryRepository;
import com.device.warehouse.repository.InventoryAlertConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 库存管理服务类
 * 提供库存查询、更新、汇总统计、预警管理等功能
 * 
 * @author Warehouse Management System
 * @version 1.0
 */
@Service
@SuppressWarnings("null")
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private AccessoryRepository accessoryRepository;

    @Autowired
    private ConsumableRepository consumableRepository;

    @Autowired
    private InventoryAlertConfigRepository alertConfigRepository;

    // ==================== 基础CRUD操作 ====================

    /**
     * 获取所有库存记录
     * @return 库存列表
     */
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    /**
     * 根据ID获取库存记录
     * @param id 库存ID
     * @return 库存记录Optional对象
     */
    public Optional<Inventory> getInventoryById(Long id) {
        return inventoryRepository.findById(id);
    }

    /**
     * 创建库存记录
     * @param inventory 库存对象
     * @return 创建的库存记录
     */
    public Inventory createInventory(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    /**
     * 更新库存记录
     * @param id 库存ID
     * @param inventory 更新的库存信息
     * @return 更新后的库存记录，如果不存在返回null
     */
    public Inventory updateInventory(Long id, Inventory inventory) {
        Optional<Inventory> existingInventory = inventoryRepository.findById(id);
        if (existingInventory.isPresent()) {
            Inventory updatedInventory = existingInventory.get();
            updatedInventory.setDeviceId(inventory.getDeviceId());
            updatedInventory.setDeviceName(inventory.getDeviceName());
            updatedInventory.setDeviceCode(inventory.getDeviceCode());
            updatedInventory.setWarehouseId(inventory.getWarehouseId());
            updatedInventory.setWarehouseName(inventory.getWarehouseName());
            updatedInventory.setQuantity(inventory.getQuantity());
            updatedInventory.setUnit(inventory.getUnit());
            updatedInventory.setMinQuantity(inventory.getMinQuantity());
            updatedInventory.setMaxQuantity(inventory.getMaxQuantity());
            updatedInventory.setStatus(inventory.getStatus());
            updatedInventory.setRemark(inventory.getRemark());
            if (inventory.getUpdatedBy() != null) {
                updatedInventory.setUpdatedBy(inventory.getUpdatedBy());
            }
            return inventoryRepository.save(updatedInventory);
        }
        return null;
    }

    /**
     * 删除库存记录
     * @param id 库存ID
     */
    public void deleteInventory(Long id) {
        inventoryRepository.deleteById(id);
    }

    // ==================== 查询方法 ====================

    /**
     * 根据设备和仓库查询库存
     * @param deviceId 设备ID
     * @param warehouseId 仓库ID
     * @return 库存记录Optional对象
     */
    public Optional<Inventory> getInventoryByDeviceAndWarehouse(Long deviceId, Long warehouseId) {
        return inventoryRepository.findByDeviceIdAndWarehouseId(deviceId, warehouseId);
    }

    /**
     * 根据设备ID查询库存
     * @param deviceId 设备ID
     * @return 库存列表
     */
    public List<Inventory> getInventoryByDevice(Long deviceId) {
        return inventoryRepository.findByDeviceId(deviceId);
    }

    /**
     * 根据仓库ID查询库存
     * @param warehouseId 仓库ID
     * @return 库存列表
     */
    public List<Inventory> getInventoryByWarehouse(Long warehouseId) {
        return inventoryRepository.findByWarehouseId(warehouseId);
    }

    /**
     * 获取低库存预警列表
     * @return 低库存列表
     */
    public List<Inventory> getLowStockInventory() {
        return inventoryRepository.findLowStockInventory();
    }

    /**
     * 获取超储库存列表
     * @return 超储库存列表
     */
    public List<Inventory> getOverStockInventory() {
        return inventoryRepository.findOverStockInventory();
    }

    /**
     * 搜索库存
     * @param keyword 搜索关键词
     * @return 匹配的库存列表
     */
    public List<Inventory> searchInventory(String keyword) {
        return inventoryRepository.searchInventory(keyword);
    }

    // ==================== 库存数量管理 ====================

    /**
     * 更新库存数量
     * @param id 库存ID
     * @param quantityChange 数量变化值（正数为增加，负数为减少）
     * @return 更新后的库存记录
     * @throws RuntimeException 当库存不足时抛出
     */
    @Transactional
    public Inventory updateInventoryQuantity(Long id, Integer quantityChange) {
        Optional<Inventory> inventoryOpt = inventoryRepository.findById(id);
        if (inventoryOpt.isPresent()) {
            Inventory inventory = inventoryOpt.get();
            int newQuantity = inventory.getQuantity() + quantityChange;
            if (newQuantity < 0) {
                throw new RuntimeException("库存数量不能为负数");
            }
            inventory.setQuantity(newQuantity);
            
            // 根据新数量更新状态
            if (inventory.getMinQuantity() != null && newQuantity <= inventory.getMinQuantity()) {
                inventory.setStatus("预警");
            } else if (inventory.getMaxQuantity() != null && newQuantity >= inventory.getMaxQuantity()) {
                inventory.setStatus("超储");
            } else {
                inventory.setStatus("正常");
            }
            
            return inventoryRepository.save(inventory);
        }
        return null;
    }

    /**
     * 更新所有库存状态
     * 根据当前数量和预警阈值重新计算状态
     */
    @Transactional
    public void updateInventoryStatus() {
        List<Inventory> allInventory = inventoryRepository.findAll();
        for (Inventory inventory : allInventory) {
            if (inventory.getMinQuantity() != null && inventory.getQuantity() <= inventory.getMinQuantity()) {
                inventory.setStatus("预警");
            } else if (inventory.getMaxQuantity() != null && inventory.getQuantity() >= inventory.getMaxQuantity()) {
                inventory.setStatus("超储");
            } else {
                inventory.setStatus("正常");
            }
            inventoryRepository.save(inventory);
        }
    }

    // ==================== 库存汇总统计 ====================

    /**
     * 获取库存汇总统计
     * 汇总专用设备、通用设备、耗材的库存信息
     * @return 库存汇总DTO列表
     */
    public List<InventorySummaryDTO> getInventorySummary() {
        Map<String, InventorySummaryDTO> summaryMap = new HashMap<>();
        
        // 获取所有预警配置
        Map<String, InventoryAlertConfig> alertConfigs = getAlertConfigMap();

        // 汇总专用设备
        List<Device> devices = deviceRepository.findAll();
        for (Device device : devices) {
            String deviceName = device.getDeviceName();
            String brand = device.getBrand() != null ? device.getBrand() : "";
            String unit = device.getUnit() != null ? device.getUnit() : "个";
            String key = deviceName + "_" + brand;
            
            summaryMap.merge(key, 
                createSummaryDTO(deviceName, brand, "专用设备", device.getQuantity(), device.getUsageStatus(), unit, alertConfigs.get(deviceName)),
                this::mergeSummaryDTO);
        }

        // 汇总通用设备
        List<Accessory> accessories = accessoryRepository.findAll();
        for (Accessory accessory : accessories) {
            String deviceName = accessory.getAccessoryName();
            String brand = accessory.getBrand() != null ? accessory.getBrand() : "";
            String unit = accessory.getUnit() != null ? accessory.getUnit() : "个";
            int totalQuantity = accessory.getQuantity() != null ? accessory.getQuantity() : 0;
            int inUseQuantity = accessory.getInUseQuantity() != null ? accessory.getInUseQuantity() : 0;
            int unusedQuantity = accessory.getRemainingQuantity() != null ? accessory.getRemainingQuantity() : 0;
            String key = deviceName + "_" + brand;
            
            summaryMap.merge(key,
                createSummaryDTOWithUsage(deviceName, brand, "通用设备", totalQuantity, inUseQuantity, unusedQuantity, unit, alertConfigs.get(deviceName)),
                this::mergeSummaryDTO);
        }

        // 汇总耗材
        List<Consumable> consumables = consumableRepository.findAll();
        for (Consumable consumable : consumables) {
            String deviceName = consumable.getConsumableName();
            String brand = consumable.getBrand() != null ? consumable.getBrand() : "";
            String unit = consumable.getUnit() != null ? consumable.getUnit() : "个";
            int quantity = consumable.getQuantity() != null ? consumable.getQuantity() : 0;
            String key = deviceName + "_" + brand;
            
            summaryMap.merge(key,
                createSummaryDTO(deviceName, brand, "耗材", quantity, null, unit, alertConfigs.get(deviceName)),
                this::mergeSummaryDTO);
        }

        List<InventorySummaryDTO> result = new ArrayList<>(summaryMap.values());
        
        // 按类别排序：专用设备、通用设备、耗材
        result.sort((a, b) -> {
            int categoryOrderA = getCategoryOrder(a.getCategory());
            int categoryOrderB = getCategoryOrder(b.getCategory());
            
            if (categoryOrderA != categoryOrderB) {
                return categoryOrderA - categoryOrderB;
            }
            
            // 同类别内按设备名称排序
            return a.getDeviceName().compareTo(b.getDeviceName());
        });
        
        return result;
    }
    
    /**
     * 获取类别排序顺序
     * @param category 类别名称
     * @return 排序顺序
     */
    private int getCategoryOrder(String category) {
        if (category == null) return 3;
        switch (category) {
            case "专用设备":
                return 1;
            case "通用设备":
                return 2;
            case "耗材":
                return 3;
            default:
                return 4;
        }
    }
    
    /**
     * 获取预警配置映射表
     * @return 设备名称到预警配置的映射
     */
    private Map<String, InventoryAlertConfig> getAlertConfigMap() {
        List<InventoryAlertConfig> configs = alertConfigRepository.findAll();
        Map<String, InventoryAlertConfig> configMap = new HashMap<>();
        for (InventoryAlertConfig config : configs) {
            configMap.put(config.getDeviceName(), config);
        }
        return configMap;
    }

    /**
     * 创建库存汇总DTO（基于使用状态计算）
     */
    private InventorySummaryDTO createSummaryDTO(String deviceName, String brand, String category, Integer quantity, String usageStatus, String unit, InventoryAlertConfig alertConfig) {
        int total = quantity != null ? quantity : 0;
        int inUse = "使用中".equals(usageStatus) ? total : 0;
        int unused = "使用中".equals(usageStatus) ? 0 : total;
        
        Integer minQty = alertConfig != null ? alertConfig.getMinQuantity() : null;
        Integer maxQty = alertConfig != null ? alertConfig.getMaxQuantity() : null;
        boolean isWarning = minQty != null && total <= minQty;
        String status = determineStatus(total, minQty, maxQty);
        
        InventorySummaryDTO dto = new InventorySummaryDTO();
        dto.setDeviceName(deviceName);
        dto.setBrand(brand);
        dto.setCategory(category);
        dto.setTotalQuantity(total);
        dto.setInUseQuantity(inUse);
        dto.setUnusedQuantity(unused);
        dto.setMinQuantity(minQty);
        dto.setMaxQuantity(maxQty);
        dto.setUnit(unit);
        dto.setStatus(status);
        dto.setIsWarning(isWarning);
        return dto;
    }

    /**
     * 创建库存汇总DTO（直接使用已使用和未使用数量）
     */
    private InventorySummaryDTO createSummaryDTOWithUsage(String deviceName, String brand, String category, int total, int inUse, int unused, String unit, InventoryAlertConfig alertConfig) {
        Integer minQty = alertConfig != null ? alertConfig.getMinQuantity() : null;
        Integer maxQty = alertConfig != null ? alertConfig.getMaxQuantity() : null;
        boolean isWarning = minQty != null && total <= minQty;
        String status = determineStatus(total, minQty, maxQty);
        
        InventorySummaryDTO dto = new InventorySummaryDTO();
        dto.setDeviceName(deviceName);
        dto.setBrand(brand);
        dto.setCategory(category);
        dto.setTotalQuantity(total);
        dto.setInUseQuantity(inUse);
        dto.setUnusedQuantity(unused);
        dto.setMinQuantity(minQty);
        dto.setMaxQuantity(maxQty);
        dto.setUnit(unit);
        dto.setStatus(status);
        dto.setIsWarning(isWarning);
        return dto;
    }
    
    /**
     * 根据库存数量确定状态
     * @param total 总数量
     * @param minQty 最小库存
     * @param maxQty 最大库存
     * @return 状态字符串（缺货、预警、超储、正常）
     */
    private String determineStatus(int total, Integer minQty, Integer maxQty) {
        if (total == 0) return "缺货";
        if (minQty != null && total <= minQty) return "预警";
        if (maxQty != null && total >= maxQty) return "超储";
        return "正常";
    }

    /**
     * 合并库存汇总DTO
     * 用于将相同设备名称和品牌的记录合并
     */
    private InventorySummaryDTO mergeSummaryDTO(InventorySummaryDTO existing, InventorySummaryDTO newDTO) {
        existing.setTotalQuantity(existing.getTotalQuantity() + newDTO.getTotalQuantity());
        existing.setInUseQuantity(existing.getInUseQuantity() + newDTO.getInUseQuantity());
        existing.setUnusedQuantity(existing.getUnusedQuantity() + newDTO.getUnusedQuantity());
        // 重新计算预警状态
        if (existing.getMinQuantity() != null) {
            existing.setIsWarning(existing.getTotalQuantity() <= existing.getMinQuantity());
            existing.setStatus(determineStatus(existing.getTotalQuantity(), existing.getMinQuantity(), existing.getMaxQuantity()));
        }
        return existing;
    }

    /**
     * 搜索库存汇总
     * @param keyword 搜索关键词
     * @return 匹配的库存汇总列表
     */
    public List<InventorySummaryDTO> searchInventorySummary(String keyword) {
        List<InventorySummaryDTO> allSummary = getInventorySummary();
        if (keyword == null || keyword.trim().isEmpty()) {
            return allSummary;
        }
        String lowerKeyword = keyword.toLowerCase();
        return allSummary.stream()
            .filter(dto -> dto.getDeviceName().toLowerCase().contains(lowerKeyword))
            .collect(Collectors.toList());
    }
    
    // ==================== 预警配置管理 ====================
    
    /**
     * 获取所有预警配置
     * @return 预警配置列表
     */
    public List<InventoryAlertConfig> getAllAlertConfigs() {
        return alertConfigRepository.findAll();
    }
    
    /**
     * 根据设备名称获取预警配置
     * @param deviceName 设备名称
     * @return 预警配置Optional对象
     */
    public Optional<InventoryAlertConfig> getAlertConfigByDeviceName(String deviceName) {
        return alertConfigRepository.findByDeviceName(deviceName);
    }
    
    /**
     * 保存预警配置
     * @param config 预警配置对象
     * @return 保存后的预警配置
     */
    public InventoryAlertConfig saveAlertConfig(InventoryAlertConfig config) {
        return alertConfigRepository.save(config);
    }
    
    /**
     * 删除预警配置
     * @param id 预警配置ID
     */
    public void deleteAlertConfig(Long id) {
        alertConfigRepository.deleteById(id);
    }
    
    /**
     * 获取预警库存列表
     * @return 预警库存汇总列表
     */
    public List<InventorySummaryDTO> getWarningInventory() {
        return getInventorySummary().stream()
            .filter(InventorySummaryDTO::getIsWarning)
            .collect(Collectors.toList());
    }
}
