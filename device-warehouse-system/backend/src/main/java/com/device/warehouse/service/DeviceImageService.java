package com.device.warehouse.service;

import com.device.warehouse.entity.DeviceImage;
import com.device.warehouse.repository.DeviceImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Service
@SuppressWarnings("null")
public class DeviceImageService {
    @Autowired
    private DeviceImageRepository deviceImageRepository;

    public List<DeviceImage> getImagesByDeviceName(String deviceName) {
        return deviceImageRepository.findByDeviceName(deviceName);
    }

    public DeviceImage saveImage(String deviceName, MultipartFile file) throws IOException {
        DeviceImage image = new DeviceImage();
        image.setDeviceName(deviceName);
        image.setFileName(file.getOriginalFilename());
        image.setFileType(file.getContentType());
        image.setFileSize(file.getSize());
        image.setFileData(file.getBytes());
        return deviceImageRepository.save(image);
    }

    public void deleteImage(Long id) {
        deviceImageRepository.deleteById(id);
    }

    public void deleteImagesByDeviceName(String deviceName) {
        deviceImageRepository.deleteByDeviceName(deviceName);
    }

    public String getImageBase64(Long id) {
        DeviceImage image = deviceImageRepository.findById(id).orElse(null);
        if (image != null && image.getFileData() != null) {
            return Base64.getEncoder().encodeToString(image.getFileData());
        }
        return null;
    }
}
