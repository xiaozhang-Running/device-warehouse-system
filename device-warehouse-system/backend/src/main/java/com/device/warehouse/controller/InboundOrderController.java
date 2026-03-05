package com.device.warehouse.controller;

import com.device.warehouse.entity.InboundOrder;
import com.device.warehouse.service.InboundOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inbound")
@CrossOrigin(origins = "*")
public class InboundOrderController {

    @Autowired
    private InboundOrderService inboundOrderService;

    @GetMapping
    public ResponseEntity<List<InboundOrder>> getAllOrders() {
        List<InboundOrder> orders = inboundOrderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        InboundOrder order = inboundOrderService.getOrderById(id);
        if (order != null) {
            return ResponseEntity.ok(order);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "入库单不存在");
            return ResponseEntity.status(404).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        try {
            InboundOrder order = new InboundOrder();
            order.setOrderCode((String) request.get("orderCode"));
            order.setRemark((String) request.get("remark"));
            order.setInboundType((String) request.get("inboundType"));
            order.setDeviceType((String) request.get("deviceType"));
            order.setReceiver((String) request.get("receiver"));
            order.setReceiverPhone((String) request.get("receiverPhone"));
            order.setDeliverer((String) request.get("deliverer"));
            
            // 处理关联出库单ID
            if (request.get("relatedOutboundId") != null) {
                Object outboundId = request.get("relatedOutboundId");
                if (outboundId instanceof Number) {
                    order.setRelatedOutboundId(((Number) outboundId).longValue());
                } else {
                    order.setRelatedOutboundId(Long.parseLong(outboundId.toString()));
                }
            }
            
            // 处理归还入库的设备ID列表
            @SuppressWarnings("unchecked")
            List<Object> deviceIdsRaw = (List<Object>) request.get("deviceIds");
            List<Long> deviceIds = null;
            if (deviceIdsRaw != null && !deviceIdsRaw.isEmpty()) {
                deviceIds = deviceIdsRaw.stream()
                    .map(id -> {
                        if (id instanceof Number) {
                            return ((Number) id).longValue();
                        }
                        return Long.parseLong(id.toString());
                    })
                    .toList();
            }
            
            // 处理前端传递的items中的设备ID
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsFromRequest = (List<Map<String, Object>>) request.get("items");
            if (itemsFromRequest != null && !itemsFromRequest.isEmpty() && deviceIds == null) {
                deviceIds = itemsFromRequest.stream()
                    .map(item -> {
                        Object deviceId = item.get("deviceId");
                        if (deviceId instanceof Number) {
                            return ((Number) deviceId).longValue();
                        }
                        return Long.parseLong(deviceId.toString());
                    })
                    .toList();
            }
            
            // 处理前端传递的itemDetails字段
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemDetails = (List<Map<String, Object>>) request.get("itemDetails");
            if (itemDetails != null && !itemDetails.isEmpty() && deviceIds == null) {
                // 从itemDetails中提取deviceId
                deviceIds = itemDetails.stream()
                    .map(item -> {
                        Object deviceId = item.get("id");
                        if (deviceId instanceof Number) {
                            return ((Number) deviceId).longValue();
                        }
                        return Long.parseLong(deviceId.toString());
                    })
                    .toList();
            }
            
            // 处理新采购入库的物品明细
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("itemDetails");
            
            // 处理设备备注
            @SuppressWarnings("unchecked")
            Map<String, String> itemRemarks = (Map<String, String>) request.get("itemRemarks");
            
            // 处理设备状态
            @SuppressWarnings("unchecked")
            Map<String, String> itemStatuses = (Map<String, String>) request.get("itemStatuses");
            
            System.out.println("创建入库单: " + order.getOrderCode() + ", 类型: " + order.getInboundType() + 
                ", 关联出库单: " + order.getRelatedOutboundId() +
                ", 归还设备数量: " + (deviceIds != null ? deviceIds.size() : 0) + 
                ", 新采购物品数量: " + (items != null ? items.size() : 0));
            
            InboundOrder createdOrder = inboundOrderService.createOrder(order, deviceIds, items, itemRemarks, itemStatuses);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "入库单创建成功");
            response.put("data", createdOrder);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("创建入库单失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "创建失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long id) {
        try {
            System.out.println("完成入库单: " + id);
            InboundOrder order = inboundOrderService.completeOrder(id);
            if (order != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "入库单已完成，设备状态已更新为未使用");
                response.put("data", order);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "入库单不存在或状态不正确");
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            System.out.println("完成入库单失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "操作失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            InboundOrder order = new InboundOrder();
            order.setOrderCode((String) request.get("orderCode"));
            order.setRemark((String) request.get("remark"));
            order.setReceiver((String) request.get("receiver"));
            order.setReceiverPhone((String) request.get("receiverPhone"));
            order.setDeliverer((String) request.get("deliverer"));
            
            // 处理物品明细
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemDetails = (List<Map<String, Object>>) request.get("itemDetails");
            
            System.out.println("更新入库单: " + id + ", 单号: " + order.getOrderCode());
            
            InboundOrder updatedOrder = inboundOrderService.updateOrder(id, order, itemDetails);
            
            if (updatedOrder != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "入库单更新成功");
                response.put("data", updatedOrder);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "入库单不存在");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            System.out.println("更新入库单失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "更新失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            InboundOrder order = inboundOrderService.cancelOrder(id);
            if (order != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "入库单已取消");
                response.put("data", order);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "入库单不存在或状态不正确");
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "操作失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            inboundOrderService.deleteOrder(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "入库单已删除");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}