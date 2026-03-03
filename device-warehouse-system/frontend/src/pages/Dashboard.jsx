import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Spin, message, Badge, Progress, Divider } from 'antd'
import {
  DatabaseOutlined,
  InboxOutlined,
  ExportOutlined,
  AlertOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  FileTextOutlined
} from '@ant-design/icons'

/**
 * 仪表盘页面组件
 * 展示仓库管理系统的关键统计数据和图表
 *
 * @author Warehouse Management System
 * @version 1.0
 */
function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  // 获取仪表盘数据
  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        message.error('获取仪表盘数据失败')
      }
    } catch (error) {
      console.error('获取仪表盘数据失败:', error)
      message.error('获取仪表盘数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  // 统计卡片配置
  const statCards = [
    {
      title: '专用设备总数',
      value: stats?.totalDevices || 0,
      icon: <DatabaseOutlined />,
      color: '#1890ff',
      suffix: '台'
    },
    {
      title: '通用设备总数',
      value: stats?.totalAccessories || 0,
      icon: <AppstoreOutlined />,
      color: '#52c41a',
      suffix: '个'
    },
    {
      title: '耗材总数',
      value: stats?.totalConsumables || 0,
      icon: <ShoppingOutlined />,
      color: '#faad14',
      suffix: '件'
    },
    {
      title: '库存预警',
      value: stats?.alertCount || 0,
      icon: <AlertOutlined />,
      color: '#ff4d4f',
      suffix: '项'
    }
  ]

  // 今日出入库卡片
  const todayCards = [
    {
      title: '今日入库',
      value: stats?.todayInbound || 0,
      icon: <InboxOutlined />,
      color: '#52c41a'
    },
    {
      title: '今日出库',
      value: stats?.todayOutbound || 0,
      icon: <ExportOutlined />,
      color: '#fa8c16'
    },
    {
      title: '本月入库',
      value: stats?.monthInbound || 0,
      icon: <FileTextOutlined />,
      color: '#1890ff'
    },
    {
      title: '本月出库',
      value: stats?.monthOutbound || 0,
      icon: <FileTextOutlined />,
      color: '#722ed1'
    }
  ]

  // 设备状态分布列
  const statusColumns = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          '正常': { color: '#52c41a', icon: <CheckCircleOutlined /> },
          '维修中': { color: '#faad14', icon: <ToolOutlined /> },
          '报废': { color: '#ff4d4f', icon: <CloseCircleOutlined /> },
          '未知': { color: '#d9d9d9', icon: <ExclamationCircleOutlined /> }
        }
        const config = statusConfig[status] || statusConfig['未知']
        return (
          <span style={{ color: config.color }}>
            {config.icon} {status}
          </span>
        )
      }
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      align: 'right'
    },
    {
      title: '占比',
      key: 'percentage',
      align: 'right',
      render: (_, record) => {
        const total = stats?.totalDevices || 1
        const percentage = ((record.count / total) * 100).toFixed(1)
        return <Progress percent={parseFloat(percentage)} size="small" />
      }
    }
  ]

  // 品牌统计列
  const brandColumns = [
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand'
    },
    {
      title: '设备数量',
      dataIndex: 'count',
      key: 'count',
      align: 'right'
    },
    {
      title: '占比',
      key: 'percentage',
      align: 'right',
      render: (_, record) => {
        const total = stats?.totalDevices || 1
        const percentage = ((record.count / total) * 100).toFixed(1)
        return <Progress percent={parseFloat(percentage)} size="small" />
      }
    }
  ]

  // 预警列表列
  const alertColumns = [
    {
      title: '名称',
      dataIndex: 'deviceName',
      key: 'deviceName'
    },
    {
      title: '最小库存',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      align: 'right'
    },
    {
      title: '最大库存',
      dataIndex: 'maxQuantity',
      key: 'maxQuantity',
      align: 'right'
    }
  ]

  // 最近操作记录列
  const activityColumns = [
    {
      title: '操作类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Badge
          color={type === '入库' ? '#52c41a' : '#fa8c16'}
          text={type}
        />
      )
    },
    {
      title: '名称',
      dataIndex: 'device',
      key: 'device'
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right'
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator'
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time'
    }
  ]

  // 状态分布数据
  const statusData = stats?.statusDistribution
    ? Object.entries(stats.statusDistribution).map(([status, count]) => ({
        key: status,
        status,
        count
      }))
    : []

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>加载中...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="page-title">仪表盘</h2>

      {/* 主要统计卡片 */}
      <Row gutter={16}>
        {statCards.map((card, index) => (
          <Col span={6} key={index}>
            <Card hoverable>
              <Statistic
                title={card.title}
                value={card.value}
                prefix={React.cloneElement(card.icon, { style: { color: card.color } })}
                suffix={card.suffix}
                valueStyle={{ color: card.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 今日/本月统计 */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        {todayCards.map((card, index) => (
          <Col span={6} key={index}>
            <Card hoverable size="small">
              <Statistic
                title={card.title}
                value={card.value}
                prefix={React.cloneElement(card.icon, { style: { color: card.color } })}
                valueStyle={{ color: card.color, fontSize: 24 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />

      {/* 详细数据表格 */}
      <Row gutter={16}>
        {/* 设备状态分布 */}
        <Col span={8}>
          <Card title="设备状态分布" size="small">
            <Table
              dataSource={statusData}
              columns={statusColumns}
              pagination={false}
              size="small"
              rowKey="key"
            />
          </Card>
        </Col>

        {/* 品牌统计 */}
        <Col span={8}>
          <Card title="品牌统计 TOP5" size="small">
            <Table
              dataSource={stats?.brandStats || []}
              columns={brandColumns}
              pagination={false}
              size="small"
              rowKey="brand"
              locale={{ emptyText: '暂无数据' }}
            />
          </Card>
        </Col>

        {/* 库存预警 */}
        <Col span={8}>
          <Card
            title="库存预警"
            size="small"
            extra={stats?.alertCount > 0 ? <Badge count={stats.alertCount} /> : null}
          >
            <Table
              dataSource={stats?.alertItems || []}
              columns={alertColumns}
              pagination={false}
              size="small"
              rowKey="deviceName"
              locale={{ emptyText: '暂无预警' }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* 最近操作记录 */}
      <Row>
        <Col span={24}>
          <Card title="最近操作记录" size="small">
            <Table
              dataSource={stats?.recentActivities || []}
              columns={activityColumns}
              pagination={{ pageSize: 5 }}
              size="small"
              rowKey={(record, index) => index}
              locale={{ emptyText: '暂无操作记录' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
