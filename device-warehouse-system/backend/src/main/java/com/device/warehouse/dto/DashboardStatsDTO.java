package com.device.warehouse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 仪表盘统计数据DTO
 * 
 * @author Warehouse Management System
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    
    // 设备统计
    private Long totalDevices;
    private Long normalDevices;
    private Long maintenanceDevices;
    private Long scrappedDevices;
    private Long inUseDevices;
    private Long unusedDevices;
    
    // 通用设备统计
    private Long totalAccessories;
    
    // 耗材统计
    private Long totalConsumables;
    
    // 库存预警
    private Long alertCount;
    private List<Map<String, Object>> alertItems;
    
    // 今日出入库
    private Long todayInbound;
    private Long todayOutbound;
    
    // 本月出入库
    private Long monthInbound;
    private Long monthOutbound;
    
    // 最近操作记录
    private List<Map<String, Object>> recentActivities;
    
    // 分类统计
    private List<Map<String, Object>> categoryStats;
    
    // 品牌统计
    private List<Map<String, Object>> brandStats;
    
    // 状态分布
    private Map<String, Long> statusDistribution;
}
