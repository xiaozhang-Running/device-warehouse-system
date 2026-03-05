package com.device.warehouse.dto;

import java.util.List;
import java.util.Map;

/**
 * 仪表盘统计数据DTO
 * 
 * @author Warehouse Management System
 * @version 1.0
 */
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

    // Default constructor
    public DashboardStatsDTO() {}

    // All args constructor
    public DashboardStatsDTO(Long totalDevices, Long normalDevices, Long maintenanceDevices, 
                           Long scrappedDevices, Long inUseDevices, Long unusedDevices, 
                           Long totalAccessories, Long totalConsumables, Long alertCount, 
                           List<Map<String, Object>> alertItems, Long todayInbound, 
                           Long todayOutbound, Long monthInbound, Long monthOutbound, 
                           List<Map<String, Object>> recentActivities, 
                           List<Map<String, Object>> categoryStats, 
                           List<Map<String, Object>> brandStats, 
                           Map<String, Long> statusDistribution) {
        this.totalDevices = totalDevices;
        this.normalDevices = normalDevices;
        this.maintenanceDevices = maintenanceDevices;
        this.scrappedDevices = scrappedDevices;
        this.inUseDevices = inUseDevices;
        this.unusedDevices = unusedDevices;
        this.totalAccessories = totalAccessories;
        this.totalConsumables = totalConsumables;
        this.alertCount = alertCount;
        this.alertItems = alertItems;
        this.todayInbound = todayInbound;
        this.todayOutbound = todayOutbound;
        this.monthInbound = monthInbound;
        this.monthOutbound = monthOutbound;
        this.recentActivities = recentActivities;
        this.categoryStats = categoryStats;
        this.brandStats = brandStats;
        this.statusDistribution = statusDistribution;
    }

    // Getters and Setters
    public Long getTotalDevices() {
        return totalDevices;
    }

    public void setTotalDevices(Long totalDevices) {
        this.totalDevices = totalDevices;
    }

    public Long getNormalDevices() {
        return normalDevices;
    }

    public void setNormalDevices(Long normalDevices) {
        this.normalDevices = normalDevices;
    }

    public Long getMaintenanceDevices() {
        return maintenanceDevices;
    }

    public void setMaintenanceDevices(Long maintenanceDevices) {
        this.maintenanceDevices = maintenanceDevices;
    }

    public Long getScrappedDevices() {
        return scrappedDevices;
    }

    public void setScrappedDevices(Long scrappedDevices) {
        this.scrappedDevices = scrappedDevices;
    }

    public Long getInUseDevices() {
        return inUseDevices;
    }

    public void setInUseDevices(Long inUseDevices) {
        this.inUseDevices = inUseDevices;
    }

    public Long getUnusedDevices() {
        return unusedDevices;
    }

    public void setUnusedDevices(Long unusedDevices) {
        this.unusedDevices = unusedDevices;
    }

    public Long getTotalAccessories() {
        return totalAccessories;
    }

    public void setTotalAccessories(Long totalAccessories) {
        this.totalAccessories = totalAccessories;
    }

    public Long getTotalConsumables() {
        return totalConsumables;
    }

    public void setTotalConsumables(Long totalConsumables) {
        this.totalConsumables = totalConsumables;
    }

    public Long getAlertCount() {
        return alertCount;
    }

    public void setAlertCount(Long alertCount) {
        this.alertCount = alertCount;
    }

    public List<Map<String, Object>> getAlertItems() {
        return alertItems;
    }

    public void setAlertItems(List<Map<String, Object>> alertItems) {
        this.alertItems = alertItems;
    }

    public Long getTodayInbound() {
        return todayInbound;
    }

    public void setTodayInbound(Long todayInbound) {
        this.todayInbound = todayInbound;
    }

    public Long getTodayOutbound() {
        return todayOutbound;
    }

    public void setTodayOutbound(Long todayOutbound) {
        this.todayOutbound = todayOutbound;
    }

    public Long getMonthInbound() {
        return monthInbound;
    }

    public void setMonthInbound(Long monthInbound) {
        this.monthInbound = monthInbound;
    }

    public Long getMonthOutbound() {
        return monthOutbound;
    }

    public void setMonthOutbound(Long monthOutbound) {
        this.monthOutbound = monthOutbound;
    }

    public List<Map<String, Object>> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<Map<String, Object>> recentActivities) {
        this.recentActivities = recentActivities;
    }

    public List<Map<String, Object>> getCategoryStats() {
        return categoryStats;
    }

    public void setCategoryStats(List<Map<String, Object>> categoryStats) {
        this.categoryStats = categoryStats;
    }

    public List<Map<String, Object>> getBrandStats() {
        return brandStats;
    }

    public void setBrandStats(List<Map<String, Object>> brandStats) {
        this.brandStats = brandStats;
    }

    public Map<String, Long> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(Map<String, Long> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }
}
