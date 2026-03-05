package com.device.warehouse.dto;

public class InventorySummaryDTO {
    private String deviceName;
    private String brand;
    private String category;
    private Integer totalQuantity;
    private Integer inUseQuantity;
    private Integer unusedQuantity;
    private Integer minQuantity;
    private Integer maxQuantity;
    private String unit;
    private String status;
    private Boolean isWarning;

    // Default constructor
    public InventorySummaryDTO() {}

    // All args constructor
    public InventorySummaryDTO(String deviceName, String brand, String category, 
                             Integer totalQuantity, Integer inUseQuantity, Integer unusedQuantity, 
                             Integer minQuantity, Integer maxQuantity, String unit, 
                             String status, Boolean isWarning) {
        this.deviceName = deviceName;
        this.brand = brand;
        this.category = category;
        this.totalQuantity = totalQuantity;
        this.inUseQuantity = inUseQuantity;
        this.unusedQuantity = unusedQuantity;
        this.minQuantity = minQuantity;
        this.maxQuantity = maxQuantity;
        this.unit = unit;
        this.status = status;
        this.isWarning = isWarning;
    }

    // Getters and Setters
    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public Integer getInUseQuantity() {
        return inUseQuantity;
    }

    public void setInUseQuantity(Integer inUseQuantity) {
        this.inUseQuantity = inUseQuantity;
    }

    public Integer getUnusedQuantity() {
        return unusedQuantity;
    }

    public void setUnusedQuantity(Integer unusedQuantity) {
        this.unusedQuantity = unusedQuantity;
    }

    public Integer getMinQuantity() {
        return minQuantity;
    }

    public void setMinQuantity(Integer minQuantity) {
        this.minQuantity = minQuantity;
    }

    public Integer getMaxQuantity() {
        return maxQuantity;
    }

    public void setMaxQuantity(Integer maxQuantity) {
        this.maxQuantity = maxQuantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsWarning() {
        return isWarning;
    }

    public void setIsWarning(Boolean isWarning) {
        this.isWarning = isWarning;
    }
}
