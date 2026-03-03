package com.device.warehouse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "inbound_order_item")
public class InboundOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private InboundOrder order;

    @ManyToOne
    @JoinColumn(name = "device_id")
    private Device device;

    @ManyToOne
    @JoinColumn(name = "accessory_id")
    private Accessory accessory;

    @ManyToOne
    @JoinColumn(name = "consumable_id")
    private Consumable consumable;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "remark", length = 255)
    private String remark;

    // 物品明细字段（用于新采购入库，完成入库前设备未创建）
    @Column(name = "item_type", length = 20)
    private String itemType;

    @Column(name = "item_name", length = 100)
    private String itemName;

    @Column(name = "item_code", length = 50)
    private String itemCode;

    @Column(name = "brand", length = 50)
    private String brand;

    @Column(name = "model_spec", length = 100)
    private String modelSpec;

    @Column(name = "unit", length = 10)
    private String unit;

    @Column(name = "company", length = 100)
    private String company;

    @Column(name = "location", length = 100)
    private String locationStr;

    @Column(name = "other_accessories", length = 500)
    private String otherAccessories;

    @Column(name = "item_detail", length = 1000)
    private String itemDetail;
}