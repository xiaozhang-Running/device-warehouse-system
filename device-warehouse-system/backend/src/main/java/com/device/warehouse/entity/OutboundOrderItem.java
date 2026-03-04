package com.device.warehouse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "outbound_order_item")
public class OutboundOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private OutboundOrder order;

    @ManyToOne
    @JoinColumn(name = "device_id")
    private Device device;

    @ManyToOne
    @JoinColumn(name = "consumable_id")
    private Consumable consumable;

    @ManyToOne
    @JoinColumn(name = "accessory_id")
    private Accessory accessory;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    @Column(name = "item_type", length = 20)
    private String itemType; // device, consumable, material

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "remark", length = 255)
    private String remark;

    // 新增字段 - 设备状况
    @Column(name = "device_condition", length = 50)
    private String deviceCondition;

    // 新增字段 - 单位
    @Column(name = "unit", length = 20)
    private String unit;

    // 新增字段 - 品牌型号（冗余存储，方便查询）
    @Column(name = "brand_model", length = 100)
    private String brandModel;
}
