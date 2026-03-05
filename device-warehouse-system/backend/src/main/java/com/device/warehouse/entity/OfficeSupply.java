package com.device.warehouse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "office_supply")
public class OfficeSupply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seq_no")
    private Integer seqNo;

    @Column(name = "supply_name", nullable = false, length = 100)
    private String supplyName;

    @Column(name = "supply_code", unique = true, length = 50)
    private String supplyCode;

    @Column(name = "category", length = 50)
    private String category;

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

    @Column(name = "min_stock")
    private Integer minStock;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "company", length = 100)
    private String company;

    @Column(name = "supplier", length = 100)
    private String supplier;

    @Column(name = "price")
    private Double price;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "remark", length = 500)
    private String remark;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    public OfficeSupply() {
    }

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
        if (status == null) {
            status = "在库";
        }
        if (minStock == null) {
            minStock = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

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

    public String getSupplyName() {
        return supplyName;
    }

    public void setSupplyName(String supplyName) {
        this.supplyName = supplyName;
    }

    public String getSupplyCode() {
        return supplyCode;
    }

    public void setSupplyCode(String supplyCode) {
        this.supplyCode = supplyCode;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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

    public Integer getMinStock() {
        return minStock;
    }

    public void setMinStock(Integer minStock) {
        this.minStock = minStock;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
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
