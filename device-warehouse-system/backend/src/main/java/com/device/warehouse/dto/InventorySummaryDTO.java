package com.device.warehouse.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventorySummaryDTO {
    private String deviceName;
    private String brand;
    private String category;
    private Integer totalQuantity;
    private Integer inUseQuantity;
    private Integer unusedQuantity;
    private Integer minQuantity;
    private Integer maxQuantity;
    private String unit;
    private String status;
    private Boolean isWarning;
}
