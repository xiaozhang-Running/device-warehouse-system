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
  const [filters, setFilters] = useState({})
  const [filterForm] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [currentUser, setCurrentUser] = useState(null)
  const [companies, setCompanies] = useState([])
  const [warehouses, setWarehouses] = useState([])

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
    fetchAccessories()
    fetchCompanies()
    fetchWarehouses()
  }, [])

  // 获取公司列表
  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('获取公司列表失败:', error)
    }
  }

  // 获取仓库列表
  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses')
      if (response.ok) {
        const data = await response.json()
        setWarehouses(data)
      }
    } catch (error) {
      console.error('获取仓库列表失败:', error)
    }
  }

  const fetchAccessories = async (filterParams = {}) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value)
        }
      })
      const response = await fetch(`/api/accessories?${queryParams.toString()}`)
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

  const handleFilterSubmit = async (values) => {
    setFilters(values)
    fetchAccessories(values)
  }

  const handleFilterReset = () => {
    filterForm.resetFields()
    setFilters({})
    fetchAccessories({})
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

  // 获取同名设备的最大编号
  const getMaxAccessoryCode = (accessoryName) => {
    const sameNameAccessories = accessories.filter(a => a.accessoryName === accessoryName)
    if (sameNameAccessories.length === 0) return 0
    
    let maxNum = 0
    sameNameAccessories.forEach(a => {
      const code = a.accessoryCode
      if (code) {
        const match = code.match(/TY-.+-([0-9]+)$/)
        if (match) {
          const num = parseInt(match[1])
          if (num > maxNum) maxNum = num
        }
      }
    })
    
    return maxNum === 0 ? sameNameAccessories.length : maxNum
  }

  // 生成设备编号
  const generateAccessoryCode = (accessoryName, startNum = 1) => {
    return `TY-${accessoryName}-${String(startNum).padStart(3, '0')}`
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (currentUser) {
        values.createdBy = currentUser.username
        values.updatedBy = currentUser.username
      }
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
      ellipsis: true,
      render: (text) => (
        <div style={{ 
          whiteSpace: 'normal', 
          wordBreak: 'break-word',
          lineHeight: '1.5'
        }}>
          {text || '-'}
        </div>
      )
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
          '预留中': { color: '#1890ff', text: '预留中' },
          '使用中': { color: '#ff4d4f', text: '使用中' },
          '维修中': { color: '#faad14', text: '维修中' }
        }
        const statusInfo = statusMap[status] || { color: '#999', text: status || '未使用' }
        return <span style={{ color: statusInfo.color }}>{statusInfo.text}</span>
      }
    },
    {
      title: '所属公司',
      dataIndex: 'company',
      key: 'company',
      width: 120
    },
    {
      title: '所在仓库',
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
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small"
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            style={{ padding: '0 4px' }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              size="small"
              icon={<DeleteOutlined />}
              style={{ padding: '0 4px' }}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card styles={{ body: { padding: '12px 24px' } }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0, padding: '8px 0' }}>
            <h2 className="page-title" style={{ margin: 0, fontSize: '18px', lineHeight: '1.2' }}>通用设备管理</h2>
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
                // 自动填充序号为设备总数+1
                const nextSeq = accessories.length + 1
                form.setFieldsValue({ seqNo: nextSeq })
                setModalVisible(true)
              }}>
                添加通用设备
              </Button>
            </Space>
          </div>
        </Space>
      </Card>
      
      <Card style={{ marginTop: 16 }}>
        <Form
          form={filterForm}
          layout="inline"
          onFinish={handleFilterSubmit}
          style={{ marginBottom: 16 }}
        >
          <Form.Item label="名称" name="accessoryName">
            <Input placeholder="请输入名称" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item label="品牌" name="brand">
            <Input placeholder="请输入品牌" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item label="设备状态" name="status">
            <Select placeholder="请选择设备状态" style={{ width: 100 }} allowClear>
              <Select.Option value="正常">正常</Select.Option>
              <Select.Option value="维修中">维修中</Select.Option>
              <Select.Option value="报废">报废</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="使用状态" name="usageStatus">
            <Select placeholder="请选择使用状态" style={{ width: 100 }} allowClear>
              <Select.Option value="未使用">未使用</Select.Option>
              <Select.Option value="预留中">预留中</Select.Option>
              <Select.Option value="使用中">使用中</Select.Option>
              <Select.Option value="维修中">维修中</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                筛选
              </Button>
              <Button onClick={handleFilterReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
        <Table
          columns={columns}
          dataSource={filteredAccessories}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
          bordered
          size="small"
          rowClassName={(record, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize })
            }
          }}
        />
      </Card>

      <Modal
        title={editingAccessory ? '编辑设备' : '添加通用设备'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingAccessory(null)
        }}
        width={1200}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
            <Form.Item label="序号" name="seqNo">
              <InputNumber 
                min={1} 
                style={{ width: '100%' }} 
                placeholder="自动填充" 
                disabled={!editingAccessory}
              />
            </Form.Item>
            
            <Form.Item
              label="名称"
              name="accessoryName"
              rules={[{ required: true, message: '请输入名称' }]}
            >
              <Input 
                placeholder="请输入名称" 
                onChange={(e) => {
                  const accessoryName = e.target.value
                  if (accessoryName && !editingAccessory) {
                    const maxNum = getMaxAccessoryCode(accessoryName)
                    const nextNum = maxNum + 1
                    const accessoryCode = generateAccessoryCode(accessoryName, nextNum)
                    form.setFieldsValue({ accessoryCode })
                  }
                }}
              />
            </Form.Item>
            
            <Form.Item label="设备编号" name="accessoryCode">
              <Input placeholder="自动填充，可手动修改" />
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
              <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入数量" />
            </Form.Item>
            
            <Form.Item label="单位" name="unit">
              <Select placeholder="请选择单位" allowClear>
                <Select.Option value="个">个</Select.Option>
                <Select.Option value="台">台</Select.Option>
                <Select.Option value="套">套</Select.Option>
                <Select.Option value="件">件</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="设备状态" name="status">
              <Select placeholder="请选择设备状态">
                <Select.Option value="正常">正常</Select.Option>
                <Select.Option value="维修中">维修中</Select.Option>
                <Select.Option value="报废">报废</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="使用状态" name="usageStatus">
              <Select placeholder="请选择使用状态">
                <Select.Option value="未使用">未使用</Select.Option>
                <Select.Option value="预留中">预留中</Select.Option>
                <Select.Option value="使用中">使用中</Select.Option>
                <Select.Option value="维修中">维修中</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="所属公司" name="company">
              <Select placeholder="请选择所属公司" allowClear>
                {companies.map(company => (
                  <Select.Option key={company.id} value={company.name}>{company.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item label="所在仓库" name="location">
              <Select placeholder="请选择所在仓库" allowClear>
                {warehouses.map(warehouse => (
                  <Select.Option key={warehouse.id} value={warehouse.name}>{warehouse.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item label="其余配件" name="otherAccessories" style={{ gridColumn: 'span 6' }}>
            <Input.TextArea rows={2} placeholder="请输入其余配件" />
          </Form.Item>
          
          <Form.Item label="图片URL" name="imageUrl" style={{ gridColumn: 'span 6' }}>
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          
          <Form.Item label="备注" name="remark" style={{ gridColumn: 'span 6' }}>
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AccessoryManagement
