package com.device.warehouse.exception;

/**
 * 资源未找到异常
 * 用于表示请求的资源不存在
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s 不存在: %s = '%s'", resourceName, fieldName, fieldValue));
    }
}
