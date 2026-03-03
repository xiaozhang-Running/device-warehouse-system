package com.device.warehouse.config;

import com.device.warehouse.entity.User;
import com.device.warehouse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("当前用户数量: " + userRepository.count());
        
        User adminUser = userRepository.findByUsername("admin");
        if (adminUser == null) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("管理员");
            admin.setEmail("admin@example.com");
            admin.setPhone("13800138000");
            admin.setRole("管理员");
            admin.setStatus("正常");
            userRepository.save(admin);
            System.out.println("创建管理员用户");
        } else {
            System.out.println("管理员用户已存在，role: " + adminUser.getRole());
            if (!"管理员".equals(adminUser.getRole())) {
                adminUser.setRole("管理员");
                userRepository.save(adminUser);
                System.out.println("修复管理员用户角色");
            }
        }
        
        User operatorUser = userRepository.findByUsername("operator");
        if (operatorUser == null) {
            User operator = new User();
            operator.setUsername("operator");
            operator.setPassword(passwordEncoder.encode("operator123"));
            operator.setName("操作员");
            operator.setEmail("operator@example.com");
            operator.setPhone("13800138001");
            operator.setRole("操作员");
            operator.setStatus("正常");
            userRepository.save(operator);
            System.out.println("创建操作员用户");
        } else {
            System.out.println("操作员用户已存在，role: " + operatorUser.getRole());
            if (!"操作员".equals(operatorUser.getRole())) {
                operatorUser.setRole("操作员");
                userRepository.save(operatorUser);
                System.out.println("修复操作员用户角色");
            }
        }
        
        User guestUser = userRepository.findByUsername("guest");
        if (guestUser == null) {
            User guest = new User();
            guest.setUsername("guest");
            guest.setPassword(passwordEncoder.encode("guest123"));
            guest.setName("游客");
            guest.setEmail("guest@example.com");
            guest.setPhone("13800138002");
            guest.setRole("游客");
            guest.setStatus("正常");
            userRepository.save(guest);
            System.out.println("创建游客用户");
        } else {
            System.out.println("游客用户已存在，role: " + guestUser.getRole());
            if (!"游客".equals(guestUser.getRole())) {
                guestUser.setRole("游客");
                userRepository.save(guestUser);
                System.out.println("修复游客用户角色");
            }
        }
        
        System.out.println("用户数据初始化完成");
    }
}