package com.device.warehouse.repository;

import com.device.warehouse.entity.OfficeSupply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfficeSupplyRepository extends JpaRepository<OfficeSupply, Long> {
    List<OfficeSupply> findBySupplyNameContaining(String supplyName);
    List<OfficeSupply> findByCategory(String category);
    List<OfficeSupply> findByStatus(String status);
    List<OfficeSupply> findByQuantityLessThanEqual(Integer quantity);
}
