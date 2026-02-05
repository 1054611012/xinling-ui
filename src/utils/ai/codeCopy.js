/**
 * 处理代码复制功能
 * @param {Event} event - 点击事件
 * @param {Function} copyToClipboardFn - 复制到剪贴板的函数
 */
export function handleCodeCopy(event, copyToClipboardFn, executeSqlFn) {
  const target = event.target
  const copyBtn = target.closest('.code-copy-btn')
  if (copyBtn) {
    let code = copyBtn.getAttribute('data-code')
    // 移除HTML实体和标签
    code = code
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<br\s*\/?>/gi, '\n')  // 将<br>标签替换为换行符
    copyToClipboardFn(code, '代码已复制')
  }
  
  const executeBtn = target.closest('.sql-execute-btn')
  if (executeBtn && executeSqlFn) {
    let sql = executeBtn.getAttribute('data-sql')
    // 移除HTML实体和标签
    sql = sql
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<br\s*\/?>/gi, '\n')  // 将<br>标签替换为换行符
    executeSqlFn(sql)
  }
}

/**
 * 复制到剪贴板
 * @param {string} text - 要复制的文本
 * @param {string} successMsg - 成功消息
 * @param {Vue} vueInstance - Vue实例，用于访问$message
 */
export function copyToClipboard(text, successMsg = '复制成功', vueInstance) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (vueInstance && vueInstance.$message) {
        vueInstance.$message.success(successMsg)
      }
    }).catch(() => {
      fallbackCopy(text, successMsg, vueInstance)
    })
  } else {
    fallbackCopy(text, successMsg, vueInstance)
  }
}

/**
 * 备用复制方法
 * @param {string} text - 要复制的文本
 * @param {string} successMsg - 成功消息
 * @param {Vue} vueInstance - Vue实例，用于访问$message
 */
function fallbackCopy(text, successMsg, vueInstance) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    if (vueInstance && vueInstance.$message) {
      vueInstance.$message.success(successMsg)
    }
  } catch (err) {
    if (vueInstance && vueInstance.$message) {
      vueInstance.$message.error('复制失败')
    }
  }
  document.body.removeChild(textarea)
}