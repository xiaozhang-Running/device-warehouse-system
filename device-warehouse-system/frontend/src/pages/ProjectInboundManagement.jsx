import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, DatePicker, message, Space, Tag, Popconfirm, Divider, Row, Col, Checkbox, InputNumber, Select } from 'antd'
import { PlusOutlined, DeleteOutlined, SearchOutlined, FileTextOutlined, EyeOutlined, SwapOutlined, CheckOutlined, CheckCircleOutlined, PrinterOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

function ProjectInboundManagement() {
  const navigate = useNavigate()
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
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  
  const [transferModalVisible, setTransferModalVisible] = useState(false)
  const [transferDevice, setTransferDevice] = useState(null)
  const [transferOutbound, setTransferOutbound] = useState(null)
  const [transferRemark, setTransferRemark] = useState('')
  const [selectedDeviceStatus, setSelectedDeviceStatus] = useState({})
  const [selectedDeviceRemarks, setSelectedDeviceRemarks] = useState({})
  const [selectedDeviceQuantities, setSelectedDeviceQuantities] = useState({})

  useEffect(() => {
    fetchOrders()
    fetchOutboundOrders()
    fetchAllItems()
    fetchWarehouses()
  }, [])

  const fetchOrders = async () => {
    try {
      console.log('开始获取入库单数据...');
      const response = await fetch('/api/inbound');
      console.log('响应状态:', response.status);
      console.log('响应状态文本:', response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('获取到的入库单数据:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('获取到的数据不是数组');
      }
      
      const returnOrders = data.filter(order => order.inboundType === 'return');
      console.log('过滤后的项目入库单:', returnOrders);
      setInboundOrders(returnOrders);
    } catch (error) {
      console.error('获取入库单列表失败:', error);
      message.error('获取入库单列表失败');
    }
  }

  const fetchOutboundOrders = async () => {
    try {
      const response = await fetch('/api/outbound')
      const data = await response.json()
      console.log('获取到的出库单数据:', data)
      setOutboundOrders(data)
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
    setSelectedDeviceStatus({})
    setSelectedDeviceRemarks({})
    setSelectedDeviceQuantities({})
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

  const handleTransfer = (device) => {
    setTransferDevice(device)
    setTransferOutbound(null)
    setTransferRemark('')
    setTransferModalVisible(true)
  }

  const handleTransferOk = async () => {
    if (!transferOutbound) {
      message.error('请选择目标出库单')
      return
    }

    try {
      const response = await fetch('/api/outbound/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceOutboundId: selectedOutbound.id,
          targetOutboundId: transferOutbound.id,
          deviceId: transferDevice.deviceId,
          itemType: transferDevice.itemType,
          remark: transferRemark
        })
      })

      if (response.ok) {
        message.success('流转成功')
        setTransferModalVisible(false)
        fetchOutboundOrders()
        
        // 自动将流转的设备添加到将要入库的设备列表中
        if (!selectedDevices.includes(transferDevice.deviceId)) {
          setSelectedDevices([...selectedDevices, transferDevice.deviceId])
        }
        
        const newRemark = `流转至赛事：${transferOutbound.eventName}（${transferOutbound.orderCode}）`
        setSelectedDeviceRemarks(prev => ({
          ...prev,
          [String(transferDevice.deviceId)]: newRemark
        }))
        setSelectedDeviceStatus(prev => ({
          ...prev,
          [String(transferDevice.deviceId)]: 'normal'
        }))
      } else {
        message.error('流转失败')
      }
    } catch (error) {
      console.error('流转失败:', error)
      message.error('流转失败')
    }
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

      console.log('selectedOutbound:', selectedOutbound)
      console.log('selectedDevices:', selectedDevices)

      const orderData = {
        orderCode: 'IN-' + Date.now(),
        orderDate: values.orderDate?.format('YYYY-MM-DD') || new Date().toISOString().split('T')[0],
        inboundType: 'return',
        relatedOutboundId: selectedOutbound.id,
        deliverer: values.deliverer,
        receiver: values.receiver,
        receiverPhone: values.receiverPhone,
        remark: values.remark,
        deviceIds: selectedDevices,
        itemDetails: selectedDevices.map(deviceId => {
          const outboundItem = selectedOutbound?.items?.find(item => {
            if (item.device) return item.device.id === deviceId
            if (item.consumable) return item.consumable.id === deviceId
            if (item.accessory) return item.accessory.id === deviceId
            return false
          })
          
          if (outboundItem) {
            return {
              type: outboundItem.device ? 'device' : outboundItem.consumable ? 'consumable' : 'accessory',
              name: outboundItem.device?.deviceName || outboundItem.consumable?.consumableName || outboundItem.accessory?.accessoryName,
              code: outboundItem.device?.deviceCode || outboundItem.consumable?.consumableCode || outboundItem.accessory?.accessoryCode,
              brand: outboundItem.device?.brand || outboundItem.consumable?.brand || outboundItem.accessory?.brand,
              modelSpec: outboundItem.device?.modelSpec || outboundItem.consumable?.specification || outboundItem.accessory?.modelSpec,
              unit: outboundItem.device?.unit || outboundItem.consumable?.unit || outboundItem.accessory?.unit,
              quantity: selectedDeviceQuantities[deviceId] !== undefined ? selectedDeviceQuantities[deviceId] : 1,
              remark: selectedDeviceRemarks[String(deviceId)] || '',
              deviceId: deviceId
            }
          }
          
          return {
            type: 'device',
            name: '-',
            code: '-',
            quantity: 1
          }
        }),
        itemRemarks: selectedDeviceRemarks,
        itemStatuses: selectedDeviceStatus
      }

      const response = await fetch('/api/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          message.success(result.message || '项目入库单创建成功')
          setModalVisible(false)
          form.resetFields()
          setSelectedOutbound(null)
          setSelectedDevices([])
          setSelectedDeviceStatus({})
          setSelectedDeviceRemarks({})
          setSelectedDeviceQuantities({})
          fetchOrders()
          fetchOutboundOrders()
        } else {
          message.error(result.message || '创建失败')
        }
      } else {
        try {
          const errorData = await response.json()
          message.error(errorData.message || '创建失败')
        } catch (e) {
          message.error('创建失败，请稍后重试')
        }
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
    setSelectedDeviceStatus({})
    setSelectedDeviceRemarks({})
    setSelectedDeviceQuantities({})
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

  const handleComplete = async (id) => {
    try {
      const response = await fetch(`/api/inbound/${id}/complete`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        message.success('入库单已完成，设备状态已更新')
        fetchOrders()
      } else {
        message.error('完成入库单失败')
      }
    } catch (error) {
      console.error('完成入库单失败:', error)
      message.error('完成入库单失败')
    }
  }

  const handlePrint = (id) => {
    navigate(`/inbound/print/${id}`)
  }

  const handleViewDetail = async (record) => {
    try {
      // 重新从API获取最新的入库单详情
      const response = await fetch(`/api/inbound/${record.id}`);
      if (response.ok) {
        const orderDetail = await response.json();
        console.log('获取到的入库单详情:', orderDetail);
        setCurrentOrder(orderDetail);
        setDetailModalVisible(true);
      } else {
        message.error('获取入库单详情失败');
      }
    } catch (error) {
      console.error('获取入库单详情失败:', error);
      message.error('获取入库单详情失败');
    }
  }

  const itemTypeName = (type) => {
    switch (type) {
      case 'device': return '专用设备'
      case 'accessory': return '通用设备'
      case 'consumable': return '耗材'
      default: return type || '-'
    }
  }

  const statusName = (status) => {
    switch (status) {
      case 'normal': return <Tag color="green">正常</Tag>
      case 'damaged': return <Tag color="red">损坏</Tag>
      case 'transferred': return <Tag color="blue">已流转</Tag>
      default: return <Tag>{status}</Tag>
    }
  }

  const columns = [
    {
      title: '入库单号',
      dataIndex: 'orderCode',
      key: 'orderCode',
      width: 160,
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
        console.log('record.relatedOutboundId:', record.relatedOutboundId)
        console.log('outboundOrders:', outboundOrders)
        const outbound = outboundOrders.find(o => Number(o.id) === Number(record.relatedOutboundId))
        return outbound ? outbound.orderCode : '-'      }
    },
    {
      title: '赛事名称',
      key: 'eventName',
      width: 150,
      render: (_, record) => {
        const outbound = outboundOrders.find(o => Number(o.id) === Number(record.relatedOutboundId))
        return outbound ? outbound.eventName : '-'      }
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
      render: (_, record) => {
        console.log('record.items:', record.items)
        return record.items ? record.items.length : 0
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
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          {record.status === 'PENDING' && (
            <Popconfirm
              title="确定要完成此入库单吗？"
              description="完成后将更新设备状态并释放设备使用状态"
              onConfirm={() => handleComplete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" icon={<CheckCircleOutlined />} style={{ color: '#52c41a' }}>
                完成
              </Button>
            </Popconfirm>
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
        dataSource={record.items.map(item => {
          let deviceName = item.itemName || '-'
          let itemCode = item.itemCode || '-'
          let brand = item.brand || '-'
          let modelSpec = item.modelSpec || '-'
          let snCode = item.snCode || '-'
          
          if (item.device) {
            deviceName = item.device.deviceName || deviceName
            itemCode = item.device.deviceCode || itemCode
            brand = item.device.brand || brand
            modelSpec = item.device.modelSpec || modelSpec
            snCode = item.device.snCode || snCode
          } else if (item.accessory) {
            deviceName = item.accessory.accessoryName || deviceName
            itemCode = item.accessory.accessoryCode || itemCode
            brand = item.accessory.brand || brand
            modelSpec = item.accessory.modelSpec || modelSpec
          } else if (item.consumable) {
            deviceName = item.consumable.consumableName || deviceName
            itemCode = item.consumable.consumableCode || itemCode
            brand = item.consumable.brand || brand
            modelSpec = item.consumable.specification || modelSpec
          }
          
          return {
            ...item,
            deviceName,
            itemCode,
            brand,
            modelSpec,
            snCode
          }
        })}
        columns={[
          { title: '类型', dataIndex: 'itemType', key: 'itemType', width: 80, render: (type) => itemTypeName(type) },
          { title: '名称', dataIndex: 'deviceName', key: 'deviceName', width: 150 },
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
          scroll={{ x: 1200 }}
        />
      </Card>
      
      <Modal
        title="创建项目入库单"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={1400}
        style={{ top: 20 }}
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
            </Card>
          )}

          {selectedOutbound && (
            <>
              <Divider>出库单明细</Divider>
              <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>出库单内设备</h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Tag color="blue">共 {selectedOutbound?.items?.length || 0} 台</Tag>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => {
                        // 获取所有设备ID
                        const allDeviceIds = selectedOutbound?.items?.map(item => {
                          if (item.device) return item.device.id
                          if (item.consumable) return item.consumable.id
                          if (item.accessory) return item.accessory.id
                          return null
                        }).filter(id => id !== null) || []
                        
                        // 过滤掉已选择的设备
                        const newDeviceIds = allDeviceIds.filter(id => !selectedDevices.includes(id))
                        
                        // 添加到已选择设备
                        setSelectedDevices([...selectedDevices, ...newDeviceIds])
                      }}
                    >
                      全部入库
                    </Button>
                  </div>
                </div>
                <Table
                  dataSource={selectedOutbound?.items?.map((item, index) => {
                    let deviceName = '-'
                    let itemCode = '-'
                    let brand = '-'
                    let modelSpec = '-'
                    let snCode = '-'
                    let deviceId = null
                    let itemType = 'device'
                    
                    if (item.device) {
                      deviceName = item.device.deviceName || '-'
                      itemCode = item.device.deviceCode || '-'
                      brand = item.device.brand || '-'
                      modelSpec = item.device.modelSpec || '-'
                      snCode = item.device.snCode || '-'
                      deviceId = item.device.id
                      itemType = 'device'
                    } else if (item.consumable) {
                      deviceName = item.consumable.consumableName || '-'
                      itemCode = item.consumable.consumableCode || '-'
                      brand = item.consumable.brand || '-'
                      modelSpec = item.consumable.specification || '-'
                      deviceId = item.consumable.id
                      itemType = 'consumable'
                    } else if (item.accessory) {
                      deviceName = item.accessory.accessoryName || '-'
                      itemCode = item.accessory.accessoryCode || '-'
                      brand = item.accessory.brand || '-'
                      modelSpec = item.accessory.modelSpec || '-'
                      deviceId = item.accessory.id
                      itemType = 'accessory'
                    }
                    
                    return {
                      ...item,
                      key: item.id || index,
                      deviceName,
                      itemCode,
                      brand,
                      modelSpec,
                      snCode,
                      deviceId,
                      itemType
                    }
                  }) || []}
                  columns={[
                    { title: '名称', dataIndex: 'deviceName', key: 'deviceName', width: 120 },
                    { title: '编号', dataIndex: 'itemCode', key: 'itemCode', width: 120 },
                    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
                    { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 100 },
                    { title: 'SN码', dataIndex: 'snCode', key: 'snCode', width: 100 },
                    {
                      title: '数量',
                      key: 'quantity',
                      width: 150,
                      render: (_, record) => (
                        record.itemType === 'consumable' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <InputNumber
                              size="small"
                              min={1}
                              max={100}
                              value={selectedDeviceQuantities[record.deviceId] || 1}
                              onChange={(value) => setSelectedDeviceQuantities(prev => ({ ...prev, [record.deviceId]: value }))}
                              style={{ width: 80 }}
                            />
                            <Button
                              size="small"
                              type="primary"
                              danger
                              onClick={() => {
                                setSelectedDeviceQuantities(prev => ({ ...prev, [record.deviceId]: 0 }))
                                setSelectedDeviceRemarks(prev => ({ ...prev, [record.deviceId]: (prev[record.deviceId] || '') + ' (全部损耗)' }))
                              }}
                            >
                              全部损耗
                            </Button>
                          </div>
                        ) : (
                          <span>1</span>
                        )
                      )
                    },
                    {
                      title: '设备状态',
                      key: 'status',
                      width: 100,
                      render: (_, record) => (
                        <Select
                          size="small"
                          value={selectedDeviceStatus[record.deviceId] || 'normal'}
                          onChange={(value) => setSelectedDeviceStatus(prev => ({ ...prev, [record.deviceId]: value }))}
                          style={{ width: 100 }}
                        >
                          <Select.Option value="normal">正常</Select.Option>
                          <Select.Option value="damaged">损坏</Select.Option>
                          <Select.Option value="lost">丢失</Select.Option>
                        </Select>
                      )
                    },
                    {
                      title: '备注',
                      key: 'remark',
                      width: 150,
                      render: (_, record) => (
                        <Input
                          size="small"
                          placeholder="输入备注"
                          value={selectedDeviceRemarks[record.deviceId] || ''}
                          onChange={(e) => setSelectedDeviceRemarks(prev => ({ ...prev, [record.deviceId]: e.target.value }))}
                          style={{ width: 150 }}
                        />
                      )
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 200,
                      fixed: 'right',
                      render: (_, record) => (
                        <Space size={8}>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => {
                              if (!selectedDevices.includes(record.deviceId)) {
                                setSelectedDevices([...selectedDevices, record.deviceId])
                              }
                            }}
                            disabled={selectedDevices.includes(record.deviceId)}
                          >
                            {selectedDevices.includes(record.deviceId) ? '已入库' : '入库'}
                          </Button>
                          <Button
                            type="default"
                            size="small"
                            icon={<SwapOutlined />}
                            onClick={() => handleTransfer(record)}
                          >
                            流转
                          </Button>
                        </Space>
                      )
                    },
                  ]}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`
                  }}
                  size="small"
                  scroll={{ y: 400, x: 1000 }}
                />
              </Card>
            </>
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
        title="流转设备"
        open={transferModalVisible}
        onOk={handleTransferOk}
        onCancel={() => setTransferModalVisible(false)}
        width={800}
      >
        {transferDevice && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <p><strong>设备名称:</strong> {transferDevice.deviceName}</p>
              <p><strong>设备编号:</strong> {transferDevice.itemCode}</p>
              <p><strong>设备品牌:</strong> {transferDevice.brand}</p>
              <p><strong>设备型号:</strong> {transferDevice.modelSpec}</p>
            </Card>
            
            <Divider>选择目标赛事</Divider>
            <Form layout="vertical">
              <Form.Item label="选择赛事/出库单">
                <Select
                  placeholder="请选择目标赛事"
                  value={transferOutbound?.id}
                  onChange={(value) => {
                    const selected = outboundOrders.find(o => o.id === value)
                    setTransferOutbound(selected)
                  }}
                  style={{ width: '100%' }}
                  showSearch
                  filterOption={(input, option) => {
                    const order = outboundOrders.find(o => o.id === option.value)
                    if (!order) return false
                    return order.eventName?.toLowerCase().includes(input.toLowerCase()) ||
                           order.orderCode?.toLowerCase().includes(input.toLowerCase())
                  }}
                >
                  {outboundOrders
                    .filter(order => order.id !== selectedOutbound?.id)
                    .map(order => (
                      <Select.Option key={order.id} value={order.id}>
                        {order.eventName} ({order.orderCode})
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
              
              {transferOutbound && (
                <Card size="small" style={{ marginBottom: 16 }}>
                  <p><strong>目标赛事:</strong> {transferOutbound.eventName}</p>
                  <p><strong>目标出库单:</strong> {transferOutbound.orderCode}</p>
                </Card>
              )}
              
              <Form.Item label="流转备注">
                <Input.TextArea
                  rows={3}
                  placeholder="请输入流转备注信息"
                  value={transferRemark}
                  onChange={(e) => setTransferRemark(e.target.value)}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      <Modal
        title="入库单详情"
        open={detailModalVisible}
        onOk={() => setDetailModalVisible(false)}
        onCancel={() => setDetailModalVisible(false)}
        width={1200}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => handlePrint(currentOrder?.id)}>
            打印
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
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
                  <p><strong>接收人:</strong> {currentOrder.receiver || '-'}</p>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={8}>
                  <p><strong>联系电话:</strong> {currentOrder.receiverPhone || '-'}</p>
                </Col>
                <Col span={16}>
                  <p><strong>备注:</strong> {currentOrder.remark || '-'}</p>
                </Col>
              </Row>
            </Card>
            
            {currentOrder.items && currentOrder.items.length > 0 && (
              <Card 
                size="small" 
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>入库设备清单</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      共 {currentOrder.items.length} 项设备
                    </span>
                  </div>
                }
                style={{ marginTop: 16 }}
              >
                <Table
                  dataSource={currentOrder.items.map((item, index) => {
                    let deviceName = item.itemName || '-'
                    let itemCode = item.itemCode || '-'
                    let brand = item.brand || '-'
                    let modelSpec = item.modelSpec || '-'
                    let snCode = item.snCode || '-'
                    let itemType = item.itemType || '-'
                    
                    if (item.device) {
                      deviceName = item.device.deviceName || deviceName
                      itemCode = item.device.deviceCode || itemCode
                      brand = item.device.brand || brand
                      modelSpec = item.device.modelSpec || modelSpec
                      snCode = item.device.snCode || snCode
                      itemType = 'device'
                    } else if (item.accessory) {
                      deviceName = item.accessory.accessoryName || deviceName
                      itemCode = item.accessory.accessoryCode || itemCode
                      brand = item.accessory.brand || brand
                      modelSpec = item.accessory.modelSpec || modelSpec
                      itemType = 'accessory'
                    } else if (item.consumable) {
                      deviceName = item.consumable.consumableName || deviceName
                      itemCode = item.consumable.consumableCode || itemCode
                      brand = item.consumable.brand || brand
                      modelSpec = item.consumable.specification || modelSpec
                      itemType = 'consumable'
                    }
                    
                    return {
                      ...item,
                      index: index + 1,
                      deviceName,
                      itemCode,
                      brand,
                      modelSpec,
                      snCode,
                      itemType
                    }
                  })}
                  columns={[
                    { 
                      title: '序号', 
                      dataIndex: 'index', 
                      key: 'index', 
                      width: 60,
                      align: 'center'
                    },
                    { 
                      title: '类型', 
                      dataIndex: 'itemType', 
                      key: 'itemType', 
                      width: 80, 
                      align: 'center',
                      render: (type) => {
                        const typeMap = {
                          'device': { text: '专用设备', color: 'blue' },
                          'accessory': { text: '通用设备', color: 'cyan' },
                          'consumable': { text: '耗材', color: 'purple' }
                        }
                        const typeInfo = typeMap[type] || { text: type || '-', color: 'default' }
                        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
                      }
                    },
                    { title: '名称', dataIndex: 'deviceName', key: 'deviceName', width: 150, ellipsis: true },
                    { title: '编号', dataIndex: 'itemCode', key: 'itemCode', width: 120, ellipsis: true },
                    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 80, ellipsis: true },
                    { title: '型号', dataIndex: 'modelSpec', key: 'modelSpec', width: 100, ellipsis: true },
                    { title: 'SN码', dataIndex: 'snCode', key: 'snCode', width: 100, ellipsis: true },
                    { 
                      title: '数量', 
                      dataIndex: 'quantity', 
                      key: 'quantity', 
                      width: 60,
                      align: 'center'
                    },
                    { 
                      title: '设备状态', 
                      dataIndex: 'itemStatus', 
                      key: 'itemStatus', 
                      width: 80,
                      align: 'center',
                      render: (status) => {
                        const statusMap = {
                          'normal': { text: '正常', color: 'green' },
                          'damaged': { text: '损坏', color: 'orange' },
                          'lost': { text: '丢失', color: 'red' }
                        }
                        const statusInfo = statusMap[status] || { text: '正常', color: 'green' }
                        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                      }
                    },
                    { 
                      title: '备注', 
                      dataIndex: 'remark', 
                      key: 'remark', 
                      width: 120, 
                      ellipsis: true,
                      render: (remark) => remark || '-'
                    },
                  ]}
                  pagination={false}
                  size="small"
                  rowKey="id"
                  scroll={{ x: 1100 }}
                  bordered
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProjectInboundManagement
