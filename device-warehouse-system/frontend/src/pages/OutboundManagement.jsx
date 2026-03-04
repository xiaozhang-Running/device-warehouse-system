import React, { useState, useEffect, useRef } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Popconfirm, Row, Col, Divider, InputNumber, Descriptions, List, Upload, Image } from 'antd'
import { CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, PrinterOutlined, SearchOutlined, DoubleRightOutlined, PlusCircleOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

function OutboundManagement() {
  const navigate = useNavigate()
  const [outboundOrders, setOutboundOrders] = useState([])
  const [devices, setDevices] = useState([])
  const [allDevices, setAllDevices] = useState([])
  const [users, setUsers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [form] = Form.useForm()
  const [items, setItems] = useState([])
  const [searchText, setSearchText] = useState('') // 设备类型筛选
  const [selectedType, setSelectedType] = useState('') // 设备类型筛选
  const [currentUser, setCurrentUser] = useState(null)
  const [images, setImages] = useState([])
  const [devicePagination, setDevicePagination] = useState({ current: 1, pageSize: 10 })
  const [deviceDetailVisible, setDeviceDetailVisible] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [deviceSingleDetailVisible, setDeviceSingleDetailVisible] = useState(false) // 单个设备详情弹窗
  const [deviceSummaryList, setDeviceSummaryList] = useState([]) // 设备汇总列表
  const [selectedDeviceModel, setSelectedDeviceModel] = useState(null) // 当前选中的设备型号
  const [deviceVariants, setDeviceVariants] = useState([]) // 当前型号的所有设备
  const [deviceVariantSearchText, setDeviceVariantSearchText] = useState('') // 设备变体搜索文本
  const processingFilesRef = useRef(new Set()) // 跟踪正在处理的文件

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
      console.log('从localStorage加载用户信息:', user)
    } else {
      console.log('localStorage中没有用户信息')
      // 模拟用户信息，用于测试
      const mockUser = { id: 1, username: 'admin', name: '管理员', role: '管理员' }
      setCurrentUser(mockUser)
      console.log('使用模拟用户信息:', mockUser)
    }
    fetchOrders()
    fetchDevices()
    fetchUsers()
  }, [])

  // 获取出库单列表
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/outbound')
      const data = await response.json()
      setOutboundOrders(data)
    } catch (error) {
      console.error('获取出库单列表失败:', error)
      message.error('获取出库单列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取所有类型的未使用设备列表（项目出库 - 不包含物料）
  const fetchDevices = async () => {
    try {
      // 同时获取所有类型的设备（项目出库不包含物料）
      const [devicesRes, accessoriesRes, consumablesRes] = await Promise.all([
        fetch('/api/devices').then(res => res.json()).catch(() => []),
        fetch('/api/accessories').then(res => res.json()).catch(() => []),
        fetch('/api/consumables').then(res => res.json()).catch(() => [])
      ])

      // 为每种设备类型添加类型标识，并筛选可用的设备
      // 专用设备：筛选未使用的（包括空字符串和'未使用'）
      const devicesWithType = devicesRes
        .filter(d => !d.usageStatus || d.usageStatus === '未使用')
        .map(d => ({ 
          ...d, 
          itemType: '专用设备',
          deviceName: d.deviceName,
          deviceCode: d.deviceCode,
          brand: d.brand,
          model: d.model,
          specification: d.specification
        }))
      
      // 通用设备：筛选剩余数量大于0的
      const accessoriesWithType = accessoriesRes
        .filter(a => (a.remainingQuantity || 0) > 0)
        .map(a => ({ 
          ...a, 
          itemType: '通用设备',
          deviceName: a.accessoryName,
          deviceCode: a.accessoryCode || a.seqNo?.toString() || '',
          brand: a.brand,
          model: a.modelSpec,
          specification: a.modelSpec
        }))
      
      // 耗材：筛选数量大于0的（Consumable没有remainingQuantity字段）
      const consumablesWithType = consumablesRes
        .filter(c => (c.quantity || 0) > 0)
        .map(c => ({ 
          ...c, 
          itemType: '耗材',
          deviceName: c.consumableName,
          deviceCode: c.consumableCode || c.seqNo?.toString() || '',
          brand: c.brand,
          model: c.modelSpec,
          specification: c.modelSpec
        }))

      // 合并所有可用的设备（项目出库不包含物料）
      const allItems = [
        ...devicesWithType,
        ...accessoriesWithType,
        ...consumablesWithType
      ]

      setAllDevices(allItems)
      setDevices(allItems)
      
      // 生成设备汇总列表（按设备型号分组）
      generateDeviceSummary(allItems)
    } catch (error) {
      console.error('获取设备列表失败:', error)
    }
  }

  // 生成设备汇总列表（按设备型号分组）
  const generateDeviceSummary = (allDevices) => {
    // 按设备名称、品牌、型号分组
    const deviceMap = new Map()
    
    allDevices.forEach(device => {
      const key = `${device.deviceName}-${device.brand}-${device.model}`
      if (!deviceMap.has(key)) {
        deviceMap.set(key, {
          deviceName: device.deviceName,
          brand: device.brand,
          model: device.model,
          itemType: device.itemType,
          unit: device.unit || (device.itemType === '耗材' ? '个' : device.itemType === '通用设备' ? '套' : '台'),
          count: 0,
          variants: []
        })
      }
      
      const summary = deviceMap.get(key)
      // 对于耗材，按实际数量统计
      if (device.itemType === '耗材') {
        summary.count += device.remainingQuantity || device.quantity || 1
      } else {
        summary.count++
      }
      summary.variants.push(device)
    })
    
    // 转换为数组并排序
    const summaryList = Array.from(deviceMap.values()).sort((a, b) => b.count - a.count)
    setDeviceSummaryList(summaryList)
  }

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    }
  }

  // 打开创建出库单弹窗
  const handleAdd = () => {
    setItems([])
    setSearchText('')
    setSelectedType('') // 重置设备类型筛选
    setImages([])
    // 显示所有设备（因为items为空，所以不需要过滤）
    setDevices(allDevices)
    form.resetFields()
    form.setFieldsValue({
      orderDate: dayjs()
    })
    setModalVisible(true)
  }

  // 查看出库单详情
  const handleViewDetail = async (record) => {
    try {
      // 获取完整的出库单信息（包含items）
      const response = await fetch(`/api/outbound/${record.id}`)
      const data = await response.json()
      setCurrentOrder(data)
      setDetailModalVisible(true)
    } catch (error) {
      console.error('获取出库单详情失败:', error)
      message.error('获取出库单详情失败')
    }
  }

  // 编辑出库单
  const handleEdit = async (record) => {
    try {
      // 获取完整的出库单信息
      const response = await fetch(`/api/outbound/${record.id}`)
      const data = await response.json()
      
      // 填充表单数据
      form.setFieldsValue({
        handledBy: data.handledBy || '',
        deptApprover: data.deptApprover || '',
        warehouseKeeper: data.warehouseKeeper || '',
        orderDate: data.orderDate ? dayjs(data.orderDate) : null,
        usageType: data.usageType || '',
        transportMethod: data.transportMethod || '',
        recipientName: data.recipientName || '',
        contactPhone: data.contactPhone || '',
        eventName: data.eventName || '',
        usageLocation: data.usageLocation || '',
        eventDate: data.eventDate || '',
        returnDate: data.returnDate ? dayjs(data.returnDate) : null,
        remark: data.remark || ''
      })
      
      // 填充设备列表
      const editItems = data.items.map(item => ({
        key: item.id || Date.now() + Math.random(),
        deviceId: item.deviceId || item.device?.id || item.consumable?.id || item.accessory?.id,
        deviceName: item.deviceName || item.device?.deviceName || item.consumable?.consumableName || item.accessory?.accessoryName || '-',
        deviceCode: item.deviceCode || item.device?.deviceCode || item.consumable?.consumableCode || item.accessory?.accessoryCode || '-',
        brand: item.brand || item.device?.brand || item.consumable?.brand || item.accessory?.brand || '-',
        itemType: item.itemType === 'consumable' ? '耗材' : item.itemType === 'material' ? '物料' : item.itemType === 'accessory' ? '通用设备' : item.itemType === 'device' ? '专用设备' : (item.itemType || item.device?.itemType || (item.consumable ? '耗材' : (item.accessory ? '通用设备' : '专用设备'))),
        usageStatus: item.usageStatus || item.device?.usageStatus || '未使用',
        quantity: item.quantity || 1,
        unit: item.unit || '台',
        remark: item.remark || '',
        brandModel: item.brandModel || `${item.brand || ''} ${item.model || ''}`.trim()
      }))
      
      setItems(editItems)
      setCurrentOrder(data) // 保存当前编辑的订单信息
      setModalVisible(true) // 打开编辑弹窗
    } catch (error) {
      console.error('获取出库单详情失败:', error)
      message.error('获取出库单详情失败')
    }
  }

  // 打印出库单
  const handlePrint = (order) => {
    navigate(`/outbound/print/${order.id}`)
  }

  // 搜索设备 - 排除已选择的设备，支持类型筛选
  const handleSearch = (value, type = selectedType) => {
    setSearchText(value)
    // 获取已选择设备的ID列表
    const selectedDeviceIds = items.map(item => item.deviceId)
    
    let filtered = allDevices.filter(device => !selectedDeviceIds.includes(device.id))
    
    // 先按设备类型筛选
    if (type && type !== '') {
      filtered = filtered.filter(device => device.itemType === type)
    }
    
    // 再按搜索文本筛选
    if (value && value.trim() !== '') {
      filtered = filtered.filter(device => 
        device.deviceName?.toLowerCase().includes(value.toLowerCase()) ||
        device.deviceCode?.toLowerCase().includes(value.toLowerCase()) ||
        device.brand?.toLowerCase().includes(value.toLowerCase()) ||
        device.model?.toLowerCase().includes(value.toLowerCase())
      )
    }
    
    setDevices(filtered)
    // 同时更新设备汇总列表
    generateDeviceSummary(filtered)
  }

  // 查看设备汇总详情
  const handleViewDeviceSummary = (summary) => {
    setSelectedDeviceModel(summary)
    setDeviceVariants(summary.variants)
    setDeviceDetailVisible(true)
  }

  // 查看单个设备详情
  const handleViewDeviceDetail = (device) => {
    setSelectedDevice(device)
    // 打开新的单个设备详情弹窗，不关闭设备变体列表弹窗
    setDeviceSingleDetailVisible(true)
  }
  
  // 处理设备型号选择，弹出该型号的所有设备
  const handleSelectDeviceModel = (model) => {
    setSelectedDeviceModel(model)
    setDeviceVariants(model.variants)
    setDeviceVariantSearchText('') // 清空搜索文本
    setDeviceDetailVisible(true)
  }

  // 过滤设备变体列表（支持多个设备编号查询，以逗号分隔）
  const getFilteredDeviceVariants = () => {
    if (!deviceVariantSearchText || deviceVariantSearchText.trim() === '') {
      return deviceVariants
    }
    
    // 分割搜索文本，支持多个设备编号查询
    const searchCodes = deviceVariantSearchText.split(',').map(code => code.trim()).filter(code => code !== '')
    
    return deviceVariants.filter(device => {
      // 检查设备编号是否匹配任意一个搜索条件
      return searchCodes.some(searchCode => 
        device.deviceCode && device.deviceCode.toLowerCase().includes(searchCode.toLowerCase())
      )
    })
  }

  // 处理设备选择（从变体列表中选择）
  const handleSelectDeviceVariant = (device) => {
    handleAddDevice(device)
    
    // 对于非耗材设备，从变体列表中移除
    if (device.itemType !== '耗材') {
      setDeviceVariants(prev => prev.filter(d => d.id !== device.id))
    }
    
    // 更新汇总列表中的数量
    setDeviceSummaryList(prev => prev.map(item => {
      if (item.deviceName === selectedDeviceModel.deviceName && 
          item.brand === selectedDeviceModel.brand && 
          item.model === selectedDeviceModel.model) {
        // 对于耗材，减去实际选择的数量（默认1）
        // 注意：这里简化处理，实际应该根据用户输入的数量来减
        return { ...item, count: Math.max(0, item.count - 1) }
      }
      return item
    }))
  }

  // 关闭设备详情弹窗
  const handleDeviceDetailCancel = () => {
    setDeviceDetailVisible(false)
    setSelectedDeviceModel(null)
    setDeviceVariants([])
  }

  // 处理设备类型变化
  const handleTypeChange = (type) => {
    setSelectedType(type)
    handleSearch(searchText, type)
  }

  // 添加设备到出库清单
  const handleAddDevice = (device) => {
    const existingItem = items.find(item => item.deviceId === device.id)
    if (existingItem) {
      message.warning('该设备已在出库清单中')
      return
    }

    // 根据设备类型和单位设置正确的单位
    let unit = device.unit || '台'
    if (device.itemType === '耗材') {
      unit = device.unit || '个'
    } else if (device.itemType === '物料') {
      unit = device.unit || '件'
    } else if (device.itemType === '通用设备') {
      unit = device.unit || '套'
    }

    const newItem = {
      key: Date.now(),
      deviceId: device.id,
      deviceName: device.deviceName,
      deviceCode: device.deviceCode,
      brand: device.brand,
      itemType: device.itemType || '专用设备',
      usageStatus: device.usageStatus || '未使用',
      quantity: 1,
      unit: unit,
      remark: '',
      brandModel: `${device.brand || ''} ${device.model || ''}`.trim()
    }

    const newItems = [...items, newItem]
    setItems(newItems)
    
    // 只有耗材(consumable)保留在右侧列表中，方便多次添加和修改数量
    // 专用设备(device)、通用设备(accessory)、物料(material)从右侧移除
    const isConsumable = device.itemType === '耗材'
    
    if (!isConsumable) {
      // 从右侧设备列表中移除已选择的设备（非耗材）
      // 同时考虑当前搜索条件和类型筛选
      const selectedDeviceIds = newItems.map(item => item.deviceId)
      let filtered = allDevices.filter(d => !selectedDeviceIds.includes(d.id))
      
      // 应用类型筛选
      if (selectedType && selectedType !== '') {
        filtered = filtered.filter(d => d.itemType === selectedType)
      }
      
      // 应用搜索文本筛选
      if (searchText && searchText.trim() !== '') {
        filtered = filtered.filter(d => 
          d.deviceName?.toLowerCase().includes(searchText.toLowerCase()) ||
          d.deviceCode?.toLowerCase().includes(searchText.toLowerCase()) ||
          d.brand?.toLowerCase().includes(searchText.toLowerCase()) ||
          d.model?.toLowerCase().includes(searchText.toLowerCase())
        )
      }
      
      setDevices(filtered)
    }
    
    message.success(`已添加设备：${device.deviceName}`)
  }

  // 删除出库明细项
  const handleRemoveItem = (key) => {
    const removedItem = items.find(item => item.key === key)
    if (removedItem) {
      // 从已选列表中移除
      const newItems = items.filter(item => item.key !== key)
      setItems(newItems)
      
      // 从所有设备中找到对应的设备并添加回右侧列表
      // 同时考虑当前搜索条件和类型筛选
      const selectedDeviceIds = newItems.map(item => item.deviceId)
      const deviceToAddBack = allDevices.find(d => d.id === removedItem.deviceId)
      
      if (deviceToAddBack) {
        let shouldAddBack = true
        
        // 检查是否符合类型筛选条件
        if (selectedType && selectedType !== '' && deviceToAddBack.itemType !== selectedType) {
          shouldAddBack = false
        }
        
        // 检查是否符合搜索条件
        if (shouldAddBack && searchText && searchText.trim() !== '') {
          const matchesSearch = 
            deviceToAddBack.deviceName?.toLowerCase().includes(searchText.toLowerCase()) ||
            deviceToAddBack.deviceCode?.toLowerCase().includes(searchText.toLowerCase()) ||
            deviceToAddBack.brand?.toLowerCase().includes(searchText.toLowerCase()) ||
            deviceToAddBack.model?.toLowerCase().includes(searchText.toLowerCase())
          
          if (!matchesSearch) {
            shouldAddBack = false
          }
        }
        
        if (shouldAddBack) {
          setDevices(prevDevices => [...prevDevices, deviceToAddBack])
        }
      }
      message.success(`已移除设备：${removedItem.deviceName}`)
    }
  }

  // 更新明细项
  const handleItemChange = (key, field, value) => {
    setItems(items.map(item => {
      if (item.key === key) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  // 创建出库单
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      if (items.length === 0) {
        message.error('请至少添加一个出库设备')
        return
      }

      if (!currentUser || !currentUser.id) {
        message.error('用户信息丢失，请重新登录')
        return
      }

      setLoading(true)
      
      const orderData = {
        orderCode: currentOrder?.orderCode || `OUT${Date.now()}`,
        orderDate: values.orderDate.format('YYYY-MM-DD'),
        status: 'PENDING',
        remark: values.remark || '',
        operatorId: currentUser.id,
        // 出库经办信息
        handledBy: values.handledBy,
        deptApprover: values.deptApprover,
        warehouseKeeper: values.warehouseKeeper,
        // 领用信息（按照表格格式）
        usageType: values.usageType,
        recipientName: values.recipientName,
        contactPhone: values.contactPhone,
        eventName: values.eventName,
        usageLocation: values.usageLocation,
        eventDate: values.eventDate || null,
        returnDate: values.returnDate ? values.returnDate.format('YYYY-MM-DD') : null,
        transportMethod: values.transportMethod,
        images: images,
        items: items.map(item => ({
          deviceId: item.deviceId,
          itemType: item.itemType === '耗材' ? 'consumable' : item.itemType === '物料' ? 'material' : item.itemType === '通用设备' ? 'accessory' : 'device',
          quantity: item.quantity,
          unit: item.unit,
          remark: item.remark,
          brandModel: item.brandModel
        }))
      }
      
      console.log(currentOrder ? '更新出库单请求数据:' : '创建出库单请求数据:', orderData)
      console.log('当前用户:', currentUser)
      
      let response
      if (currentOrder && currentOrder.id) {
        // 更新出库单
        response = await fetch(`/api/outbound/${currentOrder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })
      } else {
        // 创建出库单
        response = await fetch('/api/outbound', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })
      }
      
      console.log('响应状态:', response.status)
      console.log('响应头:', response.headers)
      
      const data = await response.json()
      
      console.log('响应数据:', data)
      
      if (data.success) {
        message.success(currentOrder ? '出库单更新成功' : '出库单创建成功')
        setModalVisible(false)
        form.resetFields()
        setItems([])
        setImages([])
        setCurrentOrder(null) // 清空当前编辑的订单信息
        fetchOrders()
        fetchDevices()
      } else {
        console.error('操作失败，错误信息:', data.message)
        message.error(data.message || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      message.error('操作失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 完成出库单
  const handleComplete = async (id) => {
    try {
      const response = await fetch(`/api/outbound/${id}/complete`, {
        method: 'PUT'
      })
      
      const data = await response.json()
      
      if (data.success) {
        message.success('出库单已完成，设备状态已更新为使用中')
        fetchOrders()
        fetchDevices()
      } else {
        message.error(data.message || '操作失败')
      }
    } catch (error) {
      console.error('完成出库单失败:', error)
      message.error('操作失败')
    }
  }

  // 取消出库单
  const handleCancel = async (id) => {
    try {
      const response = await fetch(`/api/outbound/${id}/cancel`, {
        method: 'PUT'
      })
      
      const data = await response.json()
      
      if (data.success) {
        message.success('出库单已取消')
        fetchOrders()
      } else {
        message.error(data.message || '操作失败')
      }
    } catch (error) {
      console.error('取消出库单失败:', error)
      message.error('操作失败')
    }
  }

  // 删除出库单
  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除出库单后，相关设备的使用状态将恢复为"未使用"。是否确认删除？',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`/api/outbound/${id}`, {
            method: 'DELETE'
          })
          
          const data = await response.json()
          
          if (data.success) {
            message.success('出库单已删除，设备状态已恢复')
            fetchOrders()
          } else {
            message.error(data.message || '删除失败')
          }
        } catch (error) {
          console.error('删除出库单失败:', error)
          message.error('删除失败')
        }
      }
    })
  }

  // 关闭弹窗
  const handleModalCancel = () => {
    setModalVisible(false)
    form.resetFields()
    setItems([])
    setImages([])
    setCurrentOrder(null) // 清空当前编辑的订单信息
  }

  // 获取状态标签
  const getStatusTag = (status) => {
    const statusMap = {
      'PENDING': { color: 'orange', text: '待处理' },
      'COMPLETED': { color: 'green', text: '已完成' },
      'CANCELLED': { color: 'red', text: '已取消' }
    }
    const statusInfo = statusMap[status] || { color: 'default', text: status }
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
  }

  // 表格列定义
  const columns = [
    { 
      title: '出库单号', 
      dataIndex: 'orderCode', 
      key: 'orderCode',
      width: 150
    },
    { 
      title: '赛事全称', 
      dataIndex: 'eventName', 
      key: 'eventName',
      width: 150,
      ellipsis: true
    },
    { 
      title: '领用类型', 
      dataIndex: 'usageType', 
      key: 'usageType',
      width: 120,
      ellipsis: true
    },
    { 
      title: '设备领用人', 
      dataIndex: 'recipientName', 
      key: 'recipientName',
      width: 100
    },
    { 
      title: '使用地', 
      dataIndex: 'usageLocation', 
      key: 'usageLocation',
      width: 100
    },
    { 
      title: '实际出库日期', 
      dataIndex: 'orderDate', 
      key: 'orderDate',
      width: 120,
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
    },
    { 
      title: '预计归还日期', 
      dataIndex: 'returnDate', 
      key: 'returnDate',
      width: 120,
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
    },
    { 
      title: '设备数量', 
      key: 'itemCount',
      width: 80,
      align: 'center',
      render: (_, record) => record.items?.length || 0
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      width: 80,
      render: (status) => getStatusTag(status) 
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
              <Button 
                type="primary" 
                size="small" 
                icon={<CheckOutlined />}
                onClick={() => handleComplete(record.id)}
              >
                完成
              </Button>
              <Button 
                size="small" 
                icon={<CloseOutlined />}
                onClick={() => handleCancel(record.id)}
              >
                取消
              </Button>
            </>
          )}
          <Popconfirm
            title="确定要删除这个出库单吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              type="link"
              size="small" 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 详情弹窗表格列
  const detailColumns = [
    {
      title: '序号',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: '类型',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 80,
      render: (itemType) => {
        const typeMap = {
          'device': '专用设备',
          'consumable': '耗材',
          'accessory': '通用设备',
          'material': '物料'
        }
        return typeMap[itemType] || itemType || '-'
      }
    },
    {
      title: '名称',
      key: 'name',
      render: (_, record) => {
        if (record.itemType === 'consumable' && record.consumable) {
          return record.consumable.consumableName || '-'
        } else if (record.itemType === 'accessory' && record.accessory) {
          return record.accessory.accessoryName || '-'
        }
        return record.device?.deviceName || '-'
      }
    },
    {
      title: '编号/SN码',
      key: 'code',
      width: 150,
      render: (_, record) => {
        if (record.itemType === 'consumable' && record.consumable) {
          return record.consumable.consumableCode || '-'
        } else if (record.itemType === 'accessory' && record.accessory) {
          return record.accessory.accessoryCode || record.accessory.snCode || '-'
        }
        return record.device?.deviceCode || record.device?.snCode || '-'
      }
    },
    {
      title: '品牌',
      key: 'brand',
      width: 80,
      render: (_, record) => {
        if (record.itemType === 'consumable' && record.consumable) {
          return record.consumable.brand || '-'
        } else if (record.itemType === 'accessory' && record.accessory) {
          return record.accessory.brand || '-'
        }
        return record.device?.brand || '-'
      }
    },
    {
      title: '型号',
      key: 'model',
      width: 80,
      render: (_, record) => {
        if (record.itemType === 'consumable' && record.consumable) {
          return record.consumable.modelSpec || '-'
        } else if (record.itemType === 'accessory' && record.accessory) {
          return record.accessory.modelSpec || '-'
        }
        return record.device?.modelSpec || '-'
      }
    },
    {
      title: '货架位置',
      key: 'location',
      width: 80,
      render: (_, record) => {
        if (record.itemType === 'consumable' && record.consumable) {
          return record.consumable.location || '-'
        } else if (record.itemType === 'accessory' && record.accessory) {
          return record.accessory.location || '-'
        }
        return record.device?.location || '-'
      }
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 60,
      align: 'center'
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
      align: 'center'
    },
    {
      title: '配件及备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150
    }
  ]

  // 出库设备清单表格列
  const selectedItemColumns = [
    {
      title: '序号',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: '类型',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 70,
      render: (type) => {
        const typeColors = {
          '专用设备': 'blue',
          '通用设备': 'green',
          '耗材': 'orange',
          '物料': 'purple'
        }
        return <Tag color={typeColors[type] || 'default'} size="small">{type}</Tag>
      }
    },
    {
      title: '名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 180,
      ellipsis: true
    },
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      width: 120
    },
    {
      title: '设备状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const statusColors = {
          '正常': 'green',
          '维修中': 'orange',
          '已报废': 'gray',
          '闲置': 'blue'
        }
        return <Tag color={statusColors[status] || 'default'} size="small">{status || '正常'}</Tag>
      }
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 70,
      render: (value, record) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'quantity', val)}
          style={{ width: '100%' }}
          size="small"
        />
      )
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 70,
      render: (value, record) => (
        <Select
          value={value}
          onChange={(val) => handleItemChange(record.key, 'unit', val)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="台">台</Option>
          <Option value="套">套</Option>
          <Option value="件">件</Option>
          <Option value="个">个</Option>
        </Select>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 50,
      align: 'center',
      render: (_, record) => (
        <Button 
          danger 
          type="link" 
          size="small" 
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      )
    }
  ]

  // 设备变体列表列
  const deviceVariantColumns = [
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      width: 150
    },
    {
      title: 'SN码',
      dataIndex: 'snCode',
      key: 'snCode',
      width: 150,
      render: (snCode) => snCode || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === '正常' ? 'green' : 'default'} size="small">
          {status || '正常'}
        </Tag>
      )
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      ellipsis: true,
      render: (location) => location || '-'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (remark) => remark || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDeviceDetail(record)}
            title="查看详情"
          />
          <Button
            type="primary"
            size="small"
            onClick={() => handleSelectDeviceVariant(record)}
          >
            选择
          </Button>
        </Space>
      )
    }
  ]

  // 设备汇总列表列
  const deviceSummaryColumns = [
    {
      title: '类型',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 70,
      render: (type) => {
        const typeColors = {
          '专用设备': 'blue',
          '通用设备': 'green',
          '耗材': 'orange',
          '物料': 'purple'
        }
        return <Tag color={typeColors[type] || 'default'} size="small">{type}</Tag>
      }
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 150,
      ellipsis: true
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100,
      ellipsis: true
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
      ellipsis: true
    },
    {
      title: '可用数量',
      dataIndex: 'count',
      key: 'count',
      width: 80,
      render: (count) => <span style={{ fontWeight: 'bold' }}>{count}</span>
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleSelectDeviceModel(record)}
        >
          选择
        </Button>
      )
    }
  ]

  // 仓库设备列表列
  const warehouseDeviceColumns = [
    {
      title: '类型',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 70,
      render: (type) => {
        const typeColors = {
          '专用设备': 'blue',
          '通用设备': 'green',
          '耗材': 'orange',
          '物料': 'purple'
        }
        return <Tag color={typeColors[type] || 'default'} size="small">{type}</Tag>
      }
    },
    {
      title: '名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 200,
      ellipsis: true
    },
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      width: 160,
      render: (deviceCode, record) => (
        <span>
          {deviceCode}
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedDevice(record)
              setDeviceDetailVisible(true)
            }}
            style={{ padding: '0 4px', marginLeft: 4 }}
          />
        </span>
      )
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 80,
      ellipsis: true
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 70,
      align: 'center',
      render: (_, record) => {
        // 耗材显示剩余数量
        if (record.itemType === '耗材') {
          return record.remainingQuantity || record.quantity || 0
        }
        // 通用设备显示剩余数量
        if (record.itemType === '通用设备') {
          return record.remainingQuantity || 0
        }
        // 专用设备显示1
        return 1
      }
    },
    {
      title: '设备状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const statusColors = {
          '正常': 'green',
          '维修中': 'orange',
          '已报废': 'gray',
          '闲置': 'blue'
        }
        return <Tag color={statusColors[status] || 'default'} size="small">{status || '正常'}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      align: 'center',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<DoubleRightOutlined />}
          onClick={() => handleAddDevice(record)}
        >
          添加
        </Button>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="page-title">出库管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          创建出库单
        </Button>
      </div>
      
      <Card>
        <Table 
          dataSource={outboundOrders} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 创建出库单弹窗 */}
      <Modal
        title="创建设备租赁出库单"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={1600}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          {/* 出库经办信息 */}
          <Divider orientation="left">出库经办信息</Divider>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item 
                name="handledBy" 
                label="出库经办人"
              >
                <Input placeholder="请输入出库经办人" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                name="deptApprover" 
                label="出库经办部门"
              >
                <Input placeholder="请输入出库经办部门" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                name="orderDate" 
                label="实际出库日期"
                rules={[{ required: true, message: '请选择实际出库日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* 领用信息 */}
          <Divider orientation="left">领用信息</Divider>
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item 
                name="usageType" 
                label="领用类型"
                rules={[{ required: true, message: '请选择领用类型' }]}
              >
                <Select placeholder="请选择领用类型">
                  <Option value="元动自用">元动自用</Option>
                  <Option value="金陵借出">金陵借出</Option>
                  <Option value="奥实借出">奥实借出</Option>
                  <Option value="其他单位外借">其他单位外借</Option>
                  <Option value="综合性项目借出">综合性项目借出</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item 
                name="transportMethod"
                label="运输方式"
              >
                <Select placeholder="请选择运输方式">
                  <Option value="随身携带">随身携带</Option>
                  <Option value="物流托运（跨越）">物流托运（跨越）</Option>
                  <Option value="物流托运（德邦）">物流托运（德邦）</Option>
                  <Option value="物流托运（顺丰）">物流托运（顺丰）</Option>
                  <Option value="物流托运（其他）">物流托运（其他）</Option>
                  <Option value="移交他人">移交他人</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item 
                name="recipientName" 
                label="设备领用人"
                rules={[{ required: true, message: '请输入设备领用人' }]}
              >
                <Input placeholder="请输入设备领用人姓名" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item 
                name="contactPhone" 
                label="电话"
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item 
                name="eventName" 
                label="赛事全称"
              >
                <Input placeholder="请输入赛事全称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item 
                name="usageLocation" 
                label="使用地"
              >
                <Input placeholder="请输入使用地" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item 
                name="eventDate" 
                label="比赛时间"
              >
                <Input placeholder="请输入比赛时间" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item 
                name="returnDate" 
                label="预计归还日期"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="图片"
              >
                <Upload
                  listType="picture-card"
                  multiple={true}
                  fileList={images.map((image, index) => ({
                    uid: index.toString(),
                    name: `image_${index}.png`,
                    status: 'done',
                    url: image
                  }))}
                  beforeUpload={(file, fileList) => {
                    // 计算剩余可上传数量
                    const remainingCount = 10 - images.length
                    if (remainingCount <= 0) {
                      message.error('最多只能上传10张图片')
                      return false
                    }
                    
                    // 只处理剩余数量的文件
                    const filesToProcess = fileList.slice(0, remainingCount)
                    
                    // 处理每个文件
                    filesToProcess.forEach((file) => {
                      // 使用文件名和大小作为唯一标识
                      const fileId = `${file.name}_${file.size}_${file.lastModified}`
                      
                      // 检查是否已经在处理中
                      if (processingFilesRef.current.has(fileId)) {
                        return
                      }
                      
                      // 标记为正在处理
                      processingFilesRef.current.add(fileId)
                      
                      const reader = new FileReader()
                      reader.readAsDataURL(file)
                      reader.onload = () => {
                        setImages(prev => {
                          if (prev.length < 10) {
                            return [...prev, reader.result]
                          }
                          return prev
                        })
                        // 处理完成后移除标记
                        processingFilesRef.current.delete(fileId)
                      }
                    })
                    
                    return false
                  }}
                  onRemove={(file) => {
                    const index = parseInt(file.uid)
                    setImages(images.filter((_, i) => i !== index))
                  }}
                  maxCount={10} // 限制最多上传10张图片
                >
                  {images.length < 10 && <PlusCircleOutlined />}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* 出库明细 - 左右均分布局 */}
          <Divider orientation="left">设备明细</Divider>
          <Row gutter={16} style={{ height: 500 }}>
            {/* 左侧：已选择的出库设备清单 */}
            <Col span={12} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                flex: 1, 
                border: '1px solid #d9d9d9', 
                borderRadius: 4, 
                padding: 16,
                backgroundColor: '#fafafa'
              }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>出库设备清单</h3>
                  <Tag color="blue">已选 {items.length} 台</Tag>
                </div>
                <Table
                  dataSource={items}
                  columns={selectedItemColumns}
                  rowKey="key"
                  pagination={false}
                  size="small"
                  scroll={{ y: 380 }}
                />
              </div>
            </Col>

            {/* 右侧：仓库中的设备列表 */}
            <Col span={12} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                flex: 1, 
                border: '1px solid #d9d9d9', 
                borderRadius: 4, 
                padding: 16,
                backgroundColor: '#f0f9ff'
              }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: 0, marginBottom: 12 }}>仓库设备（汇总）</h3>
                  <Row gutter={8}>
                    <Col span={6}>
                      <Select
                        placeholder="设备类型"
                        value={selectedType || undefined}
                        onChange={handleTypeChange}
                        allowClear
                        style={{ width: '100%' }}
                      >
                        <Option value="专用设备">专用设备</Option>
                        <Option value="通用设备">通用设备</Option>
                        <Option value="耗材">耗材</Option>
                      </Select>
                    </Col>
                    <Col span={18}>
                      <Input
                        placeholder="搜索设备名称、品牌或型号"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        allowClear
                      />
                    </Col>
                  </Row>
                </div>
                <Table
                  dataSource={deviceSummaryList}
                  columns={deviceSummaryColumns}
                  rowKey="deviceName"
                  pagination={{
                    current: devicePagination.current,
                    pageSize: devicePagination.pageSize,
                    size: 'small',
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total, range) => `共 ${total} 条，当前 ${range[0]}-${range[1]} 条`
                  }}
                  onChange={(pagination) => {
                    setDevicePagination({
                      current: pagination.current,
                      pageSize: pagination.pageSize
                    })
                  }}
                  size="small"
                  scroll={{ y: 320 }}
                />
              </div>
            </Col>
          </Row>

          {/* 签字信息 */}
          <Divider orientation="left">签字确认</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="recipientName" label="设备领用人">
                <Input placeholder="设备领用人签字（手动签名）" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="handledBy" label="出库经办人">
                <Input placeholder="出库经办人签字（手动签名）" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="warehouseKeeper" label="库管">
                <Input placeholder="库管签字（手动签名）" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="备注">
            <div style={{ 
              padding: '8px 12px', 
              border: '1px solid #d9d9d9', 
              borderRadius: 4, 
              backgroundColor: '#fafafa',
              lineHeight: 1.8
            }}>
              <strong>1.设备丢失：按照设备实际价格赔偿（不高于市场价）；</strong><br/>
              <strong>2.设备损坏但仍能使用：按照设备实际价格50%赔偿；</strong><br/>
              <strong>3.设备损坏不能使用：按照设备实际价格赔偿（不高于市场价）。</strong>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 出库单详情弹窗 */}
      <Modal
        title="设备出库明细单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => handlePrint(currentOrder)}>
            打印
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {currentOrder && (
          <div>
            {/* 单据标题 */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>设备出库明细单</h2>
            </div>

            {/* 出库经办信息 */}
            <Descriptions bordered column={3} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="出库经办人">{currentOrder.handledBy || '-'}</Descriptions.Item>
              <Descriptions.Item label="出库经办部门">{currentOrder.deptApprover || '-'}</Descriptions.Item>
              <Descriptions.Item label="实际出库日期">{currentOrder.orderDate ? dayjs(currentOrder.orderDate).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
            </Descriptions>

            {/* 领用信息 */}
            <Descriptions bordered column={3} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="领用类型">{currentOrder.usageType || '-'}</Descriptions.Item>
              <Descriptions.Item label="设备领用人">{currentOrder.recipientName || '-'}</Descriptions.Item>
              <Descriptions.Item label="电话">{currentOrder.contactPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="赛事全称">{currentOrder.eventName || '-'}</Descriptions.Item>
              <Descriptions.Item label="使用地">{currentOrder.usageLocation || '-'}</Descriptions.Item>
              <Descriptions.Item label="运输方式">{currentOrder.transportMethod || '-'}</Descriptions.Item>
              <Descriptions.Item label="比赛时间">{currentOrder.eventDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="预计归还日期">{currentOrder.returnDate ? dayjs(currentOrder.returnDate).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
            </Descriptions>

            {/* 设备明细 */}
            <Divider orientation="left">设备明细</Divider>
            <Table
              dataSource={currentOrder.items || []}
              columns={detailColumns}
              pagination={false}
              rowKey="id"
              size="small"
              bordered
            />

            {/* 图片展示 */}
            {currentOrder.images && currentOrder.images.length > 0 && (
              <>
                <Divider orientation="left">相关图片</Divider>
                <div style={{ marginTop: 16 }}>
                  <Image.PreviewGroup>
                    <Space wrap>
                      {(() => {
                        try {
                          const imageList = typeof currentOrder.images === 'string' 
                            ? JSON.parse(currentOrder.images) 
                            : currentOrder.images;
                          return imageList.map((img, index) => (
                            <Image
                              key={index}
                              src={img}
                              alt={`图片${index + 1}`}
                              style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 4 }}
                              preview={{ mask: '点击查看' }}
                            />
                          ));
                        } catch (e) {
                          console.error('解析图片数据失败:', e);
                          return <span>图片加载失败</span>;
                        }
                      })()}
                    </Space>
                  </Image.PreviewGroup>
                </div>
              </>
            )}

            {/* 备注 */}
            <div style={{ marginTop: 16 }}>
              <strong>备注：</strong><br/>
              <strong>1.设备丢失：按照设备实际价格赔偿（不高于市场价）；</strong><br/>
              <strong>2.设备损坏但仍能使用：按照设备实际价格50%赔偿；</strong><br/>
              <strong>3.设备损坏不能使用：按照设备实际价格赔偿（不高于市场价）。</strong>
            </div>

            {/* 签字栏 */}
            <Divider />
            <Row gutter={16} style={{ marginTop: 24 }}>
              <Col span={8}>
                <p><strong>设备领用人：</strong>{currentOrder.recipientName || '____________'}</p>
              </Col>
              <Col span={8}>
                <p><strong>出库经办人：</strong>{currentOrder.handledBy || '____________'}</p>
              </Col>
              <Col span={8}>
                <p><strong>库管：</strong>{currentOrder.warehouseKeeper || '____________'}</p>
              </Col>
            </Row>

            {/* 状态 */}
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <strong>状态：</strong>{getStatusTag(currentOrder.status)}
            </div>
          </div>
        )}
      </Modal>

      {/* 设备详情弹窗 */}
      <Modal
        title={selectedDeviceModel ? `${[selectedDeviceModel.deviceName, selectedDeviceModel.brand, selectedDeviceModel.model].filter(Boolean).join(' - ')} (可选 ${deviceVariants.length} 台)` : "设备详情"}
        open={deviceDetailVisible}
        onCancel={handleDeviceDetailCancel}
        footer={[
          <Button key="close" onClick={handleDeviceDetailCancel}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedDeviceModel ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Descriptions bordered column={3} size="small">
                <Descriptions.Item label="设备类型">{selectedDeviceModel.itemType}</Descriptions.Item>
                <Descriptions.Item label="设备名称">{selectedDeviceModel.deviceName}</Descriptions.Item>
                <Descriptions.Item label="品牌">{selectedDeviceModel.brand}</Descriptions.Item>
                <Descriptions.Item label="型号">{selectedDeviceModel.model}</Descriptions.Item>
                <Descriptions.Item label="单位">{selectedDeviceModel.unit}</Descriptions.Item>
                <Descriptions.Item label="可选数量">{deviceVariants.length}</Descriptions.Item>
              </Descriptions>
            </div>
            {/* 设备编号搜索框 */}
            <div style={{ marginBottom: 16 }}>
              <Input
                placeholder="按设备编号查询（支持多个，以逗号分隔）"
                prefix={<SearchOutlined />}
                value={deviceVariantSearchText}
                onChange={(e) => setDeviceVariantSearchText(e.target.value)}
                allowClear
              />
            </div>
            <Table
              dataSource={getFilteredDeviceVariants()}
              columns={deviceVariantColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </div>
        ) : null}
      </Modal>

      {/* 单个设备详情弹窗 */}
      <Modal
        title="设备详情"
        open={deviceSingleDetailVisible}
        onCancel={() => setDeviceSingleDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDeviceSingleDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedDevice ? (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="设备类型">{selectedDevice.itemType}</Descriptions.Item>
            <Descriptions.Item label="设备名称">{selectedDevice.deviceName}</Descriptions.Item>
            <Descriptions.Item label="设备编号">{selectedDevice.deviceCode}</Descriptions.Item>
            <Descriptions.Item label="SN码">{selectedDevice.snCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="品牌">{selectedDevice.brand || '-'}</Descriptions.Item>
            <Descriptions.Item label="型号/规格">{selectedDevice.model || selectedDevice.modelSpec || selectedDevice.specification || '-'}</Descriptions.Item>
            <Descriptions.Item label="设备状态">{selectedDevice.status || '正常'}</Descriptions.Item>
            <Descriptions.Item label="单位">{selectedDevice.unit || '-'}</Descriptions.Item>
            <Descriptions.Item label="数量">
              {selectedDevice.itemType === '耗材' ? (selectedDevice.remainingQuantity || selectedDevice.quantity || 0) :
               selectedDevice.itemType === '通用设备' ? (selectedDevice.remainingQuantity || 0) : 1}
            </Descriptions.Item>
            {selectedDevice.originalQuantity && (
              <Descriptions.Item label="初始数量">{selectedDevice.originalQuantity}</Descriptions.Item>
            )}
            {selectedDevice.usedQuantity && (
              <Descriptions.Item label="已使用数量">{selectedDevice.usedQuantity}</Descriptions.Item>
            )}
            {selectedDevice.remainingQuantity && (
              <Descriptions.Item label="剩余数量">{selectedDevice.remainingQuantity}</Descriptions.Item>
            )}
            {selectedDevice.inUseQuantity && (
              <Descriptions.Item label="使用中数量">{selectedDevice.inUseQuantity}</Descriptions.Item>
            )}
            {selectedDevice.location && (
              <Descriptions.Item label="存放位置">{selectedDevice.location}</Descriptions.Item>
            )}
            {selectedDevice.company && (
              <Descriptions.Item label="所属公司">{selectedDevice.company}</Descriptions.Item>
            )}
            {selectedDevice.otherAccessories && (
              <Descriptions.Item label="其他配件" span={2}>{selectedDevice.otherAccessories}</Descriptions.Item>
            )}
            <Descriptions.Item label="备注" span={2}>{selectedDevice.remark || '-'}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </div>
  )
}

export default OutboundManagement
