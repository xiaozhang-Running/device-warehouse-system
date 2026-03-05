package com.device.warehouse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consumable")
public class Consumable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seq_no")
    private Integer seqNo;

    @Column(name = "consumable_name", nullable = false, length = 100)
    private String consumableName;

    @Column(name = "consumable_code", unique = true, length = 50)
    private String consumableCode;

    @Column(name = "brand", length = 50)
    private String brand;

    @Column(name = "model_spec", length = 100)
    private String modelSpec;

    @Column(name = "original_quantity")
    private Integer originalQuantity;

    @Column(name = "used_quantity")
    private Integer usedQuantity;

    @Column(name = "remaining_quantity")
    private Integer remainingQuantity;

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

    @Column(name = "remark", length = 500)
    private String remark;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "images", length = 2000)
    private String images;

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
        if (originalQuantity == null) {
            originalQuantity = 0;
        }
        if (usedQuantity == null) {
            usedQuantity = 0;
        }
        if (remainingQuantity == null) {
            remainingQuantity = originalQuantity;
        }
        if (quantity == null) {
            quantity = remainingQuantity;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Default constructor
    public Consumable() {}

    // All args constructor
    public Consumable(Long id, Integer seqNo, String consumableName, String consumableCode, 
                      String brand, String modelSpec, Integer originalQuantity, Integer usedQuantity, 
                      Integer remainingQuantity, Integer quantity, String unit, String company, 
                      String location, String otherAccessories, String status, String remark, 
                      String imageUrl, String images, LocalDateTime createdAt, LocalDateTime updatedAt, 
                      String createdBy, String updatedBy) {
        this.id = id;
        this.seqNo = seqNo;
        this.consumableName = consumableName;
        this.consumableCode = consumableCode;
        this.brand = brand;
        this.modelSpec = modelSpec;
        this.originalQuantity = originalQuantity;
        this.usedQuantity = usedQuantity;
        this.remainingQuantity = remainingQuantity;
        this.quantity = quantity;
        this.unit = unit;
        this.company = company;
        this.location = location;
        this.otherAccessories = otherAccessories;
        this.status = status;
        this.remark = remark;
        this.imageUrl = imageUrl;
        this.images = images;
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

    public String getConsumableName() {
        return consumableName;
    }

    public void setConsumableName(String consumableName) {
        this.consumableName = consumableName;
    }

    public String getConsumableCode() {
        return consumableCode;
    }

    public void setConsumableCode(String consumableCode) {
        this.consumableCode = consumableCode;
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

    public Integer getOriginalQuantity() {
        return originalQuantity;
    }

    public void setOriginalQuantity(Integer originalQuantity) {
        this.originalQuantity = originalQuantity;
    }

    public Integer getUsedQuantity() {
        return usedQuantity;
    }

    public void setUsedQuantity(Integer usedQuantity) {
        this.usedQuantity = usedQuantity;
    }

    public Integer getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(Integer remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
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

    public String getImages() {
        return images;
    }

    public void setImages(String images) {
        this.images = images;
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
