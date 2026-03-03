import React, { useState, useEffect, useRef } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, message, Tabs, Space, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, HomeOutlined } from '@ant-design/icons'

function LocationManagement() {
  const dataLoadedRef = useRef(false)
  // 公司管理状态
  const [companies, setCompanies] = useState([])
  const [companyModalVisible, setCompanyModalVisible] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [companyForm] = Form.useForm()

  // 仓库管理状态
  const [warehouses, setWarehouses] = useState([])
  const [warehouseModalVisible, setWarehouseModalVisible] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState(null)
  const [warehouseForm] = Form.useForm()

  const [activeTab, setActiveTab] = useState('company')
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [])

  // 获取公司列表
  const fetchCompanies = async (signal) => {
    try {
      const response = await fetch('/api/companies', { signal })
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
        return true
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('获取公司列表失败:', error)
      }
      return false
    }
  }

  // 获取仓库列表
  const fetchWarehouses = async (signal) => {
    try {
      const response = await fetch('/api/warehouses', { signal })
      if (response.ok) {
        const data = await response.json()
        setWarehouses(data)
        return true
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('获取仓库列表失败:', error)
      }
      return false
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    const loadData = async () => {
      try {
        const [companiesSuccess, warehousesSuccess] = await Promise.all([
          fetchCompanies(controller.signal),
          fetchWarehouses(controller.signal)
        ])
        if (companiesSuccess && warehousesSuccess) {
          dataLoadedRef.current = true
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('加载数据失败:', error)
        }
      }
    }
    loadData()
    return () => controller.abort()
  }, [])

  // 公司管理函数
  const handleAddCompany = () => {
    setEditingCompany(null)
    companyForm.resetFields()
    setCompanyModalVisible(true)
  }

  const handleEditCompany = (record) => {
    setEditingCompany(record)
    companyForm.setFieldsValue(record)
    setCompanyModalVisible(true)
  }

  const handleDeleteCompany = async (id) => {
    try {
      const response = await fetch(`/api/companies/${id}`, { method: 'DELETE' })
      if (response.ok) {
        message.success('删除成功')
        fetchCompanies()
      } else {
        message.error('删除失败')
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleCompanyModalOk = async () => {
    try {
      const values = await companyForm.validateFields()
      if (currentUser) {
        values.createdBy = currentUser.username
        values.updatedBy = currentUser.username
      }
      const url = editingCompany ? `/api/companies/${editingCompany.id}` : '/api/companies'
      const method = editingCompany ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (response.ok) {
        message.success(editingCompany ? '更新成功' : '添加成功')
        setCompanyModalVisible(false)
        companyForm.resetFields()
        fetchCompanies()
      } else {
        message.error('操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 仓库管理函数
  const handleAddWarehouse = () => {
    setEditingWarehouse(null)
    warehouseForm.resetFields()
    setWarehouseModalVisible(true)
  }

  const handleEditWarehouse = (record) => {
    setEditingWarehouse(record)
    warehouseForm.setFieldsValue(record)
    setWarehouseModalVisible(true)
  }

  const handleDeleteWarehouse = async (id) => {
    try {
      const response = await fetch(`/api/warehouses/${id}`, { method: 'DELETE' })
      if (response.ok) {
        message.success('删除成功')
        fetchWarehouses()
      } else {
        message.error('删除失败')
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleWarehouseModalOk = async () => {
    try {
      const values = await warehouseForm.validateFields()
      if (currentUser) {
        values.createdBy = currentUser.username
        values.updatedBy = currentUser.username
      }
      
      // 获取选中的公司名称
      const selectedCompany = companies.find(c => c.id === values.companyId)
      if (selectedCompany) {
        values.companyName = selectedCompany.name
      }

      const url = editingWarehouse ? `/api/warehouses/${editingWarehouse.id}` : '/api/warehouses'
      const method = editingWarehouse ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (response.ok) {
        message.success(editingWarehouse ? '更新成功' : '添加成功')
        setWarehouseModalVisible(false)
        warehouseForm.resetFields()
        fetchWarehouses()
      } else {
        message.error('操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 公司表格列
  const companyColumns = [
    { title: '公司名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '公司编码', dataIndex: 'code', key: 'code', width: 150 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <span style={{ color: status === '正常' ? '#52c41a' : '#f5222d' }}>{status}</span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditCompany(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDeleteCompany(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 仓库表格列
  const warehouseColumns = [
    { title: '仓库名称', dataIndex: 'name', key: 'name', width: 150 },
    { title: '仓库编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '地址', dataIndex: 'address', key: 'address', width: 250 },
    { title: '容量', dataIndex: 'capacity', key: 'capacity', width: 80 },
    { title: '当前数量', dataIndex: 'currentCount', key: 'currentCount', width: 80 },
    { title: '负责人', dataIndex: 'manager', key: 'manager', width: 100 },
    { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone', width: 120 },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      width: 80,
      render: (status) => (
        <span style={{ color: status === '正常' ? '#52c41a' : '#f5222d' }}>{status}</span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditWarehouse(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDeleteWarehouse(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-title">位置管理</h2>
      
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'company',
            label: <span><BankOutlined />公司管理</span>,
            children: (
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCompany}>
                    添加公司
                  </Button>
                </div>
                <Table
                  dataSource={companies}
                  columns={companyColumns}
                  rowKey="id"
                  scroll={{ x: 1000 }}
                  bordered
                  size="small"
                />
              </Card>
            )
          },
          {
            key: 'warehouse',
            label: <span><HomeOutlined />仓库管理</span>,
            children: (
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddWarehouse}>
                    添加仓库
                  </Button>
                </div>
                <Table
                  dataSource={warehouses}
                  columns={warehouseColumns}
                  rowKey="id"
                  scroll={{ x: 1200 }}
                  bordered
                  size="small"
                />
              </Card>
            )
          }
        ]}
      />

      {/* 公司编辑/添加弹窗 */}
      <Modal
        title={editingCompany ? '编辑公司' : '添加公司'}
        open={companyModalVisible}
        onOk={handleCompanyModalOk}
        onCancel={() => {
          setCompanyModalVisible(false)
          companyForm.resetFields()
        }}
        width={600}
      >
        <Form form={companyForm} layout="vertical">
          <Form.Item
            name="name"
            label="公司名称"
            rules={[{ required: true, message: '请输入公司名称' }]}
          >
            <Input placeholder="请输入公司名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="公司编码"
            rules={[{ required: true, message: '请输入公司编码' }]}
          >
            <Input placeholder="请输入公司编码" />
          </Form.Item>

          <Form.Item name="status" label="状态" initialValue="正常">
            <Select>
              <Select.Option value="正常">正常</Select.Option>
              <Select.Option value="停用">停用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 仓库编辑/添加弹窗 */}
      <Modal
        title={editingWarehouse ? '编辑仓库' : '添加仓库'}
        open={warehouseModalVisible}
        onOk={handleWarehouseModalOk}
        onCancel={() => {
          setWarehouseModalVisible(false)
          warehouseForm.resetFields()
        }}
        width={600}
      >
        <Form form={warehouseForm} layout="vertical">
          <Form.Item
            name="name"
            label="仓库名称"
            rules={[{ required: true, message: '请输入仓库名称' }]}
          >
            <Input placeholder="请输入仓库名称" />
          </Form.Item>
          
          <Form.Item
            name="code"
            label="仓库编码"
            rules={[{ required: true, message: '请输入仓库编码' }]}
          >
            <Input placeholder="请输入仓库编码" />
          </Form.Item>

          <Form.Item name="address" label="地址">
            <Input placeholder="请输入地址" />
          </Form.Item>
          
          <Form.Item name="capacity" label="容量">
            <Input type="number" placeholder="请输入容量" />
          </Form.Item>
          
          <Form.Item name="manager" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          
          <Form.Item name="contactPhone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          
          <Form.Item name="status" label="状态" initialValue="正常">
            <Select>
              <Select.Option value="正常">正常</Select.Option>
              <Select.Option value="停用">停用</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default LocationManagement
