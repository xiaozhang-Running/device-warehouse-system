package com.device.warehouse.repository;

import com.device.warehouse.entity.OutboundOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutboundOrderRepository extends JpaRepository<OutboundOrder, Long> {
    List<OutboundOrder> findByEventName(String eventName);
    List<OutboundOrder> findByEventNameAndIdNot(String eventName, Long id);
}