package com.device.warehouse.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inbound_order")
public class InboundOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", unique = true, nullable = false, length = 50)
    private String orderCode;

    @Column(name = "supplier", length = 100)
    private String supplier;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "expected_date")
    private LocalDateTime expectedDate;

    @Column(name = "actual_date")
    private LocalDateTime actualDate;

    @Column(name = "total_quantity")
    private Integer totalQuantity;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "operator", length = 50)
    private String operator;

    @Column(name = "inbound_type", length = 20)
    private String inboundType;

    @Column(name = "device_type", length = 20)
    private String deviceType;

    @Column(name = "receiver", length = 50)
    private String receiver;

    @Column(name = "receiver_phone", length = 20)
    private String receiverPhone;

    @Column(name = "remark", length = 500)
    private String remark;

    @Column(name = "related_outbound_id")
    private Long relatedOutboundId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    @OneToMany(mappedBy = "order")
    private List<InboundOrderItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Default constructor
    public InboundOrder() {}

    // All args constructor
    public InboundOrder(Long id, String orderCode, String supplier, LocalDateTime orderDate, 
                       LocalDateTime expectedDate, LocalDateTime actualDate, Integer totalQuantity, 
                       BigDecimal totalAmount, String status, String operator, String inboundType, 
                       String deviceType, String receiver, String receiverPhone, String remark, 
                       Long relatedOutboundId, LocalDateTime createdAt, LocalDateTime updatedAt, 
                       String createdBy, String updatedBy, List<InboundOrderItem> items) {
        this.id = id;
        this.orderCode = orderCode;
        this.supplier = supplier;
        this.orderDate = orderDate;
        this.expectedDate = expectedDate;
        this.actualDate = actualDate;
        this.totalQuantity = totalQuantity;
        this.totalAmount = totalAmount;
        this.status = status;
        this.operator = operator;
        this.inboundType = inboundType;
        this.deviceType = deviceType;
        this.receiver = receiver;
        this.receiverPhone = receiverPhone;
        this.remark = remark;
        this.relatedOutboundId = relatedOutboundId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.items = items;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDateTime getExpectedDate() {
        return expectedDate;
    }

    public void setExpectedDate(LocalDateTime expectedDate) {
        this.expectedDate = expectedDate;
    }

    public LocalDateTime getActualDate() {
        return actualDate;
    }

    public void setActualDate(LocalDateTime actualDate) {
        this.actualDate = actualDate;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getInboundType() {
        return inboundType;
    }

    public void setInboundType(String inboundType) {
        this.inboundType = inboundType;
    }

    public String getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }

    public String getReceiver() {
        return receiver;
    }

    public void setReceiver(String receiver) {
        this.receiver = receiver;
    }

    public String getReceiverPhone() {
        return receiverPhone;
    }

    public void setReceiverPhone(String receiverPhone) {
        this.receiverPhone = receiverPhone;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public Long getRelatedOutboundId() {
        return relatedOutboundId;
    }

    public void setRelatedOutboundId(Long relatedOutboundId) {
        this.relatedOutboundId = relatedOutboundId;
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

    public List<InboundOrderItem> getItems() {
        return items;
    }

    public void setItems(List<InboundOrderItem> items) {
        this.items = items;
    }
}
