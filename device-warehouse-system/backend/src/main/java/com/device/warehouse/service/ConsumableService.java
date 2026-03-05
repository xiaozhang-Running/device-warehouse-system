package com.device.warehouse.service;

import com.device.warehouse.entity.Consumable;
import com.device.warehouse.exception.BusinessException;
import com.device.warehouse.repository.ConsumableRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 耗材服务类
 * 提供耗材的CRUD操作和库存管理
 */
@Service
public class ConsumableService extends BaseService<Consumable, Long> {

    private static final Logger logger = LoggerFactory.getLogger(ConsumableService.class);

    @Autowired
    private ConsumableRepository consumableRepository;

    @Override
    protected JpaRepository<Consumable, Long> getRepository() {
        return consumableRepository;
    }

    @Override
    protected String getEntityName() {
        return "耗材";
    }

    /**
     * 根据耗材编码查找
     */
    public Consumable findByConsumableCode(String consumableCode) {
        return consumableRepository.findByConsumableCode(consumableCode).orElse(null);
    }

    /**
     * 根据名称、品牌、型号查找耗材
     */
    public Consumable findByNameBrandModel(String consumableName, String brand, String modelSpec) {
        return consumableRepository.findByConsumableNameAndBrandAndModelSpec(consumableName, brand, modelSpec)
                .orElse(null);
    }

    /**
     * 创建耗材
     */
    @Override
    @Transactional
    public Consumable save(Consumable consumable) {
        // 验证耗材编码唯一性
        if (consumable.getId() == null) {
            consumableRepository.findByConsumableCode(consumable.getConsumableCode())
                    .ifPresent(existing -> {
                        throw new BusinessException("耗材编码 '" + consumable.getConsumableCode() + "' 已存在");
                    });
            consumable.setCreatedAt(LocalDateTime.now());
        }
        consumable.setUpdatedAt(LocalDateTime.now());

        Consumable savedConsumable = super.save(consumable);
        logger.info("耗材已保存: {} ({})", savedConsumable.getConsumableName(), savedConsumable.getConsumableCode());
        return savedConsumable;
    }

    /**
     * 更新耗材
     */
    @Transactional
    public Consumable updateConsumable(Long id, Consumable consumable) {
        Consumable existingConsumable = findById(id);

        // 如果修改了耗材编码，检查新编码是否已存在
        if (!existingConsumable.getConsumableCode().equals(consumable.getConsumableCode())) {
            consumableRepository.findByConsumableCode(consumable.getConsumableCode())
                    .ifPresent(c -> {
                        if (!c.getId().equals(id)) {
                            throw new BusinessException("耗材编码 '" + consumable.getConsumableCode() + "' 已存在");
                        }
                    });
        }

        // 更新字段
        existingConsumable.setSeqNo(consumable.getSeqNo());
        existingConsumable.setConsumableName(consumable.getConsumableName());
        existingConsumable.setConsumableCode(consumable.getConsumableCode());
        existingConsumable.setBrand(consumable.getBrand());
        existingConsumable.setModelSpec(consumable.getModelSpec());
        existingConsumable.setQuantity(consumable.getQuantity());
        existingConsumable.setRemainingQuantity(consumable.getRemainingQuantity());
        existingConsumable.setUsedQuantity(consumable.getUsedQuantity());
        existingConsumable.setUnit(consumable.getUnit());
        existingConsumable.setCompany(consumable.getCompany());
        existingConsumable.setLocation(consumable.getLocation());
        existingConsumable.setImageUrl(consumable.getImageUrl());
        existingConsumable.setImages(consumable.getImages());
        existingConsumable.setRemark(consumable.getRemark());
        existingConsumable.setUpdatedAt(LocalDateTime.now());

        Consumable updatedConsumable = super.save(existingConsumable);
        logger.info("耗材已更新: {} ({})", updatedConsumable.getConsumableName(), updatedConsumable.getConsumableCode());
        return updatedConsumable;
    }

    /**
     * 删除耗材
     */
    @Override
    @Transactional
    public void deleteById(Long id) {
        Consumable consumable = findById(id);
        super.deleteById(id);
        logger.info("耗材已删除: {} ({})", consumable.getConsumableName(), consumable.getConsumableCode());
    }

    /**
     * 增加耗材库存
     */
    @Transactional
    public Consumable increaseStock(Long id, int quantity) {
        Consumable consumable = findById(id);
        int currentQuantity = consumable.getQuantity() != null ? consumable.getQuantity() : 0;
        int currentRemaining = consumable.getRemainingQuantity() != null ? consumable.getRemainingQuantity() : 0;

        consumable.setQuantity(currentQuantity + quantity);
        consumable.setRemainingQuantity(currentRemaining + quantity);
        consumable.setUpdatedAt(LocalDateTime.now());

        Consumable updatedConsumable = super.save(consumable);
        logger.info("耗材库存增加: {} ({}), 增加数量: {}, 当前库存: {}",
                updatedConsumable.getConsumableName(), updatedConsumable.getConsumableCode(),
                quantity, updatedConsumable.getQuantity());
        return updatedConsumable;
    }

    /**
     * 减少耗材库存
     */
    @Transactional
    public Consumable decreaseStock(Long id, int quantity) {
        Consumable consumable = findById(id);
        int currentRemaining = consumable.getRemainingQuantity() != null ? consumable.getRemainingQuantity() : 0;
        int currentUsed = consumable.getUsedQuantity() != null ? consumable.getUsedQuantity() : 0;

        if (currentRemaining < quantity) {
            throw new BusinessException("耗材 '" + consumable.getConsumableName() + "' 库存不足，当前库存: " + currentRemaining);
        }

        consumable.setRemainingQuantity(currentRemaining - quantity);
        consumable.setUsedQuantity(currentUsed + quantity);
        consumable.setUpdatedAt(LocalDateTime.now());

        Consumable updatedConsumable = super.save(consumable);
        logger.info("耗材库存减少: {} ({}), 减少数量: {}, 当前库存: {}",
                updatedConsumable.getConsumableName(), updatedConsumable.getConsumableCode(),
                quantity, updatedConsumable.getRemainingQuantity());
        return updatedConsumable;
    }
}
