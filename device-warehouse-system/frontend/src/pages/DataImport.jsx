import React, { useState } from 'react'
import { Upload, Button, message, Card, Typography, Space, Divider, Alert } from 'antd'
import { InboxOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { Dragger } = Upload

const DataImport = () => {
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState([])

  const handleUpload = async (file) => {
    setLoading(true)
    setFileList([file])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import/csv', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        message.success(`导入成功！成功导入 ${data.successCount} 条数据，失败 ${data.errorCount} 条`)
        setFileList([])
      } else {
        message.error(data.message || '导入失败')
      }
    } catch (error) {
      console.error('导入失败:', error)
      message.error('导入失败，请重试')
    } finally {
      setLoading(false)
    }

    return false
  }

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: handleUpload,
    onRemove: () => {
      setFileList([])
    },
    accept: '.csv,.xlsx,.xls'
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>数据导入</Title>
      
      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>导入说明</Title>
            <Paragraph>
              支持导入设备数据到系统中。请按照以下步骤操作：
            </Paragraph>
            <ol>
              <li>准备CSV或Excel文件，确保数据格式正确</li>
              <li>点击下方上传区域选择文件</li>
              <li>系统会自动解析并导入数据</li>
            </ol>
          </div>

          <Divider />

          <div>
            <Title level={4}>文件格式要求</Title>
            <Paragraph>
              CSV文件应包含以下列（按顺序）：
            </Paragraph>
            <ul>
              <li>名称</li>
              <li>设备编码</li>
              <li>型号</li>
              <li>品牌</li>
              <li>设备类别</li>
              <li>设备分类名称</li>
              <li>序列号</li>
              <li>SN码</li>
              <li>数量</li>
              <li>单位</li>
              <li>状态</li>
              <li>使用状态</li>
              <li>备注</li>
            </ul>
          </div>

          <Divider />

          <Alert
            message="注意事项"
            description="导入前请确保文件格式正确，数据完整。导入过程中请不要关闭页面。"
            type="info"
            showIcon
          />
        </Space>
      </Card>

      <Card>
        <Title level={4}>上传文件</Title>
        <Dragger {...uploadProps} style={{ padding: '40px' }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单次上传。支持 CSV、XLSX、XLS 格式文件
          </p>
        </Dragger>
      </Card>
    </div>
  )
}

export default DataImport