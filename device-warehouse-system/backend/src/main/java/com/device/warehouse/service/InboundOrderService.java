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
        // 加载每个订单的明细
        for (InboundOrder order : orders) {
            List<InboundOrderItem> items = inboundOrderItemRepository.findByOrderId(order.getId());
            // 加载每个明细项的关联设备信息
            for (InboundOrderItem item : items) {
                if (item.getDevice() != null) {
                    Device device = deviceRepository.findById(item.getDevice().getId()).orElse(null);
                    item.setDevice(device);
                }
                if (item.getAccessory() != null) {
                    Accessory accessory = accessoryRepository.findById(item.getAccessory().getId()).orElse(null);
                    item.setAccessory(accessory);
                }
                if (item.getConsumable() != null) {
                    Consumable consumable = consumableRepository.findById(item.getConsumable().getId()).orElse(null);
                    item.setConsumable(consumable);
                }
            }
            // 清空原有集合并添加新元素，而不是直接替换
            order.getItems().clear();
            order.getItems().addAll(items);
        }
        return orders;
    }

    public InboundOrder getOrderById(Long id) {
        InboundOrder order = inboundOrderRepository.findById(id).orElse(null);
        if (order != null) {
            List<InboundOrderItem> items = inboundOrderItemRepository.findByOrderId(id);
            // 加载每个明细项的关联设备信息
            for (InboundOrderItem item : items) {
                if (item.getDevice() != null) {
                    Device device = deviceRepository.findById(item.getDevice().getId()).orElse(null);
                    item.setDevice(device);
                }
                if (item.getAccessory() != null) {
                    Accessory accessory = accessoryRepository.findById(item.getAccessory().getId()).orElse(null);
                    item.setAccessory(accessory);
                }
                if (item.getConsumable() != null) {
                    Consumable consumable = consumableRepository.findById(item.getConsumable().getId()).orElse(null);
                    item.setConsumable(consumable);
                }
            }
            // 清空原有集合并添加新元素，而不是直接替换
            order.getItems().clear();
            order.getItems().addAll(items);
        }
        return order;
    }

    @Transactional
    public InboundOrder createOrder(InboundOrder order, List<Long> deviceIds, List<Map<String, Object>> itemDetails, Map<String, String> itemRemarks, Map<String, String> itemStatuses) {
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        InboundOrder savedOrder = inboundOrderRepository.save(order);
        
        // 优先处理itemDetails，因为它包含了完整的设备信息
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
                
                // 设置设备状态
                item.setItemStatus("normal");
                
                // 设置备注
                if (detail.get("remark") != null) {
                    item.setRemark((String) detail.get("remark"));
                }
                
                // 尝试关联具体的设备对象
                if (detail.get("type") != null) {
                    String type = (String) detail.get("type");
                    // 从detail中获取设备ID
                    Object deviceIdObj = detail.get("deviceId");
                    if (deviceIdObj != null) {
                        Long deviceId = null;
                        if (deviceIdObj instanceof Number) {
                            deviceId = ((Number) deviceIdObj).longValue();
                        } else {
                            try {
                                deviceId = Long.parseLong(deviceIdObj.toString());
                            } catch (NumberFormatException e) {
                                // 忽略无效的设备ID
                            }
                        }
                        
                        if (deviceId != null) {
                            if ("device".equals(type)) {
                                Device device = deviceRepository.findById(deviceId).orElse(null);
                                if (device != null) {
                                    item.setDevice(device);
                                }
                            } else if ("accessory".equals(type)) {
                                Accessory accessory = accessoryRepository.findById(deviceId).orElse(null);
                                if (accessory != null) {
                                    item.setAccessory(accessory);
                                }
                            } else if ("consumable".equals(type)) {
                                Consumable consumable = consumableRepository.findById(deviceId).orElse(null);
                                if (consumable != null) {
                                    item.setConsumable(consumable);
                                }
                            }
                        }
                    }
                }
                
                // 保存原始明细数据，用于完成入库时创建设备
                item.setItemDetail(detail.toString());
                inboundOrderItemRepository.save(item);
            }
        }
        // 处理deviceIds（仅当没有itemDetails时）
        else if (deviceIds != null && !deviceIds.isEmpty()) {
            for (Long deviceId : deviceIds) {
                // 先尝试查找专用设备
                Device device = deviceRepository.findById(deviceId).orElse(null);
                if (device != null) {
                    InboundOrderItem item = new InboundOrderItem();
                    item.setOrder(savedOrder);
                    item.setDevice(device);
                    item.setQuantity(1);
                    item.setItemType("device");
                    item.setItemName(device.getDeviceName());
                    item.setItemCode(device.getDeviceCode());
                    
                    // 设置设备状态
                    if (itemStatuses != null && itemStatuses.containsKey(String.valueOf(deviceId))) {
                        item.setItemStatus(itemStatuses.get(String.valueOf(deviceId)));
                    } else {
                        item.setItemStatus("normal");
                    }
                    
                    // 设置备注
                    if (itemRemarks != null && itemRemarks.containsKey(String.valueOf(deviceId))) {
                        item.setRemark(itemRemarks.get(String.valueOf(deviceId)));
                    }
                    
                    inboundOrderItemRepository.save(item);
                    continue;
                }
                
                // 如果不是专用设备，尝试查找通用设备
                Accessory accessory = accessoryRepository.findById(deviceId).orElse(null);
                if (accessory != null) {
                    InboundOrderItem item = new InboundOrderItem();
                    item.setOrder(savedOrder);
                    item.setAccessory(accessory);
                    item.setQuantity(1);
                    item.setItemType("accessory");
                    item.setItemName(accessory.getAccessoryName());
                    item.setItemCode(accessory.getAccessoryCode());
                    
                    // 设置设备状态
                    if (itemStatuses != null && itemStatuses.containsKey(String.valueOf(deviceId))) {
                        item.setItemStatus(itemStatuses.get(String.valueOf(deviceId)));
                    } else {
                        item.setItemStatus("normal");
                    }
                    
                    // 设置备注
                    if (itemRemarks != null && itemRemarks.containsKey(String.valueOf(deviceId))) {
                        item.setRemark(itemRemarks.get(String.valueOf(deviceId)));
                    }
                    
                    inboundOrderItemRepository.save(item);
                    continue;
                }
                
                // 如果不是通用设备，尝试查找耗材
                Consumable consumable = consumableRepository.findById(deviceId).orElse(null);
                if (consumable != null) {
                    InboundOrderItem item = new InboundOrderItem();
                    item.setOrder(savedOrder);
                    item.setConsumable(consumable);
                    item.setQuantity(1);
                    item.setItemType("consumable");
                    item.setItemName(consumable.getConsumableName());
                    item.setItemCode(consumable.getConsumableCode());
                    
                    // 设置设备状态
                    if (itemStatuses != null && itemStatuses.containsKey(String.valueOf(deviceId))) {
                        item.setItemStatus(itemStatuses.get(String.valueOf(deviceId)));
                    } else {
                        item.setItemStatus("normal");
                    }
                    
                    // 设置备注
                    if (itemRemarks != null && itemRemarks.containsKey(String.valueOf(deviceId))) {
                        item.setRemark(itemRemarks.get(String.valueOf(deviceId)));
                    }
                    
                    inboundOrderItemRepository.save(item);
                }
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
                else if ("return".equals(order.getInboundType())) {
                    // 处理专用设备归还
                    if ("device".equals(item.getItemType()) && item.getDevice() != null) {
                        Device device = item.getDevice();
                        device.setUsageStatus("未使用");
                        device.setStatus("在库");
                        deviceRepository.save(device);
                        System.out.println("归还入库：专用设备 " + device.getDeviceName() + " 状态更新为: 未使用");
                    }
                    // 处理通用设备归还
                    else if ("accessory".equals(item.getItemType()) && item.getAccessory() != null) {
                        Accessory accessory = item.getAccessory();
                        accessory.setUsageStatus("未使用");
                        accessoryRepository.save(accessory);
                        System.out.println("归还入库：通用设备 " + accessory.getAccessoryName() + " 状态更新为: 未使用");
                    }
                    // 处理耗材归还 - 增加库存
                    else if ("consumable".equals(item.getItemType()) && item.getConsumable() != null) {
                        Consumable consumable = item.getConsumable();
                        int inboundQuantity = item.getQuantity() != null ? item.getQuantity() : 1;
                        
                        // 只有当数量大于0时才更新库存
                        if (inboundQuantity > 0) {
                            // 获取当前各数量字段
                            int currentRemaining = consumable.getRemainingQuantity() != null ? consumable.getRemainingQuantity() : 0;
                            int currentQuantity = consumable.getQuantity() != null ? consumable.getQuantity() : 0;
                            
                            // 计算新的数量
                            int newRemaining = currentRemaining + inboundQuantity;
                            int newQuantity = currentQuantity + inboundQuantity;
                            
                            // 更新数量字段
                            consumable.setRemainingQuantity(newRemaining);
                            consumable.setQuantity(newQuantity);
                            consumableRepository.save(consumable);
                            System.out.println("归还入库：耗材 " + consumable.getConsumableName() + " 已归还，库存增加: " + inboundQuantity + "，当前库存: " + newQuantity);
                        } else {
                            // 数量为0，视为全部损耗，不更新库存
                            System.out.println("归还入库：耗材 " + consumable.getConsumableName() + " 全部损耗，不更新库存");
                        }
                    }
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