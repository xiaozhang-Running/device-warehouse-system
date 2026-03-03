import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, InputNumber, message, Space, Popconfirm, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

function MaterialManagement() {
  const [materials, setMaterials] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/materials')
      const data = await response.json()
      setMaterials(data)
    } catch (error) {
      console.error('获取原材料列表失败:', error)
      message.error('获取原材料列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingMaterial(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingMaterial(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      if (editingMaterial) {
        const response = await fetch(`/api/materials/${editingMaterial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        })
        
        const data = await response.json()
        
        if (data.success) {
          message.success('原材料更新成功')
          setModalVisible(false)
          form.resetFields()
          fetchMaterials()
        } else {
          message.error(data.message || '更新失败')
        }
      } else {
        const response = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        })
        
        const data = await response.json()
        
        if (data.success) {
          message.success('原材料创建成功')
          setModalVisible(false)
          form.resetFields()
          fetchMaterials()
        } else {
          message.error(data.message || '创建失败')
        }
      }
    } catch (error) {
      console.error('操作失败:', error)
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        message.success('原材料已删除')
        fetchMaterials()
      } else {
        message.error(data.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败')
    }
  }

  const handleModalCancel = () => {
    setModalVisible(false)
    form.resetFields()
    setEditingMaterial(null)
  }

  const getStatusTag = (status) => {
    const statusMap = {
      '在库': { color: 'green', text: '在库' },
      '缺货': { color: 'red', text: '缺货' },
      '预警': { color: 'orange', text: '预警' },
    }
    const statusInfo = statusMap[status] || { color: 'default', text: status }
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
  }

  const columns = [
    { title: '原材料编码', dataIndex: 'materialCode', key: 'materialCode', width: 120 },
    { title: '原材料名称', dataIndex: 'materialName', key: 'materialName', width: 150 },
    { title: '类别', dataIndex: 'category', key: 'category', width: 100 },
    { title: '规格', dataIndex: 'specification', key: 'specification', width: 120 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    { 
      title: '数量', 
      dataIndex: 'quantity', 
      key: 'quantity', 
      width: 100,
      render: (qty, record) => {
        if (record.minQuantity && qty < record.minQuantity) {
          return <span style={{ color: 'red' }}>{qty}</span>
        }
        return qty
      }
    },
    { title: '最小库存', dataIndex: 'minQuantity', key: 'minQuantity', width: 100 },
    { title: '最大库存', dataIndex: 'maxQuantity', key: 'maxQuantity', width: 100 },
    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100 },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 120 },
    { title: '存放位置', dataIndex: 'storageLocation', key: 'storageLocation', width: 120 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (status) => getStatusTag(status) },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true, width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个原材料吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="page-title">原材料管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增原材料</Button>
      </div>
      <Card>
        <Table 
          dataSource={materials} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
        />
      </Card>
      <Modal
        title={editingMaterial ? '编辑原材料' : '新增原材料'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item 
              name="materialCode" 
              label="原材料编码" 
              rules={[{ required: true, message: '请输入原材料编码' }]}
            >
              <Input placeholder="请输入原材料编码" />
            </Form.Item>
            <Form.Item 
              name="materialName" 
              label="原材料名称" 
              rules={[{ required: true, message: '请输入原材料名称' }]}
            >
              <Input placeholder="请输入原材料名称" />
            </Form.Item>
            <Form.Item name="category" label="类别">
              <Select placeholder="请选择类别" allowClear>
                <Select.Option value="电子元件">电子元件</Select.Option>
                <Select.Option value="机械零件">机械零件</Select.Option>
                <Select.Option value="包装材料">包装材料</Select.Option>
                <Select.Option value="化工原料">化工原料</Select.Option>
                <Select.Option value="其他">其他</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="specification" label="规格">
              <Input placeholder="请输入规格" />
            </Form.Item>
            <Form.Item name="unit" label="单位">
              <Select placeholder="请选择单位" allowClear>
                <Select.Option value="个">个</Select.Option>
                <Select.Option value="件">件</Select.Option>
                <Select.Option value="kg">kg</Select.Option>
                <Select.Option value="米">米</Select.Option>
                <Select.Option value="套">套</Select.Option>
                <Select.Option value="箱">箱</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item 
              name="quantity" 
              label="数量" 
              rules={[{ required: true, message: '请输入数量' }]}
            >
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入数量" />
            </Form.Item>
            <Form.Item name="minQuantity" label="最小库存">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入最小库存" />
            </Form.Item>
            <Form.Item name="maxQuantity" label="最大库存">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入最大库存" />
            </Form.Item>
            <Form.Item name="unitPrice" label="单价">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入单价" />
            </Form.Item>
            <Form.Item name="supplier" label="供应商">
              <Input placeholder="请输入供应商" />
            </Form.Item>
            <Form.Item name="storageLocation" label="存放位置">
              <Input placeholder="请输入存放位置" />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select placeholder="请选择状态" allowClear>
                <Select.Option value="在库">在库</Select.Option>
                <Select.Option value="缺货">缺货</Select.Option>
                <Select.Option value="预警">预警</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MaterialManagement