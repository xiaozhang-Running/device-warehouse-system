package com.device.warehouse.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "event_date")
    @Temporal(TemporalType.DATE)
    private Date eventDate;

    @Column(name = "images", columnDefinition = "TEXT")
    private String images;

    @Column(name = "transport_method", length = 50)
    private String transportMethod;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}
