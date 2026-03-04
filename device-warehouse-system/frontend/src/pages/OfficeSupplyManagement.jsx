import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, message, Space, Popconfirm, InputNumber, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ClearOutlined } from '@ant-design/icons'

const { Option } = Select

const OfficeSupplyManagement = () => {
  const [supplies, setSupplies] = useState([])
  const [filteredSupplies, setFilteredSupplies] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingSupply, setEditingSupply] = useState(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    fetchSupplies()
  }, [])

  const fetchSupplies = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/office-supplies')
      const data = await response.json()
      setSupplies(data)
      setFilteredSupplies(data)
    } catch (error) {
      console.error('获取办公用品数据失败:', error)
      message.error('获取办公用品数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchText(value)
    filterSupplies(value, selectedCategory, selectedStatus)
  }

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    filterSupplies(searchText, value, selectedStatus)
  }

  const handleStatusChange = (value) => {
    setSelectedStatus(value)
    filterSupplies(searchText, selectedCategory, value)
  }

  const filterSupplies = (search, category, status) => {
    let filtered = [...supplies]

    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(item =>
        (item.supplyName && item.supplyName.toLowerCase().includes(searchLower)) ||
        (item.supplyCode && item.supplyCode.toLowerCase().includes(searchLower)) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
        (item.modelSpec && item.modelSpec.toLowerCase().includes(searchLower))
      )
    }

    if (category && category !== '') {
      filtered = filtered.filter(item => item.category === category)
    }

    if (status && status !== '') {
      filtered = filtered.filter(item => {
        const remaining = item.remainingQuantity || item.quantity || 0
        if (status === '充足') return remaining >= 10
        if (status === '紧张') return remaining > 0 && remaining < 10
        if (status === '缺货') return remaining === 0
        return item.status === status
      })
    }

    setFilteredSupplies(filtered)
  }

  const clearFilters = () => {
    setSearchText('')
    setSelectedCategory('')
    setSelectedStatus('')
    setFilteredSupplies(supplies)
  }

  const handleClearAll = async () => {
    try {
      const response = await fetch('/api/office-supplies/clear', {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        message.success('办公用品数据已清空')
        fetchSupplies()
      } else {
        message.error(data.message || '清空失败')
      }
    } catch (error) {
      console.error('清空办公用品数据失败:', error)
      message.error('清空办公用品数据失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const url = editingSupply 
        ? `/api/office-supplies/${editingSupply.id}`
        : '/api/office-supplies'
      const method = editingSupply ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      
      if (response.ok) {
        message.success(editingSupply ? '更新成功' : '创建成功')
        setModalVisible(false)
        form.resetFields()
        setEditingSupply(null)
        fetchSupplies()
      } else {
        message.error('操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleEdit = (record) => {
    setEditingSupply(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/office-supplies/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        message.success('删除成功')
        fetchSupplies()
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
      title: '用品名称',
      dataIndex: 'supplyName',
      key: 'supplyName',
      width: 150,
      fixed: 'left',
      ellipsis: true
    },
    {
      title: '用品编码',
      dataIndex: 'supplyCode',
      key: 'supplyCode',
      width: 120
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100
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
      width: 120,
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
      title: '所属公司',
      dataIndex: 'company',
      key: 'company',
      width: 120
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 100
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
            <h2 className="page-title">办公用品管理</h2>
            <Space>
              <Popconfirm
                title="确定要清空所有办公用品数据吗？此操作不可恢复！"
                onConfirm={handleClearAll}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<ClearOutlined />}>清空数据</Button>
              </Popconfirm>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setEditingSupply(null)
                form.resetFields()
                setModalVisible(true)
              }}>
                添加办公用品
              </Button>
            </Space>
          </div>
          
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              placeholder="搜索名称、编码、品牌或型号"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="选择类别"
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="文具">文具</Option>
              <Option value="纸张">纸张</Option>
              <Option value="打印耗材">打印耗材</Option>
              <Option value="办公设备">办公设备</Option>
              <Option value="其他">其他</Option>
            </Select>
            <Select
              placeholder="库存状态"
              value={selectedStatus}
              onChange={handleStatusChange}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="充足">充足</Option>
              <Option value="紧张">紧张</Option>
              <Option value="缺货">缺货</Option>
            </Select>
            <Button onClick={clearFilters}>重置</Button>
          </div>

          <Table
            columns={columns}
            dataSource={filteredSupplies}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1500 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              pageSizeOptions: ['10', '20', '50', '100'],
              defaultPageSize: 10
            }}
          />
        </Space>
      </Card>

      <Modal
        title={editingSupply ? '编辑办公用品' : '添加办公用品'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingSupply(null)
        }}
        width={800}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <Form.Item label="用品名称" name="supplyName" rules={[{ required: true, message: '请输入用品名称' }]}>
              <Input placeholder="请输入用品名称" />
            </Form.Item>
            
            <Form.Item label="用品编码" name="supplyCode">
              <Input placeholder="请输入用品编码" />
            </Form.Item>
            
            <Form.Item label="类别" name="category">
              <Select placeholder="请选择类别">
                <Option value="文具">文具</Option>
                <Option value="纸张">纸张</Option>
                <Option value="打印耗材">打印耗材</Option>
                <Option value="办公设备">办公设备</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="品牌" name="brand">
              <Input placeholder="请输入品牌" />
            </Form.Item>
            
            <Form.Item label="型号规格" name="modelSpec">
              <Input placeholder="请输入型号规格" />
            </Form.Item>
            
            <Form.Item label="单位" name="unit">
              <Select placeholder="请选择单位">
                <Option value="个">个</Option>
                <Option value="支">支</Option>
                <Option value="盒">盒</Option>
                <Option value="包">包</Option>
                <Option value="本">本</Option>
                <Option value="袋">袋</Option>
                <Option value="箱">箱</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="原始数量" name="originalQuantity">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入原始数量" />
            </Form.Item>
            
            <Form.Item label="剩余数量" name="remainingQuantity">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入剩余数量" />
            </Form.Item>
            
            <Form.Item label="最低库存" name="minStock">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入最低库存" />
            </Form.Item>
            
            <Form.Item label="所属公司" name="company">
              <Input placeholder="请输入所属公司" />
            </Form.Item>
            
            <Form.Item label="存放位置" name="location">
              <Input placeholder="请输入存放位置" />
            </Form.Item>
            
            <Form.Item label="供应商" name="supplier">
              <Input placeholder="请输入供应商" />
            </Form.Item>
            
            <Form.Item label="单价" name="price">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入单价" />
            </Form.Item>
            
            <Form.Item label="状态" name="status">
              <Select placeholder="请选择状态">
                <Option value="在库">在库</Option>
                <Option value="已领用">已领用</Option>
                <Option value="已用完">已用完</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default OfficeSupplyManagement
