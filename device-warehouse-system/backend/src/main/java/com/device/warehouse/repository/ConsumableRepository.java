package com.device.warehouse.repository;

import com.device.warehouse.entity.Consumable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 耗材数据访问接口
 */
@Repository
public interface ConsumableRepository extends JpaRepository<Consumable, Long> {
    
    /**
     * 根据耗材编码查找
     */
    Optional<Consumable> findByConsumableCode(String consumableCode);
    
    /**
     * 根据名称、品牌、型号查找耗材
     */
    Optional<Consumable> findByConsumableNameAndBrandAndModelSpec(String consumableName, String brand, String modelSpec);
}
