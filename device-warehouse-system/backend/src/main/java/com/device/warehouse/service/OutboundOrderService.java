package com.device.warehouse.service;

import com.device.warehouse.entity.Accessory;
import com.device.warehouse.entity.Consumable;
import com.device.warehouse.entity.Device;
import com.device.warehouse.entity.Material;
import com.device.warehouse.entity.OutboundOrder;
import com.device.warehouse.entity.OutboundOrderItem;
import com.device.warehouse.entity.User;
import com.device.warehouse.repository.AccessoryRepository;
import com.device.warehouse.repository.ConsumableRepository;
import com.device.warehouse.repository.DeviceRepository;
import com.device.warehouse.repository.MaterialRepository;
import com.device.warehouse.repository.OutboundOrderItemRepository;
import com.device.warehouse.repository.OutboundOrderRepository;
import com.device.warehouse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@SuppressWarnings("null")
public class OutboundOrderService {

    @Autowired
    private OutboundOrderRepository outboundOrderRepository;

    @Autowired
    private OutboundOrderItemRepository outboundOrderItemRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private AccessoryRepository accessoryRepository;

    @Autowired
    private ConsumableRepository consumableRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private UserRepository userRepository;

    public List<OutboundOrder> getAllOrders() {
        List<OutboundOrder> orders = outboundOrderRepository.findAll();
        // 加载每个订单的明细
        for (OutboundOrder order : orders) {
            List<OutboundOrderItem> items = outboundOrderItemRepository.findByOrderId(order.getId());
            order.setItems(items);
        }
        return orders;
    }

    public OutboundOrder getOrderById(Long id) {
        OutboundOrder order = outboundOrderRepository.findById(id).orElse(null);
        if (order != null) {
            List<OutboundOrderItem> items = outboundOrderItemRepository.findByOrderId(id);
            order.setItems(items);
        }
        return order;
    }

    @Transactional
    public OutboundOrder createOrder(OutboundOrder order) {
        order.setOrderDate(new Date());
        order.setStatus("PENDING");
        
        // 设置领用人
        if (order.getRecipient() != null && order.getRecipient().getId() != null) {
            User recipient = userRepository.findById(order.getRecipient().getId()).orElse(null);
            order.setRecipient(recipient);
        }
        
        OutboundOrder savedOrder = outboundOrderRepository.save(order);
        
        // 保存出库明细
        if (order.getItems() != null) {
            for (OutboundOrderItem item : order.getItems()) {
                item.setOrder(savedOrder);
                // 设置设备
                if (item.getDevice() != null && item.getDevice().getId() != null) {
                    Device device = deviceRepository.findById(item.getDevice().getId()).orElse(null);
                    item.setDevice(device);
                    // 锁定设备状态为"预留中"，防止重复出库
                    if (device != null) {
                        device.setUsageStatus("预留中");
                        deviceRepository.save(device);
                        System.out.println("出库单创建：设备 " + device.getDeviceName() + " 状态锁定为: 预留中");
                    }
                }
                outboundOrderItemRepository.save(item);
            }
        }
        
        return savedOrder;
    }

