package com.device.warehouse.repository;

import com.device.warehouse.entity.OutboundOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutboundOrderItemRepository extends JpaRepository<OutboundOrderItem, Long> {
    
    /**
     * 根据出库单ID查询明细列表（包含设备、耗材、通用设备、物料信息）
     * 
     * @param orderId 出库单ID
     * @return 出库明细列表
     */
    @Query("SELECT o FROM OutboundOrderItem o LEFT JOIN FETCH o.device LEFT JOIN FETCH o.consumable LEFT JOIN FETCH o.accessory LEFT JOIN FETCH o.material WHERE o.order.id = :orderId")
    List<OutboundOrderItem> findByOrderId(@Param("orderId") Long orderId);
}
