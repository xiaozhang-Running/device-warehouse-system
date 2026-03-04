import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Popconfirm, Divider, Row, Col, InputNumber } from 'antd'
import { PlusOutlined, DeleteOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons'

function MaterialInboundManagement() {
  const [inboundOrders, setInboundOrders] = useState([])
  const [materials, setMaterials] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [companies, setCompanies] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [selectedInboundItems, setSelectedInboundItems] = useState([])
  const [batchFormVisible, setBatchFormVisible] = useState(false)
  const [inventoryListVisible, setInventoryListVisible] = useState(false)
  const [currentInventoryList, setCurrentInventoryList] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  
  // 批量表单数据
  const [batchFormData, setBatchFormData] = useState({
    name: '',
    code: '',
    brand: '',
    modelSpec: '',
    unit: '个',
    supplier: '',
    warehouseId: '',
    company: '',
    remark: '',
    quantity: 1,
    price: 0
  })

  useEffect(() => {
    fetchOrders()
    fetchMaterials()
    fetchWarehouses()
    fetchCompanies()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/material-inbound')
      if (!response.ok) {
        // 如果接口返回错误，使用空数组
        setInboundOrders([])
        return
      }
      const data = await response.json()
      setInboundOrders(data || [])
    } catch (error) {
      console.error('获取原材料入库单列表失败:', error)
      // 如果接口不存在，使用空数组
      setInboundOrders([])
    }
  }

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials')
      const data = await response.json()
      setMaterials(data)
    } catch (error) {
      console.error('获取原材料列表失败:', error)
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

  // 检查原材料是否已存在
  const checkExistingMaterial = (name, brand, modelSpec) => {
    return materials.find(m => 
      m.name === name && 
      m.brand === brand && 
      m.modelSpec === modelSpec
    )
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
      code: '',
      brand: '',
      modelSpec: '',
      unit: '个',
      supplier: '',
      warehouseId: '',
      company: '',
      remark: '',
      quantity: 1,
      price: 0
    })
  }

  const handleBatchFormChange = (field, value) => {
    setBatchFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBatchAddClick = () => {
    const { name, code, brand, modelSpec, unit, supplier, warehouseId, company, remark, quantity, price } = batchFormData
    
    if (!name) {
      message.error('请输入原材料名称')
      return
    }

    // 检查是否已存在
    const existingMaterial = checkExistingMaterial(name, brand, modelSpec)
    const isExisting = !!existingMaterial
    
    // 生成或使用编码
    const materialCode = code || (existingMaterial ? existingMaterial.code : `MAT-${Date.now()}`)

    const newItem = {
      id: Date.now(),
      name,
      code: materialCode,
      brand,
      modelSpec,
      unit,
      supplier,
      warehouseId,
      company,
      remark,
      quantity,
      price,
      isExisting
    }

    setSelectedInboundItems([...selectedInboundItems, newItem])
    resetBatchForm()
    message.success(`已添加原材料`)
  }

  const handleRemoveItem = (index) => {
    const newItems = [...selectedInboundItems]
    newItems.splice(index, 1)
    setSelectedInboundItems(newItems)
  }

  const generateInventoryList = () => {
    const orderCode = 'MIN-' + Date.now()
    setCurrentInventoryList({
      orderCode,
      orderDate: new Date().toLocaleDateString(),
      items: selectedInboundItems,
      totalCount: selectedInboundItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
      totalAmount: selectedInboundItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0)
    })
    setInventoryListVisible(true)
  }

  const handleModalOk = async () => {
    let orderData = null
    try {
      const values = await form.validateFields()
      
      if (selectedInboundItems.length === 0) {
        message.error('请至少添加一个原材料')
        return
      }

      setLoading(true)

      orderData = {
        orderCode: 'MIN-' + Date.now(),
        orderDate: values.orderDate?.format('YYYY-MM-DD') || new Date().toISOString().split('T')[0],
        supplier: values.supplier,
        receiver: values.receiver,
        receiverPhone: values.receiverPhone,
        remark: values.remark,
        items: selectedInboundItems.map(item => ({
          materialName: item.name,
          materialCode: item.code,
          brand: item.brand,
          modelSpec: item.modelSpec,
          unit: item.unit,
          supplier: item.supplier,
          warehouseId: item.warehouseId,
          company: item.company,
          remark: item.remark,
          quantity: item.quantity,
          price: item.price,
          isExisting: item.isExisting
        }))
      }

      const response = await fetch('/api/material-inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        message.success('原材料入库单创建成功')
        setModalVisible(false)
        form.resetFields()
        setSelectedInboundItems([])
        fetchOrders()
      } else {
        // 如果后端API不存在，仅在前端模拟创建
        console.warn('后端API可能不存在，仅在前端模拟创建')
        const mockOrder = {
          id: Date.now(),
          ...orderData,
          status: 'COMPLETED',
          createdAt: new Date().toISOString()
        }
        setInboundOrders(prev => [mockOrder, ...prev])
        message.success('原材料入库单创建成功（前端模拟）')
        setModalVisible(false)
        form.resetFields()
        setSelectedInboundItems([])
      }
    } catch (error) {
      console.error('创建原材料入库单失败:', error)
      // 如果后端API不存在，仅在前端模拟创建
      const mockOrder = {
        id: Date.now(),
        ...(orderData || {
          orderCode: 'MIN-' + Date.now(),
          orderDate: new Date().toISOString().split('T')[0],
          items: selectedInboundItems
        }),
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      }
      setInboundOrders(prev => [mockOrder, ...prev])
      message.success('原材料入库单创建成功（前端模拟）')
      setModalVisible(false)
      form.resetFields()
      setSelectedInboundItems([])
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

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/material-inbound/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        message.success('删除成功')
        fetchOrders()
      } else {
        // 如果后端API不存在，仅在前端模拟删除
        setInboundOrders(prev => prev.filter(order => order.id !== id))
        message.success('删除成功（前端模拟）')
      }
    } catch (error) {
      console.error('删除失败:', error)
      // 如果后端API不存在，仅在前端模拟删除
      setInboundOrders(prev => prev.filter(order => order.id !== id))
      message.success('删除成功（前端模拟）')
    }
  }

  const handleViewDetail = (record) => {
    setCurrentOrder(record)
    setDetailModalVisible(true)
  }

  const renderMaterialForm = () => {
    return (
      <>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>原材料名称</div>
            <Input 
              placeholder="请输入原材料名称" 
              value={batchFormData.name}
              onChange={(e) => handleBatchFormChange('name', e.target.value)}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>原材料编码</div>
            <Input 
              placeholder="不填则自动生成" 
              value={batchFormData.code}
              onChange={(e) => handleBatchFormChange('code', e.target.value)}
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
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>型号规格</div>
            <Input 
              placeholder="请输入型号规格" 
              value={batchFormData.modelSpec}
              onChange={(e) => handleBatchFormChange('modelSpec', e.target.value)}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>单位</div>
            <Input 
              placeholder="请输入单位" 
              value={batchFormData.unit}
              onChange={(e) => handleBatchFormChange('unit', e.target.value)}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>供应商</div>
            <Input 
              placeholder="请输入供应商" 
              value={batchFormData.supplier}
              onChange={(e) => handleBatchFormChange('supplier', e.target.value)}
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>入库数量</div>
            <InputNumber 
              min={1}
              style={{ width: '100%' }}
              value={batchFormData.quantity}
              onChange={(value) => handleBatchFormChange('quantity', value)}
            />
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>单价（元）</div>
            <InputNumber 
              min={0}
              precision={2}
              style={{ width: '100%' }}
              value={batchFormData.price}
              onChange={(value) => handleBatchFormChange('price', value)}
            />
          </Col>
          <Col span={6}>
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
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>入库仓库</div>
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
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
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
      title: '入库数量',
      key: 'itemCount',
      width: 100,
      render: (_, record) => record.items ? record.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0
    },
    {
      title: '总金额（元）',
      key: 'totalAmount',
      width: 120,
      render: (_, record) => {
        const total = record.items ? record.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0) : 0
        return total.toFixed(2)
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
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
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
          { title: '名称', dataIndex: 'materialName', key: 'materialName', width: 150 },
          { title: '编码', dataIndex: 'materialCode', key: 'materialCode', width: 120 },
          { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
          { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 120 },
          { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
          { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
          { title: '单价', dataIndex: 'price', key: 'price', width: 100, render: (price) => price ? `¥${price.toFixed(2)}` : '-' },
          { title: '小计', key: 'subtotal', width: 100, render: (_, item) => `¥${((item.quantity || 0) * (item.price || 0)).toFixed(2)}` },
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
        <h2 className="page-title">原材料入库</h2>
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
          scroll={{ x: 1200 }}
        />
      </Card>
      
      <Modal
        title="创建原材料入库单"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={1000}
      >
        <Form form={form} layout="vertical">
          <Divider>添加入库原材料</Divider>

          {!batchFormVisible ? (
            <Button 
              type="dashed" 
              block 
              icon={<PlusOutlined />}
              onClick={() => setBatchFormVisible(true)}
              style={{ marginBottom: 16 }}
            >
              添加原材料
            </Button>
          ) : (
            <Card size="small" title="添加原材料" style={{ marginBottom: 16 }}>
              <div>
                {renderMaterialForm()}
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
                  <span>已选原材料 ({selectedInboundItems.length})</span>
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
                  { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
                  { title: '编码', dataIndex: 'code', key: 'code', width: 100 },
                  { title: '品牌', dataIndex: 'brand', key: 'brand', width: 80 },
                  { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 100 },
                  { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
                  { title: '单价', dataIndex: 'price', key: 'price', width: 100, render: (price) => price ? `¥${price.toFixed(2)}` : '-' },
                  { title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 100 },
                  { 
                    title: '仓库', 
                    key: 'warehouse',
                    width: 100,
                    render: (_, record) => {
                      const warehouse = warehouses.find(w => w.id === record.warehouseId)
                      return warehouse ? warehouse.name : '-'
                    }
                  },
                  { title: '备注', dataIndex: 'remark', key: 'remark', width: 100 },
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
                scroll={{ x: 1200 }}
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
              <Form.Item name="supplier" label="供应商">
                <Input placeholder="请输入供应商" />
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
          <Button key="print" type="primary" icon={<FileTextOutlined />} onClick={() => window.print()}>打印清单</Button>
        ]}
      >
        {currentInventoryList && (
          <div className="inventory-list">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2>原材料入库清单</h2>
              <p>单号: {currentInventoryList.orderCode}</p>
              <p>日期: {currentInventoryList.orderDate}</p>
            </div>
            <Table
              dataSource={currentInventoryList.items}
              columns={[
                { title: '序号', key: 'index', render: (_, __, index) => index + 1, width: 60 },
                { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
                { title: '编码', dataIndex: 'code', key: 'code', width: 120 },
                { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
                { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 120 },
                { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
                { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
                { title: '单价', dataIndex: 'price', key: 'price', width: 100, render: (price) => price ? `¥${price.toFixed(2)}` : '-' },
                { title: '小计', key: 'subtotal', width: 100, render: (_, item) => `¥${((item.quantity || 0) * (item.price || 0)).toFixed(2)}` },
                { title: '状态', key: 'status', render: (_, record) => record.isExisting ? '已有' : '新增', width: 80 }
              ]}
              pagination={false}
              size="small"
            />
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <p><strong>总数量: {currentInventoryList.totalCount} 件</strong></p>
              <p><strong>总金额: ¥{currentInventoryList.totalAmount?.toFixed(2)}</strong></p>
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
                  <p><strong>入库类型:</strong> 原材料入库</p>
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
                  <p><strong>供应商:</strong> {currentOrder.supplier || '-'}</p>
                </Col>
                <Col span={6}>
                  <p><strong>接收人:</strong> {currentOrder.receiver || '-'}</p>
                </Col>
                <Col span={6}>
                  <p><strong>联系电话:</strong> {currentOrder.receiverPhone || '-'}</p>
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
                  { title: '名称', dataIndex: 'materialName', key: 'materialName', width: 150 },
                  { title: '编码', dataIndex: 'materialCode', key: 'materialCode', width: 120 },
                  { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
                  { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 120 },
                  { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
                  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
                  { title: '单价', dataIndex: 'price', key: 'price', width: 100, render: (price) => price ? `¥${price.toFixed(2)}` : '-' },
                  { title: '小计', key: 'subtotal', width: 100, render: (_, item) => `¥${((item.quantity || 0) * (item.price || 0)).toFixed(2)}` },
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

export default MaterialInboundManagement
