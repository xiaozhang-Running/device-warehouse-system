import React, { useState, useEffect, useRef } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Popconfirm, Divider, Row, Col, Radio, InputNumber } from 'antd'
import { PlusOutlined, DeleteOutlined, FileTextOutlined, EyeOutlined, FilePdfOutlined } from '@ant-design/icons'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

function DeviceInboundManagement() {
  // 处理打印功能
  const handlePrint = () => {
    // 克隆内容，避免影响原页面
    const content = document.getElementById('inventory-list-content')
    if (!content) return
    
    // 打开新窗口
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    // 构建打印页面
    printWindow.document.write(`
      <html>
      <head>
        <title>入库清单打印</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          h2 {
            text-align: center;
            margin-bottom: 20px;
          }
          p {
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .signature-area {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // 等待内容加载完成后打印
    printWindow.onload = () => {
      printWindow.print()
      // 打印完成后关闭窗口
      printWindow.onafterprint = () => {
        printWindow.close()
      }
    }
  }
  const [inboundOrders, setInboundOrders] = useState([])
  const [devices, setDevices] = useState([])
  const [accessories, setAccessories] = useState([])
  const [consumables, setConsumables] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [companies, setCompanies] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [deviceType, setDeviceType] = useState('device')
  const [selectedInboundItems, setSelectedInboundItems] = useState([])
  const [batchFormVisible, setBatchFormVisible] = useState(false)
  const [inventoryListVisible, setInventoryListVisible] = useState(false)
  const [currentInventoryList, setCurrentInventoryList] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm] = Form.useForm()
  const [editedItems, setEditedItems] = useState([])
  
  // 批量表单数据
  const [batchFormData, setBatchFormData] = useState({
    name: '',
    brand: '',
    modelSpec: '',
    unit: '台',
    snCode: '',
    status: '正常',
    usageStatus: '未使用',
    company: '',
    warehouseId: '',
    otherAccessories: '',
    remark: '',
    quantity: 1
  })

  useEffect(() => {
    fetchOrders()
    fetchAllItems()
    fetchWarehouses()
    fetchCompanies()
  }, [])

  const fetchOrders = async () => {
    try {
      console.log('开始获取入库单数据...')
      const response = await fetch('/api/inbound')
      console.log('响应状态:', response.status)
      const data = await response.json()
      console.log('从后端获取的入库单数据:', data)
      
      // 检查数据结构
      if (Array.isArray(data)) {
        console.log('数据是数组，长度:', data.length)
        data.forEach((order, index) => {
          console.log(`订单${index + 1}:`, {
            orderCode: order.orderCode,
            inboundType: order.inboundType,
            items: order.items,
            itemsLength: order.items ? order.items.length : '无items字段'
          })
        })
      }
      
      // 只显示设备采购入库单（inboundType为new）
      const filteredOrders = data.filter(order => order.inboundType === 'new')
      console.log('过滤后的入库单数据:', filteredOrders)
      
      // 检查过滤后的数据
      filteredOrders.forEach((order, index) => {
        console.log(`过滤后订单${index + 1}:`, {
          orderCode: order.orderCode,
          items: order.items,
          itemsLength: order.items ? order.items.length : '无items字段'
        })
      })
      
      setInboundOrders(filteredOrders)
    } catch (error) {
      console.error('获取入库单列表失败:', error)
      message.error('获取入库单列表失败')
    }
  }

  const fetchAllItems = async () => {
    try {
      const [devicesRes, accessoriesRes, consumablesRes] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/accessories'),
        fetch('/api/consumables')
      ])
      
      const devicesData = await devicesRes.json()
      const accessoriesData = await accessoriesRes.json()
      const consumablesData = await consumablesRes.json()
      
      setDevices(devicesData)
      setAccessories(accessoriesData)
      setConsumables(consumablesData)
    } catch (error) {
      console.error('获取物品列表失败:', error)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses')
      const data = await response.json()
      setWarehouses(data)
    } catch (error) {
      console.error('获取仓库列表失败:', error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error('获取公司列表失败:', error)
    }
  }

  // 获取设备的最大编号
  // 获取已存在设备的数量（根据设备名称、品牌、型号规格）
  const getExistingDeviceCount = (deviceName, brand, modelSpec, type = 'device') => {
    let sameDevices = []
    if (type === 'device') {
      sameDevices = devices.filter(d => 
        d.deviceName === deviceName && 
        (d.brand === brand || (d.brand === null && (brand === null || brand === '')) || (d.brand === undefined && (brand === undefined || brand === '')))
        && (d.modelSpec === modelSpec || (d.modelSpec === null && (modelSpec === null || modelSpec === '')) || (d.modelSpec === undefined && (modelSpec === undefined || modelSpec === '')))
      )
    } else if (type === 'accessory') {
      sameDevices = accessories.filter(a => 
        a.accessoryName === deviceName && 
        (a.brand === brand || (a.brand === null && (brand === null || brand === '')) || (a.brand === undefined && (brand === undefined || brand === '')))
        && (a.modelSpec === modelSpec || (a.modelSpec === null && (modelSpec === null || modelSpec === '')) || (a.modelSpec === undefined && (modelSpec === undefined || modelSpec === '')))
      )
    } else if (type === 'consumable') {
      sameDevices = consumables.filter(c => 
        c.consumableName === deviceName && 
        (c.brand === brand || (c.brand === null && (brand === null || brand === '')) || (c.brand === undefined && (brand === undefined || brand === '')))
        && (c.modelSpec === modelSpec || c.specification === modelSpec || (c.modelSpec === null && (modelSpec === null || modelSpec === '')) || (c.specification === null && (modelSpec === null || modelSpec === '')))
      )
    }
    
    // 基于已存在设备的数量来生成编号
    return sameDevices.length
  }

  // 生成设备编码
  const generateDeviceCode = (deviceName, brand, modelSpec, type = 'device', startNum = null) => {
    let nextNum
    if (startNum !== null) {
      nextNum = startNum
    } else {
      const existingCount = getExistingDeviceCount(deviceName, brand, modelSpec, type)
      nextNum = existingCount + 1
    }
    if (type === 'consumable') {
      // 耗材编码逻辑：
      // 1. 首先判断是否为同一名称的设备
      // 2. 如果不是同一名称，直接生成新的设备编码
      // 3. 如果是同一名称，再判断是否为同一品牌同一型号
      // 4. 如果不是同一品牌同一型号，生成新的编码
      
      // 查找同名称的耗材
      const sameNameConsumables = consumables.filter(c => c.consumableName === deviceName)
      
      if (sameNameConsumables.length === 0) {
        // 没有同名称的耗材，生成新的编码，序号从1开始
        return `HC-${deviceName}-001`
      }
      
      // 有同名称的耗材，检查是否有完全匹配（同品牌同型号）的
      const exactMatch = sameNameConsumables.find(c => 
        (c.brand === brand || (c.brand === null && (brand === null || brand === '')) || (c.brand === undefined && (brand === undefined || brand === '')))
        && (c.modelSpec === modelSpec || c.specification === modelSpec || (c.modelSpec === null && (modelSpec === null || modelSpec === '')) || (c.specification === null && (modelSpec === null || modelSpec === '')))
      )
      
      if (exactMatch) {
        // 有完全匹配的，使用现有编码
        return exactMatch.consumableCode
      }
      
      // 没有完全匹配的（同名称但不同品牌或型号），生成新的编码
      // 查找该名称下最大的序号
      let maxSeq = 0
      sameNameConsumables.forEach(c => {
        const match = c.consumableCode.match(/-(\d+)$/)
        if (match) {
          const seq = parseInt(match[1])
          if (seq > maxSeq) {
            maxSeq = seq
          }
        }
      })
      
      // 生成新的序号
      return `HC-${deviceName}-${String(maxSeq + 1).padStart(3, '0')}`
    }
    return `YD-${deviceName}-${String(nextNum).padStart(3, '0')}`
  }

  // 检查设备是否已存在
  const checkExistingDevice = (name, brand, modelSpec, type = 'device') => {
    if (type === 'device') {
      return devices.find(d => 
        d.deviceName === name && 
        (d.brand === brand || (d.brand === null && (brand === null || brand === '')) || (d.brand === undefined && (brand === undefined || brand === '')))
        && (d.modelSpec === modelSpec || (d.modelSpec === null && (modelSpec === null || modelSpec === '')) || (d.modelSpec === undefined && (modelSpec === undefined || modelSpec === '')))
      )
    } else if (type === 'accessory') {
      return accessories.find(a => 
        a.accessoryName === name && 
        (a.brand === brand || (a.brand === null && (brand === null || brand === '')) || (a.brand === undefined && (brand === undefined || brand === '')))
        && (a.modelSpec === modelSpec || (a.modelSpec === null && (modelSpec === null || modelSpec === '')) || (a.modelSpec === undefined && (modelSpec === undefined || modelSpec === '')))
      )
    } else if (type === 'consumable') {
      return consumables.find(c => 
        c.consumableName === name && 
        (c.brand === brand || (c.brand === null && (brand === null || brand === '')) || (c.brand === undefined && (brand === undefined || brand === '')))
        && (c.modelSpec === modelSpec || c.specification === modelSpec || (c.modelSpec === null && (modelSpec === null || modelSpec === '')) || (c.specification === null && (modelSpec === null || modelSpec === '')))
      )
    }
  }

  const handleAdd = () => {
    form.resetFields()
    setSelectedInboundItems([])
    setBatchFormVisible(false)
    resetBatchForm()
    setModalVisible(true)
  }

  const resetBatchForm = () => {
    setBatchFormData({
      name: '',
      brand: '',
      modelSpec: '',
      unit: deviceType === 'consumable' ? '个' : '台',
      snCode: '',
      status: '正常',
      usageStatus: '未使用',
      company: '',
      warehouseId: '',
      otherAccessories: '',
      remark: '',
      quantity: 1
    })
  }

  // 处理批量表单字段变化
  const handleBatchFormChange = (field, value) => {
    setBatchFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // 当物品名称变化时，尝试自动填充单位
      if (field === 'name' && value) {
        let existingItem = null
        if (deviceType === 'device') {
          existingItem = devices.find(d => d.deviceName === value)
        } else if (deviceType === 'accessory') {
          existingItem = accessories.find(a => a.accessoryName === value)
        } else if (deviceType === 'consumable') {
          existingItem = consumables.find(c => c.consumableName === value)
        }
        if (existingItem && existingItem.unit) {
          newData.unit = existingItem.unit
        }
      }
      
      return newData
    })
  }

  const handleBatchAddClick = () => {
    const { name, brand, modelSpec, unit, snCode, status, usageStatus, company, warehouseId, otherAccessories, remark, quantity } = batchFormData
    
    if (!name) {
      message.error('请输入物品名称')
      return
    }

    // 耗材类型特殊处理 - 简单模式
    if (deviceType === 'consumable') {
      const existingItem = consumables.find(c => c.consumableName === name)
      const newItem = {
        id: existingItem?.id || Date.now(),
        type: 'consumable',
        itemType: 'consumable',
        name: name,
        code: existingItem?.consumableCode || generateDeviceCode(name, brand, modelSpec, 'consumable'),
        brand,
        modelSpec,
        unit,
        snCode: '',
        status: '正常',
        usageStatus: '未使用',
        company,
        warehouseId,
        otherAccessories: '',
        remark,
        quantity: parseInt(quantity) || 1,
        isExisting: !!existingItem
      }
      console.log('添加的耗材物品:', newItem)
      setSelectedInboundItems([...selectedInboundItems, newItem])
      message.success(`已添加耗材: ${name} x${quantity}`)
      resetBatchForm()
      return
    }

    // 专用设备入库 - 批量生成，每个设备都有完整信息
    if (deviceType === 'device') {
      const existingCount = getExistingDeviceCount(name, brand, modelSpec, 'device')
      const startNum = existingCount + 1
      
      const newItems = []
      for (let i = 0; i < parseInt(quantity); i++) {
        const deviceCode = generateDeviceCode(name, brand, modelSpec, 'device', startNum + i)
        newItems.push({
          id: Date.now() + i,
          type: 'device',
          itemType: 'device',
          name,
          code: deviceCode,
          brand,
          modelSpec,
          unit,
          snCode: quantity > 1 ? `${snCode}-${String(i + 1).padStart(2, '0')}` : snCode,
          status,
          usageStatus,
          company,
          warehouseId,
          otherAccessories,
          remark,
          quantity: 1,
          isExisting: false,
          seqNo: startNum + i
        })
      }
      setSelectedInboundItems([...selectedInboundItems, ...newItems])
      message.success(`新设备 ${name} 从 ${generateDeviceCode(name, brand, modelSpec, 'device', startNum)} 开始编号，共添加 ${quantity} 台`)
      resetBatchForm()
      return
    }

    // 通用设备入库
    if (deviceType === 'accessory') {
      const existingCount = getExistingDeviceCount(name, brand, modelSpec, 'accessory')
      const startNum = existingCount + 1
      
      const newItems = []
      for (let i = 0; i < parseInt(quantity); i++) {
        const accessoryCode = generateDeviceCode(name, brand, modelSpec, 'accessory', startNum + i)
        newItems.push({
          id: Date.now() + i,
          type: 'accessory',
          itemType: 'accessory',
          name,
          code: accessoryCode,
          brand,
          modelSpec,
          unit,
          snCode: quantity > 1 ? `${snCode}-${String(i + 1).padStart(2, '0')}` : snCode,
          status,
          usageStatus,
          company,
          warehouseId,
          otherAccessories,
          remark,
          quantity: 1,
          isExisting: false,
          seqNo: startNum + i
        })
      }
      setSelectedInboundItems([...selectedInboundItems, ...newItems])
      message.success(`新设备 ${name} 从 ${generateDeviceCode(name, brand, modelSpec, 'accessory', startNum)} 开始编号，共添加 ${quantity} 台`)
      resetBatchForm()
      return
    }
  }

  const handleRemoveItem = (index) => {
    const newItems = [...selectedInboundItems]
    newItems.splice(index, 1)
    setSelectedInboundItems(newItems)
  }

  const handleQuantityChange = (index, value) => {
    const newItems = [...selectedInboundItems]
    newItems[index].quantity = value
    setSelectedInboundItems(newItems)
  }

  const handleSnCodeChange = (index, value) => {
    const newItems = [...selectedInboundItems]
    newItems[index].snCode = value
    setSelectedInboundItems(newItems)
  }

  const generateInventoryList = async () => {
    try {
      const values = await form.validateFields()
      const orderCode = 'IN-' + Date.now()
      setCurrentInventoryList({
        orderCode,
        orderDate: values.orderDate ? values.orderDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
        deliverer: values.deliverer || '',
        receiver: values.receiver || '',
        receiverPhone: values.receiverPhone || '',
        remark: values.remark || '',
        items: selectedInboundItems,
        totalCount: selectedInboundItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
      })
      setInventoryListVisible(true)
    } catch (error) {
      console.error('获取表单数据失败:', error)
      message.error('获取表单数据失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      // 新采购模式下，保存物品明细信息（不创建设备，设备在完成入库时创建）
      const inventoryList = {
        orderCode: `IN${Date.now()}`,
        orderDate: values.orderDate ? values.orderDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
        inboundType: 'new',
        deviceType: deviceType,
        items: selectedInboundItems,
        totalCount: selectedInboundItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
        remark: values.remark || '',
        deliverer: values.deliverer || '',
        receiver: values.receiver || '',
        receiverPhone: values.receiverPhone || ''
      }
      
      const orderData = {
        orderCode: inventoryList.orderCode,
        orderDate: inventoryList.orderDate,
        status: 'PENDING',
        remark: values.remark || '',
        inboundType: 'new',
        deviceType: deviceType,
        deliverer: values.deliverer || '',
        receiver: values.receiver || '',
        receiverPhone: values.receiverPhone || '',
        itemDetails: selectedInboundItems
      }
      
      console.log('发送到后端的数据:', orderData)
      console.log('itemDetails数量:', selectedInboundItems.length)
      console.log('itemDetails内容:', selectedInboundItems)
      // 检查每个物品的数量
      selectedInboundItems.forEach((item, index) => {
        console.log(`物品${index + 1}的数量:`, item.quantity)
        console.log(`物品${index + 1}的类型:`, item.type)
        console.log(`物品${index + 1}的名称:`, item.name)
      })
      
      const response = await fetch('/api/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        message.success('入库单创建成功')
        setModalVisible(false)
        form.resetFields()
        setSelectedInboundItems([])
        fetchOrders()
      } else {
        message.error(data.message || '创建失败')
      }
    } catch (error) {
      console.error('创建入库单失败:', error)
      message.error('创建失败')
    } finally {
      setLoading(false)
    }
  }

  const handleModalCancel = () => {
    setModalVisible(false)
    form.resetFields()
    setSelectedInboundItems([])
    setBatchFormVisible(false)
  }

  const handleComplete = async (id) => {
    try {
      const response = await fetch(`/api/inbound/${id}/complete`, {
        method: 'PUT'
      })
      
      const data = await response.json()
      
      if (data.success) {
        message.success('入库单已完成，设备状态已更新为未使用')
        fetchOrders()
        fetchAllItems()
      } else {
        message.error(data.message || '操作失败')
      }
    } catch (error) {
      console.error('完成入库单失败:', error)
      message.error('操作失败')
    }
  }

  const handleCancel = async (id) => {
    try {
      const response = await fetch(`/api/inbound/${id}/cancel`, {
        method: 'PUT'
      })
      
      const data = await response.json()
      
      if (data.success) {
        message.success('入库单已取消')
        fetchOrders()
      } else {
        message.error(data.message || '操作失败')
      }
    } catch (error) {
      console.error('取消入库单失败:', error)
      message.error('操作失败')
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/inbound/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        message.success('入库单已删除')
        fetchOrders()
      } else {
        message.error(data.message || '删除失败')
      }
    } catch (error) {
      console.error('删除入库单失败:', error)
      message.error('删除失败')
    }
  }

  const handleViewDetail = (record) => {
    console.log('查看入库单详情:', record)
    console.log('入库单items:', record.items)
    if (record.items) {
      record.items.forEach((item, index) => {
        console.log(`物品${index + 1}:`, {
          name: item.itemName,
          quantity: item.quantity,
          itemType: item.itemType
        })
      })
    }
    setCurrentOrder(record)
    setEditedItems(record.items ? [...record.items] : [])
    setIsEditing(false)
    editForm.resetFields()
    setDetailModalVisible(true)
  }

  const handleEdit = () => {
    setIsEditing(true)
    editForm.setFieldsValue({
      orderCode: currentOrder.orderCode,
      deliverer: currentOrder.deliverer,
      receiver: currentOrder.receiver,
      receiverPhone: currentOrder.receiverPhone,
      remark: currentOrder.remark
    })
  }

  const handleSave = async () => {
    try {
      const values = await editForm.validateFields()
      setLoading(true)
      
      const orderData = {
        orderCode: values.orderCode,
        deliverer: values.deliverer,
        receiver: values.receiver,
        receiverPhone: values.receiverPhone,
        remark: values.remark,
        itemDetails: editedItems.map(item => ({
          id: item.id,
          type: item.itemType,
          itemType: item.itemType,
          name: item.itemName,
          code: item.itemCode,
          brand: item.brand,
          modelSpec: item.modelSpec,
          unit: item.unit,
          quantity: item.quantity,
          otherAccessories: item.otherAccessories,
          remark: item.remark,
          deviceId: item.device?.id || item.accessory?.id || item.consumable?.id
        }))
      }
      
      const response = await fetch(`/api/inbound/${currentOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        message.success('入库单保存成功')
        setIsEditing(false)
        setDetailModalVisible(false)
        fetchOrders()
      } else {
        message.error(data.message || '保存失败')
      }
    } catch (error) {
      console.error('保存入库单失败:', error)
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedItems(currentOrder.items ? [...currentOrder.items] : [])
    editForm.resetFields()
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...editedItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setEditedItems(newItems)
  }

  const itemTypeName = (type) => {
    switch (type) {
      case 'device': return '专用设备'
      case 'accessory': return '通用设备'
      case 'consumable': return '耗材'
      default: return type
    }
  }

  // 导出PDF
  const handleExportPDF = async () => {
    if (!currentInventoryList) return
    
    try {
      message.loading('正在生成PDF...', 0)
      
      const element = document.getElementById('inventory-list-content')
      if (!element) {
        message.destroy()
        message.error('未找到打印内容')
        return
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`入库单_${currentInventoryList.orderCode}_${new Date().toISOString().split('T')[0]}.pdf`)
      
      message.destroy()
      message.success('PDF导出成功')
    } catch (error) {
      console.error('PDF导出失败:', error)
      message.destroy()
      message.error('PDF导出失败: ' + error.message)
    }
  }

  // 获取已有物品名称列表
  const getExistingItemNames = () => {
    switch (deviceType) {
      case 'device':
        return [...new Set(devices.map(d => d.deviceName))]
      case 'accessory':
        return [...new Set(accessories.map(a => a.accessoryName))]
      case 'consumable':
        return [...new Set(consumables.map(c => c.consumableName))]
      default:
        return []
    }
  }

  // 根据物品名称获取相关品牌列表
  const getBrandsByItemName = (itemName) => {
    if (!itemName) return []
    
    switch (deviceType) {
      case 'device':
        return [...new Set(devices.filter(d => d.deviceName === itemName).map(d => d.brand).filter(Boolean))]
      case 'accessory':
        return [...new Set(accessories.filter(a => a.accessoryName === itemName).map(a => a.brand).filter(Boolean))]
      case 'consumable':
        return [...new Set(consumables.filter(c => c.consumableName === itemName).map(c => c.brand).filter(Boolean))]
      default:
        return []
    }
  }

  // 根据物品名称和品牌获取相关型号规格列表
  const getModelSpecsByItemAndBrand = (itemName, brand) => {
    if (!itemName || !brand) return []
    
    switch (deviceType) {
      case 'device':
        return [...new Set(devices.filter(d => d.deviceName === itemName && d.brand === brand).map(d => d.modelSpec).filter(Boolean))]
      case 'accessory':
        return [...new Set(accessories.filter(a => a.accessoryName === itemName && a.brand === brand).map(a => a.modelSpec).filter(Boolean))]
      case 'consumable':
        return [...new Set(consumables.filter(c => c.consumableName === itemName && c.brand === brand).map(c => c.modelSpec || c.specification).filter(Boolean))]
      default:
        return []
    }
  }

  const renderDeviceDetailForm = () => {
    // 耗材类型使用简化表单
    if (deviceType === 'consumable') {
      return (
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 8 }}>耗材名称 <span style={{ color: '#ff4d4f' }}>*</span></div>
            <Select
              showSearch
              placeholder="输入或选择耗材名称"
              value={batchFormData.name || undefined}
              onChange={(value) => handleBatchFormChange('name', value)}
              style={{ width: '100%' }}
              options={getExistingItemNames().map(name => ({ value: name, label: name }))}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="输入新耗材名称"
                      onPressEnter={(e) => {
                        handleBatchFormChange('name', e.target.value)
                      }}
                    />
                  </div>
                </>
              )}
            />
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>数量 <span style={{ color: '#ff4d4f' }}>*</span></div>
            <InputNumber 
              min={1}
              style={{ width: '100%' }}
              value={batchFormData.quantity}
              onChange={(value) => handleBatchFormChange('quantity', value)}
            />
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>单位</div>
            <Select 
              style={{ width: '100%' }}
              value={batchFormData.unit}
              onChange={(value) => handleBatchFormChange('unit', value)}
            >
              <Select.Option value="个">个</Select.Option>
              <Select.Option value="台">台</Select.Option>
              <Select.Option value="套">套</Select.Option>
              <Select.Option value="件">件</Select.Option>
              <Select.Option value="条">条</Select.Option>
              <Select.Option value="根">根</Select.Option>
              <Select.Option value="块">块</Select.Option>
              <Select.Option value="组">组</Select.Option>
              <Select.Option value="包">包</Select.Option>
              <Select.Option value="盒">盒</Select.Option>
              <Select.Option value="箱">箱</Select.Option>
              <Select.Option value="米">米</Select.Option>
              <Select.Option value="千克">千克</Select.Option>
              <Select.Option value="克">克</Select.Option>
              <Select.Option value="升">升</Select.Option>
            </Select>
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>品牌</div>
            <Select
              showSearch
              placeholder="输入或选择品牌"
              value={batchFormData.brand || undefined}
              onChange={(value) => handleBatchFormChange('brand', value)}
              style={{ width: '100%' }}
              options={getBrandsByItemName(batchFormData.name).map(brand => ({ value: brand, label: brand }))}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="输入新品牌"
                      onPressEnter={(e) => {
                        handleBatchFormChange('brand', e.target.value)
                      }}
                    />
                  </div>
                </>
              )}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>型号规格</div>
            <Select
              showSearch
              placeholder="输入或选择型号规格"
              value={batchFormData.modelSpec || undefined}
              onChange={(value) => handleBatchFormChange('modelSpec', value)}
              style={{ width: '100%' }}
              options={getModelSpecsByItemAndBrand(batchFormData.name, batchFormData.brand).map(spec => ({ value: spec, label: spec }))}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="输入新型号规格"
                      onPressEnter={(e) => {
                        handleBatchFormChange('modelSpec', e.target.value)
                      }}
                    />
                  </div>
                </>
              )}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>所在仓库</div>
            <Select 
              style={{ width: '100%' }}
              placeholder="请选择仓库"
              value={batchFormData.warehouseId}
              onChange={(value) => handleBatchFormChange('warehouseId', value)}
              allowClear
            >
              {warehouses.map(warehouse => (
                <Select.Option key={warehouse.id} value={warehouse.id}>{warehouse.name}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={24} style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8 }}>备注</div>
            <Input.TextArea 
              rows={2} 
              placeholder="请输入备注" 
              value={batchFormData.remark}
              onChange={(e) => handleBatchFormChange('remark', e.target.value)}
            />
          </Col>
        </Row>
      )
    }

    return (
      <>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>物品名称 <span style={{ color: '#ff4d4f' }}>*</span></div>
            <Select
              showSearch
              placeholder="输入或选择物品名称"
              value={batchFormData.name || undefined}
              onChange={(value) => handleBatchFormChange('name', value)}
              style={{ width: '100%' }}
              options={getExistingItemNames().map(name => ({ value: name, label: name }))}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="输入新物品名称"
                      onPressEnter={(e) => {
                        handleBatchFormChange('name', e.target.value)
                      }}
                    />
                  </div>
                </>
              )}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>品牌</div>
            <Select
              showSearch
              placeholder="输入或选择品牌"
              value={batchFormData.brand || undefined}
              onChange={(value) => handleBatchFormChange('brand', value)}
              style={{ width: '100%' }}
              options={getBrandsByItemName(batchFormData.name).map(brand => ({ value: brand, label: brand }))}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="输入新品牌"
                      onPressEnter={(e) => {
                        handleBatchFormChange('brand', e.target.value)
                      }}
                    />
                  </div>
                </>
              )}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>型号规格</div>
            <Select
              showSearch
              placeholder="输入或选择型号规格"
              value={batchFormData.modelSpec || undefined}
              onChange={(value) => handleBatchFormChange('modelSpec', value)}
              style={{ width: '100%' }}
              options={getModelSpecsByItemAndBrand(batchFormData.name, batchFormData.brand).map(spec => ({ value: spec, label: spec }))}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="输入新型号规格"
                      onPressEnter={(e) => {
                        handleBatchFormChange('modelSpec', e.target.value)
                      }}
                    />
                  </div>
                </>
              )}
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>单位</div>
            <Input 
              placeholder="请输入单位" 
              value={batchFormData.unit}
              onChange={(e) => handleBatchFormChange('unit', e.target.value)}
            />
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>SN码</div>
            <Input 
              placeholder="请输入SN码" 
              value={batchFormData.snCode}
              onChange={(e) => handleBatchFormChange('snCode', e.target.value)}
              disabled={batchFormData.quantity > 1}
            />
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>数量</div>
            <InputNumber 
              min={1}
              style={{ width: '100%' }}
              value={batchFormData.quantity}
              onChange={(value) => handleBatchFormChange('quantity', value)}
            />
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>设备状态</div>
            <Select 
              style={{ width: '100%' }}
              value={batchFormData.status}
              onChange={(value) => handleBatchFormChange('status', value)}
            >
              <Select.Option value="正常">正常</Select.Option>
              <Select.Option value="维修中">维修中</Select.Option>
              <Select.Option value="报废">报废</Select.Option>
            </Select>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>所属公司</div>
            <Select 
              style={{ width: '100%' }}
              placeholder="请选择所属公司"
              value={batchFormData.company}
              onChange={(value) => handleBatchFormChange('company', value)}
              allowClear
            >
              {companies.map(company => (
                <Select.Option key={company.id} value={company.name}>{company.name}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>所在仓库</div>
            <Select 
              style={{ width: '100%' }}
              placeholder="请选择仓库"
              value={batchFormData.warehouseId}
              onChange={(value) => handleBatchFormChange('warehouseId', value)}
              allowClear
            >
              {warehouses.map(warehouse => (
                <Select.Option key={warehouse.id} value={warehouse.id}>{warehouse.name}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>其余配件</div>
            <Input 
              placeholder="请输入其余配件" 
              value={batchFormData.otherAccessories}
              onChange={(e) => handleBatchFormChange('otherAccessories', e.target.value)}
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <div style={{ marginBottom: 8 }}>备注</div>
            <Input.TextArea 
              rows={2} 
              placeholder="请输入备注" 
              value={batchFormData.remark}
              onChange={(e) => handleBatchFormChange('remark', e.target.value)}
            />
          </Col>
        </Row>
      </>
    )
  }

  const columns = [
    {
      title: '入库单号',
      dataIndex: 'orderCode',
      key: 'orderCode',
      width: 150,
    },
    {
      title: '入库日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
    },
    {
      title: '接收人',
      dataIndex: 'receiver',
      key: 'receiver',
      width: 80,
    },
    {
      title: '联系电话',
      dataIndex: 'receiverPhone',
      key: 'receiverPhone',
      width: 120,
    },
    {
      title: '物品数量',
      key: 'itemCount',
      width: 80,
      render: (_, record) => {
        const count = record.items ? record.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0
        console.log('入库单', record.orderCode, '的物品总数量:', count)
        console.log('入库单', record.orderCode, '的items数据:', record.items)
        return count
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        switch (status) {
          case 'PENDING': return <Tag color="orange">待处理</Tag>
          case 'COMPLETED': return <Tag color="green">已完成</Tag>
          case 'CANCELLED': return <Tag color="red">已取消</Tag>
          default: return status
        }
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="small" style={{ width: '100%', justifyContent: 'space-around' }}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Popconfirm
                title="确定要完成入库吗？"
                description="完成后将创建设备记录并更新库存"
                onConfirm={() => handleComplete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" style={{ color: '#52c41a' }}>
                  完成
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确定要取消入库吗？"
                onConfirm={() => handleCancel(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger>
                  取消
                </Button>
              </Popconfirm>
            </>
          )}
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    },
  ]

  const renderExpandedRow = (record) => {
    if (!record.items || record.items.length === 0) return null
    
    return (
      <Table
        dataSource={record.items}
        columns={[
          { title: '类型', dataIndex: 'itemType', key: 'itemType', width: 80, render: (type) => itemTypeName(type) },
          { title: '名称', dataIndex: 'itemName', key: 'itemName', width: 120 },
          { title: '编号', dataIndex: 'itemCode', key: 'itemCode', width: 120 },
          { title: '品牌', dataIndex: 'brand', key: 'brand', width: 80 },
          { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 100 },
          { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 60, render: (text) => text || 1 },
          { title: 'SN码', dataIndex: 'snCode', key: 'snCode', width: 100 },
          { title: '状态', key: 'status', width: 80, render: (_, item) => item.isExisting ? <Tag color="blue">已有</Tag> : <Tag color="green">新增</Tag> },
        ]}
        pagination={false}
        size="small"
        rowKey="id"
      />
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="page-title">设备采购入库</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>创建入库单</Button>
      </div>
      <Card>
        <Table 
          dataSource={inboundOrders} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowRender: renderExpandedRow,
            rowExpandable: (record) => record.items && record.items.length > 0,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
      
      <Modal
        title="创建设备采购入库单"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={1000}
      >
        <Form form={form} layout="vertical">
          <Divider>批量入库</Divider>
          
          <Form.Item label="物品类型">
            <Radio.Group 
              value={deviceType} 
              onChange={(e) => {
                setDeviceType(e.target.value)
                resetBatchForm()
              }}
            >
              <Radio.Button value="device">专用设备</Radio.Button>
              <Radio.Button value="accessory">通用设备</Radio.Button>
              <Radio.Button value="consumable">耗材</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {!batchFormVisible ? (
            <Button 
              type="dashed" 
              block 
              icon={<PlusOutlined />}
              onClick={() => setBatchFormVisible(true)}
              style={{ marginBottom: 16 }}
            >
              添加{itemTypeName(deviceType)}
            </Button>
          ) : (
            <Card size="small" title={`添加${itemTypeName(deviceType)}`} style={{ marginBottom: 16 }}>
              <div>
                {renderDeviceDetailForm()}
                <div style={{ marginTop: 16 }}>
                  <Space>
                    <Button type="primary" onClick={handleBatchAddClick}>添加</Button>
                    <Button onClick={() => setBatchFormVisible(false)}>完成</Button>
                  </Space>
                </div>
              </div>
            </Card>
          )}

          {selectedInboundItems.length > 0 && (
            <Card 
              size="small" 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>已选物品 ({selectedInboundItems.length})</span>
                  <Button 
                    type="link" 
                    icon={<FileTextOutlined />}
                    onClick={generateInventoryList}
                  >
                    预览入库清单
                  </Button>
                </div>
              }
              style={{ marginBottom: 16 }}
            >
              <Table
                dataSource={selectedInboundItems}
                columns={[
                  {
                    title: '操作',
                    key: 'action',
                    width: 80,
                    fixed: 'left',
                    render: (_, record, index) => (
                      <Button danger size="small" onClick={() => handleRemoveItem(index)}>移除</Button>
                    )
                  },
                  { title: '类型', dataIndex: 'itemType', key: 'itemType', width: 80, render: (type) => itemTypeName(type) },
                  { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
                  { title: '编号', dataIndex: 'code', key: 'code', width: 100 },
                  { title: '品牌', dataIndex: 'brand', key: 'brand', width: 80 },
                  { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 100 },
                  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 60, render: (text) => text || 1 },
                  { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                  { title: 'SN码', dataIndex: 'snCode', key: 'snCode', width: 100, render: (text, record, index) => (
                    <Input 
                      value={text} 
                      onChange={(e) => handleSnCodeChange(index, e.target.value)} 
                      placeholder="请输入SN码"
                      disabled={record.quantity > 1}
                    />
                  ) },
                  { title: '设备状态', dataIndex: 'status', key: 'status', width: 80 },
                  { title: '使用状态', dataIndex: 'usageStatus', key: 'usageStatus', width: 80 },
                  { title: '所属公司', dataIndex: 'company', key: 'company', width: 100 },
                  { 
                    title: '所在仓库', 
                    key: 'warehouse',
                    width: 100,
                    render: (_, record) => {
                      const warehouse = warehouses.find(w => w.id === record.warehouseId)
                      return warehouse ? warehouse.name : '-'
                    }
                  },
                  { title: '其余配件', dataIndex: 'otherAccessories', key: 'otherAccessories', width: 100 },
                  { title: '备注', dataIndex: 'remark', key: 'remark', width: 100 },
                  { 
                    title: '数量', 
                    dataIndex: 'quantity', 
                    key: 'quantity', 
                    width: 80,
                    render: (text, record, index) => (
                      record.itemType === 'consumable' ? (
                        <InputNumber 
                          min={1}
                          value={text}
                          onChange={(value) => handleQuantityChange(index, value)}
                          style={{ width: 60 }}
                        />
                      ) : (text || 1)
                    )
                  },
                  { 
                    title: '状态',
                    key: 'itemStatus',
                    width: 80,
                    render: (_, record) => (
                      record.isExisting ? <Tag color="blue">已有</Tag> : <Tag color="green">新增</Tag>
                    )
                  }
                ]}
                rowKey={(record, index) => index}
                pagination={false}
                size="small"
                scroll={{ x: 1500 }}
              />
            </Card>
          )}

          <Divider>入库信息</Divider>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="orderDate" label="入库日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="deliverer" label="交货人">
                <Input placeholder="请输入交货人" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="receiver" label="接收人">
                <Input placeholder="请输入接收人" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="receiverPhone" label="联系电话">
                <Input placeholder="请输入接收人联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="remark" label="备注">
                <Input.TextArea rows={2} placeholder="可填写其他备注信息" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="入库清单"
        open={inventoryListVisible}
        onOk={() => setInventoryListVisible(false)}
        onCancel={() => setInventoryListVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setInventoryListVisible(false)}>关闭</Button>,
          <Button key="pdf" type="primary" icon={<FilePdfOutlined />} onClick={handleExportPDF}>导出PDF</Button>,
          <Button key="print" type="primary" icon={<FileTextOutlined />} onClick={handlePrint}>打印清单</Button>
        ]}
      >
        {currentInventoryList && (
          <div id="inventory-list-content" className="inventory-list" style={{ padding: 20, backgroundColor: '#fff' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 24, marginBottom: 15 }}>入库清单</h2>
              <p style={{ margin: '5px 0' }}><strong>单号:</strong> {currentInventoryList.orderCode}</p>
              <p style={{ margin: '5px 0' }}><strong>日期:</strong> {currentInventoryList.orderDate}</p>
              {currentInventoryList.deliverer && <p style={{ margin: '5px 0' }}><strong>交货人:</strong> {currentInventoryList.deliverer}</p>}
              {currentInventoryList.receiver && <p style={{ margin: '5px 0' }}><strong>接收人:</strong> {currentInventoryList.receiver}</p>}
              {currentInventoryList.receiverPhone && <p style={{ margin: '5px 0' }}><strong>联系电话:</strong> {currentInventoryList.receiverPhone}</p>}
              {currentInventoryList.remark && (
                <div style={{ marginTop: 10, padding: 10, border: '1px solid #e8e8e8', borderRadius: 4, textAlign: 'left' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>备注:</p>
                  <p style={{ margin: '5px 0 0 0' }}>{currentInventoryList.remark}</p>
                </div>
              )}
            </div>
            <Table
              dataSource={currentInventoryList.items}
              columns={[
                { title: '序号', key: 'index', render: (_, __, index) => index + 1, width: 60 },
                { title: '类型', dataIndex: 'itemType', key: 'itemType', width: 80, render: (type) => itemTypeName(type) },
                { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
                { title: '编号', dataIndex: 'code', key: 'code', width: 120 },
                { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
                { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 120 },
                { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
                { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                { title: 'SN码', dataIndex: 'snCode', key: 'snCode', width: 100 },
                { title: '配件', dataIndex: 'otherAccessories', key: 'otherAccessories', width: 100 },
                { title: '备注', dataIndex: 'remark', key: 'remark', width: 120 },
                { title: '状态', key: 'status', render: (_, record) => record.isExisting ? '已有' : '新增', width: 80 }
              ]}
              pagination={false}
              size="small"
            />
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <p style={{ fontSize: 16 }}><strong>总计: {currentInventoryList.totalCount} 件</strong></p>
            </div>
            <div className="signature-area" style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid #e8e8e8' }}>
              <div>交货人: _______________</div>
              <div>审核人: _______________</div>
              <div>入库人: _______________</div>
              <div>日期: _______________</div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="入库单详情"
        open={detailModalVisible}
        onOk={() => setDetailModalVisible(false)}
        onCancel={() => {
          setDetailModalVisible(false)
          setIsEditing(false)
        }}
        width={1000}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false)
            setIsEditing(false)
          }}>
            关闭
          </Button>,
          currentOrder?.status === 'PENDING' && !isEditing && (
            <Button key="edit" type="primary" onClick={handleEdit}>
              编辑
            </Button>
          ),
          isEditing && (
            <Button key="cancel" onClick={handleCancelEdit}>
              取消
            </Button>
          ),
          isEditing && (
            <Button key="save" type="primary" loading={loading} onClick={handleSave}>
              保存
            </Button>
          )
        ].filter(Boolean)}
      >
        {currentOrder && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              {!isEditing ? (
                <>
                  <Row gutter={16}>
                    <Col span={8}>
                      <p><strong>入库单号:</strong> {currentOrder.orderCode}</p>
                    </Col>
                    <Col span={8}>
                      <p><strong>入库类型:</strong> 设备采购入库</p>
                    </Col>
                    <Col span={8}>
                      <p><strong>入库日期:</strong> {currentOrder.orderDate}</p>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 8 }}>
                    <Col span={6}>
                      <p><strong>状态:</strong> {currentOrder.status === 'PENDING' ? '待处理' : currentOrder.status === 'COMPLETED' ? '已完成' : '已取消'}</p>
                    </Col>
                    <Col span={6}>
                      <p><strong>交货人:</strong> {currentOrder.deliverer || '-'}</p>
                    </Col>
                    <Col span={6}>
                      <p><strong>接收人:</strong> {currentOrder.receiver || '-'}</p>
                    </Col>
                    <Col span={6}>
                      <p><strong>联系电话:</strong> {currentOrder.receiverPhone || '-'}</p>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 8 }}>
                    <Col span={6}>
                      <p><strong>物品数量:</strong> {currentOrder.items ? currentOrder.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0}</p>
                    </Col>
                    <Col span={18}>
                      <p><strong>备注:</strong> {currentOrder.remark || '-'}</p>
                    </Col>
                  </Row>
                </>
              ) : (
                <Form form={editForm} layout="vertical">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="orderCode" label="入库单号" rules={[{ required: true, message: '请输入入库单号' }]}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <p style={{ marginTop: 30 }}><strong>入库类型:</strong> 设备采购入库</p>
                    </Col>
                    <Col span={8}>
                      <p style={{ marginTop: 30 }}><strong>入库日期:</strong> {currentOrder.orderDate}</p>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={6}>
                      <p><strong>状态:</strong> {currentOrder.status === 'PENDING' ? '待处理' : currentOrder.status === 'COMPLETED' ? '已完成' : '已取消'}</p>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="deliverer" label="交货人">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="receiver" label="接收人">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="receiverPhone" label="联系电话">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item name="remark" label="备注">
                        <Input.TextArea rows={2} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            </Card>

            <Card size="small" title="入库物品明细">
              <Table
                dataSource={isEditing ? editedItems : (currentOrder.items || [])}
                columns={[
                  { title: '序号', key: 'index', width: 60, render: (_, __, index) => index + 1 },
                  { title: '类型', dataIndex: 'itemType', key: 'itemType', width: 100, render: (type) => itemTypeName(type) },
                  { title: '名称', dataIndex: 'itemName', key: 'itemName', width: 150 },
                  { title: '编号', dataIndex: 'itemCode', key: 'itemCode', width: 150 },
                  { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
                  { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 150 },
                  isEditing ? {
                    title: '数量',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: 100,
                    render: (text, record, index) => (
                      <InputNumber
                        min={1}
                        value={text || 1}
                        onChange={(value) => handleItemChange(index, 'quantity', value)}
                        style={{ width: '100%' }}
                      />
                    )
                  } : { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80, render: (text) => text || 1 },
                  { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
                  isEditing ? {
                    title: '配件',
                    dataIndex: 'otherAccessories',
                    key: 'otherAccessories',
                    width: 120,
                    render: (text, record, index) => (
                      <Input
                        value={text || ''}
                        onChange={(e) => handleItemChange(index, 'otherAccessories', e.target.value)}
                      />
                    )
                  } : { title: '配件', dataIndex: 'otherAccessories', key: 'otherAccessories', width: 120 },
                  isEditing ? {
                    title: '备注',
                    dataIndex: 'remark',
                    key: 'remark',
                    width: 150,
                    render: (text, record, index) => (
                      <Input
                        value={text || ''}
                        onChange={(e) => handleItemChange(index, 'remark', e.target.value)}
                      />
                    )
                  } : { title: '备注', dataIndex: 'remark', key: 'remark', width: 150 },
                  { 
                    title: '状态', 
                    key: 'status', 
                    width: 100,
                    render: (_, item) => item.device || item.accessory || item.consumable ? <Tag color="blue">已有</Tag> : <Tag color="green">新增</Tag>
                  },
                ].filter(Boolean)}
                pagination={false}
                size="small"
                scroll={{ x: 1200 }}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DeviceInboundManagement
