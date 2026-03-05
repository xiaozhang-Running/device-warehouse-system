/**
 * 数据获取自定义Hooks
 * 统一处理数据加载、错误处理和加载状态
 */

import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'

/**
 * 通用数据获取Hook
 * @param {Function} fetchFn - 获取数据的函数
 * @param {Array} deps - 依赖数组
 * @returns {Object} { data, loading, error, refetch }
 */
export const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err)
      console.error('数据获取失败:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    fetchData()
  }, deps)

  return { data, loading, error, refetch: fetchData }
}

/**
 * 列表数据获取Hook
 * @param {Function} fetchFn - 获取列表数据的函数
 * @param {Object} options - 配置选项
 * @returns {Object} { data, loading, pagination, handleTableChange, refetch }
 */
export const useList = (fetchFn, options = {}) => {
  const { defaultPageSize = 10 } = options
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: defaultPageSize,
    total: 0
  })

  const fetchData = useCallback(async (page = 1, pageSize = defaultPageSize) => {
    try {
      setLoading(true)
      const result = await fetchFn({ page, pageSize })
      setData(result.data || result)
      setPagination({
        current: page,
        pageSize,
        total: result.total || result.length
      })
    } catch (err) {
      message.error('获取数据失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, defaultPageSize])

  const handleTableChange = useCallback((newPagination) => {
    fetchData(newPagination.current, newPagination.pageSize)
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    pagination,
    handleTableChange,
    refetch: () => fetchData(pagination.current, pagination.pageSize)
  }
}

/**
 * 表单提交Hook
 * @param {Function} submitFn - 提交函数
 * @param {Object} options - 配置选项
 * @returns {Object} { submit, loading, error }
 */
export const useSubmit = (submitFn, options = {}) => {
  const { onSuccess, onError, successMessage = '操作成功' } = options
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = useCallback(async (values) => {
    try {
      setLoading(true)
      setError(null)
      const result = await submitFn(values)
      if (successMessage) {
        message.success(successMessage)
      }
      if (onSuccess) {
        onSuccess(result)
      }
      return result
    } catch (err) {
      setError(err)
      if (onError) {
        onError(err)
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [submitFn, onSuccess, onError, successMessage])

  return { submit, loading, error }
}

/**
 * 模态框管理Hook
 * @returns {Object} { visible, open, close, toggle }
 */
export const useModal = () => {
  const [visible, setVisible] = useState(false)

  const open = useCallback(() => setVisible(true), [])
  const close = useCallback(() => setVisible(false), [])
  const toggle = useCallback(() => setVisible(prev => !prev), [])

  return { visible, open, close, toggle }
}

/**
 * 搜索Hook
 * @param {Array} data - 原始数据
 * @param {Function} searchFn - 搜索函数
 * @returns {Object} { searchText, setSearchText, filteredData }
 */
export const useSearch = (data, searchFn) => {
  const [searchText, setSearchText] = useState('')

  const filteredData = useCallback(() => {
    if (!searchText) return data
    return data.filter(item => searchFn(item, searchText))
  }, [data, searchText, searchFn])

  return {
    searchText,
    setSearchText,
    filteredData: filteredData()
  }
}

/**
 * 批量操作Hook
 * @returns {Object} { selectedKeys, setSelectedKeys, handleSelect, clearSelection }
 */
export const useSelection = () => {
  const [selectedKeys, setSelectedKeys] = useState([])

  const handleSelect = useCallback((selectedRowKeys) => {
    setSelectedKeys(selectedRowKeys)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedKeys([])
  }, [])

  return {
    selectedKeys,
    setSelectedKeys,
    handleSelect,
    clearSelection
  }
}
