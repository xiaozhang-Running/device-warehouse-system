package com.device.warehouse.repository;

import com.device.warehouse.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 设备数据访问接口
 * 
 * @author Warehouse Management System
 * @version 1.0
 */
@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    
    /**
     * 根据条件筛选设备
     * 支持按设备名称、品牌、状态、使用状态筛选
     * 
     * @param deviceName 设备名称（模糊查询）
     * @param brand 品牌（模糊查询）
     * @param status 状态
     * @param usageStatus 使用状态
     * @return 符合条件的设备列表
     */
    @Query("SELECT d FROM Device d WHERE " +
           "(:deviceName IS NULL OR d.deviceName LIKE %:deviceName%) AND " +
           "(:brand IS NULL OR d.brand LIKE %:brand%) AND " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:usageStatus IS NULL OR d.usageStatus = :usageStatus)")
    List<Device> findByFilters(@Param("deviceName") String deviceName,
                               @Param("brand") String brand,
                               @Param("status") String status,
                               @Param("usageStatus") String usageStatus);

    /**
     * 查询设备名称为空的设备
     * @return 设备列表
     */
    @Query("SELECT d FROM Device d WHERE d.deviceName IS NULL OR d.deviceName = ''")
    List<Device> findByEmptyDeviceName();

    /**
     * 查询最大全局序号
     * @return 最大序号
     */
    @Query("SELECT MAX(d.seqNo) FROM Device d")
    Integer findMaxSeqNo();
}
