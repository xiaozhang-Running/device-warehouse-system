package com.device.warehouse.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 设备实体类
 * 用于存储专用设备的基本信息、库存状态和使用情况
 * 
 * @author Warehouse Management System
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
