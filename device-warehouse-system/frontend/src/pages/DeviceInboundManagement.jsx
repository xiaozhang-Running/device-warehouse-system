import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Popconfirm, Divider, Row, Col, Radio, InputNumber } from 'antd'
import { PlusOutlined, DeleteOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons'

function DeviceInboundManagement() {
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
      const response = await fetch('/api/inbound')
      const data = await response.json()
      // 只显示设备采购入库单（inboundType为new）
      setInboundOrders(data.filter(order => order.inboundType === 'new'))
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
        const match = code.match(/(\d+)$/)
        if (match) {
          const num = parseInt(match[1])
          if (num > maxNum) maxNum = num
        }
      }
    })
    return maxNum
  }

  // 生成设备编码
  const generateDeviceCode = (deviceName, type = 'device', startNum = null) => {
    const maxNum = getMaxDeviceCode(deviceName, type)
    const nextNum = startNum !== null ? startNum : maxNum + 1
    if (type === 'consumable') {
      return `HC-${deviceName}-${String(nextNum).padStart(3, '0')}`
    }
    const prefix = type === 'device' ? 'DEV' : 'ACC'
    return `${prefix}-${deviceName}-${String(nextNum).padStart(3, '0')}`
  }

  // 检查设备是否已存在
  const checkExistingDevice = (name, brand, modelSpec, type = 'device') => {
    if (type === 'device') {
      return devices.find(d => 
        d.deviceName === name && 
        d.brand === brand && 
        d.modelSpec === modelSpec
      )
    } else if (type === 'accessory') {
      return accessories.find(a => 
        a.accessoryName === name && 
        a.brand === brand && 
        a.modelSpec === modelSpec
      )
    } else if (type === 'consumable') {
      return consumables.find(c => 
        c.consumableName === name && 
        c.brand === brand && 
        c.modelSpec === modelSpec
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

  const handleBatchFormChange = (field, value) => {
    setBatchFormData(prev => ({ ...prev, [field]: value }))
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
        code: existingItem?.consumableCode || generateDeviceCode(name, 'consumable'),
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
      setSelectedInboundItems([...selectedInboundItems, newItem])
      message.success(`已添加耗材: ${name} x${quantity}`)
      resetBatchForm()
      return
    }

    // 专用设备入库 - 批量生成，每个设备都有完整信息
    if (deviceType === 'device') {
      const maxNum = getMaxDeviceCode(name, 'device')
      const startNum = maxNum + 1
      
      const newItems = []
      for (let i = 0; i < parseInt(quantity); i++) {
        const deviceCode = generateDeviceCode(name, 'device', startNum + i)
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
      message.success(`新设备 ${name} 从 ${generateDeviceCode(name, 'device', startNum)} 开始编号，共添加 ${quantity} 台`)
      resetBatchForm()
      return
    }

    // 通用设备入库
    if (deviceType === 'accessory') {
      const maxNum = getMaxDeviceCode(name, 'accessory')
      const startNum = maxNum + 1
      
      const newItems = []
      for (let i = 0; i < parseInt(quantity); i++) {
        const accessoryCode = generateDeviceCode(name, 'accessory', startNum + i)
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
      message.success(`新设备 ${name} 从 ${generateDeviceCode(name, 'accessory', startNum)} 开始编号，共添加 ${quantity} 台`)
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

  const generateInventoryList = () => {
    const orderCode = 'IN-' + Date.now()
    setCurrentInventoryList({
      orderCode,
      orderDate: new Date().toLocaleDateString(),
      items: selectedInboundItems,
      totalCount: selectedInboundItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    })
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
        inboundType: 'new',
        deviceType: deviceType,
        items: selectedInboundItems,
        totalCount: selectedInboundItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
        remark: values.remark || '',
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
    setCurrentOrder(record)
    setDetailModalVisible(true)
  }

  const itemTypeName = (type) => {
    switch (type) {
      case 'device': return '专用设备'
      case 'accessory': return '通用设备'
      case 'consumable': return '耗材'
      default: return type
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
              <Select.Option value="包">包</Select.Option>
              <Select.Option value="盒">盒</Select.Option>
              <Select.Option value="箱">箱</Select.Option>
            </Select>
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>品牌</div>
            <Input 
              placeholder="请输入品牌" 
              value={batchFormData.brand}
              onChange={(e) => handleBatchFormChange('brand', e.target.value)}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>型号规格</div>
            <Input 
              placeholder="请输入型号规格" 
              value={batchFormData.modelSpec}
              onChange={(e) => handleBatchFormChange('modelSpec', e.target.value)}
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
            <div style={{ marginBottom: 8 }}>物品名称</div>
            <Input 
              placeholder="请输入物品名称" 
              value={batchFormData.name}
              onChange={(e) => handleBatchFormChange('name', e.target.value)}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>品牌</div>
            <Input 
              placeholder="请输入品牌" 
              value={batchFormData.brand}
              onChange={(e) => handleBatchFormChange('brand', e.target.value)}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>型号规格</div>
            <Input 
              placeholder="请输入型号规格" 
              value={batchFormData.modelSpec}
              onChange={(e) => handleBatchFormChange('modelSpec', e.target.value)}
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
      width: 180,
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
      width: 100,
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
      width: 100,
      render: (_, record) => record.items ? record.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0
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
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
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
    }
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
                  { title: '类型', dataIndex: 'itemType', key: 'itemType', width: 80, render: (type) => itemTypeName(type) },
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

          <Divider>入库信息</Divider>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="orderDate" label="入库日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="receiver" label="接收人">
                <Input placeholder="请输入接收人" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
          <Button key="print" type="primary" icon={<FileTextOutlined />} onClick={() => window.print()}>打印清单</Button>
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
                { title: '类型', dataIndex: 'itemType', key: 'itemType', width: 80, render: (type) => itemTypeName(type) },
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
                  { title: '类型', dataIndex: 'itemType', key: 'itemType', width: 100, render: (type) => itemTypeName(type) },
                  { title: '名称', dataIndex: 'itemName', key: 'itemName', width: 150 },
                  { title: '编号', dataIndex: 'itemCode', key: 'itemCode', width: 150 },
                  { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
                  { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 150 },
                  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80, render: (text) => text || 1 },
                  { title: 'SN码', dataIndex: 'snCode', key: 'snCode', width: 120 },
                  { 
                    title: '状态', 
                    key: 'status', 
                    width: 100,
                    render: (_, item) => item.isExisting ? <Tag color="blue">已有规格</Tag> : <Tag color="green">新增规格</Tag>
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

export default DeviceInboundManagement
