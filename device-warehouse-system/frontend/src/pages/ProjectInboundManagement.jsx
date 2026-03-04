import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, DatePicker, message, Space, Tag, Popconfirm, Divider, Row, Col, Checkbox } from 'antd'
import { PlusOutlined, DeleteOutlined, SearchOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons'

function ProjectInboundManagement() {
  const [inboundOrders, setInboundOrders] = useState([])
  const [outboundOrders, setOutboundOrders] = useState([])
  const [devices, setDevices] = useState([])
  const [accessories, setAccessories] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [selectedOutbound, setSelectedOutbound] = useState(null)
  const [selectedDevices, setSelectedDevices] = useState([])
  const [outboundDevicesModal, setOutboundDevicesModal] = useState(false)
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
      // 只显示项目入库单（inboundType为return）
      setInboundOrders(data.filter(order => order.inboundType === 'return'))
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
      const [devicesRes, accessoriesRes] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/accessories')
      ])
      
      const devicesData = await devicesRes.json()
      const accessoriesData = await accessoriesRes.json()
      
      setDevices(devicesData)
      setAccessories(accessoriesData)
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

  const handleAdd = () => {
    form.resetFields()
    setSelectedOutbound(null)
    setSelectedDevices([])
    setSearchText('')
    setModalVisible(true)
  }

  const handleSearchOutbound = () => {
    if (!searchText.trim()) {
      message.warning('请输入出库单号或赛事名称')
      return
    }
    
    const found = outboundOrders.find(order => 
      order.orderCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.eventName?.toLowerCase().includes(searchText.toLowerCase())
    )
    
    if (found) {
      setSelectedOutbound(found)
      message.success('找到出库单')
    } else {
      message.error('未找到匹配的出库单')
      setSelectedOutbound(null)
    }
  }

  const handleSelectDevices = () => {
    setOutboundDevicesModal(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      if (!selectedOutbound) {
        message.error('请选择出库单')
        return
      }

      if (selectedDevices.length === 0) {
        message.error('请至少选择一个设备')
        return
      }

      setLoading(true)

      const orderData = {
        orderCode: 'IN-' + Date.now(),
        orderDate: values.orderDate?.format('YYYY-MM-DD') || new Date().toISOString().split('T')[0],
        inboundType: 'return',
        relatedOutboundId: selectedOutbound.id,
        receiver: values.receiver,
        receiverPhone: values.receiverPhone,
        remark: values.remark,
        items: selectedDevices.map(deviceId => {
          const device = devices.find(d => d.id === deviceId) || accessories.find(a => a.id === deviceId)
          return {
            itemType: device?.deviceName ? 'device' : 'accessory',
            itemName: device?.deviceName || device?.accessoryName,
            itemCode: device?.deviceCode || device?.accessoryCode,
            brand: device?.brand,
            modelSpec: device?.modelSpec,
            unit: device?.unit,
            snCode: device?.snCode,
            deviceId: deviceId,
            quantity: 1
          }
        })
      }

      const response = await fetch('/api/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        message.success('项目入库单创建成功')
        setModalVisible(false)
        form.resetFields()
        setSelectedOutbound(null)
        setSelectedDevices([])
        fetchOrders()
      } else {
        message.error('创建失败')
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
    setSelectedOutbound(null)
    setSelectedDevices([])
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/inbound/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        message.success('删除成功')
        fetchOrders()
      } else {
        message.error('删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
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
      default: return type
    }
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
      title: '关联出库单',
      key: 'relatedOutbound',
      width: 180,
      render: (_, record) => {
        const outbound = outboundOrders.find(o => o.id === record.relatedOutboundId)
        return outbound ? outbound.orderCode : '-'
      }
    },
    {
      title: '赛事名称',
      key: 'eventName',
      width: 150,
      render: (_, record) => {
        const outbound = outboundOrders.find(o => o.id === record.relatedOutboundId)
        return outbound ? outbound.eventName : '-'
      }
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
      title: '归还数量',
      key: 'itemCount',
      width: 100,
      render: (_, record) => record.items ? record.items.length : 0
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
          { title: '类型', dataIndex: 'itemType', key: 'itemType', width: 80, render: (type) => itemTypeName(type) },
          { title: '名称', dataIndex: 'itemName', key: 'itemName', width: 150 },
          { title: '编号', dataIndex: 'itemCode', key: 'itemCode', width: 120 },
          { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
          { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 120 },
          { title: 'SN码', dataIndex: 'snCode', key: 'snCode', width: 120 },
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
        <h2 className="page-title">项目入库</h2>
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
        title="创建项目入库单"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={900}
      >
        <Form form={form} layout="vertical">
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
              <Row gutter={16}>
                <Col span={8}>
                  <p><strong>出库单号:</strong> {selectedOutbound.orderCode}</p>
                </Col>
                <Col span={8}>
                  <p><strong>赛事名称:</strong> {selectedOutbound.eventName}</p>
                </Col>
                <Col span={8}>
                  <p><strong>出库日期:</strong> {selectedOutbound.orderDate}</p>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <p><strong>备注:</strong> {selectedOutbound.remark || '无'}</p>
                </Col>
              </Row>
              <Button type="link" onClick={handleSelectDevices}>选择设备入库</Button>
            </Card>
          )}

          {selectedDevices.length > 0 && (
            <Card size="small" title="已选择归还设备" style={{ marginBottom: 16 }}>
              <p>已选择 {selectedDevices.length} 个设备</p>
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
                  <p><strong>入库类型:</strong> 项目归还入库</p>
                </Col>
                <Col span={8}>
                  <p><strong>入库日期:</strong> {currentOrder.orderDate}</p>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={8}>
                  <p><strong>关联出库单:</strong> {
                    (() => {
                      const outbound = outboundOrders.find(o => o.id === currentOrder.relatedOutboundId)
                      return outbound ? outbound.orderCode : '-'
                    })()
                  }</p>
                </Col>
                <Col span={8}>
                  <p><strong>赛事名称:</strong> {
                    (() => {
                      const outbound = outboundOrders.find(o => o.id === currentOrder.relatedOutboundId)
                      return outbound ? outbound.eventName : '-'
                    })()
                  }</p>
                </Col>
                <Col span={8}>
                  <p><strong>状态:</strong> {currentOrder.status === 'PENDING' ? '待处理' : currentOrder.status === 'COMPLETED' ? '已完成' : '已取消'}</p>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={8}>
                  <p><strong>接收人:</strong> {currentOrder.receiver || '-'}</p>
                </Col>
                <Col span={8}>
                  <p><strong>联系电话:</strong> {currentOrder.receiverPhone || '-'}</p>
                </Col>
                <Col span={8}>
                  <p><strong>归还数量:</strong> {currentOrder.items ? currentOrder.items.length : 0}</p>
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
                  { title: 'SN码', dataIndex: 'snCode', key: 'snCode', width: 120 },
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

export default ProjectInboundManagement
