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
}
