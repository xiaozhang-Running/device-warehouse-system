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
            System.out.println("请求数据: " + requestData);
            
            // 检查赛事名称是否重复
            String eventName = (String) requestData.get("eventName");
            if (eventName != null && !eventName.trim().isEmpty()) {
                List<OutboundOrder> existingOrders = outboundOrderService.findByEventName(eventName.trim());
                if (!existingOrders.isEmpty()) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "赛事名称已存在，请使用不同的赛事名称");
                    return ResponseEntity.status(400).body(response);
                }
            }
            
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
            // 比赛时间为文本类型，直接存储
            order.setEventDate((String) requestData.get("eventDate"));
            
            // 设置运输方式
            order.setTransportMethod((String) requestData.get("transportMethod"));
            
            // 设置出库单类型
            order.setOrderType((String) requestData.get("orderType"));
            
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

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable Long id, @RequestBody Map<String, Object> requestData) {
        try {
            System.out.println("更新出库单: " + id);
            System.out.println("请求数据: " + requestData);
            
            // 先获取原有出库单
            OutboundOrder existingOrder = outboundOrderService.getOrderById(id);
            if (existingOrder == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "出库单不存在");
                return ResponseEntity.status(404).body(response);
            }
            
            // 更新出库单字段
            if (requestData.get("orderCode") != null) {
                existingOrder.setOrderCode((String) requestData.get("orderCode"));
            }
            if (requestData.get("remark") != null) {
                existingOrder.setRemark((String) requestData.get("remark"));
            }
            if (requestData.get("status") != null) {
                existingOrder.setStatus((String) requestData.get("status"));
            }
            
            // 更新订单日期
            if (requestData.get("orderDate") != null) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    existingOrder.setOrderDate(sdf.parse((String) requestData.get("orderDate")));
                } catch (Exception e) {
                    System.out.println("解析订单日期失败: " + e.getMessage());
                }
            }
            
            // 更新借用单位信息
            if (requestData.get("companyName") != null) {
                existingOrder.setCompanyName((String) requestData.get("companyName"));
            }
            if (requestData.get("contactPerson") != null) {
                existingOrder.setContactPerson((String) requestData.get("contactPerson"));
            }
            if (requestData.get("contactPhone") != null) {
                existingOrder.setContactPhone((String) requestData.get("contactPhone"));
            }
            
            // 更新签字信息
            if (requestData.get("handledBy") != null) {
                existingOrder.setHandledBy((String) requestData.get("handledBy"));
            }
            if (requestData.get("deptApprover") != null) {
                existingOrder.setDeptApprover((String) requestData.get("deptApprover"));
            }
            if (requestData.get("warehouseKeeper") != null) {
                existingOrder.setWarehouseKeeper((String) requestData.get("warehouseKeeper"));
            }
            
            // 更新借用信息
            if (requestData.get("borrowPurpose") != null) {
                existingOrder.setBorrowPurpose((String) requestData.get("borrowPurpose"));
            }
            if (requestData.get("borrowDays") != null) {
                existingOrder.setBorrowDays(Integer.valueOf(requestData.get("borrowDays").toString()));
            }
            if (requestData.get("returnDate") != null) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    existingOrder.setReturnDate(sdf.parse((String) requestData.get("returnDate")));
                } catch (Exception e) {
                    System.out.println("解析归还日期失败: " + e.getMessage());
                }
            }
            
            // 更新领用信息（按照表格格式）
            if (requestData.get("usageType") != null) {
                existingOrder.setUsageType((String) requestData.get("usageType"));
            }
            if (requestData.get("recipientName") != null) {
                existingOrder.setRecipientName((String) requestData.get("recipientName"));
            }
            if (requestData.get("eventName") != null) {
                existingOrder.setEventName((String) requestData.get("eventName"));
            }
            if (requestData.get("usageLocation") != null) {
                existingOrder.setUsageLocation((String) requestData.get("usageLocation"));
            }
            // 比赛时间为文本类型，直接存储
            if (requestData.get("eventDate") != null) {
                existingOrder.setEventDate((String) requestData.get("eventDate"));
            }
            
            // 更新运输方式
            if (requestData.get("transportMethod") != null) {
                existingOrder.setTransportMethod((String) requestData.get("transportMethod"));
            }
            
            // 更新出库单类型
            if (requestData.get("orderType") != null) {
                existingOrder.setOrderType((String) requestData.get("orderType"));
            }
            
            // 更新图片URLs
            if (requestData.get("images") instanceof List) {
                List<String> images = (List<String>) requestData.get("images");
                // 将图片列表转换为JSON字符串存储
                ObjectMapper objectMapper = new ObjectMapper();
                try {
                    String imagesJson = objectMapper.writeValueAsString(images);
                    existingOrder.setImages(imagesJson);
                } catch (Exception e) {
                    System.out.println("图片数据转换失败: " + e.getMessage());
                }
            }
            
            // 更新领用人
            if (requestData.get("recipientId") != null) {
                Long recipientId = Long.valueOf(requestData.get("recipientId").toString());
                User recipient = new User();
                recipient.setId(recipientId);
                existingOrder.setRecipient(recipient);
            }
            
            // 更新操作员
            if (requestData.get("operatorId") != null) {
                Long operatorId = Long.valueOf(requestData.get("operatorId").toString());
                User operator = new User();
                operator.setId(operatorId);
                existingOrder.setOperator(operator);
            }
            
            // 获取明细列表
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) requestData.get("items");
            
            // 更新出库单及其明细
            OutboundOrder updatedOrder = outboundOrderService.updateOrderWithItems(existingOrder, items);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "出库单更新成功");
            response.put("data", updatedOrder);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("更新出库单失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "更新失败: " + e.getMessage());
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

    @PostMapping("/transfer")
    public ResponseEntity<?> transferDevice(@RequestBody Map<String, Object> requestData) {
        try {
            System.out.println("流转设备: " + requestData);
            
            Long sourceOutboundId = Long.valueOf(requestData.get("sourceOutboundId").toString());
            Long targetOutboundId = Long.valueOf(requestData.get("targetOutboundId").toString());
            Long deviceId = Long.valueOf(requestData.get("deviceId").toString());
            String itemType = (String) requestData.get("itemType");
            String remark = (String) requestData.get("remark");
            
            outboundOrderService.transferDevice(sourceOutboundId, targetOutboundId, deviceId, itemType, remark);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "设备流转成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("设备流转失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "流转失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