    @Transactional
    public OutboundOrder createOrderWithItems(OutboundOrder order, List<Map<String, Object>> items) {
        System.out.println("开始创建出库单，订单号: " + order.getOrderCode());
        System.out.println("出库明细数量: " + (items != null ? items.size() : 0));
        
        order.setOrderDate(new Date());
        order.setStatus("PENDING");
        
        // 设置领用人
        if (order.getRecipient() != null && order.getRecipient().getId() != null) {
            User recipient = userRepository.findById(order.getRecipient().getId()).orElse(null);
            order.setRecipient(recipient);
        }
        
        OutboundOrder savedOrder = outboundOrderRepository.save(order);
        System.out.println("出库单已保存，ID: " + savedOrder.getId());
        
        // 保存出库明细
        if (items != null) {
            for (int i = 0; i < items.size(); i++) {
                Map<String, Object> itemData = items.get(i);
                System.out.println("处理第 " + (i + 1) + " 个明细项: " + itemData);
                
                OutboundOrderItem item = new OutboundOrderItem();
                item.setOrder(savedOrder);
                
                // 判断是设备还是耗材
                String itemType = itemData.get("itemType") != null ? itemData.get("itemType").toString() : "device";
                item.setItemType(itemType);
                
                System.out.println("设备类型: " + itemType);
                
                if ("consumable".equals(itemType)) {
                    // 处理耗材
                    Long consumableId = Long.valueOf(itemData.get("deviceId").toString());
                    Consumable consumable = consumableRepository.findById(consumableId).orElse(null);
                    item.setConsumable(consumable);
                    // 耗材出库不锁定，只在完成时扣减库存
                    if (consumable != null) {
                        System.out.println("出库单创建：耗材 " + consumable.getConsumableName() + " 待出库");
                    } else {
                        System.out.println("警告：耗材ID " + consumableId + " 不存在");
                    }
                } else if ("material".equals(itemType)) {
                    // 处理物料
                    Long materialId = Long.valueOf(itemData.get("deviceId").toString());
                    Material material = materialRepository.findById(materialId).orElse(null);
                    item.setMaterial(material);
                    // 物料出库不锁定，只在完成时扣减库存
                    if (material != null) {
                        System.out.println("出库单创建：物料 " + material.getMaterialName() + " 待出库");
                    } else {
                        System.out.println("警告：物料ID " + materialId + " 不存在");
                    }
                } else if ("accessory".equals(itemType)) {
                    // 处理通用设备
                    Long accessoryId = Long.valueOf(itemData.get("deviceId").toString());
                    Accessory accessory = accessoryRepository.findById(accessoryId).orElse(null);
                    item.setAccessory(accessory);
                    // 通用设备出库不锁定，只在完成时扣减库存
                    if (accessory != null) {
                        System.out.println("出库单创建：通用设备 " + accessory.getAccessoryName() + " 待出库");
                    } else {
                        System.out.println("警告：通用设备ID " + accessoryId + " 不存在");
                    }
                } else {
                    // 处理专用设备
                    Long deviceId = Long.valueOf(itemData.get("deviceId").toString());
                    Device device = deviceRepository.findById(deviceId).orElse(null);
                    item.setDevice(device);
                    // 锁定设备状态为"预留中"，防止重复出库
                    if (device != null) {
                        device.setUsageStatus("预留中");
                        deviceRepository.save(device);
                        System.out.println("出库单创建：专用设备 " + device.getDeviceName() + " 状态锁定为: 预留中");
                    } else {
                        System.out.println("警告：设备ID " + deviceId + " 不存在");
                    }
                }
                
                // 设置数量
                Integer quantity = Integer.valueOf(itemData.get("quantity").toString());
                item.setQuantity(quantity);
                
                // 设置单位
                if (itemData.get("unit") != null) {
                    item.setUnit((String) itemData.get("unit"));
                }
                
                // 设置设备状况
                if (itemData.get("deviceCondition") != null) {
                    item.setDeviceCondition((String) itemData.get("deviceCondition"));
                }
                
                // 设置品牌型号
                if (itemData.get("brandModel") != null) {
                    item.setBrandModel((String) itemData.get("brandModel"));
                }
                
                // 设置备注
                if (itemData.get("remark") != null) {
                    item.setRemark((String) itemData.get("remark"));
                }
                
                outboundOrderItemRepository.save(item);
            }
        }
        
        return savedOrder;
    }

