package com.device.warehouse.entity;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "outbound_order")
public class OutboundOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", unique = true, nullable = false, length = 50)
    private String orderCode;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @Column(name = "order_date", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date orderDate;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @ManyToOne
    @JoinColumn(name = "operator_id")
    private User operator;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OutboundOrderItem> items;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    // 新增字段 - 借用单位信息
    @Column(name = "company_name", length = 200)
    private String companyName;

    @Column(name = "contact_person", length = 50)
    private String contactPerson;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    // 新增字段 - 签字信息
    @Column(name = "handled_by", length = 50)
    private String handledBy;

    @Column(name = "dept_approver", length = 50)
    private String deptApprover;

    @Column(name = "warehouse_keeper", length = 50)
    private String warehouseKeeper;

    // 新增字段 - 借用信息
    @Column(name = "borrow_purpose", length = 200)
    private String borrowPurpose;

    @Column(name = "borrow_days")
    private Integer borrowDays;

    @Column(name = "return_date")
    @Temporal(TemporalType.DATE)
    private Date returnDate;

    // 新增字段 - 领用信息（按照表格格式）
    @Column(name = "usage_type", length = 100)
    private String usageType;

    @Column(name = "recipient_name", length = 50)
    private String recipientName;

    @Column(name = "event_name", length = 200)
    private String eventName;

    @Column(name = "usage_location", length = 100)
    private String usageLocation;

    @Column(name = "event_date", length = 100)
    private String eventDate;

    @Column(name = "images", columnDefinition = "LONGTEXT")
    private String images;

    @Column(name = "transport_method", length = 50)
    private String transportMethod;

    // 新增字段 - 出库单类型
    @Column(name = "order_type", length = 50)
    private String orderType; // PROJECT_OUTBOUND, MATERIAL_OUTBOUND

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    // Default constructor
    public OutboundOrder() {}

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

    public User getRecipient() {
        return recipient;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getOperator() {
        return operator;
    }

    public void setOperator(User operator) {
        this.operator = operator;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public List<OutboundOrderItem> getItems() {
        return items;
    }

    public void setItems(List<OutboundOrderItem> items) {
        this.items = items;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getHandledBy() {
        return handledBy;
    }

    public void setHandledBy(String handledBy) {
        this.handledBy = handledBy;
    }

    public String getDeptApprover() {
        return deptApprover;
    }

    public void setDeptApprover(String deptApprover) {
        this.deptApprover = deptApprover;
    }

    public String getWarehouseKeeper() {
        return warehouseKeeper;
    }

    public void setWarehouseKeeper(String warehouseKeeper) {
        this.warehouseKeeper = warehouseKeeper;
    }

    public String getBorrowPurpose() {
        return borrowPurpose;
    }

    public void setBorrowPurpose(String borrowPurpose) {
        this.borrowPurpose = borrowPurpose;
    }

    public Integer getBorrowDays() {
        return borrowDays;
    }

    public void setBorrowDays(Integer borrowDays) {
        this.borrowDays = borrowDays;
    }

    public Date getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(Date returnDate) {
        this.returnDate = returnDate;
    }

    public String getUsageType() {
        return usageType;
    }

    public void setUsageType(String usageType) {
        this.usageType = usageType;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getUsageLocation() {
        return usageLocation;
    }

    public void setUsageLocation(String usageLocation) {
        this.usageLocation = usageLocation;
    }

    public String getEventDate() {
        return eventDate;
    }

    public void setEventDate(String eventDate) {
        this.eventDate = eventDate;
    }

    public String getImages() {
        return images;
    }

    public void setImages(String images) {
        this.images = images;
    }

    public String getTransportMethod() {
        return transportMethod;
    }

    public void setTransportMethod(String transportMethod) {
        this.transportMethod = transportMethod;
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }
}
