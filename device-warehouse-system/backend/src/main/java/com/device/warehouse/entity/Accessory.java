package com.device.warehouse.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
