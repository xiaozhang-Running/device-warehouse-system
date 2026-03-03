package com.device.warehouse.service;

import com.device.warehouse.dto.DashboardStatsDTO;
import com.device.warehouse.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 仪表盘统计服务类
 * 提供仪表盘所需的各种统计数据
 *
 * @author Warehouse Management System
 * @version 1.0
 */
@Service
@SuppressWarnings("null")
public class DashboardService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private AccessoryRepository accessoryRepository;

    @Autowired
    private ConsumableRepository consumableRepository;

    @Autowired
    private InboundOrderRepository inboundOrderRepository;

    @Autowired
    private OutboundOrderRepository outboundOrderRepository;

    @Autowired
    private InventoryAlertConfigRepository alertConfigRepository;

    /**
     * 获取仪表盘统计数据
     *
     * @return 仪表盘统计数据DTO
     */
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // 设备统计
        List<com.device.warehouse.entity.Device> devices = deviceRepository.findAll();
        stats.setTotalDevices((long) devices.size());
        stats.setNormalDevices(devices.stream().filter(d -> "正常".equals(d.getStatus())).count());
        stats.setMaintenanceDevices(devices.stream().filter(d -> "维修中".equals(d.getStatus())).count());
        stats.setScrappedDevices(devices.stream().filter(d -> "报废".equals(d.getStatus())).count());
        stats.setInUseDevices(devices.stream().filter(d -> "使用中".equals(d.getUsageStatus())).count());
        stats.setUnusedDevices(devices.stream().filter(d -> "未使用".equals(d.getUsageStatus())).count());

        // 通用设备统计
        stats.setTotalAccessories((long) accessoryRepository.findAll().size());

        // 耗材统计
        stats.setTotalConsumables((long) consumableRepository.findAll().size());

        // 库存预警
        List<com.device.warehouse.entity.InventoryAlertConfig> alertConfigs = alertConfigRepository.findAll();
        stats.setAlertCount((long) alertConfigs.size());

        // 预警项目详情
        List<Map<String, Object>> alertItems = alertConfigs.stream()
                .limit(5)
                .map(config -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("deviceName", config.getDeviceName());
                    item.put("minQuantity", config.getMinQuantity());
                    item.put("maxQuantity", config.getMaxQuantity());
                    return item;
                })
                .collect(Collectors.toList());
        stats.setAlertItems(alertItems);

        // 今日出入库统计
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.plusDays(1).atStartOfDay();

        // 入库单统计
        List<com.device.warehouse.entity.InboundOrder> inboundOrders = inboundOrderRepository.findAll();
        stats.setTodayInbound(inboundOrders.stream()
                .filter(order -> order.getOrderDate() != null)
                .filter(order -> {
                    LocalDateTime orderDate = order.getOrderDate();
                    return !orderDate.isBefore(todayStart) && orderDate.isBefore(todayEnd);
                })
                .count());

        // 本月入库统计
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDateTime monthStartTime = monthStart.atStartOfDay();
        stats.setMonthInbound(inboundOrders.stream()
                .filter(order -> order.getOrderDate() != null)
                .filter(order -> !order.getOrderDate().isBefore(monthStartTime))
                .count());

        // 出库单统计
        List<com.device.warehouse.entity.OutboundOrder> outboundOrders = outboundOrderRepository.findAll();
        stats.setTodayOutbound(outboundOrders.stream()
                .filter(order -> order.getOrderDate() != null)
                .filter(order -> {
                    LocalDateTime orderDate = order.getOrderDate().toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime();
                    return !orderDate.isBefore(todayStart) && orderDate.isBefore(todayEnd);
                })
                .count());

        // 本月出库统计
        stats.setMonthOutbound(outboundOrders.stream()
                .filter(order -> order.getOrderDate() != null)
                .filter(order -> {
                    LocalDateTime orderDate = order.getOrderDate().toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime();
                    return !orderDate.isBefore(monthStartTime);
                })
                .count());

        // 最近操作记录
        List<Map<String, Object>> recentActivities = new ArrayList<>();

        // 入库记录
        inboundOrders.stream()
                .filter(order -> order.getOrderDate() != null)
                .sorted((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()))
                .limit(5)
                .forEach(order -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("type", "入库");
                    activity.put("device", order.getOrderCode());
                    activity.put("quantity", order.getTotalQuantity() != null ? order.getTotalQuantity() : 0);
                    activity.put("time", order.getOrderDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
                    activity.put("operator", order.getOperator());
                    recentActivities.add(activity);
                });

        // 出库记录
        outboundOrders.stream()
                .filter(order -> order.getOrderDate() != null)
                .sorted((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()))
                .limit(5)
                .forEach(order -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("type", "出库");
                    activity.put("device", order.getOrderCode());
                    int totalQty = order.getItems() != null ? 
                            order.getItems().stream().mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0).sum() : 0;
                    activity.put("quantity", totalQty);
                    activity.put("time", new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm").format(order.getOrderDate()));
                    activity.put("operator", order.getOperator() != null ? order.getOperator().getName() : "未知");
                    recentActivities.add(activity);
                });

        // 按时间排序
        recentActivities.sort((a, b) -> ((String) b.get("time")).compareTo((String) a.get("time")));
        stats.setRecentActivities(recentActivities.stream().limit(10).collect(Collectors.toList()));

        // 品牌统计
        Map<String, Long> brandCount = devices.stream()
                .filter(d -> d.getBrand() != null && !d.getBrand().isEmpty())
                .collect(Collectors.groupingBy(
                        com.device.warehouse.entity.Device::getBrand,
                        Collectors.counting()
                ));

        List<Map<String, Object>> brandStats = brandCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Map<String, Object> stat = new HashMap<>();
                    stat.put("brand", entry.getKey());
                    stat.put("count", entry.getValue());
                    return stat;
                })
                .collect(Collectors.toList());
        stats.setBrandStats(brandStats);

        // 状态分布
        Map<String, Long> statusDistribution = devices.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getStatus() != null ? d.getStatus() : "未知",
                        Collectors.counting()
                ));
        stats.setStatusDistribution(statusDistribution);

        return stats;
    }
}