    @Transactional
    public OutboundOrder updateOrderWithItems(OutboundOrder order, List<Map<String, Object>> items) {
        System.out.println("开始更新出库单，订单ID: " + order.getId());
        System.out.println("新的出库明细数量: " + (items != null ? items.size() : 0));
        
        // 先删除原有的出库单明细
        List<OutboundOrderItem> existingItems = outboundOrderItemRepository.findByOrderId(order.getId());
        if (!existingItems.isEmpty()) {
            // 恢复原有设备的状态
            for (OutboundOrderItem existingItem : existingItems) {
                if ("device".equals(existingItem.getItemType()) && existingItem.getDevice() != null) {
                    Device device = existingItem.getDevice();
                    device.setUsageStatus("未使用");
                    deviceRepository.save(device);
                    System.out.println("更新出库单：恢复设备 " + device.getDeviceName() + " 状态为: 未使用");
                }
            }
            // 删除原有明细
            outboundOrderItemRepository.deleteAll(existingItems);
            System.out.println("已删除原有出库单明细，数量: " + existingItems.size());
        }
        
        // 保存更新后的出库单基本信息
        OutboundOrder updatedOrder = outboundOrderRepository.save(order);
        System.out.println("出库单基本信息已更新，ID: " + updatedOrder.getId());
        
        // 重新创建新的出库单明细
        if (items != null) {
            for (int i = 0; i < items.size(); i++) {
                Map<String, Object> itemData = items.get(i);
                System.out.println("处理第 " + (i + 1) + " 个明细项: " + itemData);
                
                OutboundOrderItem item = new OutboundOrderItem();
                item.setOrder(updatedOrder);
                
                // 判断是设备还是耗材
                String itemType = itemData.get("itemType") != null ? itemData.get("itemType").toString() : "device";
                item.setItemType(itemType);
                
                System.out.println("设备类型: " + itemType);
                
                if ("consumable".equals(itemType)) {
                    // 处理耗材
                    Long consumableId = Long.valueOf(itemData.get("deviceId").toString());
                    Consumable consumable = consumableRepository.findById(consumableId).orElse(null);
                    item.setConsumable(consumable);
                    // 耗材出库不锁定，只在完成时扣减库存
                    if (consumable != null) {
                        System.out.println("出库单更新：耗材 " + consumable.getConsumableName() + " 待出库");
                    } else {
                        System.out.println("警告：耗材ID " + consumableId + " 不存在");
                    }
                } else if ("material".equals(itemType)) {
                    // 处理物料
                    Long materialId = Long.valueOf(itemData.get("deviceId").toString());
                    Material material = materialRepository.findById(materialId).orElse(null);
                    item.setMaterial(material);
                    // 物料出库不锁定，只在完成时扣减库存
                    if (material != null) {
                        System.out.println("出库单更新：物料 " + material.getMaterialName() + " 待出库");
                    } else {
                        System.out.println("警告：物料ID " + materialId + " 不存在");
                    }
                } else if ("accessory".equals(itemType)) {
                    // 处理通用设备
                    Long accessoryId = Long.valueOf(itemData.get("deviceId").toString());
                    Accessory accessory = accessoryRepository.findById(accessoryId).orElse(null);
                    item.setAccessory(accessory);
                    // 通用设备出库不锁定，只在完成时扣减库存
                    if (accessory != null) {
                        System.out.println("出库单更新：通用设备 " + accessory.getAccessoryName() + " 待出库");
                    } else {
                        System.out.println("警告：通用设备ID " + accessoryId + " 不存在");
                    }
                } else {
                    // 处理专用设备
                    Long deviceId = Long.valueOf(itemData.get("deviceId").toString());
                    Device device = deviceRepository.findById(deviceId).orElse(null);
                    item.setDevice(device);
                    // 锁定设备状态为"预留中"，防止重复出库
                    if (device != null) {
                        device.setUsageStatus("预留中");
                        deviceRepository.save(device);
                        System.out.println("出库单更新：专用设备 " + device.getDeviceName() + " 状态锁定为: 预留中");
                    } else {
                        System.out.println("警告：设备ID " + deviceId + " 不存在");
                    }
                }
                
                // 设置数量
                Integer quantity = Integer.valueOf(itemData.get("quantity").toString());
                item.setQuantity(quantity);
                
                // 设置单位
                if (itemData.get("unit") != null) {
                    item.setUnit((String) itemData.get("unit"));
                }
                
                // 设置设备状况
                if (itemData.get("deviceCondition") != null) {
                    item.setDeviceCondition((String) itemData.get("deviceCondition"));
                }
                
                // 设置品牌型号
                if (itemData.get("brandModel") != null) {
                    item.setBrandModel((String) itemData.get("brandModel"));
                }
                
                // 设置备注
                if (itemData.get("remark") != null) {
                    item.setRemark((String) itemData.get("remark"));
                }
                
                outboundOrderItemRepository.save(item);
            }
        }
        
        return updatedOrder;
    }

