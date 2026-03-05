/**
 * API 请求封装
 * 统一处理HTTP请求和错误处理
 */

import axios from 'axios'
import { message } from 'antd'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      if (userData.token) {
        config.headers.Authorization = `Bearer ${userData.token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const { response } = error
    
    if (response) {
      switch (response.status) {
        case 400:
          message.error(response.data?.message || '请求参数错误')
          break
        case 401:
          message.error('未授权，请重新登录')
          localStorage.removeItem('user')
          window.location.href = '/login'
          break
        case 403:
          message.error('拒绝访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error(response.data?.message || '服务器内部错误')
          break
        default:
          message.error(response.data?.message || '网络错误')
      }
    } else {
      message.error('网络连接失败')
    }
    
    return Promise.reject(error)
  }
)

// 入库单API
export const inboundOrderApi = {
  getAll: () => api.get('/inbound-orders'),
  getById: (id) => api.get(`/inbound-orders/${id}`),
  create: (data) => api.post('/inbound-orders', data),
  update: (id, data) => api.put(`/inbound-orders/${id}`, data),
  delete: (id) => api.delete(`/inbound-orders/${id}`),
  complete: (id) => api.post(`/inbound-orders/${id}/complete`),
  cancel: (id) => api.post(`/inbound-orders/${id}/cancel`)
}

// 出库单API
export const outboundOrderApi = {
  getAll: () => api.get('/outbound-orders'),
  getById: (id) => api.get(`/outbound-orders/${id}`),
  create: (data) => api.post('/outbound-orders', data),
  update: (id, data) => api.put(`/outbound-orders/${id}`, data),
  delete: (id) => api.delete(`/outbound-orders/${id}`),
  complete: (id) => api.post(`/outbound-orders/${id}/complete`),
  cancel: (id) => api.post(`/outbound-orders/${id}/cancel`),
  transfer: (data) => api.post('/outbound-orders/transfer', data)
}

// 设备API
export const deviceApi = {
  getAll: () => api.get('/devices'),
  getById: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
  getByStatus: (status) => api.get(`/devices/status/${status}`)
}

// 通用设备API
export const accessoryApi = {
  getAll: () => api.get('/accessories'),
  getById: (id) => api.get(`/accessories/${id}`),
  create: (data) => api.post('/accessories', data),
  update: (id, data) => api.put(`/accessories/${id}`, data),
  delete: (id) => api.delete(`/accessories/${id}`)
}

// 耗材API
export const consumableApi = {
  getAll: () => api.get('/consumables'),
  getById: (id) => api.get(`/consumables/${id}`),
  create: (data) => api.post('/consumables', data),
  update: (id, data) => api.put(`/consumables/${id}`, data),
  delete: (id) => api.delete(`/consumables/${id}`)
}

// 物料API
export const materialApi = {
  getAll: () => api.get('/materials'),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`)
}

// 仓库API
export const warehouseApi = {
  getAll: () => api.get('/warehouses'),
  getById: (id) => api.get(`/warehouses/${id}`),
  create: (data) => api.post('/warehouses', data),
  update: (id, data) => api.put(`/warehouses/${id}`, data),
  delete: (id) => api.delete(`/warehouses/${id}`)
}

// 公司API
export const companyApi = {
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`)
}

// 用户API
export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data)
}

// 库存API
export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  getSummary: () => api.get('/inventory/summary'),
  getAlerts: () => api.get('/inventory/alerts')
}

// 仪表盘API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivities: () => api.get('/dashboard/recent-activities')
}

export default api
