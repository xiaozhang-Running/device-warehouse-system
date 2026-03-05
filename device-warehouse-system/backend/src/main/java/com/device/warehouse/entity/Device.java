package com.device.warehouse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 设备实体类
 * 用于存储专用设备的基本信息、库存状态和使用情况
 * 
 * @author Warehouse Management System
 * @version 1.0
 */
@Entity
@Table(name = "device")
public class Device {
    
    /** 设备唯一标识ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 序号，用于排序和展示 */
    @Column(name = "seq_no")
    private Integer seqNo;

    /** 设备名称 */
    @Column(name = "device_name", nullable = false, length = 100)
    private String deviceName;

    /** 设备编码，唯一标识 */
    @Column(name = "device_code", unique = true, nullable = false, length = 50)
    private String deviceCode;

    /** SN序列号 */
    @Column(name = "sn_code", length = 100)
    private String snCode;

    /** 品牌 */
    @Column(name = "brand", length = 50)
    private String brand;

    /** 型号规格 */
    @Column(name = "model_spec", length = 100)
    private String modelSpec;

    /** 数量 */
    @Column(name = "quantity")
    private Integer quantity;

    /** 单位（个、台、套等） */
    @Column(name = "unit", length = 20)
    private String unit;

    /** 其他配件信息 */
    @Column(name = "other_accessories", length = 500)
    private String otherAccessories;

    /** 状态（正常、维修中、报废等） */
    @Column(name = "status", length = 20)
    private String status;

    /** 使用状态（使用中、未使用） */
    @Column(name = "usage_status", length = 20)
    private String usageStatus;

    /** 赛事时间信息（出库时设置，格式：YYYY-MM-DD 至 YYYY-MM-DD） */
    @Column(name = "event_time", length = 100)
    private String eventTime;

    /** 所属公司 */
    @Column(name = "company", length = 100)
    private String company;

    /** 存放位置 */
    @Column(name = "location", length = 100)
    private String location;

    /** 备注 */
    @Column(name = "remark", length = 500)
    private String remark;

    /** 图片URL */
    @Column(name = "image_url", length = 2000)
    private String imageUrl;

    /** 图片数量（非持久化字段） */
    @Transient
    private Integer imageCount;

    /** 创建时间 */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /** 更新时间 */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** 创建人 */
    @Column(name = "created_by", length = 50)
    private String createdBy;

    /** 更新人 */
    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    /**
     * 实体创建前的回调方法
     * 自动设置创建时间、更新时间、默认数量和状态
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (quantity == null) {
            quantity = 1;
        }
        if (status == null) {
            status = "正常";
        }
        if (usageStatus == null) {
            usageStatus = "未使用";
        }
    }

    /**
     * 实体更新前的回调方法
     * 自动更新更新时间
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Default constructor
    public Device() {}

    // All args constructor
    public Device(Long id, Integer seqNo, String deviceName, String deviceCode, String snCode, 
                  String brand, String modelSpec, Integer quantity, String unit, String otherAccessories, 
                  String status, String usageStatus, String company, String location, String remark, 
                  String imageUrl, Integer imageCount, LocalDateTime createdAt, LocalDateTime updatedAt, 
                  String createdBy, String updatedBy) {
        this.id = id;
        this.seqNo = seqNo;
        this.deviceName = deviceName;
        this.deviceCode = deviceCode;
        this.snCode = snCode;
        this.brand = brand;
        this.modelSpec = modelSpec;
        this.quantity = quantity;
        this.unit = unit;
        this.otherAccessories = otherAccessories;
        this.status = status;
        this.usageStatus = usageStatus;
        this.company = company;
        this.location = location;
        this.remark = remark;
        this.imageUrl = imageUrl;
        this.imageCount = imageCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getSeqNo() {
        return seqNo;
    }

    public void setSeqNo(Integer seqNo) {
        this.seqNo = seqNo;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getDeviceCode() {
        return deviceCode;
    }

    public void setDeviceCode(String deviceCode) {
        this.deviceCode = deviceCode;
    }

    public String getSnCode() {
        return snCode;
    }

    public void setSnCode(String snCode) {
        this.snCode = snCode;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModelSpec() {
        return modelSpec;
    }

    public void setModelSpec(String modelSpec) {
        this.modelSpec = modelSpec;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getOtherAccessories() {
        return otherAccessories;
    }

    public void setOtherAccessories(String otherAccessories) {
        this.otherAccessories = otherAccessories;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUsageStatus() {
        return usageStatus;
    }

    public void setUsageStatus(String usageStatus) {
        this.usageStatus = usageStatus;
    }

    public String getEventTime() {
        return eventTime;
    }

    public void setEventTime(String eventTime) {
        this.eventTime = eventTime;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getImageCount() {
        return imageCount;
    }

    public void setImageCount(Integer imageCount) {
        this.imageCount = imageCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}
