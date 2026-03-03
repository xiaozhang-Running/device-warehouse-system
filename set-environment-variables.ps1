# 环境变量设置脚本

# 设置Java环境变量
$javaHome = "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
if (Test-Path $javaHome) {
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")
    Write-Host "已设置JAVA_HOME环境变量: $javaHome"
    
    # 将Java bin目录添加到Path
    $javaBinPath = "$javaHome\bin"
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if (-not $currentPath.Contains($javaBinPath)) {
        $newPath = "$currentPath;$javaBinPath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Host "已将Java bin目录添加到Path环境变量"
    }
} else {
    Write-Host "Java安装路径不存在: $javaHome"
    Write-Host "请手动设置Java安装路径"
}

# 设置Node.js环境变量（通常安装程序会自动设置）
$nodePath = "C:\Program Files\nodejs"
if (Test-Path $nodePath) {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if (-not $currentPath.Contains($nodePath)) {
        $newPath = "$currentPath;$nodePath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Host "已将Node.js目录添加到Path环境变量"
    }
} else {
    Write-Host "Node.js安装路径不存在: $nodePath"
    Write-Host "请手动设置Node.js安装路径"
}

# 设置Maven环境变量
$mavenHome = "C:\Users\Zhen\Apache\maven"
if (Test-Path $mavenHome) {
    [Environment]::SetEnvironmentVariable("MAVEN_HOME", $mavenHome, "User")
    Write-Host "已设置MAVEN_HOME环境变量: $mavenHome"
    
    # 将Maven bin目录添加到Path
    $mavenBinPath = "$mavenHome\bin"
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if (-not $currentPath.Contains($mavenBinPath)) {
        $newPath = "$currentPath;$mavenBinPath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Host "已将Maven bin目录添加到Path环境变量"
    }
} else {
    Write-Host "Maven安装路径不存在: $mavenHome"
    Write-Host "请手动设置Maven安装路径"
}

# 设置MySQL环境变量
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.4\bin"
if (Test-Path $mysqlPath) {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if (-not $currentPath.Contains($mysqlPath)) {
        $newPath = "$currentPath;$mysqlPath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Host "已将MySQL bin目录添加到Path环境变量"
    }
} else {
    Write-Host "MySQL安装路径不存在: $mysqlPath"
    Write-Host "请手动设置MySQL安装路径"
}

Write-Host "环境变量设置完成！"
Write-Host "请重启终端后验证安装情况"
Write-Host "运行以下命令验证："
Write-Host "java -version"
Write-Host "node -v"
Write-Host "npm -v"
Write-Host "mvn -version"
Write-Host "mysql --version"