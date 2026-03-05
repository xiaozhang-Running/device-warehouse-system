/**
 * 打印工具函数
 * 用于统一处理打印功能
 */

/**
 * 打印入库清单
 * @param {string} elementId - 要打印的元素ID
 * @param {string} title - 打印标题
 */
export const printInventoryList = (elementId, title = '入库清单打印') => {
  const content = document.getElementById(elementId) || document.querySelector('.inventory-list')
  if (!content) {
    console.error('未找到打印内容')
    return
  }

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    console.error('无法打开打印窗口')
    return
  }

  printWindow.document.write(`
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
        }
        p {
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .signature-area {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        @media print {
          body {
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      ${content.innerHTML}
    </body>
    </html>
  `)

  printWindow.document.close()

  printWindow.onload = () => {
    printWindow.print()
    printWindow.onafterprint = () => {
      printWindow.close()
    }
  }
}

/**
 * 导出PDF
 * @param {string} elementId - 要导出的元素ID
 * @param {string} fileName - 文件名
 * @param {Object} options - 配置选项
 */
export const exportToPDF = async (elementId, fileName = 'document.pdf', options = {}) => {
  const { jsPDF } = await import('jspdf')
  const { default: html2canvas } = await import('html2canvas')

  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('未找到导出元素')
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    ...options
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

  const imgX = (pdfWidth - imgWidth * ratio) / 2
  const imgY = 10

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
  pdf.save(fileName)
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
