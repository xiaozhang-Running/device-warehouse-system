package com.device.warehouse.service;

import com.device.warehouse.entity.Device;
import com.device.warehouse.entity.Accessory;
import com.device.warehouse.entity.Consumable;
import com.device.warehouse.entity.InboundOrder;
import com.device.warehouse.entity.InboundOrderItem;
import com.device.warehouse.repository.DeviceRepository;
import com.device.warehouse.repository.AccessoryRepository;
import com.device.warehouse.repository.ConsumableRepository;
import com.device.warehouse.repository.InboundOrderItemRepository;
import com.device.warehouse.repository.InboundOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@SuppressWarnings("null")
public class InboundOrderService {

    @Autowired
    private InboundOrderRepository inboundOrderRepository;

    @Autowired
    private InboundOrderItemRepository inboundOrderItemRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private AccessoryRepository accessoryRepository;

    @Autowired
    private ConsumableRepository consumableRepository;

    public List<InboundOrder> getAllOrders() {
        List<InboundOrder> orders = inboundOrderRepository.findAll();
        // 强制加载 items 和 device 数据
        for (InboundOrder order : orders) {
            if (order.getItems() != null) {
                for (InboundOrderItem item : order.getItems()) {
                    if (item.getDevice() != null) {
                        item.getDevice().getDeviceName(); // 触发加载
                    }
                }
            }
        }
        return orders;
    }

    public InboundOrder getOrderById(Long id) {
        return inboundOrderRepository.findById(id).orElse(null);
    }

    @Transactional
    public InboundOrder createOrder(InboundOrder order, List<Long> deviceIds, List<Map<String, Object>> itemDetails) {
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        InboundOrder savedOrder = inboundOrderRepository.save(order);
        
        // 处理归还入库 - 关联已有设备
        if (deviceIds != null && !deviceIds.isEmpty()) {
            for (Long deviceId : deviceIds) {
                Device device = deviceRepository.findById(deviceId).orElse(null);
                if (device != null) {
                    InboundOrderItem item = new InboundOrderItem();
                    item.setOrder(savedOrder);
                    item.setDevice(device);
                    item.setQuantity(1);
                    item.setItemType("device");
                    item.setItemName(device.getDeviceName());
                    item.setItemCode(device.getDeviceCode());
                    inboundOrderItemRepository.save(item);
                }
            }
        }
        
        // 处理新采购入库 - 保存物品明细（设备在完成入库时创建）
        if (itemDetails != null && !itemDetails.isEmpty()) {
            for (Map<String, Object> detail : itemDetails) {
                InboundOrderItem item = new InboundOrderItem();
                item.setOrder(savedOrder);
                item.setQuantity(1);
                item.setItemType((String) detail.get("type"));
                item.setItemName((String) detail.get("name"));
                item.setItemCode((String) detail.get("code"));
                item.setBrand((String) detail.get("brand"));
                item.setModelSpec((String) detail.get("modelSpec"));
                item.setUnit((String) detail.get("unit"));
                item.setCompany((String) detail.get("company"));
                item.setLocationStr((String) detail.get("location"));
                item.setOtherAccessories((String) detail.get("otherAccessories"));
                item.setRemark((String) detail.get("remark"));
                // 保存原始明细数据，用于完成入库时创建设备
                item.setItemDetail(detail.toString());
                inboundOrderItemRepository.save(item);
            }
        }
        
        return savedOrder;
    }

