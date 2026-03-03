/**
 * 库存管理页面组件
 * 
 * 功能说明：
 * 1. 库存汇总展示 - 汇总显示专用设备、通用设备、耗材的库存信息
 * 2. 多维度筛选 - 支持按状态、类别、品牌筛选
 * 3. 库存预警 - 显示库存低于阈值的设备，支持预警配置
 * 4. 统计分析 - 展示总设备数、总数量、使用中/未使用数量等统计信息
 * 
 * @author Warehouse Management System
 * @version 1.0
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, Table, Button, Input, Space, Tag, message, Statistic, Row, Col, Select, Progress, Tooltip, Modal, Form, InputNumber, Badge, Alert } from 'antd'
import { SearchOutlined, ReloadOutlined, InboxOutlined, WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons'

const { Option } = Select

/**
 * 库存管理主组件
 */
function InventoryManagement() {
  // ==================== 状态定义 ====================
  
  /** 库存列表数据 */
  const [inventoryList, setInventoryList] = useState([])
  /** 筛选后的库存列表 */
  const [filteredList, setFilteredList] = useState([])
  /** 加载状态 */
  const [loading, setLoading] = useState(false)
  /** 搜索关键词 */
  const [searchKeyword, setSearchKeyword] = useState('')
  /** 状态筛选值 */
  const [filterStatus, setFilterStatus] = useState('all')
  /** 类别筛选值 */
  const [filterCategory, setFilterCategory] = useState('all')
  /** 品牌筛选值 */
  const [filterBrand, setFilterBrand] = useState('all')
  /** 预警配置弹窗显示状态 */
  const [alertModalVisible, setAlertModalVisible] = useState(false)
  /** 当前编辑的预警配置 */
  const [editingAlert, setEditingAlert] = useState(null)
  /** 预警配置表单 */
  const [alertForm] = Form.useForm()
  /** 预警配置列表 */
  const [alertConfigs, setAlertConfigs] = useState([])
  /** 统计数据 */
  const [stats, setStats] = useState({
    totalDevices: 0,
    totalQuantity: 0,
    inUseQuantity: 0,
    unusedQuantity: 0,
    normalCount: 0,
    warningCount: 0,
    outOfStockCount: 0
  })
  /** 数据加载标记，防止重复加载 */
  const dataLoadedRef = useRef(false)

  // ==================== 数据获取方法 ====================

  /**
   * 获取库存汇总数据
   * @param {AbortSignal} signal - 用于取消请求的信号
   */
  const fetchInventorySummary = async (signal) => {
    try {
      setLoading(true)
      const url = searchKeyword 
        ? `/api/inventory/summary/search?keyword=${encodeURIComponent(searchKeyword)}`
        : '/api/inventory/summary'
      
      const response = await fetch(url, { signal })
      if (response.ok) {
        const data = await response.json()
        setInventoryList(data)
        processAndSortData(data)
      } else {
        message.error('获取库存数据失败')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('获取库存数据失败:', error)
        message.error('获取库存数据失败')
      }
    } finally {
      setLoading(false)
    }
  }

  // 获取预警配置
  const fetchAlertConfigs = async () => {
    try {
      const response = await fetch('/api/inventory/alert-configs')
      if (response.ok) {
        const data = await response.json()
        setAlertConfigs(data)
      }
    } catch (error) {
      console.error('获取预警配置失败:', error)
    }
  }

  // 处理和排序数据
  const processAndSortData = (data) => {
    // 计算统计数据
    const totalDevices = data.length
    const totalQuantity = data.reduce((sum, item) => sum + (item.totalQuantity || 0), 0)
    const inUseQuantity = data.reduce((sum, item) => sum + (item.inUseQuantity || 0), 0)
    const unusedQuantity = data.reduce((sum, item) => sum + (item.unusedQuantity || 0), 0)
    const normalCount = data.filter(item => item.status === '正常').length
    const warningCount = data.filter(item => item.status === '预警' || item.status === '超储').length
    const outOfStockCount = data.filter(item => item.status === '缺货').length
    
    setStats({
      totalDevices,
      totalQuantity,
      inUseQuantity,
      unusedQuantity,
      normalCount,
      warningCount,
      outOfStockCount
    })

    // 过滤
    let processed = [...data]
    
    // 状态过滤
    if (filterStatus !== 'all') {
      processed = processed.filter(item => {
        if (filterStatus === 'normal') return item.status === '正常'
        if (filterStatus === 'warning') return item.status === '预警' || item.status === '超储'
        if (filterStatus === 'outOfStock') return item.status === '缺货'
        return true
      })
    }
    
    // 类别过滤
    if (filterCategory !== 'all') {
      processed = processed.filter(item => item.category === filterCategory)
    }
    
    // 品牌过滤
    if (filterBrand !== 'all') {
      processed = processed.filter(item => item.brand === filterBrand)
    }
    
    setFilteredList(processed)
  }

  // 当过滤条件改变时重新处理数据
  useEffect(() => {
    processAndSortData(inventoryList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterCategory, filterBrand])

  // 加载数据
  const loadData = async () => {
    if (dataLoadedRef.current) return
    
    const controller = new AbortController()
    await fetchInventorySummary(controller.signal)
    await fetchAlertConfigs()
    dataLoadedRef.current = true
    
    return () => controller.abort()
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 搜索
  const handleSearch = () => {
    dataLoadedRef.current = false
    fetchInventorySummary()
  }

  // 刷新数据
  const handleRefresh = () => {
    setSearchKeyword('')
    setFilterStatus('all')
    setFilterCategory('all')
    setFilterBrand('all')
    dataLoadedRef.current = false
    fetchInventorySummary()
    fetchAlertConfigs()
  }

  // 打开预警配置弹窗
  const handleOpenAlertModal = (record) => {
    setEditingAlert(record)
    alertForm.setFieldsValue({
      deviceName: record.deviceName,
      minQuantity: record.minQuantity || 10,
      maxQuantity: record.maxQuantity || 1000,
      remark: record.remark || ''
    })
    setAlertModalVisible(true)
  }

  // 保存预警配置
  const handleSaveAlertConfig = async () => {
    try {
      const values = await alertForm.validateFields()
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      
      const config = {
        ...values,
        createdBy: currentUser.username,
        updatedBy: currentUser.username
      }

      const url = editingAlert?.alertConfigId 
        ? `/api/inventory/alert-configs/${editingAlert.alertConfigId}`
        : '/api/inventory/alert-configs'
      const method = editingAlert?.alertConfigId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        message.success('预警配置保存成功')
        setAlertModalVisible(false)
        fetchAlertConfigs()
        fetchInventorySummary()
      } else {
        message.error('保存失败')
      }
    } catch (error) {
      message.error('保存失败')
    }
  }

  // 获取状态标签
  const getStatusTag = (status, isWarning) => {
    if (isWarning) {
      return <Badge status="error" text={<Tag color="red" icon={<WarningOutlined />}>预警</Tag>} />
    }
    switch (status) {
      case '正常':
        return <Tag color="green" icon={<CheckCircleOutlined />}>正常</Tag>
      case '预警':
        return <Tag color="orange" icon={<WarningOutlined />}>预警</Tag>
      case '超储':
        return <Tag color="red" icon={<ExclamationCircleOutlined />}>超储</Tag>
      case '缺货':
        return <Tag color="red" icon={<ExclamationCircleOutlined />}>缺货</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  // 获取类别标签
  const getCategoryTag = (category) => {
    switch (category) {
      case '专用设备':
        return <Tag color="blue">专用设备</Tag>
      case '通用设备':
        return <Tag color="purple">通用设备</Tag>
      case '耗材':
        return <Tag color="cyan">耗材</Tag>
      default:
        return <Tag>{category}</Tag>
    }
  }

  // 计算使用率
  const getUsageRate = (record) => {
    if (!record.totalQuantity || record.totalQuantity === 0) return 0
    return Math.round((record.inUseQuantity / record.totalQuantity) * 100)
  }

  // 获取行样式
  const getRowClassName = (record) => {
    if (record.isWarning || record.status === '预警') {
      return 'inventory-warning-row'
    }
    return ''
  }

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 70,
      render: (_, __, index) => index + 1
    },
    {
      title: '名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 200,
      render: (text, record) => (
        <span style={{ 
          fontWeight: 'bold',
          color: record.isWarning || record.status === '预警' ? '#ff4d4f' : 'inherit'
        }}>
          {record.isWarning && <WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />}
          {text}
        </span>
      )
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
      render: (brand) => <span style={{ color: '#666' }}>{brand || '-'}</span>
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category) => getCategoryTag(category)
    },
    {
      title: '总数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 110,
      align: 'right',
      render: (quantity, record) => (
        <Tooltip title={`单位: ${record.unit || '个'}${record.minQuantity ? `, 最小库存: ${record.minQuantity}` : ''}`}>
          <span style={{ 
            fontWeight: 'bold', 
            color: record.isWarning || record.status === '预警' ? '#ff4d4f' : '#1890ff'
          }}>
            {quantity}
          </span>
        </Tooltip>
      )
    },
    {
      title: '已使用',
      dataIndex: 'inUseQuantity',
      key: 'inUseQuantity',
      width: 100,
      align: 'right',
      render: (quantity) => <span style={{ color: '#52c41a' }}>{quantity}</span>
    },
    {
      title: '未使用',
      dataIndex: 'unusedQuantity',
      key: 'unusedQuantity',
      width: 100,
      align: 'right',
      render: (quantity, record) => (
        <span style={{ 
          color: record.isWarning || record.status === '预警' ? '#ff4d4f' : '#faad14',
          fontWeight: record.isWarning || record.status === '预警' ? 'bold' : 'normal'
        }}>
          {quantity}
        </span>
      )
    },
    {
      title: '使用率',
      key: 'usageRate',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const rate = getUsageRate(record)
        let status = 'normal'
        if (rate >= 80) status = 'exception'
        else if (rate >= 50) status = 'active'
        
        return (
          <Tooltip title={`使用率: ${rate}%`}>
            <Progress 
              percent={rate} 
              size="small" 
              status={status}
              style={{ width: 80 }}
            />
          </Tooltip>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status, record) => getStatusTag(status, record.isWarning)
    },
    {
      title: '预警设置',
      key: 'alert',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button 
          type={record.minQuantity ? 'primary' : 'default'}
          size="small"
          icon={<SettingOutlined />}
          onClick={() => handleOpenAlertModal(record)}
        >
          {record.minQuantity ? '已设置' : '设置'}
        </Button>
      )
    }
  ]

  // 预警设备列表
  const warningList = inventoryList.filter(item => item.isWarning || item.status === '预警')

  return (
    <div style={{ padding: '24px' }}>
      {/* 预警提示 */}
      {warningList.length > 0 && (
        <Alert
          message={
            <span>
              <BellOutlined style={{ marginRight: 8 }} />
              库存预警提醒：有 {warningList.length} 个设备库存低于最小值，请及时补充
            </span>
          }
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
          action={
            <Button size="small" danger onClick={() => setFilterStatus('warning')}>
              查看预警
            </Button>
          }
        />
      )}

      {/* 库存汇总统计 */}
      <Card title="库存汇总统计" style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={4}>
            <Statistic
              title="设备种类"
              value={stats.totalDevices}
              prefix={<InboxOutlined />}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="总库存数量"
              value={stats.totalQuantity}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="已使用数量"
              value={stats.inUseQuantity}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="未使用数量"
              value={stats.unusedQuantity}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="正常库存"
              value={stats.normalCount}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${stats.totalDevices}`}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="预警/缺货"
              value={stats.warningCount + stats.outOfStockCount}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 库存分析 */}
      <Card title="库存分析" style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" title="库存状态分布" variant="borderless">
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '24px', color: '#52c41a', fontWeight: 'bold' }}>{stats.normalCount}</div>
                  <div style={{ color: '#666' }}>正常</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', color: '#faad14', fontWeight: 'bold' }}>{stats.warningCount}</div>
                  <div style={{ color: '#666' }}>预警/超储</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', color: '#ff4d4f', fontWeight: 'bold' }}>{stats.outOfStockCount}</div>
                  <div style={{ color: '#666' }}>缺货</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="整体使用率" variant="borderless">
              <div style={{ textAlign: 'center' }}>
                <Progress 
                  type="dashboard" 
                  percent={stats.totalQuantity > 0 ? Math.round((stats.inUseQuantity / stats.totalQuantity) * 100) : 0}
                  size={80}
                />
                <div style={{ marginTop: '8px', color: '#666' }}>
                  {stats.inUseQuantity} / {stats.totalQuantity}
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="可用库存比例" variant="borderless">
              <div style={{ textAlign: 'center' }}>
                <Progress 
                  type="dashboard" 
                  percent={stats.totalQuantity > 0 ? Math.round((stats.unusedQuantity / stats.totalQuantity) * 100) : 0}
                  size={80}
                  strokeColor="#faad14"
                />
                <div style={{ marginTop: '8px', color: '#666' }}>
                  {stats.unusedQuantity} / {stats.totalQuantity}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 库存明细 */}
      <Card
        title={
          <span>
            库存明细
            {filterStatus === 'warning' && (
              <Tag color="red" style={{ marginLeft: 8 }}>仅显示预警</Tag>
            )}
          </span>
        }
        extra={
          <Space>
            <Select
              placeholder="状态筛选"
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="all">全部状态</Option>
              <Option value="normal">正常</Option>
              <Option value="warning">预警/超储</Option>
              <Option value="outOfStock">缺货</Option>
            </Select>
            <Select
              placeholder="类别筛选"
              value={filterCategory}
              onChange={(value) => setFilterCategory(value)}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="all">全部类别</Option>
              <Option value="专用设备">专用设备</Option>
              <Option value="通用设备">通用设备</Option>
              <Option value="耗材">耗材</Option>
            </Select>
            <Select
              placeholder="品牌筛选"
              value={filterBrand}
              onChange={(value) => setFilterBrand(value)}
              style={{ width: 140 }}
              allowClear
            >
              <Option value="all">全部品牌</Option>
              {[...new Set(inventoryList.map(item => item.brand).filter(Boolean))].map(brand => (
                <Option key={brand} value={brand}>{brand}</Option>
              ))}
            </Select>
            <Input
              placeholder="搜索名称"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 180 }}
              prefix={<SearchOutlined />}
              allowClear
            />
            <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button onClick={handleRefresh} icon={<ReloadOutlined />}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey="deviceName"
          loading={loading}
          rowClassName={getRowClassName}
          pagination={{
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50', '100'],
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          summary={(pageData) => {
            const totalQty = pageData.reduce((sum, item) => sum + (item.totalQuantity || 0), 0)
            const inUseQty = pageData.reduce((sum, item) => sum + (item.inUseQuantity || 0), 0)
            const unusedQty = pageData.reduce((sum, item) => sum + (item.unusedQuantity || 0), 0)
            
            return (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    本页合计：
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <span style={{ color: '#1890ff' }}>{totalQty}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <span style={{ color: '#52c41a' }}>{inUseQty}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <span style={{ color: '#faad14' }}>{unusedQty}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} colSpan={3} />
                </Table.Summary.Row>
              </Table.Summary>
            )
          }}
        />
      </Card>

      {/* 预警配置弹窗 */}
      <Modal
        title="库存预警配置"
        open={alertModalVisible}
        onOk={handleSaveAlertConfig}
        onCancel={() => setAlertModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={alertForm}
          layout="vertical"
        >
          <Form.Item
            name="deviceName"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="minQuantity"
            label="最小库存数量"
            rules={[{ required: true, message: '请输入最小库存数量' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="低于此值将触发预警" />
          </Form.Item>
          <Form.Item
            name="maxQuantity"
            label="最大库存数量"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="高于此值将标记为超储" />
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 自定义样式 */}
      <style>{`
        .inventory-warning-row {
          background-color: #fff1f0 !important;
        }
        .inventory-warning-row:hover {
          background-color: #ffccc7 !important;
        }
      `}</style>
    </div>
  )
}

export default InventoryManagement
