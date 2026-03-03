package com.device.warehouse.controller;

import com.device.warehouse.entity.OutboundOrder;
import com.device.warehouse.entity.User;
import com.device.warehouse.service.OutboundOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/outbound")
@CrossOrigin(origins = "*")
public class OutboundOrderController {

    @Autowired
    private OutboundOrderService outboundOrderService;

    @GetMapping
    public ResponseEntity<List<OutboundOrder>> getAllOrders() {
        List<OutboundOrder> orders = outboundOrderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        OutboundOrder order = outboundOrderService.getOrderById(id);
        if (order != null) {
            return ResponseEntity.ok(order);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "出库单不存在");
            return ResponseEntity.status(404).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> requestData) {
        try {
            System.out.println("创建出库单: " + requestData.get("orderCode"));
            
            // 构建出库单对象
            OutboundOrder order = new OutboundOrder();
            order.setOrderCode((String) requestData.get("orderCode"));
            order.setRemark((String) requestData.get("remark"));
            order.setStatus((String) requestData.get("status"));
            
            // 设置订单日期
            if (requestData.get("orderDate") != null) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    order.setOrderDate(sdf.parse((String) requestData.get("orderDate")));
                } catch (Exception e) {
                    System.out.println("解析订单日期失败: " + e.getMessage());
                }
            }
            
            // 设置借用单位信息
            order.setCompanyName((String) requestData.get("companyName"));
            order.setContactPerson((String) requestData.get("contactPerson"));
            order.setContactPhone((String) requestData.get("contactPhone"));
            
            // 设置签字信息
            order.setHandledBy((String) requestData.get("handledBy"));
            order.setDeptApprover((String) requestData.get("deptApprover"));
            order.setWarehouseKeeper((String) requestData.get("warehouseKeeper"));
            
            // 设置借用信息
            order.setBorrowPurpose((String) requestData.get("borrowPurpose"));
            if (requestData.get("borrowDays") != null) {
                order.setBorrowDays(Integer.valueOf(requestData.get("borrowDays").toString()));
            }
            if (requestData.get("returnDate") != null) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    order.setReturnDate(sdf.parse((String) requestData.get("returnDate")));
                } catch (Exception e) {
                    System.out.println("解析归还日期失败: " + e.getMessage());
                }
            }
            
            // 设置领用信息（按照表格格式）
            order.setUsageType((String) requestData.get("usageType"));
            order.setRecipientName((String) requestData.get("recipientName"));
            order.setEventName((String) requestData.get("eventName"));
            order.setUsageLocation((String) requestData.get("usageLocation"));
            if (requestData.get("eventDate") != null) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    order.setEventDate(sdf.parse((String) requestData.get("eventDate")));
                } catch (Exception e) {
                    System.out.println("解析比赛时间失败: " + e.getMessage());
                }
            }
            
            // 设置运输方式
            order.setTransportMethod((String) requestData.get("transportMethod"));
            
            // 设置图片URLs
            if (requestData.get("images") instanceof List) {
                List<String> images = (List<String>) requestData.get("images");
                // 将图片列表转换为JSON字符串存储
                ObjectMapper objectMapper = new ObjectMapper();
                try {
                    String imagesJson = objectMapper.writeValueAsString(images);
                    order.setImages(imagesJson);
                } catch (Exception e) {
                    System.out.println("图片数据转换失败: " + e.getMessage());
                }
            }
            
            // 设置领用人
            if (requestData.get("recipientId") != null) {
                Long recipientId = Long.valueOf(requestData.get("recipientId").toString());
                User recipient = new User();
                recipient.setId(recipientId);
                order.setRecipient(recipient);
            }
            
            // 设置操作员
            if (requestData.get("operatorId") != null) {
                Long operatorId = Long.valueOf(requestData.get("operatorId").toString());
                User operator = new User();
                operator.setId(operatorId);
                order.setOperator(operator);
            }
            
            // 获取明细列表
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) requestData.get("items");
            
            OutboundOrder createdOrder = outboundOrderService.createOrderWithItems(order, items);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "出库单创建成功");
            response.put("data", createdOrder);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("创建出库单失败: " + e.getMessage());
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
            System.out.println("完成出库单: " + id);
            OutboundOrder order = outboundOrderService.completeOrder(id);
            if (order != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "出库单已完成，设备状态已更新为使用中");
                response.put("data", order);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "出库单不存在或状态不正确");
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            System.out.println("完成出库单失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "操作失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            OutboundOrder order = outboundOrderService.cancelOrder(id);
            if (order != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "出库单已取消");
                response.put("data", order);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "出库单不存在或状态不正确");
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
            outboundOrderService.deleteOrder(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "出库单已删除");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearAllOrders() {
        try {
            outboundOrderService.deleteAllOrders();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "出库单数据已清空");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "清空失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
