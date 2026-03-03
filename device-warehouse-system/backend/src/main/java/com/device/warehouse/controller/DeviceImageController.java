package com.device.warehouse.controller;

import com.device.warehouse.entity.DeviceImage;
import com.device.warehouse.repository.DeviceImageRepository;
import com.device.warehouse.service.DeviceImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/device-images")
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class DeviceImageController {
    @Autowired
    private DeviceImageService deviceImageService;
    
    @Autowired
    private DeviceImageRepository deviceImageRepository;

    @GetMapping("/device/{deviceName}")
    public ResponseEntity<?> getImagesByDeviceName(@PathVariable String deviceName) {
        try {
            List<DeviceImage> images = deviceImageService.getImagesByDeviceName(deviceName);
            List<Map<String, Object>> result = images.stream().map(img -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", img.getId());
                map.put("deviceName", img.getDeviceName());
                map.put("fileName", img.getFileName());
                map.put("fileType", img.getFileType());
                map.put("fileSize", img.getFileSize());
                map.put("createdAt", img.getCreatedAt());
                return map;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("获取图片列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/data")
    public ResponseEntity<?> getImageData(@PathVariable Long id) {
        try {
            DeviceImage image = deviceImageRepository.findById(id).orElse(null);
            if (image != null && image.getFileData() != null) {
                String mimeType = image.getFileType() != null ? image.getFileType() : "image/jpeg";
                return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(mimeType))
                    .body(image.getFileData());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("获取图片数据失败: " + e.getMessage());
        }
    }

    @PostMapping("/upload/{deviceName}")
    public ResponseEntity<?> uploadImage(
            @PathVariable String deviceName,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("请选择要上传的文件");
            }
            
            // 检查文件类型
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("只能上传图片文件");
            }
            
            // 检查文件大小 (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("文件大小不能超过10MB");
            }
            
            DeviceImage savedImage = deviceImageService.saveImage(deviceName, file);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "上传成功");
            result.put("id", savedImage.getId());
            result.put("fileName", savedImage.getFileName());
            
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("上传失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteImage(@PathVariable Long id) {
        try {
            deviceImageService.deleteImage(id);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "删除成功");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("删除失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/device/{deviceName}")
    public ResponseEntity<?> deleteImagesByDeviceName(@PathVariable String deviceName) {
        try {
            deviceImageService.deleteImagesByDeviceName(deviceName);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "删除成功");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("删除失败: " + e.getMessage());
        }
    }
}
