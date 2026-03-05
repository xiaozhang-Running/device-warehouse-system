import React, { useState, useEffect } from 'react'
import { Button, Spin, message, Tag } from 'antd'
import { PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import './InboundOrderPrint.css'

const InboundOrderPrint = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [orderData, setOrderData] = useState(null)
  const [outboundOrders, setOutboundOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetail()
    fetchOutboundOrders()
  }, [id])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/inbound/${id}`)
      if (!response.ok) {
        throw new Error('获取入库单详情失败')
      }
      const data = await response.json()
      console.log('打印页面获取到的数据:', data)
      console.log('打印页面获取到的items:', data.items)
      setOrderData(data)
    } catch (error) {
      console.error('获取入库单详情失败:', error)
      message.error('获取入库单详情失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchOutboundOrders = async () => {
    try {
      const response = await fetch('/api/outbound')
      const data = await response.json()
      setOutboundOrders(data)
    } catch (error) {
      console.error('获取出库单列表失败:', error)
    }
  }

  const items = orderData?.items?.map((item, index) => {
    let deviceName = '-'
    let itemCode = '-'
    let brand = '-'
    let modelSpec = '-'
    let snCode = '-'
    let quantity = item.quantity || 1
    let unit = item.unit || '台'
    let itemStatus = item.itemStatus || 'normal'
    let remark = item.remark || '-'
    
    if (item.device) {
      deviceName = item.device.deviceName || '-'
      itemCode = item.device.deviceCode || '-'
      brand = item.device.brand || '-'
      modelSpec = item.device.modelSpec || '-'
      snCode = item.device.snCode || '-'
      unit = item.device.unit || '台'
    } else if (item.accessory) {
      deviceName = item.accessory.accessoryName || '-'
      itemCode = item.accessory.accessoryCode || '-'
      brand = item.accessory.brand || '-'
      modelSpec = item.accessory.modelSpec || '-'
      unit = item.accessory.unit || '套'
    } else if (item.consumable) {
      deviceName = item.consumable.consumableName || '-'
      itemCode = item.consumable.consumableCode || '-'
      brand = item.consumable.brand || '-'
      modelSpec = item.consumable.specification || '-'
      unit = item.consumable.unit || '个'
    } else if (item.itemName) {
      deviceName = item.itemName || '-'
      itemCode = item.itemCode || '-'
      brand = item.brand || '-'
      modelSpec = item.modelSpec || '-'
    }
    
    return {
      index: index + 1,
      itemType: item.itemType || '-',
      deviceName,
      itemCode,
      brand,
      modelSpec,
      snCode,
      quantity,
      unit,
      itemStatus,
      remark
    }
  }) || []

  const handlePrint = () => {
    window.print()
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  const outbound = outboundOrders.find(o => Number(o.id) === Number(orderData?.relatedOutboundId))

  return (
    <div className="print-container">
      <div className="print-actions">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回
        </Button>
        <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          打印
        </Button>
      </div>

      <div className="print-content">
        <div className="print-header">
          <h1>项目入库单</h1>
          <div className="print-info">
            <div className="info-row">
              <div className="info-item">
                <span className="label">入库单号：</span>
                <span className="value">{orderData?.orderCode || '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">入库日期：</span>
                <span className="value">{orderData?.orderDate ? dayjs(orderData.orderDate).format('YYYY-MM-DD') : '-'}</span>
              </div>
            </div>
            <div className="info-row">
              <div className="info-item">
                <span className="label">关联出库单：</span>
                <span className="value">{outbound ? outbound.orderCode : '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">赛事名称：</span>
                <span className="value">{outbound ? outbound.eventName : '-'}</span>
              </div>
            </div>
            <div className="info-row">
              <div className="info-item">
                <span className="label">接收人：</span>
                <span className="value">{orderData?.receiver || '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">联系电话：</span>
                <span className="value">{orderData?.receiverPhone || '-'}</span>
              </div>
            </div>
            <div className="info-row">
              <div className="info-item full-width">
                <span className="label">备注：</span>
                <span className="value">{orderData?.remark || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        <table className="print-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>类型</th>
              <th>名称</th>
              <th>编号</th>
              <th>品牌</th>
              <th>型号</th>
              <th>SN码</th>
              <th>数量</th>
              <th>单位</th>
              <th>设备状态</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.index}>
                <td>{item.index}</td>
                <td>{item.itemType === 'device' ? '专用设备' : item.itemType === 'accessory' ? '通用设备' : item.itemType === 'consumable' ? '耗材' : '-'}</td>
                <td>{item.deviceName}</td>
                <td>{item.itemCode}</td>
                <td>{item.brand}</td>
                <td>{item.modelSpec}</td>
                <td>{item.snCode}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>
                  {item.itemStatus === 'normal' ? <Tag color="green">正常</Tag> : 
                   item.itemStatus === 'damaged' ? <Tag color="orange">损坏</Tag> : 
                   item.itemStatus === 'lost' ? <Tag color="red">丢失</Tag> : 
                   <Tag color="default">正常</Tag>}
                </td>
                <td>{item.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-footer">
          <div className="footer-info">
            <div className="footer-item">
              <span className="label">打印日期：</span>
              <span className="value">{dayjs().format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
            <div className="footer-item">
              <span className="label">入库状态：</span>
              <span className="value">
                {orderData?.status === 'PENDING' ? <Tag color="orange">待处理</Tag> : 
                 orderData?.status === 'COMPLETED' ? <Tag color="green">已完成</Tag> : 
                 orderData?.status === 'CANCELLED' ? <Tag color="red">已取消</Tag> : 
                 orderData?.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InboundOrderPrint