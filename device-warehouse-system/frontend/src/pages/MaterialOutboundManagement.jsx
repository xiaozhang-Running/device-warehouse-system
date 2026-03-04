import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Popconfirm, Row, Col, Divider, InputNumber, Descriptions, List } from 'antd'
import { CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, PrinterOutlined, SearchOutlined, DoubleRightOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

function MaterialOutboundManagement() {
  const navigate = useNavigate()
  const [outboundOrders, setOutboundOrders] = useState([])
  const [materials, setMaterials] = useState([])
  const [allMaterials, setAllMaterials] = useState([])
  const [users, setUsers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [form] = Form.useForm()
  const [items, setItems] = useState([])
  const [searchText, setSearchText] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [materialPagination, setMaterialPagination] = useState({ current: 1, pageSize: 10 })
  const [materialDetailVisible, setMaterialDetailVisible] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
    } else {
      const mockUser = { id: 1, username: 'admin', name: '管理员', role: '管理员' }
      setCurrentUser(mockUser)
    }
    fetchOrders()
    fetchMaterials()
    fetchUsers()
  }, [])

  // 获取出库单列表
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/outbound')
      const data = await response.json()
      // 只显示原材料出库单
      const materialOrders = data.filter(order => order.orderType === 'MATERIAL_OUTBOUND')
      setOutboundOrders(materialOrders)
    } catch (error) {
      console.error('获取出库单列表失败:', error)
      message.error('获取出库单列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取原材料列表
  const fetchMaterials = async () => {
    try {
      const materialsRes = await fetch('/api/materials').then(res => res.json()).catch(() => [])
      
      // 筛选状态为在库的原材料
      const materialsWithType = materialsRes
        .filter(m => m.status === '在库')
        .map(m => ({ 
          ...m, 
          itemType: '原材料',
          deviceName: m.materialName,
          deviceCode: m.materialCode,
          brand: m.brand || '',
          model: m.model || '',
          specification: m.specification
        }))

      setAllMaterials(materialsWithType)
      setMaterials(materialsWithType)
    } catch (error) {
      console.error('获取原材料列表失败:', error)
    }
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

  // 添加原材料到出库清单
  const handleAddMaterial = (material) => {
    const existingItem = items.find(item => item.deviceId === material.id)
    if (existingItem) {
      message.warning('该原材料已在出库清单中')
      return
    }

    const newItem = {
      key: Date.now(),
      deviceId: material.id,
      deviceName: material.materialName,
      deviceCode: material.materialCode,
      brand: material.brand || '',
      itemType: '原材料',
      quantity: 1,
      unit: material.unit || '件',
      remark: '',
      brandModel: `${material.brand || ''} ${material.model || ''}`.trim(),
      maxQuantity: material.quantity || 0
    }

    const newItems = [...items, newItem]
    setItems(newItems)
    
    // 从右侧原材料列表中移除已选择的原材料
    const selectedMaterialIds = newItems.map(item => item.deviceId)
    let filtered = allMaterials.filter(m => !selectedMaterialIds.includes(m.id))
    
    // 应用搜索文本筛选
    if (searchText && searchText.trim() !== '') {
      filtered = filtered.filter(m => 
        m.materialName?.toLowerCase().includes(searchText.toLowerCase()) ||
        m.materialCode?.toLowerCase().includes(searchText.toLowerCase())
      )
    }
    
    setMaterials(filtered)
    message.success('已添加到出库清单')
  }

  // 从出库清单中移除
  const handleRemoveItem = (key) => {
    const removedItem = items.find(item => item.key === key)
    const newItems = items.filter(item => item.key !== key)
    setItems(newItems)
    
    // 将移除的原材料重新添加到右侧列表
    if (removedItem) {
      const originalMaterial = allMaterials.find(m => m.id === removedItem.deviceId)
      if (originalMaterial) {
        let filtered = [...materials, originalMaterial]
        
        // 应用搜索文本筛选
        if (searchText && searchText.trim() !== '') {
          filtered = filtered.filter(m => 
            m.materialName?.toLowerCase().includes(searchText.toLowerCase()) ||
            m.materialCode?.toLowerCase().includes(searchText.toLowerCase())
          )
        }
        
        setMaterials(filtered)
      }
    }
  }

  // 更新出库清单项
  const handleUpdateItem = (key, field, value) => {
    const newItems = items.map(item => {
      if (item.key === key) {
        return { ...item, [field]: value }
      }
      return item
    })
    setItems(newItems)
  }

  // 搜索原材料
  const handleSearch = (value) => {
    setSearchText(value)
    const selectedMaterialIds = items.map(item => item.deviceId)
    let filtered = allMaterials.filter(m => !selectedMaterialIds.includes(m.id))
    
    if (value && value.trim() !== '') {
      filtered = filtered.filter(m => 
        m.materialName?.toLowerCase().includes(value.toLowerCase()) ||
        m.materialCode?.toLowerCase().includes(value.toLowerCase())
      )
    }
    
    setMaterials(filtered)
    setMaterialPagination({ ...materialPagination, current: 1 })
  }

  // 打开新建出库单弹窗
  const handleAdd = () => {
    setItems([])
    setMaterials(allMaterials)
    form.resetFields()
    form.setFieldsValue({
      orderDate: dayjs(),
      handledBy: currentUser?.name || ''
    })
    setModalVisible(true)
  }

  // 提交出库单
  const handleModalOk = async () => {
    if (items.length === 0) {
      message.error('请至少添加一个原材料到出库清单')
      return
    }

    try {
      const values = await form.validateFields()
      
      const orderData = {
        orderCode: `MO${Date.now()}`,
        orderDate: values.orderDate.format('YYYY-MM-DD'),
        status: 'PENDING',
        remark: values.remark || '',
        operatorId: currentUser.id,
        handledBy: values.handledBy,
        deptApprover: values.deptApprover,
        warehouseKeeper: values.warehouseKeeper,
        usageType: values.usageType,
        recipientName: values.recipientName,
        contactPhone: values.contactPhone,
        usageLocation: values.usageLocation,
        orderType: 'MATERIAL_OUTBOUND',
        items: items.map(item => ({
          deviceId: item.deviceId,
          itemType: 'material',
          quantity: item.quantity,
          unit: item.unit,
          remark: item.remark,
          brandModel: item.brandModel
        }))
      }

      const response = await fetch('/api/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (result.success) {
        message.success('原材料出库单创建成功')
        setModalVisible(false)
        fetchOrders()
        setItems([])
      } else {
        message.error(result.message || '创建失败')
      }
    } catch (error) {
      console.error('创建出库单失败:', error)
      message.error('创建失败')
    }
  }

  // 完成出库单
  const handleComplete = async (order) => {
    try {
      const response = await fetch(`/api/outbound/${order.id}/complete`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        message.success('出库单已完成')
        fetchOrders()
      } else {
        message.error('完成出库单失败')
      }
    } catch (error) {
      console.error('完成出库单失败:', error)
      message.error('完成出库单失败')
    }
  }

  // 取消出库单
  const handleCancel = async (order) => {
    try {
      const response = await fetch(`/api/outbound/${order.id}/cancel`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        message.success('出库单已取消')
        fetchOrders()
      } else {
        message.error('取消出库单失败')
      }
    } catch (error) {
      console.error('取消出库单失败:', error)
      message.error('取消出库单失败')
    }
  }

  // 删除出库单
  const handleDelete = async (order) => {
    try {
      const response = await fetch(`/api/outbound/${order.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        message.success('出库单已删除')
        fetchOrders()
      } else {
        message.error('删除出库单失败')
      }
    } catch (error) {
      console.error('删除出库单失败:', error)
      message.error('删除出库单失败')
    }
  }

  // 查看出库单详情
  const handleViewDetail = (order) => {
    setCurrentOrder(order)
    setDetailModalVisible(true)
  }

  // 查看原材料详情
  const handleViewMaterialDetail = (material) => {
    setSelectedMaterial(material)
    setMaterialDetailVisible(true)
  }

  // 出库清单表格列
  const itemColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', render: (_, __, index) => index + 1, width: 60 },
    { title: '原材料名称', dataIndex: 'deviceName', key: 'deviceName' },
    { title: '原材料编号', dataIndex: 'deviceCode', key: 'deviceCode' },
    { title: '品牌型号', dataIndex: 'brandModel', key: 'brandModel', render: (text) => text || '-' },
    { 
      title: '数量', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (text, record) => (
        <InputNumber
          min={1}
          max={record.maxQuantity}
          value={text}
          onChange={(value) => handleUpdateItem(record.key, 'quantity', value)}
          style={{ width: 80 }}
        />
      )
    },
    { 
      title: '单位', 
      dataIndex: 'unit', 
      key: 'unit',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleUpdateItem(record.key, 'unit', e.target.value)}
          style={{ width: 80 }}
        />
      )
    },
    { 
      title: '备注', 
      dataIndex: 'remark', 
      key: 'remark',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleUpdateItem(record.key, 'remark', e.target.value)}
          placeholder="备注"
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        >
          移除
        </Button>
      )
    }
  ]

  // 原材料列表表格列
  const materialColumns = [
    { title: '序号', dataIndex: 'seqNo', key: 'seqNo', width: 60 },
    { 
      title: '原材料编号', 
      dataIndex: 'materialCode', 
      key: 'materialCode',
      render: (text, record) => (
        <Space>
          {text}
          <EyeOutlined 
            style={{ color: '#1890ff', cursor: 'pointer' }}
            onClick={() => handleViewMaterialDetail(record)}
          />
        </Space>
      )
    },
    { title: '原材料名称', dataIndex: 'materialName', key: 'materialName' },
    { title: '品牌', dataIndex: 'brand', key: 'brand', render: (text) => text || '-' },
    { title: '型号', dataIndex: 'model', key: 'model', render: (text) => text || '-' },
    { title: '规格', dataIndex: 'specification', key: 'specification', render: (text) => text || '-' },
    { 
      title: '数量', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (text) => text || 0
    },
    { title: '单位', dataIndex: 'unit', key: 'unit', render: (text) => text || '件' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusCircleOutlined />}
          onClick={() => handleAddMaterial(record)}
        >
          添加
        </Button>
      )
    }
  ]

  // 出库单列表表格列
  const orderColumns = [
    { title: '出库单号', dataIndex: 'orderCode', key: 'orderCode' },
    { title: '出库日期', dataIndex: 'orderDate', key: 'orderDate' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        const statusMap = {
          'PENDING': { color: 'warning', text: '待出库' },
          'COMPLETED': { color: 'success', text: '已完成' },
          'CANCELLED': { color: 'default', text: '已取消' }
        }
        const { color, text } = statusMap[status] || { color: 'default', text: status }
        return <Tag color={color}>{text}</Tag>
      }
    },
    { title: '经办人', dataIndex: 'handledBy', key: 'handledBy' },
    { title: '领用人', dataIndex: 'recipientName', key: 'recipientName' },
    { title: '用途类型', dataIndex: 'usageType', key: 'usageType' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button type="link" icon={<CheckOutlined />} onClick={() => handleComplete(record)}>
                完成
              </Button>
              <Button type="link" danger icon={<CloseOutlined />} onClick={() => handleCancel(record)}>
                取消
              </Button>
            </>
          )}
          <Popconfirm
            title="确定删除此出库单吗？"
            onConfirm={() => handleDelete(record)}
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

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="原材料出库管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建出库单
          </Button>
        }
      >
        <Table
          columns={orderColumns}
          dataSource={outboundOrders}
          rowKey="id"
          loading={loading}
        />
      </Card>

      {/* 新建出库单弹窗 */}
      <Modal
        title="新建原材料出库单"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false)
          setItems([])
          fetchMaterials()
        }}
        width={1400}
        okText="确定"
        cancelText="取消"
      >
        <Row gutter={24}>
          {/* 左侧：出库清单 */}
          <Col span={14}>
            <Card title="出库清单" size="small">
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="key"
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
              />
            </Card>
            
            <Card title="出库信息" size="small" style={{ marginTop: 16 }}>
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="orderDate"
                      label="出库日期"
                      rules={[{ required: true, message: '请选择出库日期' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="handledBy"
                      label="经办人"
                      rules={[{ required: true, message: '请输入经办人' }]}
                    >
                      <Input placeholder="请输入经办人" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="deptApprover"
                      label="部门审批人"
                    >
                      <Input placeholder="请输入部门审批人" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="warehouseKeeper"
                      label="仓库管理员"
                    >
                      <Input placeholder="请输入仓库管理员" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="usageType"
                      label="用途类型"
                      rules={[{ required: true, message: '请选择用途类型' }]}
                    >
                      <Select placeholder="请选择用途类型">
                        <Option value="生产使用">生产使用</Option>
                        <Option value="维修使用">维修使用</Option>
                        <Option value="研发使用">研发使用</Option>
                        <Option value="其他">其他</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="recipientName"
                      label="领用人"
                      rules={[{ required: true, message: '请输入领用人' }]}
                    >
                      <Input placeholder="请输入领用人" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="contactPhone"
                      label="联系电话"
                    >
                      <Input placeholder="请输入联系电话" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="usageLocation"
                      label="使用地点"
                    >
                      <Input placeholder="请输入使用地点" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="remark" label="备注">
                  <TextArea rows={2} placeholder="请输入备注" />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* 右侧：原材料列表 */}
          <Col span={10}>
            <Card 
              title="原材料库存" 
              size="small"
              extra={
                <Input.Search
                  placeholder="搜索原材料"
                  allowClear
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: 200 }}
                />
              }
            >
              <Table
                columns={materialColumns}
                dataSource={materials}
                rowKey="id"
                pagination={{
                  ...materialPagination,
                  onChange: (page, pageSize) => setMaterialPagination({ current: page, pageSize }),
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                  showTotal: (total) => `共 ${total} 条`
                }}
                size="small"
                scroll={{ y: 500 }}
              />
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* 出库单详情弹窗 */}
      <Modal
        title="出库单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentOrder && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="出库单号">{currentOrder.orderCode}</Descriptions.Item>
              <Descriptions.Item label="出库日期">{currentOrder.orderDate}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {currentOrder.status === 'PENDING' ? '待出库' : 
                 currentOrder.status === 'COMPLETED' ? '已完成' : '已取消'}
              </Descriptions.Item>
              <Descriptions.Item label="经办人">{currentOrder.handledBy}</Descriptions.Item>
              <Descriptions.Item label="部门审批人">{currentOrder.deptApprover || '-'}</Descriptions.Item>
              <Descriptions.Item label="仓库管理员">{currentOrder.warehouseKeeper || '-'}</Descriptions.Item>
              <Descriptions.Item label="用途类型">{currentOrder.usageType}</Descriptions.Item>
              <Descriptions.Item label="领用人">{currentOrder.recipientName}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentOrder.contactPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="使用地点">{currentOrder.usageLocation || '-'}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{currentOrder.remark || '-'}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <h4>出库明细</h4>
            <List
              size="small"
              bordered
              dataSource={currentOrder.items || []}
              renderItem={item => (
                <List.Item>
                  <Space>
                    <span>{item.device?.deviceName || item.consumable?.consumableName || item.material?.materialName}</span>
                    <span>数量: {item.quantity}</span>
                    <span>单位: {item.unit || '件'}</span>
                  </Space>
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>

      {/* 原材料详情弹窗 */}
      <Modal
        title="原材料详情"
        open={materialDetailVisible}
        onCancel={() => setMaterialDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedMaterial && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="原材料编号">{selectedMaterial.materialCode}</Descriptions.Item>
            <Descriptions.Item label="原材料名称">{selectedMaterial.materialName}</Descriptions.Item>
            <Descriptions.Item label="品牌">{selectedMaterial.brand || '-'}</Descriptions.Item>
            <Descriptions.Item label="型号">{selectedMaterial.model || '-'}</Descriptions.Item>
            <Descriptions.Item label="规格">{selectedMaterial.specification || '-'}</Descriptions.Item>
            <Descriptions.Item label="数量">{selectedMaterial.quantity || 0}</Descriptions.Item>
            <Descriptions.Item label="单位">{selectedMaterial.unit || '件'}</Descriptions.Item>
            <Descriptions.Item label="状态">{selectedMaterial.status}</Descriptions.Item>
            <Descriptions.Item label="所属公司">{selectedMaterial.company || '-'}</Descriptions.Item>
            <Descriptions.Item label="所在位置">{selectedMaterial.location || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{selectedMaterial.remark || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default MaterialOutboundManagement
