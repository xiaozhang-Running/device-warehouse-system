$csvFile = "c:\Users\Zhen\Documents\trae_projects\DEVICE\device-warehouse-system\专用计时记分设备.csv"
$url = "http://localhost:8080/api/import/csv"

try {
    $fileBytes = [System.IO.File]::ReadAllBytes($csvFile)
    $fileContent = [System.IO.File]::ReadAllText($csvFile, [System.Text.Encoding]::UTF8)
    
    $boundary = [System.Guid]::NewGuid().ToString()
    $body = "--$boundary`r`n"
    $body += "Content-Disposition: form-data; name=`"file`"; filename=`"专用计时记分设备.csv`"`r`n"
    $body += "Content-Type: text/csv`r`n`r`n"
    $body += $fileContent + "`r`n"
    $body += "--$boundary--`r`n"
    
    $response = Invoke-WebRequest -Uri $url -Method Post -Body $body -ContentType "multipart/form-data; boundary=$boundary"
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "导入成功！"
    Write-Host "成功导入: $($result.successCount) 条"
    Write-Host "失败: $($result.errorCount) 条"
    Write-Host "消息: $($result.message)"
} catch {
    Write-Host "发生错误: $_"
    Write-Host $_.Exception.Message
}