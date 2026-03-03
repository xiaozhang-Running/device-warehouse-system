package com.device.warehouse.service;

import com.device.warehouse.entity.Consumable;
import com.device.warehouse.entity.Device;
import com.device.warehouse.entity.OutboundOrder;
import com.device.warehouse.entity.OutboundOrderItem;
import com.device.warehouse.entity.User;
import com.device.warehouse.repository.ConsumableRepository;
import com.device.warehouse.repository.DeviceRepository;
import com.device.warehouse.repository.OutboundOrderItemRepository;
import com.device.warehouse.repository.OutboundOrderRepository;
import com.device.warehouse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private ConsumableRepository consumableRepository;

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
        order.setOrderDate(new Date());
        order.setStatus("PENDING");
        
        // 设置领用人
        if (order.getRecipient() != null && order.getRecipient().getId() != null) {
            User recipient = userRepository.findById(order.getRecipient().getId()).orElse(null);
            order.setRecipient(recipient);
        }
        
        OutboundOrder savedOrder = outboundOrderRepository.save(order);
        
        // 保存出库明细
        if (items != null) {
            for (Map<String, Object> itemData : items) {
                OutboundOrderItem item = new OutboundOrderItem();
                item.setOrder(savedOrder);
                
                // 判断是设备还是耗材
                String itemType = itemData.get("itemType") != null ? itemData.get("itemType").toString() : "device";
                item.setItemType(itemType);
                
                if ("consumable".equals(itemType)) {
                    // 处理耗材
                    Long consumableId = Long.valueOf(itemData.get("deviceId").toString());
                    Consumable consumable = consumableRepository.findById(consumableId).orElse(null);
                    item.setConsumable(consumable);
                    // 耗材出库不锁定，只在完成时扣减库存
                    if (consumable != null) {
                        System.out.println("出库单创建：耗材 " + consumable.getConsumableName() + " 待出库");
                    }
                } else {
                    // 处理设备
                    Long deviceId = Long.valueOf(itemData.get("deviceId").toString());
                    Device device = deviceRepository.findById(deviceId).orElse(null);
                    item.setDevice(device);
                    // 锁定设备状态为"预留中"，防止重复出库
                    if (device != null) {
                        device.setUsageStatus("预留中");
                        deviceRepository.save(device);
                        System.out.println("出库单创建：设备 " + device.getDeviceName() + " 状态锁定为: 预留中");
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
    public OutboundOrder completeOrder(Long id) {
        OutboundOrder order = outboundOrderRepository.findById(id).orElse(null);
        if (order != null && "PENDING".equals(order.getStatus())) {
            order.setStatus("COMPLETED");
            
            List<OutboundOrderItem> items = outboundOrderItemRepository.findByOrderId(id);
            
            for (OutboundOrderItem item : items) {
                // 处理设备出库
                if ("device".equals(item.getItemType()) && item.getDevice() != null) {
                    Device device = item.getDevice();
                    device.setUsageStatus("使用中");
                    deviceRepository.save(device);
                    System.out.println("设备 " + device.getDeviceName() + " 已出库，使用状态更新为: 使用中");
                }
                // 处理耗材出库 - 扣减库存
                else if ("consumable".equals(item.getItemType()) && item.getConsumable() != null) {
                    Consumable consumable = item.getConsumable();
                    int outboundQuantity = item.getQuantity() != null ? item.getQuantity() : 1;
                    int currentQuantity = consumable.getQuantity() != null ? consumable.getQuantity() : 0;
                    int newQuantity = currentQuantity - outboundQuantity;
                    
                    if (newQuantity < 0) {
                        newQuantity = 0;
                    }
                    
                    consumable.setQuantity(newQuantity);
                    consumableRepository.save(consumable);
                    System.out.println("耗材 " + consumable.getConsumableName() + " 出库 " + outboundQuantity + " 个，剩余库存: " + newQuantity);
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
                // 恢复设备状态
                if ("device".equals(item.getItemType()) && item.getDevice() != null) {
                    Device device = item.getDevice();
                    device.setUsageStatus("未使用");
                    deviceRepository.save(device);
                    System.out.println("取消出库单：设备 " + device.getDeviceName() + " 状态恢复为: 未使用");
                }
                // 恢复耗材库存
                else if ("consumable".equals(item.getItemType()) && item.getConsumable() != null) {
                    Consumable consumable = item.getConsumable();
                    int outboundQuantity = item.getQuantity() != null ? item.getQuantity() : 1;
                    int currentQuantity = consumable.getQuantity() != null ? consumable.getQuantity() : 0;
                    int newQuantity = currentQuantity + outboundQuantity;
                    
                    consumable.setQuantity(newQuantity);
                    consumableRepository.save(consumable);
                    System.out.println("取消出库单：耗材 " + consumable.getConsumableName() + " 库存恢复 " + outboundQuantity + " 个，当前库存: " + newQuantity);
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
            // 恢复设备状态
            if ("device".equals(item.getItemType()) && item.getDevice() != null && item.getDevice().getId() != null) {
                Device device = deviceRepository.findById(item.getDevice().getId()).orElse(null);
                if (device != null) {
                    device.setUsageStatus("未使用");
                    deviceRepository.save(device);
                    System.out.println("删除出库单，恢复设备使用状态: " + device.getDeviceName() + " -> 未使用");
                }
            }
            // 恢复耗材库存
            else if ("consumable".equals(item.getItemType()) && item.getConsumable() != null) {
                Consumable consumable = consumableRepository.findById(item.getConsumable().getId()).orElse(null);
                if (consumable != null) {
                    int outboundQuantity = item.getQuantity() != null ? item.getQuantity() : 1;
                    int currentQuantity = consumable.getQuantity() != null ? consumable.getQuantity() : 0;
                    int newQuantity = currentQuantity + outboundQuantity;
                    
                    consumable.setQuantity(newQuantity);
                    consumableRepository.save(consumable);
                    System.out.println("删除出库单，恢复耗材库存: " + consumable.getConsumableName() + " +" + outboundQuantity + "，当前库存: " + newQuantity);
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