    @Transactional
    public OutboundOrder completeOrder(Long id) {
        OutboundOrder order = outboundOrderRepository.findById(id).orElse(null);
        if (order != null && "PENDING".equals(order.getStatus())) {
            order.setStatus("COMPLETED");
            
            List<OutboundOrderItem> items = outboundOrderItemRepository.findByOrderId(id);
            
            for (OutboundOrderItem item : items) {
                // 处理专用设备出库
                if ("device".equals(item.getItemType()) && item.getDevice() != null) {
                    Device device = item.getDevice();
                    device.setUsageStatus("使用中");
                    deviceRepository.save(device);
                    System.out.println("专用设备 " + device.getDeviceName() + " 已出库，使用状态更新为: 使用中");
                }
                // 处理通用设备出库 - 只更新使用状态
                else if ("accessory".equals(item.getItemType()) && item.getAccessory() != null) {
                    Accessory accessory = item.getAccessory();
                    accessory.setUsageStatus("使用中");
                    accessoryRepository.save(accessory);
                    System.out.println("通用设备 " + accessory.getAccessoryName() + " 已出库，使用状态更新为: 使用中");
                }
                // 处理耗材出库 - 扣减库存
                else if ("consumable".equals(item.getItemType()) && item.getConsumable() != null) {
                    Consumable consumable = item.getConsumable();
                    int outboundQuantity = item.getQuantity() != null ? item.getQuantity() : 1;
                    
                    // 获取当前各数量字段
                    int currentUsed = consumable.getUsedQuantity() != null ? consumable.getUsedQuantity() : 0;
                    int currentRemaining = consumable.getRemainingQuantity() != null ? consumable.getRemainingQuantity() : 0;
                    int currentQuantity = consumable.getQuantity() != null ? consumable.getQuantity() : 0;
                    
                    // 计算新的数量
                    int newUsed = currentUsed + outboundQuantity;
                    int newRemaining = currentRemaining - outboundQuantity;
                    int newQuantity = currentQuantity - outboundQuantity;
                    
                    // 确保不会变成负数
                    if (newRemaining < 0) {
                        newRemaining = 0;
                    }
                    if (newQuantity < 0) {
                        newQuantity = 0;
                    }
                    
                    // 更新所有数量字段
                    consumable.setUsedQuantity(newUsed);
                    consumable.setRemainingQuantity(newRemaining);
                    consumable.setQuantity(newQuantity);
                    consumableRepository.save(consumable);
                    System.out.println("耗材 " + consumable.getConsumableName() + " 出库 " + outboundQuantity + " 个，已使用: " + newUsed + "，剩余: " + newRemaining);
                }
                // 处理物料出库 - 扣减库存
                else if ("material".equals(item.getItemType()) && item.getMaterial() != null) {
                    Material material = item.getMaterial();
                    int outboundQuantity = item.getQuantity() != null ? item.getQuantity() : 1;
                    int currentQuantity = material.getQuantity() != null ? material.getQuantity().intValue() : 0;
                    int newQuantity = currentQuantity - outboundQuantity;
                    
                    if (newQuantity < 0) {
                        newQuantity = 0;
                    }
                    
                    material.setQuantity(BigDecimal.valueOf(newQuantity));
                    materialRepository.save(material);
                    System.out.println("物料 " + material.getMaterialName() + " 出库 " + outboundQuantity + " 个，剩余库存: " + newQuantity);
                }
            }
            
            return outboundOrderRepository.save(order);
        }
        return null;
    }

