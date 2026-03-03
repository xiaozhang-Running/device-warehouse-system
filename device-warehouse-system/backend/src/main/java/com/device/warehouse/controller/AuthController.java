package com.device.warehouse.controller;

import com.device.warehouse.entity.User;
import com.device.warehouse.service.AuthService;
import com.device.warehouse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/fix-users")
    public ResponseEntity<?> fixUsers() {
        try {
            User adminUser = userRepository.findByUsername("admin");
            if (adminUser != null && !"管理员".equals(adminUser.getRole())) {
                adminUser.setRole("管理员");
                userRepository.save(adminUser);
                System.out.println("修复管理员用户角色");
            }

            User operatorUser = userRepository.findByUsername("operator");
            if (operatorUser != null && !"操作员".equals(operatorUser.getRole())) {
                operatorUser.setRole("操作员");
                userRepository.save(operatorUser);
                System.out.println("修复操作员用户角色");
            }

            User guestUser = userRepository.findByUsername("guest");
            if (guestUser != null && !"游客".equals(guestUser.getRole())) {
                guestUser.setRole("游客");
                userRepository.save(guestUser);
                System.out.println("修复游客用户角色");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "用户角色修复完成");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            System.out.println("收到登录请求: " + loginRequest);
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");
            
            System.out.println("尝试登录用户: " + username);
            User user = authService.login(username, password);
            
            if (user != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "登录成功");
                
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("username", user.getUsername());
                userData.put("name", user.getName());
                userData.put("email", user.getEmail());
                userData.put("phone", user.getPhone());
                userData.put("role", user.getRole());
                userData.put("status", user.getStatus());
                
                response.put("user", userData);
                System.out.println("登录成功: " + username + ", 角色: " + user.getRole());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "用户名或密码错误");
                System.out.println("登录失败: " + username);
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
            System.out.println("登录异常: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "登录失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}