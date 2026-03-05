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
                // 设置数量
                Object quantityObj = detail.get("quantity");
                // 尝试从不同的键名中获取数量
                if (quantityObj == null) {
                    quantityObj = detail.get("Quantity");
                }
                if (quantityObj == null) {
                    quantityObj = detail.get("QUANTITY");
                }
                // 尝试从itemDetail字符串中解析数量
                if (quantityObj == null) {
                    String itemDetailStr = (String) detail.get("itemDetail");
                    if (itemDetailStr != null) {
                        // 尝试从itemDetail字符串中提取quantity值
                        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("quantity=(\\d+)");
                        java.util.regex.Matcher matcher = pattern.matcher(itemDetailStr);
                        if (matcher.find()) {
                            try {
                                quantityObj = Integer.parseInt(matcher.group(1));
                                System.out.println("从itemDetail中解析到的quantity值: " + quantityObj);
                            } catch (NumberFormatException e) {
                                // 解析失败，继续使用默认值
                            }
                        }
                    }
                }
                System.out.println("获取到的quantity值: " + quantityObj);
                System.out.println("quantity值的类型: " + (quantityObj != null ? quantityObj.getClass() : "null"));
                if (quantityObj != null) {
                    if (quantityObj instanceof Number) {
                        item.setQuantity(((Number) quantityObj).intValue());
                        System.out.println("数量设置为: " + item.getQuantity());
                    } else {
                        try {
                            item.setQuantity(Integer.parseInt(quantityObj.toString()));
                            System.out.println("数量设置为: " + item.getQuantity());
                        } catch (NumberFormatException e) {
                            item.setQuantity(1);
                            System.out.println("数量解析失败，设置为默认值: 1");
                        }
                    }
                } else {
                    item.setQuantity(1);
                    System.out.println("quantity为null，设置为默认值: 1");
                }
                item.setItemType((String) detail.get("type"));
                item.setItemName((String) detail.get("name"));
                item.setItemCode((String) detail.get("code"));
                item.setBrand((String) detail.get("brand"));
                item.setModelSpec((String) detail.get("modelSpec"));
                item.setUnit((String) detail.get("unit"));
                item.setCompany((String) detail.get("company"));
                item.setLocationStr((String) detail.get("location"));
                item.setOtherAccessories((String) detail.get("otherAccessories"));
                
                // 打印所有字段，检查数据结构
                System.out.println("Detail数据结构:");
                for (Map.Entry<String, Object> entry : detail.entrySet()) {
                    System.out.println("  " + entry.getKey() + ": " + entry.getValue());
                }
                
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
                        // 检查是否已存在相同的专用设备（同名称、同品牌、同型号、同SN码）
                        Device existingDevice = findExistingDevice(item.getItemName(), item.getBrand(), item.getModelSpec(), item.getSnCode());
                        
                        if (existingDevice != null) {
                            // 已存在，抛出异常提示用户修改数据
                            throw new RuntimeException("专用设备 '" + item.getItemName() + "' 已存在于仓库中（编码：" + existingDevice.getDeviceCode() + "），请修改数据或删除该条目后重新提交");
                        }
                        
                        // 创建专用设备
                        Device device = new Device();
                        device.setDeviceName(item.getItemName());
                        device.setDeviceCode(item.getItemCode());
                        device.setBrand(item.getBrand());
                        device.setModelSpec(item.getModelSpec());
                        device.setSnCode(item.getSnCode());
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
                        // 检查是否已存在相同的通用设备（同名称、同品牌、同型号）
                        Accessory existingAccessory = findExistingAccessory(item.getItemName(), item.getBrand(), item.getModelSpec());
                        
                        if (existingAccessory != null) {
                            // 已存在，抛出异常提示用户修改数据
                            throw new RuntimeException("通用设备 '" + item.getItemName() + "' 已存在于仓库中（编码：" + existingAccessory.getAccessoryCode() + "），请修改数据或删除该条目后重新提交");
                        }
                        
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
                        // 查找是否已存在相同的耗材（同名称、同品牌、同型号）
                        Consumable existingConsumable = findExistingConsumable(item.getItemName(), item.getBrand(), item.getModelSpec());
                        
                        if (existingConsumable != null) {
                            // 已存在，更新数量
                            int inboundQuantity = item.getQuantity() != null ? item.getQuantity() : 1;
                            int currentQuantity = existingConsumable.getQuantity() != null ? existingConsumable.getQuantity() : 0;
                            int currentRemaining = existingConsumable.getRemainingQuantity() != null ? existingConsumable.getRemainingQuantity() : 0;
                            
                            // 更新数量
                            existingConsumable.setQuantity(currentQuantity + inboundQuantity);
                            existingConsumable.setRemainingQuantity(currentRemaining + inboundQuantity);
                            
                            // 更新其他字段（如果新值不为空）
                            if (item.getUnit() != null) existingConsumable.setUnit(item.getUnit());
                            if (item.getCompany() != null) existingConsumable.setCompany(item.getCompany());
                            if (item.getLocationStr() != null) existingConsumable.setLocation(item.getLocationStr());
                            if (item.getOtherAccessories() != null) existingConsumable.setOtherAccessories(item.getOtherAccessories());
                            if (item.getRemark() != null) existingConsumable.setRemark(item.getRemark());
                            
                            consumableRepository.save(existingConsumable);
                            item.setConsumable(existingConsumable);
                            inboundOrderItemRepository.save(item);
                            System.out.println("新采购入库：更新耗材库存 " + existingConsumable.getConsumableName() + " (" + existingConsumable.getConsumableCode() + ")，新增数量: " + inboundQuantity + "，当前库存: " + existingConsumable.getQuantity());
                        } else {
                            // 不存在，创建新耗材
                            Consumable consumable = new Consumable();
                            consumable.setConsumableName(item.getItemName());
                            
                            // 生成唯一的耗材编码
                            String consumableCode = generateUniqueConsumableCode(item.getItemName(), item.getBrand(), item.getModelSpec());
                            consumable.setConsumableCode(consumableCode);
                            
                            consumable.setBrand(item.getBrand());
                            consumable.setModelSpec(item.getModelSpec());
                            consumable.setUnit(item.getUnit());
                            consumable.setCompany(item.getCompany());
                            consumable.setLocation(item.getLocationStr());
                            consumable.setOtherAccessories(item.getOtherAccessories());
                            consumable.setRemark(item.getRemark());
                            consumable.setQuantity(item.getQuantity());
                            consumable.setRemainingQuantity(item.getQuantity()); // 初始剩余数量等于入库数量
                            consumable.setStatus("正常");
                            consumableRepository.save(consumable);
                            
                            item.setConsumable(consumable);
                            inboundOrderItemRepository.save(item);
                            System.out.println("新采购入库：创建耗材 " + consumable.getConsumableName() + " (" + consumable.getConsumableCode() + ")");
                        }
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
    public InboundOrder updateOrder(Long id, InboundOrder order, List<Map<String, Object>> itemDetails) {
        InboundOrder existingOrder = inboundOrderRepository.findById(id).orElse(null);
        if (existingOrder == null) {
            return null;
        }
        
        // 只允许更新待处理的入库单
        if (!"PENDING".equals(existingOrder.getStatus())) {
            throw new RuntimeException("只能更新待处理状态的入库单");
        }
        
        // 更新基本信息
        existingOrder.setOrderCode(order.getOrderCode());
        existingOrder.setRemark(order.getRemark());
        existingOrder.setReceiver(order.getReceiver());
        existingOrder.setReceiverPhone(order.getReceiverPhone());
        existingOrder.setDeliverer(order.getDeliverer());
        existingOrder.setUpdatedAt(LocalDateTime.now());
        
        // 如果提供了新的物品明细，则更新明细
        if (itemDetails != null && !itemDetails.isEmpty()) {
            // 删除原有明细
            List<InboundOrderItem> existingItems = inboundOrderItemRepository.findByOrderId(id);
            inboundOrderItemRepository.deleteAll(existingItems);
            
            // 创建新的明细
            for (Map<String, Object> detail : itemDetails) {
                InboundOrderItem item = new InboundOrderItem();
                item.setOrder(existingOrder);
                
                // 设置数量
                Object quantityObj = detail.get("quantity");
                if (quantityObj == null) {
                    quantityObj = detail.get("Quantity");
                }
                if (quantityObj == null) {
                    quantityObj = detail.get("QUANTITY");
                }
                if (quantityObj != null) {
                    if (quantityObj instanceof Number) {
                        item.setQuantity(((Number) quantityObj).intValue());
                    } else {
                        try {
                            item.setQuantity(Integer.parseInt(quantityObj.toString()));
                        } catch (NumberFormatException e) {
                            item.setQuantity(1);
                        }
                    }
                } else {
                    item.setQuantity(1);
                }
                
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
                item.setItemStatus("normal");
                
                // 尝试关联具体的设备对象
                if (detail.get("type") != null) {
                    String type = (String) detail.get("type");
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
                
                // 保存原始明细数据
                item.setItemDetail(detail.toString());
                inboundOrderItemRepository.save(item);
            }
        }
        
        return inboundOrderRepository.save(existingOrder);
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

    /**
     * 查找已存在的专用设备（同名称、同品牌、同型号、同SN码）
     * @param deviceName 设备名称
     * @param brand 品牌
     * @param modelSpec 型号规格
     * @param snCode SN码
     * @return 如果找到则返回设备对象，否则返回null
     */
    private Device findExistingDevice(String deviceName, String brand, String modelSpec, String snCode) {
        return deviceRepository.findAll().stream()
            .filter(d -> deviceName.equals(d.getDeviceName()))
            .filter(d -> {
                boolean brandMatch = (brand == null && d.getBrand() == null) || 
                                   (brand != null && brand.equals(d.getBrand())) ||
                                   (brand == "" && (d.getBrand() == null || d.getBrand().isEmpty())) ||
                                   (d.getBrand() == null && (brand == null || brand.isEmpty()));
                return brandMatch;
            })
            .filter(d -> {
                boolean modelMatch = (modelSpec == null && d.getModelSpec() == null) || 
                                    (modelSpec != null && modelSpec.equals(d.getModelSpec())) ||
                                    (modelSpec == "" && (d.getModelSpec() == null || d.getModelSpec().isEmpty())) ||
                                    (d.getModelSpec() == null && (modelSpec == null || modelSpec.isEmpty()));
                return modelMatch;
            })
            .filter(d -> {
                // SN码匹配：如果提供了SN码，则必须匹配；如果没有提供SN码，则只匹配名称、品牌、型号
                if (snCode != null && !snCode.isEmpty()) {
                    return snCode.equals(d.getSnCode());
                }
                return true;
            })
            .findFirst()
            .orElse(null);
    }

    /**
     * 查找已存在的通用设备（同名称、同品牌、同型号）
     * @param accessoryName 设备名称
     * @param brand 品牌
     * @param modelSpec 型号规格
     * @return 如果找到则返回设备对象，否则返回null
     */
    private Accessory findExistingAccessory(String accessoryName, String brand, String modelSpec) {
        return accessoryRepository.findAll().stream()
            .filter(a -> accessoryName.equals(a.getAccessoryName()))
            .filter(a -> {
                boolean brandMatch = (brand == null && a.getBrand() == null) || 
                                   (brand != null && brand.equals(a.getBrand())) ||
                                   (brand == "" && (a.getBrand() == null || a.getBrand().isEmpty())) ||
                                   (a.getBrand() == null && (brand == null || brand.isEmpty()));
                return brandMatch;
            })
            .filter(a -> {
                boolean modelMatch = (modelSpec == null && a.getModelSpec() == null) || 
                                    (modelSpec != null && modelSpec.equals(a.getModelSpec())) ||
                                    (modelSpec == "" && (a.getModelSpec() == null || a.getModelSpec().isEmpty())) ||
                                    (a.getModelSpec() == null && (modelSpec == null || modelSpec.isEmpty()));
                return modelMatch;
            })
            .findFirst()
            .orElse(null);
    }

    /**
     * 查找已存在的耗材（同名称、同品牌、同型号）
     * @param consumableName 耗材名称
     * @param brand 品牌
     * @param modelSpec 型号规格
     * @return 如果找到则返回耗材对象，否则返回null
     */
    private Consumable findExistingConsumable(String consumableName, String brand, String modelSpec) {
        return consumableRepository.findAll().stream()
            .filter(c -> consumableName.equals(c.getConsumableName()))
            .filter(c -> {
                boolean brandMatch = (brand == null && c.getBrand() == null) || 
                                   (brand != null && brand.equals(c.getBrand())) ||
                                   (brand == null && c.getBrand() == null) ||
                                   (brand == "" && (c.getBrand() == null || c.getBrand().isEmpty())) ||
                                   (c.getBrand() == null && (brand == null || brand.isEmpty()));
                return brandMatch;
            })
            .filter(c -> {
                boolean modelMatch = (modelSpec == null && c.getModelSpec() == null) || 
                                    (modelSpec != null && modelSpec.equals(c.getModelSpec())) ||
                                    (modelSpec == null && c.getModelSpec() == null) ||
                                    (modelSpec == "" && (c.getModelSpec() == null || c.getModelSpec().isEmpty())) ||
                                    (c.getModelSpec() == null && (modelSpec == null || modelSpec.isEmpty()));
                return modelMatch;
            })
            .findFirst()
            .orElse(null);
    }

    /**
     * 生成唯一的耗材编码
     * 逻辑：
     * 1. 首先判断是否为同一名称的耗材
     * 2. 如果不是同一名称，直接生成新的编码（HC-名称-001）
     * 3. 如果是同一名称，再判断是否为同一品牌同一型号
     * 4. 如果不是同一品牌同一型号，生成新的编码
     */
    private String generateUniqueConsumableCode(String consumableName, String brand, String modelSpec) {
        // 查找同名称的耗材
        List<Consumable> sameNameConsumables = consumableRepository.findAll().stream()
            .filter(c -> consumableName.equals(c.getConsumableName()))
            .toList();
        
        if (sameNameConsumables.isEmpty()) {
            // 没有同名称的耗材，生成新的编码，序号从1开始
            return "HC-" + consumableName + "-001";
        }
        
        // 有同名称的耗材，检查是否有完全匹配（同品牌同型号）的
        Consumable exactMatch = sameNameConsumables.stream()
            .filter(c -> {
                boolean brandMatch = (brand == null && c.getBrand() == null) || 
                                   (brand != null && brand.equals(c.getBrand()));
                boolean modelMatch = (modelSpec == null && c.getModelSpec() == null) || 
                                    (modelSpec != null && modelSpec.equals(c.getModelSpec()));
                return brandMatch && modelMatch;
            })
            .findFirst()
            .orElse(null);
        
        if (exactMatch != null) {
            // 有完全匹配的，使用现有编码
            return exactMatch.getConsumableCode();
        }
        
        // 没有完全匹配的（同名称但不同品牌或型号），生成新的编码
        // 查找该名称下最大的序号
        int maxSeq = 0;
        for (Consumable c : sameNameConsumables) {
            String code = c.getConsumableCode();
            if (code != null) {
                // 提取序号部分
                int lastDashIndex = code.lastIndexOf('-');
                if (lastDashIndex > 0 && lastDashIndex < code.length() - 1) {
                    try {
                        int seq = Integer.parseInt(code.substring(lastDashIndex + 1));
                        if (seq > maxSeq) {
                            maxSeq = seq;
                        }
                    } catch (NumberFormatException e) {
                        // 忽略无法解析的序号
                    }
                }
            }
        }
        
        // 生成新的序号
        return "HC-" + consumableName + "-" + String.format("%03d", maxSeq + 1);
    }
}