    @Transactional
    public OutboundOrder cancelOrder(Long id) {
        OutboundOrder order = outboundOrderRepository.findById(id).orElse(null);
        if (order != null && "PENDING".equals(order.getStatus())) {
            order.setStatus("CANCELLED");
            
            // 恢复设备状态为"未使用"
            List<OutboundOrderItem> items = outboundOrderItemRepository.findByOrderId(id);
            for (OutboundOrderItem item : items) {
                // 恢复专用设备状态
                if ("device".equals(item.getItemType()) && item.getDevice() != null) {
                    Device device = item.getDevice();
                    device.setUsageStatus("未使用");
                    deviceRepository.save(device);
                    System.out.println("取消出库单：专用设备 " + device.getDeviceName() + " 状态恢复为: 未使用");
                }
                // 恢复通用设备使用状态
                else if ("accessory".equals(item.getItemType()) && item.getAccessory() != null) {
                    Accessory accessory = item.getAccessory();
                    accessory.setUsageStatus("未使用");
                    accessoryRepository.save(accessory);
                    System.out.println("取消出库单：通用设备 " + accessory.getAccessoryName() + " 状态恢复为: 未使用");
                }
                // 恢复耗材库存
                else if ("consumable".equals(item.getItemType()) && item.getConsumable() != null) {
                    Consumable consumable = item.getConsumable();
                    int outboundQuantity = item.getQuantity() != null ? item.getQuantity() : 1;
                    
                    // 获取当前各数量字段
                    int currentUsed = consumable.getUsedQuantity() != null ? consumable.getUsedQuantity() : 0;
                    int currentRemaining = consumable.getRemainingQuantity() != null ? consumable.getRemainingQuantity() : 0;
                    int currentQuantity = consumable.getQuantity() != null ? consumable.getQuantity() : 0;
                    
                    // 计算新的数量
                    int newUsed = currentUsed - outboundQuantity;
                    int newRemaining = currentRemaining + outboundQuantity;
                    int newQuantity = currentQuantity + outboundQuantity;
                    
                    // 确保不会变成负数
                    if (newUsed < 0) {
                        newUsed = 0;
                    }
                    
                    // 更新所有数量字段
                    consumable.setUsedQuantity(newUsed);
                    consumable.setRemainingQuantity(newRemaining);
                    consumable.setQuantity(newQuantity);
                    consumableRepository.save(consumable);
                    System.out.println("取消出库单：耗材 " + consumable.getConsumableName() + " 库存恢复 " + outboundQuantity + " 个，已使用: " + newUsed + "，剩余: " + newRemaining);
                }
                // 恢复物料库存
                else if ("material".equals(item.getItemType()) && item.getMaterial() != null) {
                    Material material = item.getMaterial();
                    int outboundQuantity = item.getQuantity() != null ? item.getQuantity() : 1;
                    int currentQuantity = material.getQuantity() != null ? material.getQuantity().intValue() : 0;
                    int newQuantity = currentQuantity + outboundQuantity;
                    
                    material.setQuantity(BigDecimal.valueOf(newQuantity));
                    materialRepository.save(material);
                    System.out.println("取消出库单：物料 " + material.getMaterialName() + " 库存恢复 " + outboundQuantity + " 个，当前库存: " + newQuantity);
                }
            }
            
            return outboundOrderRepository.save(order);
        }
        return null;
    }

