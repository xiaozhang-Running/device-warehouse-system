package com.device.warehouse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

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

    @Column(name = "item_status", length = 20)
    private String itemStatus;

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

    @Column(name = "sn_code", length = 100)
    private String snCode;

    // Default constructor
    public InboundOrderItem() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public InboundOrder getOrder() {
        return order;
    }

    public void setOrder(InboundOrder order) {
        this.order = order;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }

    public Accessory getAccessory() {
        return accessory;
    }

    public void setAccessory(Accessory accessory) {
        this.accessory = accessory;
    }

    public Consumable getConsumable() {
        return consumable;
    }

    public void setConsumable(Consumable consumable) {
        this.consumable = consumable;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getItemStatus() {
        return itemStatus;
    }

    public void setItemStatus(String itemStatus) {
        this.itemStatus = itemStatus;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getItemCode() {
        return itemCode;
    }

    public void setItemCode(String itemCode) {
        this.itemCode = itemCode;
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

    public String getLocationStr() {
        return locationStr;
    }

    public void setLocationStr(String locationStr) {
        this.locationStr = locationStr;
    }

    public String getOtherAccessories() {
        return otherAccessories;
    }

    public void setOtherAccessories(String otherAccessories) {
        this.otherAccessories = otherAccessories;
    }

    public String getItemDetail() {
        return itemDetail;
    }

    public void setItemDetail(String itemDetail) {
        this.itemDetail = itemDetail;
    }

    public String getSnCode() {
        return snCode;
    }

    public void setSnCode(String snCode) {
        this.snCode = snCode;
    }
}
