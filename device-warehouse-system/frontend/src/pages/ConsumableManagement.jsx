import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, message, Space, Popconfirm, InputNumber, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ClearOutlined } from '@ant-design/icons'

const { Option } = Select

const ConsumableManagement = () => {
  const [consumables, setConsumables] = useState([])
  const [filteredConsumables, setFilteredConsumables] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingConsumable, setEditingConsumable] = useState(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    fetchConsumables()
  }, [])

  const fetchConsumables = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/consumables')
      const data = await response.json()
      setConsumables(data)
      setFilteredConsumables(data)
    } catch (error) {
      console.error('获取耗材数据失败:', error)
      message.error('获取耗材数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 筛选功能
  const handleSearch = (value) => {
    setSearchText(value)
    filterConsumables(value, selectedStatus)
  }

  const handleStatusChange = (value) => {
    setSelectedStatus(value)
    filterConsumables(searchText, value)
  }

  const filterConsumables = (search, status) => {
    let filtered = [...consumables]

    // 按搜索文本筛选
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(item =>
        (item.consumableName && item.consumableName.toLowerCase().includes(searchLower)) ||
        (item.consumableCode && item.consumableCode.toLowerCase().includes(searchLower)) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
        (item.modelSpec && item.modelSpec.toLowerCase().includes(searchLower))
      )
    }

    // 按库存状态筛选
    if (status && status !== '') {
      filtered = filtered.filter(item => {
        const remaining = item.remainingQuantity || item.quantity || 0
        if (status === '充足') return remaining >= 10
        if (status === '紧张') return remaining > 0 && remaining < 10
        if (status === '缺货') return remaining === 0
        return true
      })
    }

    setFilteredConsumables(filtered)
  }

  const clearFilters = () => {
    setSearchText('')
    setSelectedStatus('')
    setFilteredConsumables(consumables)
  }

  const handleClearAll = async () => {
    try {
      const response = await fetch('/api/consumables/clear', {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        message.success('耗材数据已清空')
        fetchConsumables()
      } else {
        message.error(data.message || '清空失败')
      }
    } catch (error) {
      console.error('清空耗材数据失败:', error)
      message.error('清空耗材数据失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const url = editingConsumable 
        ? `/api/consumables/${editingConsumable.id}`
        : '/api/consumables'
      const method = editingConsumable ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      
      if (response.ok) {
        message.success(editingConsumable ? '更新成功' : '创建成功')
        setModalVisible(false)
        form.resetFields()
        setEditingConsumable(null)
        fetchConsumables()
      } else {
        message.error('操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleEdit = (record) => {
    setEditingConsumable(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/consumables/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        message.success('删除成功')
        fetchConsumables()
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
      title: '耗材名称',
      dataIndex: 'consumableName',
      key: 'consumableName',
      width: 150,
      fixed: 'left',
      ellipsis: true
    },
    {
      title: '耗材编码',
      dataIndex: 'consumableCode',
      key: 'consumableCode',
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
      title: '原始总数',
      dataIndex: 'originalQuantity',
      key: 'originalQuantity',
      width: 90,
      align: 'center'
    },
    {
      title: '已使用数',
      dataIndex: 'usedQuantity',
      key: 'usedQuantity',
      width: 90,
      align: 'center'
    },
    {
      title: '剩余数量',
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      width: 90,
      align: 'center',
      render: (text, record) => {
        const remaining = record.remainingQuantity || record.quantity || 0
        let color = '#52c41a'
        if (remaining === 0) color = '#f5222d'
        else if (remaining < 10) color = '#faad14'
        return <span style={{ color, fontWeight: 'bold' }}>{remaining}</span>
      }
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
      align: 'center'
    },
    {
      title: '库存状态',
      key: 'stockStatus',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const remaining = record.remainingQuantity || record.quantity || 0
        if (remaining >= 10) {
          return <span style={{ color: '#52c41a' }}>充足</span>
        } else if (remaining > 0) {
          return <span style={{ color: '#faad14' }}>紧张</span>
        } else {
          return <span style={{ color: '#f5222d' }}>缺货</span>
        }
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
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
            <h2 className="page-title">耗材管理</h2>
            <Space>
              <Popconfirm
                title="确定要清空所有耗材数据吗？此操作不可恢复！"
                onConfirm={handleClearAll}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<ClearOutlined />}>清空数据</Button>
              </Popconfirm>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setEditingConsumable(null)
                form.resetFields()
                setModalVisible(true)
              }}>
                添加耗材
              </Button>
            </Space>
          </div>
          
          {/* 筛选区域 */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              placeholder="搜索名称、编码、品牌或型号"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="库存状态"
              value={selectedStatus || undefined}
              onChange={handleStatusChange}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="充足">充足</Option>
              <Option value="紧张">紧张</Option>
              <Option value="缺货">缺货</Option>
            </Select>
            <Button onClick={clearFilters}>清空筛选</Button>
            <span style={{ color: '#999', marginLeft: 'auto' }}>
              共 {filteredConsumables.length} 条记录
            </span>
          </div>
        </Space>
      </Card>
      
      <Card style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={filteredConsumables}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
        />
      </Card>

      <Modal
        title={editingConsumable ? '编辑耗材' : '添加耗材'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingConsumable(null)
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item label="序号" name="seqNo">
              <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入序号" />
            </Form.Item>
            
            <Form.Item
              label="耗材名称"
              name="consumableName"
              rules={[{ required: true, message: '请输入耗材名称' }]}
            >
              <Input placeholder="请输入耗材名称" />
            </Form.Item>
            
            <Form.Item label="耗材编码" name="consumableCode">
              <Input placeholder="请输入耗材编码" />
            </Form.Item>
            
            <Form.Item label="品牌" name="brand">
              <Input placeholder="请输入品牌" />
            </Form.Item>
            
            <Form.Item label="型号规格" name="modelSpec">
              <Input placeholder="请输入型号规格" />
            </Form.Item>
            
            <Form.Item label="原始总数" name="originalQuantity">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入原始总数" />
            </Form.Item>
            
            <Form.Item label="已使用数" name="usedQuantity">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入已使用数" />
            </Form.Item>
            
            <Form.Item label="剩余数量" name="remainingQuantity">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入剩余数量" />
            </Form.Item>
            
            <Form.Item label="单位" name="unit">
              <Input placeholder="请输入单位" />
            </Form.Item>
          </div>
          
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

export default ConsumableManagement
