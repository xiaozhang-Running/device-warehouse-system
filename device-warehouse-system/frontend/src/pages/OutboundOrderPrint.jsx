import React, { useState, useEffect } from 'react'
import { Button, Spin, message } from 'antd'
import { PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import './OutboundOrderPrint.css'

const OutboundOrderPrint = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetail()
  }, [id])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/outbound/${id}`)
      if (!response.ok) {
        throw new Error('获取出库单详情失败')
      }
      const data = await response.json()
      console.log('打印页面获取到的数据:', data)
      console.log('打印页面获取到的items:', data.items)
      setOrderData(data)
    } catch (error) {
      console.error('获取出库单详情失败:', error)
      message.error('获取出库单详情失败')
    } finally {
      setLoading(false)
    }
  }

  const items = orderData?.items?.map((item, index) => {
    // 处理不同类型的设备
    let deviceName = '-'
    let snCode = '-'
    let brand = '-'
    let model = '-'
    let shelfLocation = '-'
    let quantity = item.quantity || 1
    let unit = item.unit || '台'
    
    if (item.consumable) {
      // 处理耗材
      deviceName = item.consumable.consumableName || '-'
      snCode = item.consumable.consumableCode || '-'
      brand = item.consumable.brand || '-'
      model = item.consumable.specification || item.consumable.model || '-'
      shelfLocation = item.consumable.location || '-'
      unit = item.consumable.unit || '个'
    } else if (item.accessory) {
      // 处理通用设备
      deviceName = item.accessory.accessoryName || '-'
      snCode = item.accessory.accessoryCode || '-'
      brand = item.accessory.brand || '-'
      model = item.accessory.specification || item.accessory.model || '-'
      shelfLocation = item.accessory.location || '-'
      unit = item.accessory.unit || '套'
    } else if (item.device) {
      // 处理专用设备
      deviceName = item.device.deviceName || '-'
      snCode = item.device.snCode || '-'
      brand = item.device.brand || '-'
      model = item.device.modelSpec || item.device.model || '-'
      shelfLocation = item.device.location || '-'
    } else if (item.brandModel) {
      // 处理品牌型号格式的数据
      deviceName = item.brandModel?.split(' ')[0] || '-'
    }
    
    return {
      index: index + 1,
      deviceName,
      snCode,
      brand,
      model,
      shelfLocation,
      quantity,
      unit,
      condition: item.deviceCondition || '-',
      accessories: item.remark || '-'
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

  if (!orderData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>未找到出库单数据</p>
        <Button onClick={handleBack}>返回</Button>
      </div>
    )
  }

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

      <div className="print-page">
        <div className="print-header">
          <h1>设备出库明细单</h1>
        </div>

        {/* 出库经办信息 */}
        <table className="print-table">
          <tbody>
            <tr>
              <td className="label">出库经办人</td>
              <td className="value">{orderData.handledBy || ''}</td>
              <td className="label">出库经办部门</td>
              <td className="value">{orderData.deptApprover || ''}</td>
              <td className="label">实际出库日期</td>
              <td className="value">{orderData.orderDate ? dayjs(orderData.orderDate).format('YYYY.MM.DD') : ''}</td>
            </tr>
          </tbody>
        </table>

        {/* 领用信息 */}
        <table className="print-table">
          <tbody>
            <tr>
              <td className="label">领用类型</td>
              <td className="value">{orderData.usageType || ''}</td>
              <td className="label">设备领用人</td>
              <td className="value">{orderData.recipientName || ''}</td>
              <td className="label">电话</td>
              <td className="value">{orderData.contactPhone || ''}</td>
            </tr>
            <tr>
              <td className="label">赛事全称</td>
              <td className="value">{orderData.eventName || ''}</td>
              <td className="label">使用地</td>
              <td className="value">{orderData.usageLocation || ''}</td>
            </tr>
            <tr>
              <td className="label">比赛时间</td>
              <td className="value">{orderData.eventDate ? dayjs(orderData.eventDate).format('YYYY.MM.DD') : ''}</td>
              <td className="label">预计归还日期</td>
              <td className="value">{orderData.returnDate ? dayjs(orderData.returnDate).format('YYYY.MM.DD') : ''}</td>
              <td className="label">运输方式</td>
              <td className="value">{orderData.transportMethod || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* 设备明细 */}
        <table className="print-table items-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>名称</th>
              <th>SN码</th>
              <th>品牌</th>
              <th>型号</th>
              <th>货架位置</th>
              <th>数量</th>
              <th>单位</th>
              <th>状况</th>
              <th>配件及备注</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.index}>
                <td>{item.index}</td>
                <td>{item.deviceName}</td>
                <td>{item.snCode}</td>
                <td>{item.brand}</td>
                <td>{item.model}</td>
                <td>{item.shelfLocation}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>{item.condition}</td>
                <td>{item.accessories}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 10 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td>{items.length + i + 1}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 图片 */}
        {orderData.images && (
          <table className="print-table">
            <tbody>
              <tr>
                <td className="label" style={{ width: '8%' }}>图片</td>
                <td className="value" style={{ width: '92%' }}>
                  {(() => {
                    try {
                      const images = JSON.parse(orderData.images);
                      return images.map((image, index) => (
                        <div key={index} style={{ marginBottom: '10px' }}>
                          <img 
                            src={image} 
                            alt={`出库单图片 ${index + 1}`} 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '200px',
                              display: 'block'
                            }} 
                          />
                        </div>
                      ));
                    } catch (error) {
                      return null;
                    }
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* 备注 */}
        <table className="print-table">
          <tbody>
            <tr>
              <td className="label" style={{ width: '8%' }}>备注</td>
              <td className="value" style={{ width: '92%' }}>
                <strong>1.设备丢失：按照设备实际价格赔偿（不高于市场价）；</strong><br/>
                <strong>2.设备损坏但仍能使用：按照设备实际价格50%赔偿；</strong><br/>
                <strong>3.设备损坏不能使用：按照设备实际价格赔偿（不高于市场价）。</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 签字确认 */}
        <table className="print-table signature-table">
          <tbody>
            <tr>
              <td className="signature-label">设备领用人</td>
              <td className="signature-value"></td>
              <td className="signature-label">日期</td>
              <td className="signature-value"></td>
            </tr>
            <tr>
              <td className="signature-label">出库经办人</td>
              <td className="signature-value"></td>
              <td className="signature-label">日期</td>
              <td className="signature-value"></td>
            </tr>
            <tr>
              <td className="signature-label">库管</td>
              <td className="signature-value"></td>
              <td className="signature-label">日期</td>
              <td className="signature-value"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OutboundOrderPrint