    @Transactional
    public void deleteOrder(Long id) {
        // 获取出库单明细
        List<OutboundOrderItem> items = outboundOrderItemRepository.findByOrderId(id);
        
        // 恢复设备使用状态为"未使用"，恢复耗材库存
        for (OutboundOrderItem item : items) {
            // 恢复专用设备状态
            if ("device".equals(item.getItemType()) && item.getDevice() != null && item.getDevice().getId() != null) {
                Device device = deviceRepository.findById(item.getDevice().getId()).orElse(null);
                if (device != null) {
                    device.setUsageStatus("未使用");
                    deviceRepository.save(device);
                    System.out.println("删除出库单，恢复专用设备使用状态: " + device.getDeviceName() + " -> 未使用");
                }
            }
            // 恢复通用设备使用状态
            else if ("accessory".equals(item.getItemType()) && item.getAccessory() != null) {
                Accessory accessory = accessoryRepository.findById(item.getAccessory().getId()).orElse(null);
                if (accessory != null) {
                    accessory.setUsageStatus("未使用");
                    accessoryRepository.save(accessory);
                    System.out.println("删除出库单，恢复通用设备使用状态: " + accessory.getAccessoryName() + " -> 未使用");
                }
            }
            // 恢复耗材库存
            else if ("consumable".equals(item.getItemType()) && item.getConsumable() != null) {
                Consumable consumable = consumableRepository.findById(item.getConsumable().getId()).orElse(null);
                if (consumable != null) {
                    int outboundQuantity = item.getQuantity() != null ? item.getQuantity() : 1;
                    
                    // 获取当前各数量字段
                    int currentUsed = consumable.getUsedQuantity() != null ? consumable.getUsedQuantity() : 0;
                    int currentRemaining = consumable.getRemainingQuantity() != null ? consumable.getRemainingQuantity() : 0;
                    int currentQuantity = consumable.getQuantity() != null ? consumable.getQuantity() : 0;
                    
                    // 计算新的数量
                    int newUsed = currentUsed - outboundQuantity;
                    int newRemaining = currentRemaining + outboundQuantity;
                    int newQuantity = currentQuantity + outboundQuantity;
                    
                    // 确保不会变成负数
                    if (newUsed < 0) {
                        newUsed = 0;
                    }
                    
                    // 更新所有数量字段
                    consumable.setUsedQuantity(newUsed);
                    consumable.setRemainingQuantity(newRemaining);
                    consumable.setQuantity(newQuantity);
                    consumableRepository.save(consumable);
                    System.out.println("删除出库单，恢复耗材库存: " + consumable.getConsumableName() + " +" + outboundQuantity + "，已使用: " + newUsed + "，剩余: " + newRemaining);
                }
            }
            // 恢复物料库存
            else if ("material".equals(item.getItemType()) && item.getMaterial() != null) {
                Material material = materialRepository.findById(item.getMaterial().getId()).orElse(null);
                if (material != null) {
                    int outboundQuantity = item.getQuantity() != null ? item.getQuantity() : 1;
                    int currentQuantity = material.getQuantity() != null ? material.getQuantity().intValue() : 0;
                    int newQuantity = currentQuantity + outboundQuantity;
                    
                    material.setQuantity(BigDecimal.valueOf(newQuantity));
                    materialRepository.save(material);
                    System.out.println("删除出库单，恢复物料库存: " + material.getMaterialName() + " +" + outboundQuantity + "，当前库存: " + newQuantity);
                }
            }
        }
        
        // 删除明细
        outboundOrderItemRepository.deleteAll(items);
        // 删除订单
        outboundOrderRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllOrders() {
        // 获取所有出库单明细
        List<OutboundOrderItem> allItems = outboundOrderItemRepository.findAll();
        
        // 恢复所有设备使用状态为"未使用"
        for (OutboundOrderItem item : allItems) {
            if (item.getDevice() != null && item.getDevice().getId() != null) {
                Device device = deviceRepository.findById(item.getDevice().getId()).orElse(null);
                if (device != null) {
                    device.setUsageStatus("未使用");
                    deviceRepository.save(device);
                }
            }
        }
        
        // 删除所有明细
        outboundOrderItemRepository.deleteAll();
        // 删除所有订单
        outboundOrderRepository.deleteAll();
    }
}
