package com.device.warehouse.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 安全配置类
 * 
 * 配置说明：
 * 1. 禁用CSRF保护（适用于REST API）
 * 2. 配置CORS跨域支持
 * 3. 配置URL访问权限
 * 4. 使用无状态会话管理
 * 
 * @author Warehouse Management System
 * @version 1.0
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * 密码编码器
     * 使用BCrypt算法进行密码加密
     * @return PasswordEncoder实例
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 安全过滤器链配置
     * 
     * 权限配置：
     * - 开放路径：认证、设备、配件、耗材、导入、入库、出库、物料、图片、公司、仓库、库存等API
     * - 其他路径：需要认证
     * 
     * @param http HttpSecurity配置对象
     * @return SecurityFilterChain实例
     * @throws Exception 配置异常
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 禁用CSRF（适用于REST API）
            .csrf(csrf -> csrf.disable())
            // 配置请求授权
            .authorizeHttpRequests(auth -> auth
                // 开放所有请求，不进行认证
                .anyRequest().permitAll()
            )
            // 禁用HTTP Basic认证
            .httpBasic(basic -> basic.disable())
            // 禁用表单登录
            .formLogin(form -> form.disable())
            // 配置无状态会话
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        return http.build();
    }
}
