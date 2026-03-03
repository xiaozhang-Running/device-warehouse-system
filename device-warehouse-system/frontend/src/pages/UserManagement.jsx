import React from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, message } from 'antd'

function UserManagement() {
  const [users, setUsers] = React.useState([
    { id: 1, username: 'admin', name: '管理员', role: '管理员', status: '正常' },
    { id: 2, username: 'operator', name: '操作员', role: '操作员', status: '正常' },
    { id: 3, username: 'guest', name: '游客', role: '游客', status: '正常' },
  ])
  const [modalVisible, setModalVisible] = React.useState(false)
  const [form] = Form.useForm()

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <>
          <Button type="link">编辑</Button>
          <Button type="link" danger>删除</Button>
        </>
      ),
    },
  ]

  const handleAdd = () => {
    setModalVisible(true)
  }

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newUser = {
        id: users.length + 1,
        status: '正常',
        ...values,
      }
      setUsers([...users, newUser])
      setModalVisible(false)
      form.resetFields()
      message.success('添加成功')
    })
  }

  const handleModalCancel = () => {
    setModalVisible(false)
    form.resetFields()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="page-title">用户管理</h2>
        <Button type="primary" onClick={handleAdd}>添加用户</Button>
      </div>
      <Card>
        <Table dataSource={users} columns={columns} rowKey="id" />
      </Card>
      <Modal
        title="添加用户"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="管理员">管理员（所有权限）</Select.Option>
              <Select.Option value="操作员">操作员（查看设备、出入库登记）</Select.Option>
              <Select.Option value="游客">游客（仅查看设备）</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement