import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, message, Space, Popconfirm, InputNumber, Select, AutoComplete, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ClearOutlined, UploadOutlined } from '@ant-design/icons'

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
  const [companies, setCompanies] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [consumableOptions, setConsumableOptions] = useState([])
  const [brandOptions, setBrandOptions] = useState([])
  const [modelSpecOptions, setModelSpecOptions] = useState([])
  const [unitOptions, setUnitOptions] = useState([])
  const [formImages, setFormImages] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState(new Set())
  const [selectedConsumableName, setSelectedConsumableName] = useState('')
  const [isExistingConsumable, setIsExistingConsumable] = useState(false)

  useEffect(() => {
    fetchConsumables()
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

  const fetchConsumables = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/consumables')
      const data = await response.json()
      setConsumables(data)
      setFilteredConsumables(data)
      // 设置耗材名称选项用于自动完成
      const options = data.map(item => ({
        value: item.consumableName,
        label: item.consumableName,
        data: item
      }))
      setConsumableOptions(options)
      
      // 设置品牌选项用于自动完成（去重）
      const uniqueBrands = [...new Set(data.map(item => item.brand).filter(Boolean))]
      setBrandOptions(uniqueBrands.map(brand => ({ value: brand, label: brand })))
      
      // 设置型号规格选项用于自动完成（去重）
      const uniqueModelSpecs = [...new Set(data.map(item => item.modelSpec).filter(Boolean))]
      setModelSpecOptions(uniqueModelSpecs.map(spec => ({ value: spec, label: spec })))
      
      // 设置单位选项用于自动完成（去重）
      const uniqueUnits = [...new Set(data.map(item => item.unit).filter(Boolean))]
      setUnitOptions(uniqueUnits.map(unit => ({ value: unit, label: unit })))
    } catch (error) {
      console.error('获取耗材数据失败:', error)
      message.error('获取耗材数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 根据当前选中的耗材名称筛选品牌选项
  const getFilteredBrandOptions = () => {
    if (!selectedConsumableName) {
      return brandOptions
    }
    // 筛选出与选中耗材名称一致的品牌
    const filteredBrands = consumables
      .filter(item => item.consumableName === selectedConsumableName)
      .map(item => item.brand)
      .filter(Boolean)
    const uniqueBrands = [...new Set(filteredBrands)]
    return uniqueBrands.map(brand => ({ value: brand, label: brand }))
  }

  // 根据当前选中的耗材名称筛选型号规格选项
  const getFilteredModelSpecOptions = () => {
    if (!selectedConsumableName) {
      return modelSpecOptions
    }
    // 筛选出与选中耗材名称一致的型号规格
    const filteredSpecs = consumables
      .filter(item => item.consumableName === selectedConsumableName)
      .map(item => item.modelSpec)
      .filter(Boolean)
    const uniqueSpecs = [...new Set(filteredSpecs)]
    return uniqueSpecs.map(spec => ({ value: spec, label: spec }))
  }

  // 检查耗材是否已存在（根据名称、品牌、型号规格）
  const checkExistingConsumable = (consumableName, brand, modelSpec) => {
    if (!consumableName || !brand || !modelSpec) {
      setIsExistingConsumable(false)
      return
    }
    const existing = consumables.some(item => 
      item.consumableName === consumableName && 
      item.brand === brand && 
      item.modelSpec === modelSpec
    )
    setIsExistingConsumable(existing)
    if (existing) {
      // 如果已存在，自动填充该耗材的编码
      const existingItem = consumables.find(item => 
        item.consumableName === consumableName && 
        item.brand === brand && 
        item.modelSpec === modelSpec
      )
      if (existingItem) {
        form.setFieldsValue({
          consumableCode: existingItem.consumableCode || '',
          remainingQuantity: existingItem.remainingQuantity || 0
        })
      }
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
      
      // 处理新增耗材时的数量计算
      if (!editingConsumable) {
        // 新增模式：计算新的剩余数量
        const addQuantity = values.addQuantity || 0
        const currentRemaining = values.remainingQuantity || 0
        const newRemaining = currentRemaining + addQuantity
        
        // 设置计算后的数量字段
        values.quantity = newRemaining
        values.remainingQuantity = newRemaining
        values.usedQuantity = 0
        
        // 删除新增数量字段（后端不需要）
        delete values.addQuantity
        
        // 添加图片数据
        if (formImages.length > 0) {
          values.images = JSON.stringify(formImages)
        }
        
        // 如果耗材已存在（名称、品牌、型号规格一致），则更新现有耗材
        if (isExistingConsumable) {
          const existingItem = consumables.find(item => 
            item.consumableName === values.consumableName && 
            item.brand === values.brand && 
            item.modelSpec === values.modelSpec
          )
          
          if (existingItem) {
            // 更新现有耗材的剩余数量
            const updatedValues = {
              ...existingItem,
              remainingQuantity: newRemaining,
              quantity: newRemaining,
              // 更新其他可编辑字段
              unit: values.unit,
              company: values.company,
              location: values.location,
              images: values.images || existingItem.images,
              remark: values.remark
            }
            
            const response = await fetch(`/api/consumables/${existingItem.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedValues)
            })
            
            if (response.ok) {
              message.success('已更新现有耗材的剩余数量')
              setModalVisible(false)
              form.resetFields()
              setEditingConsumable(null)
              setFormImages([])
              setIsExistingConsumable(false)
              fetchConsumables()
            } else {
              message.error('更新失败')
            }
            return
          }
        }
      }
      
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
        setFormImages([])
        setIsExistingConsumable(false)
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
    // 加载已有图片
    if (record.images) {
      try {
        const images = JSON.parse(record.images)
        setFormImages(images)
      } catch (e) {
        setFormImages([])
      }
    } else {
      setFormImages([])
    }
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
                setFormImages([])
                setSelectedConsumableName('')
                setIsExistingConsumable(false)
                // 自动填充序号为耗材总数+1
                const nextSeq = consumables.length + 1
                form.setFieldsValue({ seqNo: nextSeq })
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
          setFormImages([])
        }}
        width={1200}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          {/* 编辑模式：显示所有字段（只读和可编辑） */}
          {editingConsumable && (
            <>
              {/* 只读字段区域 */}
              <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 12, color: '#666' }}>基本信息（只读）</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                  <Form.Item label="序号" name="seqNo">
                    <Input disabled />
                  </Form.Item>
                  
                  <Form.Item label="耗材名称" name="consumableName">
                    <Input disabled />
                  </Form.Item>
                  
                  <Form.Item label="耗材编码" name="consumableCode">
                    <Input disabled />
                  </Form.Item>
                  
                  <Form.Item label="已使用数" name="usedQuantity">
                    <InputNumber style={{ width: '100%' }} disabled />
                  </Form.Item>
                  
                  <Form.Item label="剩余数量" name="remainingQuantity">
                    <InputNumber style={{ width: '100%' }} disabled />
                  </Form.Item>
                </div>
              </div>
              
              {/* 可编辑字段区域 */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 12, color: '#666' }}>可编辑信息</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                  <Form.Item label="品牌" name="brand">
                    <AutoComplete
                      placeholder="请输入或选择品牌"
                      options={brandOptions}
                      filterOption={(inputValue, option) =>
                        option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                      }
                    >
                      <Input placeholder="请输入或选择品牌" />
                    </AutoComplete>
                  </Form.Item>
                  
                  <Form.Item label="型号规格" name="modelSpec">
                    <AutoComplete
                      placeholder="请输入或选择型号规格"
                      options={modelSpecOptions}
                      filterOption={(inputValue, option) =>
                        option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                      }
                    >
                      <Input placeholder="请输入或选择型号规格" />
                    </AutoComplete>
                  </Form.Item>
                  
                  <Form.Item label="单位" name="unit">
                    <AutoComplete
                      placeholder="请输入或选择单位"
                      options={unitOptions}
                      filterOption={(inputValue, option) =>
                        option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                      }
                    >
                      <Input placeholder="请输入或选择单位" />
                    </AutoComplete>
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
              </div>
            </>
          )}
          
          {/* 添加模式：显示添加表单 */}
          {!editingConsumable && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              <Form.Item label="序号" name="seqNo">
                <Input 
                  disabled 
                  placeholder="自动填充" 
                />
              </Form.Item>
              
              <Form.Item
                label="耗材名称"
                name="consumableName"
                rules={[{ required: true, message: '请输入耗材名称' }]}
              >
                <AutoComplete
                  placeholder="请输入或选择耗材名称"
                  options={consumableOptions}
                  onSelect={(value, option) => {
                    // 选择已有耗材时自动填充
                    if (option.data && !editingConsumable) {
                      setSelectedConsumableName(value)
                      form.setFieldsValue({
                        consumableCode: option.data.consumableCode || '',
                        remainingQuantity: option.data.remainingQuantity || 0,
                        brand: option.data.brand || '',
                        modelSpec: option.data.modelSpec || '',
                        unit: option.data.unit || ''
                      })
                      // 检查是否完全匹配（名称、品牌、型号规格）
                      checkExistingConsumable(value, option.data.brand, option.data.modelSpec)
                    }
                  }}
                  onChange={(value) => {
                    setSelectedConsumableName(value)
                    const currentBrand = form.getFieldValue('brand') || ''
                    const currentModelSpec = form.getFieldValue('modelSpec') || ''
                    checkExistingConsumable(value, currentBrand, currentModelSpec)
                  }}
                  filterOption={(inputValue, option) =>
                    option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                  }
                >
                  <Input placeholder="请输入或选择耗材名称" />
                </AutoComplete>
              </Form.Item>
              
              <Form.Item label="耗材编码" name="consumableCode">
                <Input 
                  disabled={isExistingConsumable}
                  placeholder={isExistingConsumable ? "已有耗材，不新增编码" : "请输入耗材编码"}
                />
              </Form.Item>
              
              <Form.Item label="新增数量" name="addQuantity">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入新增数量" />
              </Form.Item>
              
              <Form.Item label="剩余数量" name="remainingQuantity">
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="自动填充" 
                  disabled
                />
              </Form.Item>
              
              <Form.Item label="品牌" name="brand">
                <AutoComplete
                  placeholder="请输入或选择品牌"
                  options={getFilteredBrandOptions()}
                  onChange={(value) => {
                    const currentConsumableName = form.getFieldValue('consumableName') || ''
                    const currentModelSpec = form.getFieldValue('modelSpec') || ''
                    checkExistingConsumable(currentConsumableName, value, currentModelSpec)
                  }}
                  filterOption={(inputValue, option) =>
                    option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                  }
                >
                  <Input placeholder="请输入或选择品牌" />
                </AutoComplete>
              </Form.Item>
              
              <Form.Item label="型号规格" name="modelSpec">
                <AutoComplete
                  placeholder="请输入或选择型号规格"
                  options={getFilteredModelSpecOptions()}
                  onChange={(value) => {
                    const currentConsumableName = form.getFieldValue('consumableName') || ''
                    const currentBrand = form.getFieldValue('brand') || ''
                    checkExistingConsumable(currentConsumableName, currentBrand, value)
                  }}
                  filterOption={(inputValue, option) =>
                    option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                  }
                >
                  <Input placeholder="请输入或选择型号规格" />
                </AutoComplete>
              </Form.Item>
              
              <Form.Item label="单位" name="unit">
                <AutoComplete
                  placeholder="请输入或选择单位"
                  options={unitOptions}
                  filterOption={(inputValue, option) =>
                    option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                  }
                >
                  <Input placeholder="请输入或选择单位" />
                </AutoComplete>
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
          )}
          
          <Form.Item label="耗材图片" style={{ gridColumn: 'span 5' }}>
            <div>
              <Upload
                accept="image/*"
                multiple
                showUploadList={false}
                beforeUpload={(file) => {
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    const base64 = e.target.result
                    setFormImages(prev => [...prev, base64])
                    message.success(`${file.name} 已添加`)
                  }
                  reader.readAsDataURL(file)
                  return false
                }}
              >
                <Button icon={<UploadOutlined />}>选择图片</Button>
              </Upload>
              
              {formImages.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {formImages.map((img, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img 
                        src={img} 
                        alt={`图片${index + 1}`} 
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <Button
                        type="primary"
                        danger
                        size="small"
                        style={{ position: 'absolute', top: 0, right: 0, padding: '0 4px', minWidth: 'auto' }}
                        onClick={() => {
                          setFormImages(prev => prev.filter((_, i) => i !== index))
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
