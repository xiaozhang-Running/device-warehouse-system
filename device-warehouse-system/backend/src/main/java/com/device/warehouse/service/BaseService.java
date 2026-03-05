package com.device.warehouse.service;

import com.device.warehouse.exception.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 通用服务层基类
 * 提供CRUD基础实现
 * @param <T> 实体类型
 * @param <ID> 主键类型
 */
public abstract class BaseService<T, ID> {
    
    protected abstract JpaRepository<T, ID> getRepository();
    
    protected abstract String getEntityName();
    
    /**
     * 获取所有记录
     */
    public List<T> findAll() {
        return getRepository().findAll();
    }
    
    /**
     * 根据ID查找
     */
    public T findById(ID id) {
        return getRepository().findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(getEntityName(), "id", id));
    }
    
    /**
     * 保存实体
     */
    public T save(T entity) {
        return getRepository().save(entity);
    }
    
    /**
     * 批量保存
     */
    public List<T> saveAll(List<T> entities) {
        return getRepository().saveAll(entities);
    }
    
    /**
     * 根据ID删除
     */
    public void deleteById(ID id) {
        if (!getRepository().existsById(id)) {
            throw new ResourceNotFoundException(getEntityName(), "id", id);
        }
        getRepository().deleteById(id);
    }
    
    /**
     * 删除实体
     */
    public void delete(T entity) {
        getRepository().delete(entity);
    }
    
    /**
     * 批量删除
     */
    public void deleteAll(List<T> entities) {
        getRepository().deleteAll(entities);
    }
    
    /**
     * 统计数量
     */
    public long count() {
        return getRepository().count();
    }
    
    /**
     * 检查是否存在
     */
    public boolean existsById(ID id) {
        return getRepository().existsById(id);
    }
}
