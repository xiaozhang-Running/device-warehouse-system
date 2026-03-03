package com.device.warehouse.repository;

import com.device.warehouse.entity.DeviceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface DeviceImageRepository extends JpaRepository<DeviceImage, Long> {
    List<DeviceImage> findByDeviceName(String deviceName);
    void deleteByDeviceName(String deviceName);
    
    /**
     * 批量查询多个设备的图片数量
     * 使用原生SQL提高效率，避免N+1查询问题
     * 
     * @param deviceNames 设备名称列表
     * @return 设备名称和图片数量的映射列表
     */
    @Query(value = "SELECT device_name as deviceName, COUNT(*) as count FROM device_image WHERE device_name IN :deviceNames GROUP BY device_name", nativeQuery = true)
    List<Map<String, Object>> countImagesByDeviceNames(@Param("deviceNames") List<String> deviceNames);
}
