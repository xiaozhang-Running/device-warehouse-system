package com.device.warehouse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "accessory")
public class Accessory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seq_no")
    private Integer seqNo;

    @Column(name = "accessory_name", nullable = false, length = 100)
    private String accessoryName;

    @Column(name = "accessory_code", unique = true, length = 50)
    private String accessoryCode;

    @Column(name = "sn_code", length = 100)
    private String snCode;

    @Column(name = "brand", length = 50)
    private String brand;

    @Column(name = "model_spec", length = 100)
    private String modelSpec;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "company", length = 100)
    private String company;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "other_accessories", length = 500)
    private String otherAccessories;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "usage_status", length = 20)
    private String usageStatus;

    @Column(name = "event_time", length = 100)
    private String eventTime;

    @Column(name = "remark", length = 500)
    private String remark;

    @Column(name = "image_url", length = 2000)
    private String imageUrl;

    @Column(name = "in_use_quantity")
    private Integer inUseQuantity;

    @Column(name = "remaining_quantity")
    private Integer remainingQuantity;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (quantity == null) {
            quantity = 1;
        }
        if (inUseQuantity == null) {
            inUseQuantity = 0;
        }
        if (remainingQuantity == null) {
            remainingQuantity = quantity;
        }
        if (status == null) {
            status = "正常";
        }
        if (usageStatus == null) {
            usageStatus = "未使用";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (quantity != null && inUseQuantity != null) {
            remainingQuantity = quantity - inUseQuantity;
        }
    }

    // Default constructor
    public Accessory() {}

    // All args constructor
    public Accessory(Long id, Integer seqNo, String accessoryName, String accessoryCode, 
                     String snCode, String brand, String modelSpec, Integer quantity, String unit, 
                     String company, String location, String otherAccessories, String status, 
                     String usageStatus, String remark, String imageUrl, Integer inUseQuantity, 
                     Integer remainingQuantity, LocalDateTime createdAt, LocalDateTime updatedAt, 
                     String createdBy, String updatedBy) {
        this.id = id;
        this.seqNo = seqNo;
        this.accessoryName = accessoryName;
        this.accessoryCode = accessoryCode;
        this.snCode = snCode;
        this.brand = brand;
        this.modelSpec = modelSpec;
        this.quantity = quantity;
        this.unit = unit;
        this.company = company;
        this.location = location;
        this.otherAccessories = otherAccessories;
        this.status = status;
        this.usageStatus = usageStatus;
        this.remark = remark;
        this.imageUrl = imageUrl;
        this.inUseQuantity = inUseQuantity;
        this.remainingQuantity = remainingQuantity;
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

    public String getAccessoryName() {
        return accessoryName;
    }

    public void setAccessoryName(String accessoryName) {
        this.accessoryName = accessoryName;
    }

    public String getAccessoryCode() {
        return accessoryCode;
    }

    public void setAccessoryCode(String accessoryCode) {
        this.accessoryCode = accessoryCode;
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

    public Integer getInUseQuantity() {
        return inUseQuantity;
    }

    public void setInUseQuantity(Integer inUseQuantity) {
        this.inUseQuantity = inUseQuantity;
    }

    public Integer getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(Integer remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
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
