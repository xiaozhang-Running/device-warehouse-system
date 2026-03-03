import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, message, Space, Popconfirm, InputNumber, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ClearOutlined } from '@ant-design/icons'

const { Option } = Select

const AccessoryManagement = () => {
  const [accessories, setAccessories] = useState([])
  const [filteredAccessories, setFilteredAccessories] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAccessory, setEditingAccessory] = useState(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedUsageStatus, setSelectedUsageStatus] = useState('')

  useEffect(() => {
    fetchAccessories()
  }, [])

  const fetchAccessories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/accessories')
      const data = await response.json()
      setAccessories(data)
      setFilteredAccessories(data)
    } catch (error) {
      console.error('获取配件数据失败:', error)
      message.error('获取配件数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 筛选功能
  const handleSearch = (value) => {
    setSearchText(value)
    filterAccessories(value, selectedStatus, selectedUsageStatus)
  }

  const handleStatusChange = (value) => {
    setSelectedStatus(value)
    filterAccessories(searchText, value, selectedUsageStatus)
  }

  const handleUsageStatusChange = (value) => {
    setSelectedUsageStatus(value)
    filterAccessories(searchText, selectedStatus, value)
  }

  const filterAccessories = (search, status, usageStatus) => {
    let filtered = [...accessories]

    // 按搜索文本筛选
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(item =>
        (item.accessoryName && item.accessoryName.toLowerCase().includes(searchLower)) ||
        (item.accessoryCode && item.accessoryCode.toLowerCase().includes(searchLower)) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
        (item.modelSpec && item.modelSpec.toLowerCase().includes(searchLower)) ||
        (item.snCode && item.snCode.toLowerCase().includes(searchLower))
      )
    }

    // 按设备状态筛选
    if (status && status !== '') {
      filtered = filtered.filter(item => item.status === status)
    }

    // 按使用状态筛选
    if (usageStatus && usageStatus !== '') {
      filtered = filtered.filter(item => item.usageStatus === usageStatus)
    }

    setFilteredAccessories(filtered)
  }

  const clearFilters = () => {
    setSearchText('')
    setSelectedStatus('')
    setSelectedUsageStatus('')
    setFilteredAccessories(accessories)
  }

  const handleClearAll = async () => {
    try {
      const response = await fetch('/api/accessories/clear', {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        message.success('配件数据已清空')
        fetchAccessories()
      } else {
        message.error(data.message || '清空失败')
      }
    } catch (error) {
      console.error('清空配件数据失败:', error)
      message.error('清空配件数据失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const url = editingAccessory 
        ? `/api/accessories/${editingAccessory.id}`
        : '/api/accessories'
      const method = editingAccessory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      
      if (response.ok) {
        message.success(editingAccessory ? '更新成功' : '创建成功')
        setModalVisible(false)
        form.resetFields()
        setEditingAccessory(null)
        fetchAccessories()
      } else {
        message.error('操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleEdit = (record) => {
    setEditingAccessory(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/accessories/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        message.success('删除成功')
        fetchAccessories()
      } else {
        message.error('删除失败')
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  const columns = [
    {
      title: '序号',
      dataIndex: 'seqNo',
      key: 'seqNo',
      width: 60,
      fixed: 'left'
    },
    {
      title: '名称',
      dataIndex: 'accessoryName',
      key: 'accessoryName',
      width: 150,
      fixed: 'left',
      ellipsis: true
    },
    {
      title: '编号',
      dataIndex: 'accessoryCode',
      key: 'accessoryCode',
      width: 180
    },
    {
      title: 'SN码',
      dataIndex: 'snCode',
      key: 'snCode',
      width: 120
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100
    },
    {
      title: '型号规格',
      dataIndex: 'modelSpec',
      key: 'modelSpec',
      width: 150,
      ellipsis: true
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
      title: '配件',
      dataIndex: 'otherAccessories',
      key: 'otherAccessories',
      width: 200,
      ellipsis: true
    },
    {
      title: '设备状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status) => {
        const statusMap = {
          '正常': { color: '#52c41a', text: '正常' },
          '维修中': { color: '#faad14', text: '维修中' },
          '报废': { color: '#f5222d', text: '报废' }
        }
        const statusInfo = statusMap[status] || { color: '#999', text: status || '正常' }
        return <span style={{ color: statusInfo.color }}>{statusInfo.text}</span>
      }
    },
    {
      title: '使用状态',
      dataIndex: 'usageStatus',
      key: 'usageStatus',
      width: 80,
      align: 'center',
      render: (status) => {
        const statusMap = {
          '未使用': { color: '#52c41a', text: '未使用' },
          '使用中': { color: '#1890ff', text: '使用中' },
          '维修中': { color: '#faad14', text: '维修中' }
        }
        const statusInfo = statusMap[status] || { color: '#999', text: status || '未使用' }
        return <span style={{ color: statusInfo.color }}>{statusInfo.text}</span>
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
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

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="page-title">通用设备管理</h2>
            <Space>
              <Popconfirm
                title="确定要清空所有通用设备数据吗？此操作不可恢复！"
                onConfirm={handleClearAll}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<ClearOutlined />}>清空数据</Button>
              </Popconfirm>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setEditingAccessory(null)
                form.resetFields()
                setModalVisible(true)
              }}>
                添加配件
              </Button>
            </Space>
          </div>
          
          {/* 筛选区域 */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              placeholder="搜索名称、编号、品牌或型号"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="设备状态"
              value={selectedStatus || undefined}
              onChange={handleStatusChange}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="正常">正常</Option>
              <Option value="维修中">维修中</Option>
              <Option value="报废">报废</Option>
            </Select>
            <Select
              placeholder="使用状态"
              value={selectedUsageStatus || undefined}
              onChange={handleUsageStatusChange}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="未使用">未使用</Option>
              <Option value="使用中">使用中</Option>
              <Option value="维修中">维修中</Option>
            </Select>
            <Button onClick={clearFilters}>清空筛选</Button>
            <span style={{ color: '#999', marginLeft: 'auto' }}>
              共 {filteredAccessories.length} 条记录
            </span>
          </div>
        </Space>
      </Card>
      
      <Card style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={filteredAccessories}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
        />
      </Card>

      <Modal
        title={editingAccessory ? '编辑配件' : '添加配件'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingAccessory(null)
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item label="序号" name="seqNo">
              <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入序号" />
            </Form.Item>
            
            <Form.Item
              label="名称"
              name="accessoryName"
              rules={[{ required: true, message: '请输入名称' }]}
            >
              <Input placeholder="请输入名称" />
            </Form.Item>
            
            <Form.Item label="设备编号" name="accessoryCode">
              <Input placeholder="请输入设备编号" />
            </Form.Item>
            
            <Form.Item label="SN码" name="snCode">
              <Input placeholder="请输入SN码" />
            </Form.Item>
            
            <Form.Item label="品牌" name="brand">
              <Input placeholder="请输入品牌" />
            </Form.Item>
            
            <Form.Item label="型号规格" name="modelSpec">
              <Input placeholder="请输入型号规格" />
            </Form.Item>
            
            <Form.Item label="数量" name="quantity">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入数量" />
            </Form.Item>
            
            <Form.Item label="单位" name="unit">
              <Input placeholder="请输入单位" />
            </Form.Item>
            
            <Form.Item label="设备状态" name="status">
              <Select placeholder="请选择设备状态">
                <Option value="正常">正常</Option>
                <Option value="维修中">维修中</Option>
                <Option value="报废">报废</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="使用状态" name="usageStatus">
              <Select placeholder="请选择使用状态">
                <Option value="未使用">未使用</Option>
                <Option value="使用中">使用中</Option>
                <Option value="维修中">维修中</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item label="配件" name="otherAccessories">
            <Input.TextArea rows={2} placeholder="请输入配件信息" />
          </Form.Item>
          
          <Form.Item label="图片URL" name="imageUrl">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AccessoryManagement
