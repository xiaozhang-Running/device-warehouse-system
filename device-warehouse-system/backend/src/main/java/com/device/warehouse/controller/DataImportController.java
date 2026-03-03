package com.device.warehouse.controller;

import com.device.warehouse.entity.Device;
import com.device.warehouse.service.DeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/import")
@CrossOrigin(origins = "*")
public class DataImportController {

    @Autowired
    private DeviceService deviceService;

    @PostMapping("/csv")
    public ResponseEntity<?> importFromCSV(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("收到CSV文件上传请求: " + file.getOriginalFilename());
            
            if (file.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "文件为空");
                return ResponseEntity.badRequest().body(response);
            }

            BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)
            );

            String line;
            int successCount = 0;
            int errorCount = 0;
            boolean isHeader = true;

            while ((line = reader.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                try {
                    String[] fields = line.split(",");
                    if (fields.length >= 3) {
                        Device device = new Device();
                        
                        if (fields.length > 0 && !fields[0].trim().isEmpty()) {
                            try {
                                device.setSeqNo(Integer.parseInt(fields[0].trim().replace("\"", "")));
                            } catch (NumberFormatException e) {
                            }
                        }
                        if (fields.length > 1) device.setDeviceName(fields[1].trim().replace("\"", ""));
                        if (fields.length > 2) device.setDeviceCode(fields[2].trim().replace("\"", ""));
                        if (fields.length > 3) device.setSnCode(fields[3].trim().replace("\"", ""));
                        if (fields.length > 4) device.setBrand(fields[4].trim().replace("\"", ""));
                        if (fields.length > 5) device.setModelSpec(fields[5].trim().replace("\"", ""));
                        if (fields.length > 6) {
                            try {
                                device.setQuantity(Integer.parseInt(fields[6].trim().replace("\"", "")));
                            } catch (NumberFormatException e) {
                                device.setQuantity(1);
                            }
                        }
                        if (fields.length > 7) device.setUnit(fields[7].trim().replace("\"", ""));
                        if (fields.length > 8) device.setOtherAccessories(fields[8].trim().replace("\"", ""));
                        if (fields.length > 9) device.setStatus(fields[9].trim().replace("\"", ""));
                        if (fields.length > 10) device.setUsageStatus(fields[10].trim().replace("\"", ""));
                        if (fields.length > 11) device.setRemark(fields[11].trim().replace("\"", ""));
                        if (fields.length > 12) device.setImageUrl(fields[12].trim().replace("\"", ""));
                        
                        deviceService.createDevice(device);
                        successCount++;
                    }
                } catch (Exception e) {
                    System.out.println("处理行数据时出错: " + line + ", 错误: " + e.getMessage());
                    errorCount++;
                }
            }

            reader.close();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "数据导入完成");
            response.put("successCount", successCount);
            response.put("errorCount", errorCount);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("导入CSV文件时出错: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "导入失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}