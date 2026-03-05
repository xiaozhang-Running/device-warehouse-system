import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Popconfirm, Divider, Row, Col, Checkbox, Radio, InputNumber } from 'antd'
import { CheckOutlined, CloseOutlined, DeleteOutlined, SearchOutlined, PlusOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons'

function InboundManagement() {
  // 处理打印功能
  const handlePrint = () => {
    // 克隆内容，避免影响原页面
    const content = document.querySelector('.inventory-list')
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
  const [outboundOrders, setOutboundOrders] = useState([])
  const [devices, setDevices] = useState([])
  const [accessories, setAccessories] = useState([])
  const [consumables, setConsumables] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [selectedOutbound, setSelectedOutbound] = useState(null)
  const [selectedDevices, setSelectedDevices] = useState([])
  const [outboundDevicesModal, setOutboundDevicesModal] = useState(false)
  const [inboundMode, setInboundMode] = useState('new')
  const [deviceType, setDeviceType] = useState('device')
  const [selectedInboundItems, setSelectedInboundItems] = useState([])
  const [batchFormVisible, setBatchFormVisible] = useState(false)

  const [inventoryListVisible, setInventoryListVisible] = useState(false)
  const [currentInventoryList, setCurrentInventoryList] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
    fetchOutboundOrders()
    fetchAllItems()
    fetchWarehouses()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/inbound')
      const data = await response.json()
      setInboundOrders(data)
    } catch (error) {
      console.error('获取入库单列表失败:', error)
      message.error('获取入库单列表失败')
    }
  }

  const fetchOutboundOrders = async () => {
    try {
      const response = await fetch('/api/outbound')
      const data = await response.json()
      setOutboundOrders(data.filter(order => order.status === 'COMPLETED'))
    } catch (error) {
      console.error('获取出库单列表失败:', error)
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

  // 获取设备的最大编号
  const getMaxDeviceCode = (deviceName, type = 'device') => {
    let sameNameDevices = []
    if (type === 'device') {
      sameNameDevices = devices.filter(d => d.deviceName === deviceName)
    } else if (type === 'accessory') {
      sameNameDevices = accessories.filter(a => a.accessoryName === deviceName)
    }
    
    if (sameNameDevices.length === 0) return 0
    
    let maxNum = 0
    sameNameDevices.forEach(d => {
      const code = d.deviceCode || d.accessoryCode
      if (code) {
        const match = code.match(/YD-.+-([0-9]+)$/)
        if (match) {
          const num = parseInt(match[1])
          if (num > maxNum) maxNum = num
        }
      }
    })
    
    // 如果没有解析到编号数字，使用设备数量作为最大编号
    if (maxNum === 0) {
      return sameNameDevices.length
    }
    
    return maxNum
  }

  // 生成设备编号
  const generateDeviceCode = (deviceName, startNum = 1) => {
    return `YD-${deviceName}-${String(startNum).padStart(3, '0')}`
  }

  const handleAdd = () => {
    setModalVisible(true)
    setInboundMode('new')
    setSelectedInboundItems([])
    setSelectedOutbound(null)
    setSelectedDevices([])
    setBatchFormVisible(false)
    form.resetFields()
  }

  const handleSearchOutbound = () => {
    const found = outboundOrders.find(order => 
      order.orderCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.remark?.toLowerCase().includes(searchText.toLowerCase())
    )
    if (found) {
      setSelectedOutbound(found)
      message.success('找到出库单')
    } else {
      message.warning('未找到匹配的出库单')
    }
  }

  const handleSelectDevices = () => {
    if (!selectedOutbound) {
      message.warning('请先查询并选择出库单')
      return
    }
    setOutboundDevicesModal(true)
  }

  // 添加设备到入库列表
  const handleBatchAdd = (values) => {
    const { itemName, quantity, ...otherFields } = values
    
    if (deviceType === 'consumable') {
      // 耗材入库 - 简单模式
      const existingItem = consumables.find(c => c.consumableName === itemName)
      const newItem = {
        id: existingItem?.id || Date.now(),
        type: 'consumable',
        name: itemName,
        code: existingItem?.consumableCode || `HC-${String(consumables.length + 1).padStart(4, '0')}`,
        quantity: parseInt(quantity),
        isExisting: !!existingItem,
        itemType: '耗材',
        ...otherFields
      }
      setSelectedInboundItems([...selectedInboundItems, newItem])
      message.success(`已添加耗材: ${itemName} x${quantity}`)
    } else if (deviceType === 'device') {
      // 专用设备入库 - 批量生成，每个设备都有完整信息
      const maxNum = getMaxDeviceCode(itemName, 'device')
      const startNum = maxNum + 1
      
      const newItems = []
      for (let i = 0; i < parseInt(quantity); i++) {
        const deviceCode = generateDeviceCode(itemName, startNum + i)
        newItems.push({
          id: Date.now() + i,
          type: 'device',
          name: itemName,
          code: deviceCode,
          quantity: 1,
          isExisting: false,
          itemType: '专用设备',
          seqNo: startNum + i,
          ...otherFields
        })
      }
      setSelectedInboundItems([...selectedInboundItems, ...newItems])
      
      message.success(`新设备 ${itemName} 从 ${generateDeviceCode(itemName, startNum)} 开始编号，共添加 ${quantity} 台`)
    } else if (deviceType === 'accessory') {
      // 通用设备入库
      const maxNum = getMaxDeviceCode(itemName, 'accessory')
      const startNum = maxNum + 1
      
      const newItems = []
      for (let i = 0; i < parseInt(quantity); i++) {
        const accessoryCode = generateDeviceCode(itemName, startNum + i)
        newItems.push({
          id: Date.now() + i,
          type: 'accessory',
          name: itemName,
          code: accessoryCode,
          quantity: 1,
          isExisting: false,
          itemType: '通用设备',
          seqNo: startNum + i,
          ...otherFields
        })
      }
      setSelectedInboundItems([...selectedInboundItems, ...newItems])
      
      message.success(`新设备 ${itemName} 从 ${generateDeviceCode(itemName, startNum)} 开始编号，共添加 ${quantity} 台`)
    }
  }

  // 从入库列表移除物品
  const handleRemoveItem = (index) => {
    const newItems = [...selectedInboundItems]
    newItems.splice(index, 1)
    setSelectedInboundItems(newItems)
  }

  // 修改数量
  const handleQuantityChange = (index, value) => {
    const newItems = [...selectedInboundItems]
    newItems[index].quantity = value
    setSelectedInboundItems(newItems)
  }

  // 生成入库清单
  const generateInventoryList = () => {
    const list = {
      orderCode: `IN${Date.now()}`,
      orderDate: new Date().toISOString().split('T')[0],
      items: selectedInboundItems,
      totalCount: selectedInboundItems.reduce((sum, item) => sum + item.quantity, 0)
    }
    setCurrentInventoryList(list)
    setInventoryListVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      // 新采购模式下，保存物品明细信息（不创建设备，设备在完成入库时创建）
      const inventoryList = {
        orderCode: `IN${Date.now()}`,
        orderDate: values.orderDate ? values.orderDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
        inboundType: inboundMode,
        deviceType: deviceType,
        items: inboundMode === 'new' ? selectedInboundItems : selectedDevices.map(id => ({ deviceId: id, quantity: 1 })),
        totalCount: inboundMode === 'new' 
          ? selectedInboundItems.reduce((sum, item) => sum + item.quantity, 0)
          : selectedDevices.length,
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
        inboundType: inboundMode,
        deviceType: deviceType,
        outboundOrderId: inboundMode === 'return' ? selectedOutbound?.id : null,
        deviceIds: inboundMode === 'return' ? selectedDevices : [],
        deliverer: values.deliverer || '',
        receiver: values.receiver || '',
        receiverPhone: values.receiverPhone || '',
        inventoryList: inventoryList
      }
      
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
        setSelectedOutbound(null)
        setSelectedDevices([])
        setSelectedInboundItems([])
        setSearchText('')
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

  // 查看入库单详情
  const handleViewDetails = (record) => {
    setCurrentOrder(record)
    setDetailModalVisible(true)
  }

  // 获取物品类型名称
  const itemTypeName = (type) => {
    switch (type) {
      case 'device': return '专用设备'
      case 'accessory': return '通用设备'
      case 'consumable': return '耗材'
      default: return '物品'
    }
  }

  const handleModalCancel = () => {
    setModalVisible(false)
    form.resetFields()
    setSelectedOutbound(null)
    setSelectedDevices([])
    setSelectedInboundItems([])
    setSearchText('')
    setInboundMode('new')
    setBatchFormVisible(false)
    setInventoryListVisible(false)
  }

  const getStatusTag = (status) => {
    const statusMap = {
      'PENDING': { color: 'orange', text: '待处理' },
      'COMPLETED': { color: 'green', text: '已完成' },
      'CANCELLED': { color: 'red', text: '已取消' }
    }
    const statusInfo = statusMap[status] || { color: 'default', text: status }
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
  }

  const getInboundTypeTag = (type) => {
    const typeMap = {
      'new': { color: 'blue', text: '新采购' },
      'return': { color: 'purple', text: '归还入库' }
    }
    const typeInfo = typeMap[type] || { color: 'default', text: type }
    return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
  }

  const getDeviceTypeTag = (type) => {
    const typeMap = {
      'device': { color: 'cyan', text: '专用设备' },
      'accessory': { color: 'orange', text: '通用设备' },
      'consumable': { color: 'green', text: '耗材' }
    }
    const typeInfo = typeMap[type] || { color: 'default', text: type }
    return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
  }

  const columns = [
    { title: '入库单号', dataIndex: 'orderCode', key: 'orderCode', width: 180 },
    { title: '入库类型', dataIndex: 'inboundType', key: 'inboundType', width: 100, render: (type) => getInboundTypeTag(type) },
    { title: '入库日期', dataIndex: 'orderDate', key: 'orderDate', width: 150 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (status) => getStatusTag(status) },
    { title: '物品数量', key: 'itemCount', width: 100, render: (_, record) => record.items?.length || 0 },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            查看详情
          </Button>
          {record.status === 'PENDING' && (
            <>
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
            title="确定要删除这个入库单吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
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

  // 渲染展开的行内容 - 入库单详情列表
  const renderExpandedRow = (record) => {
    const itemColumns = [
      { title: '序号', key: 'index', width: 60, render: (_, __, index) => index + 1 },
      { 
        title: '类型', 
        key: 'itemType', 
        width: 100,
        render: (_, item) => {
          const type = item.device ? 'device' : item.accessory ? 'accessory' : item.consumable ? 'consumable' : 'device'
          return itemTypeName(type)
        }
      },
      { 
        title: '名称', 
        key: 'name', 
        width: 150,
        render: (_, item) => item.device?.deviceName || item.accessory?.accessoryName || item.consumable?.consumableName || '-'
      },
      { 
        title: '编号', 
        key: 'code', 
        width: 150,
        render: (_, item) => item.device?.deviceCode || item.accessory?.accessoryCode || item.consumable?.consumableCode || '-'
      },
      { 
        title: '品牌', 
        key: 'brand', 
        width: 100,
        render: (_, item) => item.device?.brand || item.accessory?.brand || item.consumable?.brand || '-'
      },
      { 
        title: '型号', 
        key: 'modelSpec', 
        width: 150,
        render: (_, item) => item.device?.modelSpec || item.accessory?.modelSpec || item.consumable?.modelSpec || '-'
      },
      { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
      { 
        title: '状态', 
        key: 'status', 
        width: 100,
        render: (_, item) => <Tag color="green">新增</Tag>
      },
    ]

    return (
      <Card size="small" title="入库物品明细" style={{ margin: '12px 0' }}>
        <Table
          dataSource={record.items || []}
          columns={itemColumns}
          rowKey={(item, index) => index}
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
        />
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <Button 
            type="link" 
            icon={<FileTextOutlined />}
            onClick={() => {
              setCurrentInventoryList(record.inventoryList)
              setInventoryListVisible(true)
            }}
          >
            查看完整清单
          </Button>
        </div>
      </Card>
    )
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

  // 表单数据状态
  const [batchFormData, setBatchFormData] = useState({
    itemName: undefined,
    quantity: 1,
    unit: undefined,
    brand: '',
    modelSpec: '',
    snCode: '',
    status: '正常',
    usageStatus: '未使用',
    company: '',
    warehouseId: undefined,
    otherAccessories: '',
    remark: ''
  })

  // 处理表单字段变化
  const handleBatchFormChange = (field, value) => {
    setBatchFormData(prev => ({ ...prev, [field]: value }))
  }

  // 重置批次表单
  const resetBatchForm = () => {
    setBatchFormData({
      itemName: undefined,
      quantity: 1,
      unit: undefined,
      brand: '',
      modelSpec: '',
      snCode: '',
      status: '正常',
      usageStatus: '未使用',
      company: '',
      warehouseId: undefined,
      otherAccessories: '',
      remark: ''
    })
  }

  // 点击添加按钮处理
  const handleBatchAddClick = () => {
    const { itemName, quantity } = batchFormData
    
    if (!itemName) {
      message.error('请输入设备名称')
      return
    }
    if (!quantity || quantity < 1) {
      message.error('请输入有效的数量')
      return
    }
    
    handleBatchAdd(batchFormData)
    resetBatchForm()
  }

  // 渲染设备详细信息表单
  const renderDeviceDetailForm = () => {
    if (deviceType === 'consumable') {
      return (
        <Row gutter={16}>
          <Col span={24}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>耗材名称 <span style={{ color: '#ff4d4f' }}>*</span></label>
              <Select
                showSearch
                placeholder="输入或选择耗材名称"
                value={batchFormData.itemName}
                onChange={(value) => handleBatchFormChange('itemName', value)}
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
                          handleBatchFormChange('itemName', e.target.value)
                        }}
                      />
                    </div>
                  </>
                )}
              />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>数量 <span style={{ color: '#ff4d4f' }}>*</span></label>
              <InputNumber 
                min={1} 
                style={{ width: '100%' }} 
                placeholder="数量" 
                value={batchFormData.quantity}
                onChange={(value) => handleBatchFormChange('quantity', value)}
              />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>单位</label>
              <Select 
                placeholder="请选择单位" 
                allowClear
                style={{ width: '100%' }}
                value={batchFormData.unit}
                onChange={(value) => handleBatchFormChange('unit', value)}
              >
                <Select.Option value="个">个</Select.Option>
                <Select.Option value="台">台</Select.Option>
                <Select.Option value="套">套</Select.Option>
                <Select.Option value="件">件</Select.Option>
                <Select.Option value="包">包</Select.Option>
                <Select.Option value="盒">盒</Select.Option>
              </Select>
            </div>
          </Col>
        </Row>
      )
    }

    // 专用设备或通用设备的完整表单
    return (
      <>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                {deviceType === 'device' ? '专用设备' : '通用设备'}名称 <span style={{ color: '#ff4d4f' }}>*</span>
              </label>
              <Select
                showSearch
                placeholder={`输入或选择${deviceType === 'device' ? '专用设备' : '通用设备'}名称`}
                value={batchFormData.itemName}
                onChange={(value) => handleBatchFormChange('itemName', value)}
                style={{ width: '100%' }}
                options={getExistingItemNames().map(name => ({ value: name, label: name }))}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ padding: '0 8px 4px' }}>
                      <Input
                        placeholder={`输入新${deviceType === 'device' ? '专用设备' : '通用设备'}名称`}
                        onPressEnter={(e) => {
                          handleBatchFormChange('itemName', e.target.value)
                        }}
                      />
                    </div>
                  </>
                )}
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>数量 <span style={{ color: '#ff4d4f' }}>*</span></label>
              <InputNumber 
                min={1} 
                style={{ width: '100%' }} 
                placeholder="数量" 
                value={batchFormData.quantity}
                onChange={(value) => handleBatchFormChange('quantity', value)}
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>品牌</label>
              <Input 
                placeholder="请输入品牌" 
                value={batchFormData.brand}
                onChange={(e) => handleBatchFormChange('brand', e.target.value)}
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>型号规格</label>
              <Input 
                placeholder="请输入型号规格" 
                value={batchFormData.modelSpec}
                onChange={(e) => handleBatchFormChange('modelSpec', e.target.value)}
              />
            </div>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>单位</label>
              <Select 
                placeholder="请选择单位" 
                allowClear
                style={{ width: '100%' }}
                value={batchFormData.unit}
                onChange={(value) => handleBatchFormChange('unit', value)}
              >
                <Select.Option value="个">个</Select.Option>
                <Select.Option value="台">台</Select.Option>
                <Select.Option value="套">套</Select.Option>
                <Select.Option value="件">件</Select.Option>
              </Select>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>SN码</label>
              <Input 
                placeholder="请输入SN码" 
                value={batchFormData.snCode}
                onChange={(e) => handleBatchFormChange('snCode', e.target.value)}
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>设备状态</label>
              <Select 
                placeholder="请选择设备状态"
                style={{ width: '100%' }}
                value={batchFormData.status}
                onChange={(value) => handleBatchFormChange('status', value)}
              >
                <Select.Option value="正常">正常</Select.Option>
                <Select.Option value="维修中">维修中</Select.Option>
                <Select.Option value="报废">报废</Select.Option>
              </Select>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>使用状态</label>
              <Select 
                placeholder="请选择使用状态"
                style={{ width: '100%' }}
                value={batchFormData.usageStatus}
                onChange={(value) => handleBatchFormChange('usageStatus', value)}
              >
                <Select.Option value="未使用">未使用</Select.Option>
                <Select.Option value="使用中">使用中</Select.Option>
                <Select.Option value="借出">借出</Select.Option>
                <Select.Option value="维修">维修</Select.Option>
              </Select>
            </div>
          </Col>
        </Row>
        
        {deviceType === 'device' && (
          <>
            <Row gutter={16}>
              <Col span={6}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>所属公司</label>
                  <Input 
                    placeholder="请输入所属公司" 
                    value={batchFormData.company}
                    onChange={(e) => handleBatchFormChange('company', e.target.value)}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>所在仓库</label>
                  <Select 
                    placeholder="请选择所在仓库" 
                    allowClear
                    style={{ width: '100%' }}
                    value={batchFormData.warehouseId}
                    onChange={(value) => handleBatchFormChange('warehouseId', value)}
                  >
                    {warehouses.map(wh => (
                      <Select.Option key={wh.id} value={wh.id}>{wh.name}</Select.Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>其余配件</label>
                  <Input.TextArea 
                    rows={2} 
                    placeholder="请输入其余配件" 
                    value={batchFormData.otherAccessories}
                    onChange={(e) => handleBatchFormChange('otherAccessories', e.target.value)}
                  />
                </div>
              </Col>
            </Row>
          </>
        )}
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>备注</label>
          <Input.TextArea 
            rows={2} 
            placeholder="请输入备注" 
            value={batchFormData.remark}
            onChange={(e) => handleBatchFormChange('remark', e.target.value)}
          />
        </div>
      </>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="page-title">入库管理</h2>
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
        title="创建入库单"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={1000}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="入库类型" required>
            <Radio.Group 
              value={inboundMode} 
              onChange={(e) => {
                setInboundMode(e.target.value)
                setSelectedOutbound(null)
                setSelectedDevices([])
                setSelectedInboundItems([])
                setBatchFormVisible(false)
              }}
            >
              <Radio.Button value="new">新采购入库</Radio.Button>
              <Radio.Button value="return">已出库归还</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {inboundMode === 'return' ? (
            <>
              <Divider>查询出库单</Divider>
              <Row gutter={16}>
                <Col span={18}>
                  <Form.Item label="出库单号/赛事名称">
                    <Input 
                      placeholder="输入出库单号或赛事名称进行查询" 
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onPressEnter={handleSearchOutbound}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label=" ">
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearchOutbound}>
                      查询
                    </Button>
                  </Form.Item>
                </Col>
              </Row>

              {selectedOutbound && (
                <Card size="small" style={{ marginBottom: 16, background: '#f5f5f5' }}>
                  <p><strong>出库单号:</strong> {selectedOutbound.orderCode}</p>
                  <p><strong>出库日期:</strong> {selectedOutbound.orderDate}</p>
                  <p><strong>备注:</strong> {selectedOutbound.remark || '无'}</p>
                  <Button type="link" onClick={handleSelectDevices}>选择设备入库</Button>
                </Card>
              )}

              {selectedDevices.length > 0 && (
                <Card size="small" title="已选择归还设备" style={{ marginBottom: 16 }}>
                  <p>已选择 {selectedDevices.length} 个设备</p>
                </Card>
              )}
            </>
          ) : (
            <>
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
                      { title: '类型', dataIndex: 'itemType', key: 'itemType', width: 80 },
                      { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
                      { title: '编号', dataIndex: 'code', key: 'code', width: 100 },
                      { title: '品牌', dataIndex: 'brand', key: 'brand', width: 80 },
                      { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 100 },
                      { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                      { title: 'SN码', dataIndex: 'snCode', key: 'snCode', width: 100 },
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
                          deviceType === 'consumable' ? (
                            <InputNumber 
                              min={1}
                              value={text}
                              onChange={(value) => handleQuantityChange(index, value)}
                              style={{ width: 60 }}
                            />
                          ) : (
                            <span>{text}</span>
                          )
                        )
                      },
                      {
                        title: '状态',
                        key: 'itemStatus',
                        width: 80,
                        render: (_, record) => (
                          record.isExisting ? <Tag color="blue">已有</Tag> : <Tag color="green">新增</Tag>
                        )
                      },
                      {
                        title: '操作',
                        key: 'action',
                        width: 80,
                        render: (_, record, index) => (
                          <Button danger size="small" onClick={() => handleRemoveItem(index)}>移除</Button>
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
            </>
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
          <Button key="print" type="primary" icon={<FileTextOutlined />} onClick={handlePrint}>打印清单</Button>
        ]}
      >
        {currentInventoryList && (
          <div className="inventory-list">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2>入库清单</h2>
              <p>单号: {currentInventoryList.orderCode}</p>
              <p>日期: {currentInventoryList.orderDate}</p>
            </div>
            <Table
              dataSource={currentInventoryList.items}
              columns={[
                { title: '序号', key: 'index', render: (_, __, index) => index + 1, width: 60 },
                { title: '类型', dataIndex: 'itemType', key: 'itemType', width: 80 },
                { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
                { title: '编号', dataIndex: 'code', key: 'code', width: 120 },
                { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
                { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 120 },
                { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
                { title: '状态', key: 'status', render: (_, record) => record.isExisting ? '已有' : '新增', width: 80 }
              ]}
              pagination={false}
              size="small"
            />
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <p><strong>总计: {currentInventoryList.totalCount} 件</strong></p>
            </div>
            <div style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between' }}>
              <div>入库人: _______________</div>
              <div>审核人: _______________</div>
              <div>日期: _______________</div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="选择入库设备"
        open={outboundDevicesModal}
        onOk={() => setOutboundDevicesModal(false)}
        onCancel={() => setOutboundDevicesModal(false)}
        width={900}
      >
        <div style={{ marginBottom: 16 }}>
          <p>请选择需要入库的设备（已出库设备）:</p>
        </div>
        <Table
          dataSource={devices.filter(d => d.usageStatus === '使用中')}
          columns={[
            {
              title: '选择',
              key: 'select',
              width: 60,
              render: (_, record) => (
                <Checkbox 
                  checked={selectedDevices.includes(record.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDevices([...selectedDevices, record.id])
                    } else {
                      setSelectedDevices(selectedDevices.filter(id => id !== record.id))
                    }
                  }}
                />
              )
            },
            { title: '名称', dataIndex: 'deviceName', key: 'deviceName', width: 150 },
            { title: '设备编码', dataIndex: 'deviceCode', key: 'deviceCode', width: 120 },
            { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 150 },
            { title: '使用状态', dataIndex: 'usageStatus', key: 'usageStatus', width: 100 },
          ]}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
        <div style={{ marginTop: 16 }}>
          <p>已选择 {selectedDevices.length} 个设备</p>
        </div>
      </Modal>

      {/* 入库单详情弹窗 */}
      <Modal
        title="入库单详情"
        open={detailModalVisible}
        onOk={() => setDetailModalVisible(false)}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
      >
        {currentOrder && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <p><strong>入库单号:</strong> {currentOrder.orderCode}</p>
                </Col>
                <Col span={8}>
                  <p><strong>入库类型:</strong> {currentOrder.inboundType === 'new' ? '新采购' : '归还入库'}</p>
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
                  <p><strong>接收人:</strong> {currentOrder.receiver || '-'}</p>
                </Col>
                <Col span={6}>
                  <p><strong>联系电话:</strong> {currentOrder.receiverPhone || '-'}</p>
                </Col>
                <Col span={6}>
                  <p><strong>物品数量:</strong> {currentOrder.items ? currentOrder.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0}</p>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={24}>
                  <p><strong>备注:</strong> {currentOrder.remark || '-'}</p>
                </Col>
              </Row>
            </Card>

            <Card size="small" title="入库物品明细">
              <Table
                dataSource={currentOrder.items || []}
                columns={[
                  { title: '序号', key: 'index', width: 60, render: (_, __, index) => index + 1 },
                  { 
                    title: '类型', 
                    key: 'itemType', 
                    width: 100,
                    render: (_, item) => {
                      // 优先使用新的 itemType 字段，否则根据 device 判断
                      if (item.itemType) {
                        return itemTypeName(item.itemType)
                      }
                      const type = item.device ? 'device' : item.accessory ? 'accessory' : item.consumable ? 'consumable' : 'device'
                      return itemTypeName(type)
                    }
                  },
                  { 
                    title: '名称', 
                    key: 'name', 
                    width: 150,
                    render: (_, item) => {
                      // 优先使用新的 itemName 字段，否则使用 device 对象
                      return item.itemName || item.device?.deviceName || item.accessory?.accessoryName || item.consumable?.consumableName || '-'
                    }
                  },
                  { 
                    title: '编号', 
                    key: 'code', 
                    width: 150,
                    render: (_, item) => {
                      // 优先使用新的 itemCode 字段，否则使用 device 对象
                      return item.itemCode || item.device?.deviceCode || item.accessory?.accessoryCode || item.consumable?.consumableCode || '-'
                    }
                  },
                  { 
                    title: '品牌', 
                    key: 'brand', 
                    width: 100, 
                    render: (_, item) => {
                      // 优先使用新的 brand 字段，否则使用 device 对象
                      return item.brand || item.device?.brand || item.accessory?.brand || item.consumable?.brand || '-'
                    }
                  },
                  { 
                    title: '型号', 
                    key: 'modelSpec', 
                    width: 150, 
                    render: (_, item) => {
                      // 优先使用新的 modelSpec 字段，否则使用 device 对象
                      return item.modelSpec || item.device?.modelSpec || item.accessory?.modelSpec || item.consumable?.modelSpec || '-'
                    }
                  },
                  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80, render: (text) => text || 1 },
                  { 
                    title: '状态', 
                    key: 'status', 
                    width: 100,
                    render: (_, item) => {
                      // 如果已关联设备，显示已完成
                      if (item.device) {
                        return <Tag color="blue">已入库</Tag>
                      }
                      return <Tag color="green">待入库</Tag>
                    }
                  },
                ]}
                pagination={false}
                size="small"
                scroll={{ x: 900 }}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}



export default InboundManagement
