import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { Layout, Menu, ConfigProvider, Dropdown, Avatar, message } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import zhCN from 'antd/locale/zh_CN'
import './App.css'

// 导入图标
import {
  DashboardOutlined, 
  ToolOutlined, 
  InboxOutlined, 
  ExportOutlined, 
  DatabaseOutlined, 
  HomeOutlined, 
  UserOutlined as UserIcon, 
  BarChartOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  UploadOutlined,
  ExperimentOutlined,
  DesktopOutlined
} from '@ant-design/icons'

// 页面组件
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DeviceManagement from './pages/DeviceManagement'
import InboundManagement from './pages/InboundManagement'
import DeviceInboundManagement from './pages/DeviceInboundManagement'
import ProjectInboundManagement from './pages/ProjectInboundManagement'
import MaterialInboundManagement from './pages/MaterialInboundManagement'
import OutboundManagement from './pages/OutboundManagement'
import MaterialOutboundManagement from './pages/MaterialOutboundManagement'
import OutboundOrderPrint from './pages/OutboundOrderPrint'
import InboundOrderPrint from './pages/InboundOrderPrint'
import InventoryManagement from './pages/InventoryManagement'
import LocationManagement from './pages/LocationManagement'
import UserManagement from './pages/UserManagement'
import ReportManagement from './pages/ReportManagement'
import AccessoryManagement from './pages/AccessoryManagement'
import ConsumableManagement from './pages/ConsumableManagement'
import DataImport from './pages/DataImport'
import MaterialManagement from './pages/MaterialManagement'
import OfficeSupplyManagement from './pages/OfficeSupplyManagement'

const { Header, Sider, Content } = Layout

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = localStorage.getItem('user')
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  const userData = JSON.parse(user)
  const userRole = userData.role
  
  // 检查角色权限
  if (requiredRole) {
    if (requiredRole === '管理员' && userRole !== '管理员') {
      message.error('您没有权限访问此页面')
      return <Navigate to="/" replace />
    }
    if (requiredRole === '操作员' && userRole === '游客') {
      message.error('您没有权限访问此页面')
      return <Navigate to="/" replace />
    }
  }
  
  return children
}

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKey, setSelectedKey] = useState('')
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  })
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key)
    navigate(`/${key}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    message.success('退出登录成功')
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  // 根据用户角色获取菜单项
  const getMenuItems = () => {
    const role = user?.role

    // 所有角色都可以查看的菜单
    const commonMenus = [
      {
        key: '',
        icon: <DashboardOutlined />,
        label: '仪表盘',
      },
      {
        key: 'inventory',
        icon: <DatabaseOutlined />,
        label: '库存管理',
      },
      {
        key: 'devices',
        icon: <ToolOutlined />,
        label: '专用设备管理',
      },
      {
        key: 'accessories',
        icon: <AppstoreOutlined />,
        label: '通用设备管理',
      },
      {
        key: 'consumables',
        icon: <ShoppingOutlined />,
        label: '耗材管理',
      },
      {
        key: 'outbound',
        icon: <ExportOutlined />,
        label: '出库管理',
        children: [
          {
            key: 'outbound',
            label: '项目出库',
          },
          {
            key: 'material-outbound',
            label: '原材料出库',
          },
        ],
      },
      {
        key: 'inbound',
        icon: <InboxOutlined />,
        label: '入库管理',
        children: [
          {
            key: 'project-inbound',
            label: '项目入库',
          },
          {
            key: 'inbound',
            label: '设备采购入库',
          },
          {
            key: 'material-inbound',
            label: '原材料入库',
          },
        ],
      },
      {
        key: 'locations',
        icon: <HomeOutlined />,
        label: '库房管理',
      },
      {
        key: 'reports',
        icon: <BarChartOutlined />,
        label: '报表管理',
      },
    ]

    // 操作员和管理员可以看到的菜单（已合并到commonMenus）
    const operatorMenus = []

    // 只有管理员可以看到的菜单
    const adminMenus = [
      {
        key: 'users',
        icon: <UserIcon />,
        label: '用户管理',
      },
      {
        key: 'office-supplies',
        icon: <DesktopOutlined />,
        label: '办公用品管理',
      },
      {
        key: 'materials',
        icon: <ExperimentOutlined />,
        label: '原材料管理',
      },
      {
        key: 'import',
        icon: <UploadOutlined />,
        label: '数据导入',
      },
    ]

    // 如果没有用户数据，显示所有菜单（默认管理员权限）
    if (!role) {
      return [...commonMenus, ...operatorMenus, ...adminMenus]
    }

    if (role === '管理员') {
      return [...commonMenus, ...operatorMenus, ...adminMenus]
    } else if (role === '操作员') {
      return [...commonMenus, ...operatorMenus]
    } else {
      // 游客只能看到 commonMenus
      return commonMenus
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="logo">
          <img src="/logo.png" alt="元动未来" style={{ height: '100%', width: 'auto' }} />
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={getMenuItems()} />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: '#fff'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            仓库管理系统
          </div>
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                <span>{user.name}</span>
              </div>
            </Dropdown>
          )}
        </Header>
        <Content style={{ margin: '0 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="devices" element={<DeviceManagement />} />
            <Route path="accessories" element={<AccessoryManagement />} />
            <Route path="consumables" element={<ConsumableManagement />} />
            <Route path="office-supplies" element={<OfficeSupplyManagement />} />
            <Route path="inbound" element={
              <ProtectedRoute requiredRole="操作员">
                <DeviceInboundManagement />
              </ProtectedRoute>
            } />
            <Route path="project-inbound" element={
              <ProtectedRoute requiredRole="操作员">
                <ProjectInboundManagement />
              </ProtectedRoute>
            } />
            <Route path="material-inbound" element={
              <ProtectedRoute requiredRole="操作员">
                <MaterialInboundManagement />
              </ProtectedRoute>
            } />
            <Route path="outbound" element={
              <ProtectedRoute requiredRole="操作员">
                <OutboundManagement />
              </ProtectedRoute>
            } />
            <Route path="material-outbound" element={
              <ProtectedRoute requiredRole="操作员">
                <MaterialOutboundManagement />
              </ProtectedRoute>
            } />
            <Route path="outbound/print/:id" element={
              <ProtectedRoute requiredRole="操作员">
                <OutboundOrderPrint />
              </ProtectedRoute>
            } />
            <Route path="inbound/print/:id" element={
              <ProtectedRoute requiredRole="操作员">
                <InboundOrderPrint />
              </ProtectedRoute>
            } />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="locations" element={<LocationManagement />} />
            <Route path="users" element={
              <ProtectedRoute requiredRole="管理员">
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="reports" element={<ReportManagement />} />
            <Route path="import" element={
              <ProtectedRoute requiredRole="管理员">
                <DataImport />
              </ProtectedRoute>
            } />
            <Route path="materials" element={
              <ProtectedRoute requiredRole="管理员">
                <MaterialManagement />
              </ProtectedRoute>
            } />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App