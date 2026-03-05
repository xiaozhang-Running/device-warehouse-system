package com.device.warehouse.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "material")
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "material_code", unique = true, nullable = false, length = 50)
    private String materialCode;

    @Column(name = "material_name", nullable = false, length = 100)
    private String materialName;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "specification", length = 100)
    private String specification;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(name = "min_quantity", precision = 12, scale = 2)
    private BigDecimal minQuantity;

    @Column(name = "max_quantity", precision = 12, scale = 2)
    private BigDecimal maxQuantity;

    @Column(name = "unit_price", precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "supplier", length = 100)
    private String supplier;

    @Column(name = "storage_location", length = 100)
    private String storageLocation;

    @Column(name = "company", length = 100)
    private String company;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "remark", length = 500)
    private String remark;

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
        if (status == null) {
            status = "在库";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Default constructor
    public Material() {}

    // All args constructor
    public Material(Long id, String materialCode, String materialName, String category, 
                    String specification, String unit, BigDecimal quantity, BigDecimal minQuantity, 
                    BigDecimal maxQuantity, BigDecimal unitPrice, String supplier, String storageLocation, 
                    String company, String status, String remark, LocalDateTime createdAt, 
                    LocalDateTime updatedAt, String createdBy, String updatedBy) {
        this.id = id;
        this.materialCode = materialCode;
        this.materialName = materialName;
        this.category = category;
        this.specification = specification;
        this.unit = unit;
        this.quantity = quantity;
        this.minQuantity = minQuantity;
        this.maxQuantity = maxQuantity;
        this.unitPrice = unitPrice;
        this.supplier = supplier;
        this.storageLocation = storageLocation;
        this.company = company;
        this.status = status;
        this.remark = remark;
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

    public String getMaterialCode() {
        return materialCode;
    }

    public void setMaterialCode(String materialCode) {
        this.materialCode = materialCode;
    }

    public String getMaterialName() {
        return materialName;
    }

    public void setMaterialName(String materialName) {
        this.materialName = materialName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSpecification() {
        return specification;
    }

    public void setSpecification(String specification) {
        this.specification = specification;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getMinQuantity() {
        return minQuantity;
    }

    public void setMinQuantity(BigDecimal minQuantity) {
        this.minQuantity = minQuantity;
    }

    public BigDecimal getMaxQuantity() {
        return maxQuantity;
    }

    public void setMaxQuantity(BigDecimal maxQuantity) {
        this.maxQuantity = maxQuantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
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
