package com.device.warehouse.repository;

import com.device.warehouse.entity.InboundOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InboundOrderRepository extends JpaRepository<InboundOrder, Long> {
    // 查询已完成的入库单，通过关联的出库单ID
    @Query("SELECT i FROM InboundOrder i WHERE i.relatedOutboundId = :outboundId AND i.status = 'COMPLETED'")
    List<InboundOrder> findCompletedByRelatedOutboundId(@Param("outboundId") Long outboundId);
}
