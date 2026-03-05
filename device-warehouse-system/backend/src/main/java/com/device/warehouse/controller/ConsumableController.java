package com.device.warehouse.controller;

import com.device.warehouse.dto.ApiResponse;
import com.device.warehouse.entity.Consumable;
import com.device.warehouse.service.ConsumableService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 耗材控制器
 * 提供耗材CRUD和库存管理接口
 */
@RestController
@RequestMapping("/api/consumables")
@CrossOrigin(origins = "*")
public class ConsumableController {

    private static final Logger logger = LoggerFactory.getLogger(ConsumableController.class);

    @Autowired
    private ConsumableService consumableService;

    /**
     * 获取所有耗材
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Consumable>>> getAllConsumables() {
        List<Consumable> consumables = consumableService.findAll();
        return ResponseEntity.ok(ApiResponse.success(consumables));
    }

    /**
     * 根据ID获取耗材
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Consumable>> getConsumableById(@PathVariable Long id) {
        Consumable consumable = consumableService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(consumable));
    }

    /**
     * 创建耗材
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Consumable>> createConsumable(@RequestBody Consumable consumable) {
        logger.info("创建耗材: {}", consumable.getConsumableName());
        Consumable created = consumableService.save(consumable);
        return ResponseEntity.ok(ApiResponse.success("耗材创建成功", created));
    }

    /**
     * 更新耗材
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Consumable>> updateConsumable(
            @PathVariable Long id,
            @RequestBody Consumable consumable) {
        logger.info("更新耗材: id={}", id);
        Consumable updated = consumableService.updateConsumable(id, consumable);
        return ResponseEntity.ok(ApiResponse.success("耗材更新成功", updated));
    }

    /**
     * 删除耗材
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteConsumable(@PathVariable Long id) {
        logger.info("删除耗材: id={}", id);
        consumableService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("耗材删除成功", null));
    }

    /**
     * 增加库存
     */
    @PostMapping("/{id}/increase-stock")
    public ResponseEntity<ApiResponse<Consumable>> increaseStock(
            @PathVariable Long id,
            @RequestParam int quantity) {
        logger.info("增加耗材库存: id={}, quantity={}", id, quantity);
        Consumable updated = consumableService.increaseStock(id, quantity);
        return ResponseEntity.ok(ApiResponse.success("库存增加成功", updated));
    }

    /**
     * 减少库存
     */
    @PostMapping("/{id}/decrease-stock")
    public ResponseEntity<ApiResponse<Consumable>> decreaseStock(
            @PathVariable Long id,
            @RequestParam int quantity) {
        logger.info("减少耗材库存: id={}, quantity={}", id, quantity);
        Consumable updated = consumableService.decreaseStock(id, quantity);
        return ResponseEntity.ok(ApiResponse.success("库存减少成功", updated));
    }
}
