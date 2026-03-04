import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Image, InputNumber, Upload, Badge } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ToolOutlined, ClearOutlined, PictureOutlined, EyeOutlined, UploadOutlined, DeleteOutlined as DeleteIcon } from '@ant-design/icons'

const DeviceManagement = () => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingDevice, setEditingDevice] = useState(null)
  const [form] = Form.useForm()
  const [filterForm] = Form.useForm()
  const [filters, setFilters] = useState({})
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [currentImages, setCurrentImages] = useState([])
  const [currentDeviceName, setCurrentDeviceName] = useState('')
  const [currentDeviceId, setCurrentDeviceId] = useState(null)
  const [currentFormDeviceName, setCurrentFormDeviceName] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState(new Set())
  const [formImages, setFormImages] = useState([])
  const [pendingUploadFiles, setPendingUploadFiles] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [isExistingDevice, setIsExistingDevice] = useState(false)
  const [companies, setCompanies] = useState([])
  const [warehouses, setWarehouses] = useState([])

  const handleFilterSubmit = async (values) => {
    setFilters(values)
    fetchDevices(values)
  }

  const handleFilterReset = () => {
    filterForm.resetFields()
    setFilters({})
    fetchDevices({})
  }

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
    fetchDevices()
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

  const fetchDevices = async (filterParams = {}) => {
    setLoading(true)
    try {
      console.log('开始获取设备数据...', filterParams)
      const queryParams = new URLSearchParams()
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value)
        }
      })
      const response = await fetch(`/api/devices?${queryParams.toString()}`)
      console.log('响应状态:', response.status)
      console.log('响应状态文本:', response.statusText)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('获取到的设备数据:', data)
      setDevices(data)
    } catch (error) {
      console.error('获取设备数据失败:', error)
      message.error('获取设备数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    try {
      const response = await fetch('/api/devices/clear', {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        message.success('设备数据已清空')
        fetchDevices()
      } else {
        message.error(data.message || '清空失败')
      }
    } catch (error) {
      console.error('清空设备数据失败:', error)
      message.error('清空设备数据失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (currentUser) {
        values.createdBy = currentUser.username
        values.updatedBy = currentUser.username
      }
      const url = editingDevice 
        ? `/api/devices/${editingDevice.id}`
        : '/api/devices'
      const method = editingDevice ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      
      if (response.ok) {
        const data = await response.json()
        message.success(editingDevice ? '更新成功' : '创建成功')
        
        // 如果是新增设备且有待上传的照片，上传照片
        if (!editingDevice && pendingUploadFiles.length > 0) {
          message.loading('正在上传照片...', 0)
          const deviceName = data.deviceName
          let successCount = 0
          let failCount = 0
          
          for (const item of pendingUploadFiles) {
            const formData = new FormData()
            formData.append('file', item.file)
            
            try {
              const uploadResponse = await fetch(`/api/device-images/upload/${encodeURIComponent(deviceName)}`, {
                method: 'POST',
                body: formData
              })
              
              if (uploadResponse.ok) {
                successCount++
              } else {
                failCount++
              }
            } catch (error) {
              console.error('上传照片失败:', error)
              failCount++
            }
          }
          
          message.destroy()
          if (successCount > 0) {
            message.success(`成功上传 ${successCount} 张照片`)
          }
          if (failCount > 0) {
            message.error(`${failCount} 张照片上传失败`)
          }
        }
        
        if (!editingDevice) {
          setEditingDevice(data)
          setCurrentDeviceId(data.id)
          setCurrentFormDeviceName(data.deviceName)
          const images = await fetchDeviceImages(data.deviceName)
          setFormImages(images)
        } else {
          setCurrentFormDeviceName(values.deviceName)
          const images = await fetchDeviceImages(values.deviceName)
          setFormImages(images)
        }
        
        setModalVisible(false)
        form.resetFields()
        setEditingDevice(null)
        setCurrentDeviceId(null)
        setCurrentFormDeviceName('')
        setFormImages([])
        setPendingUploadFiles([])
        fetchDevices()
      } else {
        message.error('操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 获取同名设备的最大编号
  const getMaxDeviceCode = (deviceName) => {
    const sameNameDevices = devices.filter(d => d.deviceName === deviceName)
    if (sameNameDevices.length === 0) return 0
    
    let maxNum = 0
    sameNameDevices.forEach(d => {
      const code = d.deviceCode
      if (code) {
        const match = code.match(/YD-.+-([0-9]+)$/)
        if (match) {
          const num = parseInt(match[1])
          if (num > maxNum) maxNum = num
        }
      }
    })
    
    return maxNum === 0 ? sameNameDevices.length : maxNum
  }

  // 生成设备编号
  const generateDeviceCode = (deviceName, startNum = 1) => {
    return `YD-${deviceName}-${String(startNum).padStart(3, '0')}`
  }

  const handleEdit = async (record) => {
    setEditingDevice(record)
    setCurrentDeviceId(record.id)
    setCurrentFormDeviceName(record.deviceName)
    const images = await fetchDeviceImages(record.deviceName)
    setFormImages(images)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/devices/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        message.success('删除成功')
        fetchDevices()
      } else {
        message.error('删除失败')
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  // 获取设备图片列表
  const fetchDeviceImages = async (deviceName) => {
    try {
      const response = await fetch(`/api/device-images/device/${encodeURIComponent(deviceName)}`)
      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (error) {
      console.error('获取设备图片失败:', error)
    }
    return []
  }

  // 查看设备照片
  const handleViewImages = async (record) => {
    const images = await fetchDeviceImages(record.deviceName)
    setCurrentImages(images)
    setCurrentDeviceName(record.deviceName)
    setCurrentDeviceId(record.id)
    setImageModalVisible(true)
  }

  // 表单中上传图片
  const handleFormUpload = async (file) => {
    if (!currentFormDeviceName) {
      message.error('请先保存设备信息')
      return false
    }
    
    const fileId = file.name + file.size
    setUploadingFiles(prev => new Set([...prev, fileId]))
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch(`/api/device-images/upload/${encodeURIComponent(currentFormDeviceName)}`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        message.success(`${file.name} 上传成功`)
        // 刷新图片列表
        const images = await fetchDeviceImages(currentFormDeviceName)
        setFormImages(images)
        return true
      } else {
        const errorData = await response.json()
        message.error(`${file.name} ${errorData.message || '上传失败'}`)
        console.error('上传失败:', errorData)
        return false
      }
    } catch (error) {
      message.error(`${file.name} 上传失败`)
      console.error('上传异常:', error)
      return false
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileId)
        return newSet
      })
    }
  }

  // 表单中删除图片
  const handleFormDeleteImage = async (imageId) => {
    try {
      const response = await fetch(`/api/device-images/${imageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        message.success('删除成功')
        // 刷新图片列表
        const images = await fetchDeviceImages(currentDeviceId)
        setFormImages(images)
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
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1
      }
    },
    {
      title: '名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 150,
      fixed: 'left',
      ellipsis: true
    },
    {
      title: '编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
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
            <h2 className="page-title" style={{ margin: 0, fontSize: '18px', lineHeight: '1.2' }}>专用设备管理</h2>
            <Space>
              <Popconfirm
                title="确定要清空所有设备数据吗？此操作不可恢复！"
                onConfirm={handleClearAll}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<ClearOutlined />}>清空数据</Button>
              </Popconfirm>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setEditingDevice(null)
                setCurrentDeviceId(null)
                setCurrentFormDeviceName('')
                setFormImages([])
                setPendingUploadFiles([])
                setIsExistingDevice(false)
                form.resetFields()
                // 自动填充序号为设备总数+1
                const nextSeq = devices.length + 1
                form.setFieldsValue({ displaySeq: nextSeq })
                setModalVisible(true)
              }}>
                添加专用设备
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
          <Form.Item label="名称" name="deviceName">
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
              <Select.Option value="借出">借出</Select.Option>
              <Select.Option value="维修">维修</Select.Option>
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
          dataSource={devices}
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
        title={editingDevice ? '编辑设备' : '添加专用设备'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingDevice(null)
        }}
        width={1200}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
            <Form.Item label="序号" name="displaySeq">
              <Input disabled placeholder="自动填充" />
            </Form.Item>
            
            <Form.Item
              label="名称"
              name="deviceName"
              rules={[{ required: true, message: '请输入名称' }]}
            >
              <Input 
                placeholder="请输入名称" 
                onChange={(e) => {
                  const deviceName = e.target.value
                  if (deviceName && !editingDevice) {
                    // 判断是否为已有设备
                    const existing = devices.some(d => d.deviceName === deviceName)
                    setIsExistingDevice(existing)
                    
                    const maxNum = getMaxDeviceCode(deviceName)
                    const nextNum = maxNum + 1
                    const deviceCode = generateDeviceCode(deviceName, nextNum)
                    form.setFieldsValue({ deviceCode })
                  }
                }}
              />
            </Form.Item>
            
            <Form.Item
              label="设备编号"
              name="deviceCode"
              rules={[{ required: true, message: '请输入设备编号' }]}
            >
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
                <Select.Option value="使用中">使用中</Select.Option>
                <Select.Option value="借出">借出</Select.Option>
                <Select.Option value="维修">维修</Select.Option>
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
          
          <Form.Item label="设备照片" style={{ gridColumn: 'span 6' }}>
            <div>
              <Upload
                accept="image/*"
                multiple
                showUploadList={false}
                beforeUpload={(file) => {
                  if (editingDevice) {
                    // 编辑模式：直接上传
                    handleFormUpload(file)
                  } else {
                    // 新增模式：缓存文件
                    const fileId = file.name + file.size
                    if (!pendingUploadFiles.some(f => f.fileId === fileId)) {
                      setPendingUploadFiles(prev => [...prev, { file, fileId }])
                      message.success(`${file.name} 已添加到待上传列表`)
                    }
                  }
                  return false
                }}
                disabled={uploadingFiles.size > 0 || isExistingDevice}
              >
                <Button 
                  icon={<UploadOutlined />} 
                  loading={uploadingFiles.size > 0} 
                  disabled={isExistingDevice}
                >
                  {editingDevice ? '上传照片' : '选择照片'}
                </Button>
              </Upload>
              <span style={{ marginLeft: '8px', color: '#999', fontSize: '12px' }}>
                {isExistingDevice 
                  ? '该设备名称已存在，照片上传已禁用' 
                  : editingDevice
                    ? `支持 JPG、PNG、GIF 格式，单个文件不超过 10MB，可一次选择多张${uploadingFiles.size > 0 ? ` (正在上传 ${uploadingFiles.size} 个文件)` : ''}`
                    : `支持 JPG、PNG、GIF 格式，单个文件不超过 10MB，已选择 ${pendingUploadFiles.length} 张照片，保存时自动上传`
                }
              </span>
            </div>
            
            {/* 待上传文件预览 */}
            {!editingDevice && pendingUploadFiles.length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {pendingUploadFiles.map((item, index) => (
                  <div key={item.fileId} style={{ 
                    width: '50px', 
                    height: '50px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <Image
                      src={URL.createObjectURL(item.file)}
                      alt={`待上传照片 ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      preview={false}
                    />
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<DeleteIcon />}
                      onClick={() => setPendingUploadFiles(prev => prev.filter(f => f.fileId !== item.fileId))}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        opacity: 0.8
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* 已上传图片预览（编辑模式） */}
            {editingDevice && formImages.length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {formImages.map((image, index) => (
                  <div key={image.id} style={{ 
                    width: '50px', 
                    height: '50px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <Image
                      src={`/api/device-images/${image.id}/data`}
                      alt={`照片 ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      preview={false}
                    />
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<DeleteIcon />}
                      onClick={() => handleFormDeleteImage(image.id)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        opacity: 0.8
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </Form.Item>
          
          <Form.Item label="备注" name="remark" style={{ gridColumn: 'span 6' }}>
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 照片查看弹窗 */}
      <Modal
        title={`${currentDeviceName} - 设备照片`}
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={null}
        width={900}
      >
        {/* 照片列表 */}
        {currentImages.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {currentImages.map((image, index) => (
              <div key={image.id} style={{ 
                width: '200px', 
                height: '200px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Image
                  src={`/api/device-images/${image.id}/data`}
                  alt={`照片 ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  placeholder={<div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: '#f5f5f5'
                  }}>加载中...</div>}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  padding: '4px 8px',
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  fontSize: '12px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {image.fileName}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <PictureOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <p>暂无照片</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DeviceManagement
