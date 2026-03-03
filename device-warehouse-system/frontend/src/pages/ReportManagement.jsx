import React from 'react'
import { Card, Row, Col, Statistic, Table } from 'antd'

function ReportManagement() {
  const reportData = [
    { key: '设备A', device: '设备A', inboundCount: 10, outboundCount: 5, currentStock: 100 },
    { key: '设备B', device: '设备B', inboundCount: 5, outboundCount: 3, currentStock: 50 },
    { key: '设备C', device: '设备C', inboundCount: 2, outboundCount: 1, currentStock: 10 },
  ]

  const columns = [
    { title: '名称', dataIndex: 'device', key: 'device' },
    { title: '入库次数', dataIndex: 'inboundCount', key: 'inboundCount' },
    { title: '出库次数', dataIndex: 'outboundCount', key: 'outboundCount' },
    { title: '当前库存', dataIndex: 'currentStock', key: 'currentStock' },
  ]

  return (
    <div>
      <h2 className="page-title">报表管理</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="总入库次数" value={17} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="总出库次数" value={9} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="总库存数量" value={160} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="设备出入库统计">
            <Table dataSource={reportData} columns={columns} rowKey="key" />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ReportManagement