    @Transactional
    public InboundOrder completeOrder(Long id) {
        InboundOrder order = inboundOrderRepository.findById(id).orElse(null);
        if (order != null && "PENDING".equals(order.getStatus())) {
            order.setStatus("COMPLETED");
            
            List<InboundOrderItem> items = inboundOrderItemRepository.findAll().stream()
                .filter(item -> item.getOrder().getId().equals(id))
                .toList();
            
            for (InboundOrderItem item : items) {
                // 新采购入库：根据明细创建物品
                if ("new".equals(order.getInboundType())) {
                    String itemType = item.getItemType();
                    
                    if ("device".equals(itemType) && item.getDevice() == null) {
                        // 创建专用设备
                        Device device = new Device();
                        device.setDeviceName(item.getItemName());
                        device.setDeviceCode(item.getItemCode());
                        device.setBrand(item.getBrand());
                        device.setModelSpec(item.getModelSpec());
                        device.setUnit(item.getUnit());
                        device.setCompany(item.getCompany());
                        device.setLocation(item.getLocationStr());
                        device.setOtherAccessories(item.getOtherAccessories());
                        device.setRemark(item.getRemark());
                        device.setQuantity(1);
                        device.setStatus("正常");
                        device.setUsageStatus("未使用");
                        deviceRepository.save(device);
                        
                        item.setDevice(device);
                        inboundOrderItemRepository.save(item);
                        System.out.println("新采购入库：创建设备 " + device.getDeviceName() + " (" + device.getDeviceCode() + ")");
                        
                    } else if ("accessory".equals(itemType) && item.getAccessory() == null) {
                        // 创建通用设备
                        Accessory accessory = new Accessory();
                        accessory.setAccessoryName(item.getItemName());
                        accessory.setAccessoryCode(item.getItemCode());
                        accessory.setBrand(item.getBrand());
                        accessory.setModelSpec(item.getModelSpec());
                        accessory.setUnit(item.getUnit());
                        accessory.setCompany(item.getCompany());
                        accessory.setLocation(item.getLocationStr());
                        accessory.setOtherAccessories(item.getOtherAccessories());
                        accessory.setRemark(item.getRemark());
                        accessory.setQuantity(1);
                        accessory.setStatus("正常");
                        accessoryRepository.save(accessory);
                        
                        item.setAccessory(accessory);
                        inboundOrderItemRepository.save(item);
                        System.out.println("新采购入库：创建通用设备 " + accessory.getAccessoryName() + " (" + accessory.getAccessoryCode() + ")");
                        
                    } else if ("consumable".equals(itemType) && item.getConsumable() == null) {
                        // 创建耗材
                        Consumable consumable = new Consumable();
                        consumable.setConsumableName(item.getItemName());
                        consumable.setConsumableCode(item.getItemCode());
                        consumable.setBrand(item.getBrand());
                        consumable.setModelSpec(item.getModelSpec());
                        consumable.setUnit(item.getUnit());
                        consumable.setCompany(item.getCompany());
                        consumable.setLocation(item.getLocationStr());
                        consumable.setOtherAccessories(item.getOtherAccessories());
                        consumable.setRemark(item.getRemark());
                        consumable.setQuantity(item.getQuantity());
                        consumable.setStatus("正常");
                        consumableRepository.save(consumable);
                        
                        item.setConsumable(consumable);
                        inboundOrderItemRepository.save(item);
                        System.out.println("新采购入库：创建耗材 " + consumable.getConsumableName() + " (" + consumable.getConsumableCode() + ")");
                    }
                } 
                // 归还入库：更新已有设备状态
                else if ("return".equals(order.getInboundType()) && item.getDevice() != null) {
                    Device device = item.getDevice();
                    device.setUsageStatus("未使用");
                    device.setStatus("在库");
                    deviceRepository.save(device);
                    System.out.println("归还入库：设备 " + device.getDeviceName() + " 状态更新为: 未使用");
                }
            }
            
            return inboundOrderRepository.save(order);
        }
        return null;
    }

    @Transactional
    public InboundOrder cancelOrder(Long id) {
        InboundOrder order = inboundOrderRepository.findById(id).orElse(null);
        if (order != null && "PENDING".equals(order.getStatus())) {
            order.setStatus("CANCELLED");
            return inboundOrderRepository.save(order);
        }
        return null;
    }

    @Transactional
    public void deleteOrder(Long id) {
        // 获取入库单
        InboundOrder order = inboundOrderRepository.findById(id).orElse(null);
        if (order != null) {
            // 获取入库明细
            List<InboundOrderItem> items = inboundOrderItemRepository.findAll().stream()
                .filter(item -> item.getOrder().getId().equals(id))
                .toList();
            
            // 如果入库单已完成，需要删除已创建的设备
            if ("COMPLETED".equals(order.getStatus())) {
                for (InboundOrderItem item : items) {
                    if (item.getDevice() != null) {
                        deviceRepository.delete(item.getDevice());
                        System.out.println("删除入库单：删除设备 " + item.getDevice().getDeviceName());
                    }
                    if (item.getAccessory() != null) {
                        accessoryRepository.delete(item.getAccessory());
                        System.out.println("删除入库单：删除通用设备 " + item.getAccessory().getAccessoryName());
                    }
                    if (item.getConsumable() != null) {
                        consumableRepository.delete(item.getConsumable());
                        System.out.println("删除入库单：删除耗材 " + item.getConsumable().getConsumableName());
                    }
                }
            }
            
            // 删除明细
            inboundOrderItemRepository.deleteAll(items);
            // 删除订单
            inboundOrderRepository.deleteById(id);
        }
    }
}