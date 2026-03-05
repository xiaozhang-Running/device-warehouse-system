package com.device.warehouse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

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

    // Default constructor
    public OutboundOrderItem() {}

    // All args constructor
    public OutboundOrderItem(Long id, OutboundOrder order, Device device, Consumable consumable, 
                            Accessory accessory, Material material, String itemType, Integer quantity, 
                            Long locationId, String remark, String deviceCondition, String unit, String brandModel) {
        this.id = id;
        this.order = order;
        this.device = device;
        this.consumable = consumable;
        this.accessory = accessory;
        this.material = material;
        this.itemType = itemType;
        this.quantity = quantity;
        this.locationId = locationId;
        this.remark = remark;
        this.deviceCondition = deviceCondition;
        this.unit = unit;
        this.brandModel = brandModel;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OutboundOrder getOrder() {
        return order;
    }

    public void setOrder(OutboundOrder order) {
        this.order = order;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }

    public Consumable getConsumable() {
        return consumable;
    }

    public void setConsumable(Consumable consumable) {
        this.consumable = consumable;
    }

    public Accessory getAccessory() {
        return accessory;
    }

    public void setAccessory(Accessory accessory) {
        this.accessory = accessory;
    }

    public Material getMaterial() {
        return material;
    }

    public void setMaterial(Material material) {
        this.material = material;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getDeviceCondition() {
        return deviceCondition;
    }

    public void setDeviceCondition(String deviceCondition) {
        this.deviceCondition = deviceCondition;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getBrandModel() {
        return brandModel;
    }

    public void setBrandModel(String brandModel) {
        this.brandModel = brandModel;
    }
}
