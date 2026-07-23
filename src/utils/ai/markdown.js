import hljs from 'highlight.js'

/**
 * 生成缓存键（截取内容特征，避免完整内容作为键占用内存）
 * @param {string} content - 原始内容
 * @returns {string} 缓存键
 */
function generateCacheKey(content) {
  const prefix = content.substring(0, Math.min(50, content.length))
  const length = content.length
  return `${length}:${prefix}`
}

/**
 * HTML转义（防止XSS，转义特殊字符）
 * @param {string} text - 待转义文本
 * @returns {string} 转义后文本
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return text
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/'/g, '&#039;')
}

/**
 * 清理label标签的for属性（避免浏览器警告"Incorrect use of <label for=FORM_ELEMENT>"）
 * @param {string} html - HTML内容
 * @returns {string} 处理后的HTML
 */
function sanitizeLabelFor(html) {
  if (typeof html !== 'string') return html
  return html.replace(/<label([^>]*)for\s*=\s*["']?([^"'>\s]*)["']?([^>]*)>/gi, '<label$1$3>')
}

/**
 * 还原占位符为实际内容（代码块/行内代码/表格）
 * @param {string} content - 带占位符的内容
 * @param {string} type - 占位符类型（CODE_BLOCK/INLINE_CODE/TABLE）
 * @param {Array<string>} items - 实际内容数组
 * @returns {string} 还原后内容
 */
function restoreItems(content, type, items) {
  for (let i = 0; i < items.length; i++) {
    const placeholder = `__${type}_${i}__`
    content = content.replace(placeholder, items[i])
  }
  return content
}

/**
 * 解析空格分隔的表格（处理AI返回的对齐式表格）
 * @param {Array<string>} lines - 表格行数组
 * @returns {object|null} 表格数据 { headers: 表头数组, rows: 数据行二维数组 }
 */
function parseSpaceSeparatedTable(lines) {
  if (lines.length === 0) return null

  // 分析第一行确定列边界位置
  const columnPositions = []
  const firstLine = lines[0]
  let inContent = false

  for (let i = 0; i < firstLine.length; i++) {
    const char = firstLine[i]
    if (char !== ' ' && !inContent) {
      columnPositions.push(i)
      inContent = true
    } else if (char === ' ' && inContent) {
      if (i < firstLine.length - 1 && firstLine[i + 1] === ' ') {
        inContent = false
      }
    }
  }

  // 自动检测列分隔（至少2个连续空格）
  if (columnPositions.length < 2) {
    const sampleLine = lines[0].trim()
    const parts = sampleLine.split(/\s{2,}/)
    if (parts.length >= 2) {
      let pos = 0
      columnPositions.length = 0
      parts.forEach(part => {
        columnPositions.push(pos)
        pos += part.length
        while (pos < sampleLine.length && sampleLine[pos] === ' ') {
          pos++
        }
      })
    }
  }

  if (columnPositions.length < 2) return null

  // 提取每行列数据并去首尾空格
  const rows = []
  for (let i = 0; i < lines.length; i++) {
    const row = []
    const line = lines[i]
    for (let j = 0; j < columnPositions.length; j++) {
      const start = columnPositions[j]
      const end = j < columnPositions.length - 1 ? columnPositions[j + 1] : line.length
      const cellContent = line.substring(start, end).trim()
      row.push(cellContent)
    }
    rows.push(row)
  }

  // 第一行作为表头，其余为数据行
  const headers = rows.length > 0 ? rows[0] : []
  const dataRows = rows.length > 1 ? rows.slice(1) : []
  return { headers, rows: dataRows }
}

/**
 * 格式化SQL查询（关键词大写、合理换行缩进，提升可读性）
 * @param {string} sql - 原始SQL语句
 * @returns {string} 格式化后SQL
 */
function formatSQL(sql) {
  if (!sql) return sql

  // SQL关键词转大写
  let formatted = sql.replace(
    /\b(SELECT|FROM|WHERE|ORDER BY|GROUP BY|HAVING|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|ON|AS|INSERT INTO|UPDATE|DELETE|CREATE|DROP|ALTER|UNION|LIMIT|OFFSET)\b/gi,
    (match) => match.toUpperCase()
  )

  // 合理换行和缩进，避免多余空行
  formatted = formatted
    .replace(/, /g, ',\n    ')
    .replace(/\bFROM\b/gi, '\nFROM')
    .replace(/\bWHERE\b/gi, '\nWHERE')
    .replace(/\bORDER BY\b/gi, '\nORDER BY')
    .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
    .replace(/\bHAVING\b/gi, '\nHAVING')
    .replace(/\bLIMIT\b/gi, '\nLIMIT')
    .replace(/\b(LEFT JOIN|RIGHT JOIN|INNER JOIN|JOIN)\b/gi, '\n$1')
    .replace(/\n\s*\n/g, '\n')
    .replace(/^\s+|\s+$/g, '')

  return formatted
}

/**
 * 预处理内容（提取代码块/行内代码/表格，用占位符替换，避免后续处理干扰）
 * @param {string} content - 原始消息内容
 * @returns {object} 预处理结果 { content: 处理后内容, codeBlocks: 代码块数组, inlineCodes: 行内代码数组, tables: 表格数组 }
 */
function preprocessContent(content) {
  const codeBlocks = []
  const inlineCodes = []
  const tables = []
  let processedContent = content

  // 1. 提取带语言标识的代码块 ```语言\n内容\n```
  processedContent = processedContent.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
    const language = lang || 'sql'
    const originalCode = code
    let processedCode = language === 'sql' ? formatSQL(code) : code
    processedCode = processedCode.trim()

    // 代码高亮处理
    let highlightedCode
    try {
      if (language && language !== 'plaintext' && hljs.getLanguage(language)) {
        highlightedCode = hljs.highlight(processedCode, { language }).value
      } else {
        highlightedCode = hljs.highlightAuto(processedCode).value
      }
    } catch (e) {
      highlightedCode = escapeHtml(processedCode)
    }

    // 生成带按钮的代码块HTML（转义属性避免引号冲突）
    const escapedCodeForAttr = originalCode.replace(/"/g, '&quot;').replace(/'/g, '&#039;')
    let buttonsHtml = ''
    if (language.toLowerCase() === 'sql') {
      buttonsHtml += `<button class="sql-execute-btn" data-sql="${escapedCodeForAttr}" title="执行SQL"><i class="el-icon-video-play"></i></button>`
    }
    buttonsHtml += `<button class="code-copy-btn" data-code="${escapedCodeForAttr}" title="复制代码"><i class="el-icon-document-copy"></i></button>`

    const codeBlock = `<div class="code-block-wrapper"><div class="code-language-tag">${language}</div><div class="code-buttons">${buttonsHtml}</div><pre><code class="hljs language-${language}" data-original-code="${escapedCodeForAttr}" data-highlighted="true">${highlightedCode}</code></pre></div>`
    const processedCodeBlock = codeBlock.replace(/\n/g, '__CODE_BLOCK_NEWLINE__')
    codeBlocks.push(processedCodeBlock)
    return placeholder
  })

  // 2. 提取无语言标识的代码块 ```\n内容\n```（自动检测是否为SQL）
  processedContent = processedContent.replace(/```\n([\s\S]*?)\n```/g, (match, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
    const originalCode = code
    let processedCode = code

    // 自动检测SQL并格式化
    const isSqlCode = code.toUpperCase().includes('SELECT') && (code.toUpperCase().includes('FROM') || code.toUpperCase().includes('WHERE'))
    if (isSqlCode) processedCode = formatSQL(code)
    processedCode = processedCode.trim()

    // 代码高亮处理
    let highlightedCode
    try {
      const result = hljs.highlightAuto(processedCode)
      highlightedCode = result.value
    } catch (e) {
      highlightedCode = escapeHtml(processedCode)
    }

    // 生成带按钮的代码块HTML
    const escapedCodeForAttr = originalCode.replace(/"/g, '&quot;').replace(/'/g, '&#039;')
    let buttonsHtml = ''
    if (isSqlCode) {
      buttonsHtml += `<button class="sql-execute-btn" data-sql="${escapedCodeForAttr}" title="执行SQL"><i class="el-icon-video-play"></i></button>`
    }
    buttonsHtml += `<button class="code-copy-btn" data-code="${escapedCodeForAttr}" title="复制代码"><i class="el-icon-document-copy"></i></button>`

    const codeBlock = `<div class="code-block-wrapper"><div class="code-language-tag">code</div><div class="code-buttons">${buttonsHtml}</div><pre><code class="hljs" data-original-code="${escapedCodeForAttr}" data-highlighted="true">${highlightedCode}</code></pre></div>`
    const processedCodeBlock = codeBlock.replace(/\n/g, '__CODE_BLOCK_NEWLINE__')
    codeBlocks.push(processedCodeBlock)
    return placeholder
  })

  // 3. 处理流式输出的未闭合代码块 ```语言\n内容（无结束符）
  if (!processedContent.includes('```\n```') && /```\w*\n[\s\S]*$/.test(processedContent) && !processedContent.match(/```\w*\n[\s\S]*?\n```/)) {
    processedContent = processedContent.replace(/```(\w+)?\n([\s\S]*)$/g, (match, lang, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
      const language = lang || 'plaintext'

      // 代码高亮处理
      let highlightedCode
      try {
        if (language && language !== 'plaintext' && hljs.getLanguage(language)) {
          highlightedCode = hljs.highlight(code, { language }).value
        } else {
          highlightedCode = hljs.highlightAuto(code).value
        }
      } catch (e) {
        highlightedCode = escapeHtml(code)
      }

      // 生成流式代码块HTML
      const escapedCodeForAttr = code.replace(/"/g, '&quot;').replace(/'/g, '&#039;')
      let buttonsHtml = ''
      if (language.toLowerCase() === 'sql') {
        buttonsHtml += `<button class="sql-execute-btn" data-sql="${escapedCodeForAttr}" title="执行SQL"><i class="el-icon-video-play"></i></button>`
      }
      buttonsHtml += `<button class="code-copy-btn" data-code="${escapedCodeForAttr}" title="复制代码"><i class="el-icon-document-copy"></i></button>`

      const codeBlock = `<div class="code-block-wrapper streaming-code"><div class="code-language-tag">${language}</div><div class="code-buttons">${buttonsHtml}</div><pre><code class="hljs language-${language}" data-original-code="${escapedCodeForAttr}" data-highlighted="true">${highlightedCode}</code></pre></div>`
      const processedCodeBlock = codeBlock.replace(/\n/g, '__CODE_BLOCK_NEWLINE__')
      codeBlocks.push(processedCodeBlock)
      return placeholder
    })
  }

  // 4. 提取行内代码 `内容`
  processedContent = processedContent.replace(/`([^`\n]+)`/g, (match, code) => {
    const placeholder = `__INLINE_CODE_${inlineCodes.length}__`
    const escapedCode = escapeHtml(code)
    inlineCodes.push(`<code class="inline-code">${escapedCode}</code>`)
    return placeholder
  })

  // 5. 处理|分隔的Markdown表格（优先处理，支持标准Markdown表格）
  processedContent = processedContent.replace(/((?:\|[^\n]+\|(?:\n|$))+)/g, (match) => {
    const lines = match.trim().split('\n').filter(line => line.trim())
    if (lines.length < 2) return match

    const hasSeparator = /^\|?[\s\-:|]+\|?$/.test(lines[1])
    let headers, dataStartIndex
    if (hasSeparator && lines.length >= 3) {
      headers = lines[0].split('|').filter(c => c.trim()).map(c => c.trim())
      dataStartIndex = 2
    } else {
      headers = lines[0].split('|').filter(c => c.trim()).map(c => c.trim())
      dataStartIndex = 1
    }

    const rows = []
    for (let i = dataStartIndex; i < lines.length; i++) {
      const cells = lines[i].split('|').filter(c => c.trim()).map(c => c.trim())
      if (cells.length > 0) rows.push(cells)
    }
    if (rows.length === 0) return match

    // 处理单元格内粗体/斜体
    const processCell = (text) => text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

    let html = '<div class="markdown-table-wrapper"><table class="markdown-table">'
    html += '<thead><tr>'
    headers.forEach(h => { html += `<th>${processCell(h)}</th>` })
    html += '</tr></thead><tbody>'
    rows.forEach(row => {
      html += '<tr>'
      row.forEach(cell => { html += `<td>${processCell(cell)}</td>` })
      html += '</tr>'
    })
    html += '</tbody></table></div>'

    const placeholder = `__TABLE_${tables.length}__`
    tables.push(html)
    return placeholder
  })

  // 6. 处理Tab分隔的表格（AI返回的主流表格格式）
  processedContent = processedContent.replace(/((?:[^\n]*\t[^\n]*(?:\n|$))+)/gm, (match) => {
    const lines = match.trim().split('\n').filter(line => line.includes('\t'))
    if (lines.length < 2) return match

    const headers = lines[0].split('\t').map(c => c.trim()).filter(c => c)
    if (headers.length < 2) return match

    const rows = []
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split('\t').map(c => c.trim())
      if (cells.length >= headers.length) rows.push(cells.slice(0, headers.length))
    }
    if (rows.length === 0) return match

    // 处理单元格内粗体/斜体
    const processCell = (text) => text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

    let html = '<div class="markdown-table-wrapper"><table class="markdown-table">'
    html += '<thead><tr>'
    headers.forEach(h => { html += `<th>${processCell(h)}</th>` })
    html += '</tr></thead><tbody>'
    rows.forEach(row => {
      html += '<tr>'
      row.forEach(cell => { html += `<td>${processCell(cell)}</td>` })
      html += '</tr>'
    })
    html += '</tbody></table></div>'

    const placeholder = `__TABLE_${tables.length}__`
    tables.push(html)
    return placeholder
  })

  // 7. 处理空格分隔的表格（对齐式表格，需至少2个连续空格分隔）
  processedContent = processedContent.replace(/((?:[^\n]*\s{2,}[^\n]*(?:\n|$))+)/gm, (match) => {
    const lines = match.trim().split('\n').filter(line => line.trim())
    if (lines.length < 2) return match

    const hasMultipleFields = lines.every(line => line.split(/\s{2,}/).length >= 2)
    if (!hasMultipleFields) return match

    const tableData = parseSpaceSeparatedTable(lines)
    if (!tableData || tableData.rows.length === 0) return match

    // 处理单元格内粗体/斜体
    const processCell = (text) => text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

    let html = '<div class="markdown-table-wrapper"><table class="markdown-table">'
    html += '<thead><tr>'
    tableData.headers.forEach(h => { html += `<th>${processCell(h)}</th>` })
    html += '</tr></thead><tbody>'
    tableData.rows.forEach(row => {
      html += '<tr>'
      row.forEach(cell => { html += `<td>${processCell(cell)}</td>` })
      html += '</tr>'
    })
    html += '</tbody></table></div>'

    const placeholder = `__TABLE_${tables.length}__`
    tables.push(html)
    return placeholder
  })

  return { content: processedContent, codeBlocks, inlineCodes, tables }
}

/**
 * 高效代码高亮（指定语言/自动检测，失败则返回转义后代码）
 * @param {string} code - 待高亮代码
 * @param {string|null} language - 代码语言
 * @returns {string} 高亮后HTML
 */
function highlightCodeBlock(code, language = null) {
  try {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value
    } else {
      return hljs.highlightAuto(code).value
    }
  } catch (e) {
    return escapeHtml(code)
  }
}

/**
 * 应用代码高亮（仅处理未高亮的代码块，避免重复执行）
 * 浏览器环境下执行，确保DOM更新完成后处理
 */
function applyCodeHighlighting() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    setTimeout(() => {
      const codeBlocks = document.querySelectorAll('pre code[data-original-code]:not([data-highlighted="true"])')
      codeBlocks.forEach(block => {
        try {
          const originalCode = block.getAttribute('data-original-code')
          block.innerHTML = originalCode
          const language = block.getAttribute('class')?.match(/language-(\w+)/)?.[1]

          if (language && hljs.getLanguage(language)) {
            block.innerHTML = hljs.highlight(originalCode, { language }).value
          } else {
            block.innerHTML = hljs.highlightAuto(originalCode).value
          }
          block.setAttribute('data-highlighted', 'true')
        } catch (e) {
          block.setAttribute('data-highlighted', 'true')
        }
      })
    }, 0)
  }
}

/**
 * 设置缓存（LRU策略，超出容量删除最旧条目）
 * @param {Map} formatMessageCache - 缓存Map
 * @param {string} key - 缓存键
 * @param {string} value - 缓存值
 * @param {number} cacheSizeLimit - 缓存最大容量
 */
function setCache(formatMessageCache, key, value, cacheSizeLimit) {
  if (formatMessageCache.size >= cacheSizeLimit) {
    const firstKey = formatMessageCache.keys().next().value
    formatMessageCache.delete(firstKey)
  }
  formatMessageCache.set(key, value)
}

/**
 * 格式化消息内容（主入口，整合所有处理逻辑+缓存，修复列表渲染结构）
 * @param {string} content - 原始消息内容
 * @param {Map} formatMessageCache - 缓存Map（默认新建）
 * @param {number} cacheSizeLimit - 缓存最大容量（默认100）
 * @returns {string} 格式化后的HTML内容
 */
function formatMessage(content, formatMessageCache = new Map(), cacheSizeLimit = 100) {
  if (!content) return ''

  // 缓存命中直接返回
  const cacheKey = generateCacheKey(content)
  const cachedResult = formatMessageCache.get(cacheKey)
  if (cachedResult) {
    return cachedResult
  }

  // 预处理提取特殊元素，替换为占位符
  const { content: processedContent, codeBlocks, inlineCodes, tables } = preprocessContent(content)
  let formatted = processedContent

  // HTML转义（防止XSS，需在表格/代码块提取后执行）
  formatted = escapeHtml(formatted)

  // 处理Markdown标题（###### ~ #）
  formatted = formatted
    .replace(/^######\s*(.+)$/gm, '<h6><strong>$1</strong></h6>')
    .replace(/^#####\s*(.+)$/gm, '<h5><strong>$1</strong></h5>')
    .replace(/^####\s*(.+)$/gm, '<h4><strong>$1</strong></h4>')
    .replace(/^###\s+(.+)$/gm, '<h3><strong>$1</strong></h3>')
    .replace(/^##\s+(.+)$/gm, '<h2><strong>$1</strong></h2>')
    .replace(/^#\s+(.+)$/gm, '<h1><strong>$1</strong></h1>')

  // 处理粗体和斜体
  formatted = formatted
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')

  // ========== 修复核心：生成标准多级嵌套列表HTML结构 ==========
  // 1. 匹配带缩进的列表项，生成带级别类的<li>标签（每2个空格为1级）
  formatted = formatted.replace(/^(\s*)-\s+(.*?)$/gm, (match, spaces, content) => {
    const level = Math.floor(spaces.length / 2)
    return `<li class="list-item level-${level}">${content}</li>`
  })
  // 2. 合并相邻列表项，用标准<ul>包裹，解决排版异常
  formatted = formatted.replace(/(<li class="list-item.*?<\/li>\s*)+/g, (match) => {
    const items = match.match(/<li class="list-item.*?<\/li>/g)
    if (items) {
      return `<ul class="unordered-list">${items.join('')}</ul>`
    }
    return match
  })

  // 还原占位符（表格→行内代码→代码块，顺序不可换）
  formatted = restoreItems(formatted, 'TABLE', tables)
  formatted = restoreItems(formatted, 'INLINE_CODE', inlineCodes)
  formatted = restoreItems(formatted, 'CODE_BLOCK', codeBlocks)

  // 处理换行符：先还原代码块内的换行，再处理普通换行
  formatted = formatted.replace(/__CODE_BLOCK_NEWLINE__/g, '\n')
  // 保护HTML标签内的换行，避免被替换为<br>
  const htmlTagPlaceholders = []
  formatted = formatted.replace(/<(h[1-6]|ul|ol|li|p|div|pre|code|table|thead|tbody|tr|th|td)[^>]*>[\s\S]*?<\/\1>/g, (match) => {
    const placeholder = `__HTML_TAG_${htmlTagPlaceholders.length}__`
    htmlTagPlaceholders.push(match)
    return placeholder
  })
  // 普通换行替换为<br>
  formatted = formatted.replace(/\n/g, '<br>')
  // 还原HTML标签内容
  formatted = htmlTagPlaceholders.reduce((result, tag, index) => {
    return result.replace(`__HTML_TAG_${index}__`, tag)
  }, formatted)

  // 清理冗余<br>标签，优化排版
  formatted = formatted
    .replace(/(<br>\s*){3,}/g, '<br><br>')
    .replace(/\s*<br>\s*/g, '<br>')
    .replace(/(<\/div>|<\/p>|<\/li>|<\/h[1-6]>|<\/th>|<\/td>|<\/tr>)\s*<br>/g, '$1')
    .replace(/<br>\s*(<ul|<ol|<li|<div|<p|<table|<tr|<th|<td)/g, '$1')
    .replace(/(<br>\s*)+<h([1-6])/g, '<br><h$2')

  // 清理label标签的for属性，避免浏览器警告
  formatted = sanitizeLabelFor(formatted)

  // 缓存结果并返回
  setCache(formatMessageCache, cacheKey, formatted, cacheSizeLimit)
  return formatted
}

/**
 * 清空缓存
 * @param {Map} formatMessageCache - 缓存Map
 */
function clearFormatCache(formatMessageCache) {
  formatMessageCache.clear()
}

/**
 * 复制消息内容（极简纯文本，移除所有Markdown标记）
 * @param {string} content - 原始内容
 * @returns {string} 纯文本内容
 */
function copyMessage(content) {
  return content
    .replace(/```[\w]*\n[\s\S]*?\n```/g, (match) => match.replace(/```[\w]*\n/g, '').replace(/\n```/g, ''))
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
}

/**
 * 复制全部消息内容（保留代码，移除大部分Markdown标记，轻量格式化）
 * @param {string} content - 原始内容
 * @returns {string} 处理后纯文本
 */
function copyAllMessage(content) {
  return content
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/^#{6}\s*(.*?)$/gm, '$1')
    .replace(/^#{5}\s*(.*?)$/gm, '$1')
    .replace(/^#{4}\s*(.*?)$/gm, '$1')
    .replace(/^#{3}\s*(.*?)$/gm, '$1')
    .replace(/^#{2}\s*(.*?)$/gm, '$1')
    .replace(/^#{1}\s*(.*?)$/gm, '$1')
    .replace(/^(\s*)-\s+(.*?)$/gm, '$2')
    .replace(/^(\s*)\*\s+(.*?)$/gm, '$2')
    .replace(/^(\s*)\d+\.\s+(.*?)$/gm, '$2')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\[(.*?)\]/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/^-{3,}$/gm, '')
    .replace(/^\*{3,}$/gm, '')
    .replace(/^_{3,}$/gm, '')
    .replace(/^>\s*(.*?)$/gm, '$1')
    .replace(/\[\^.+?\](: .*?$)?/g, '')
    .replace(/^\s+|\s+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
}

/**
 * 复制全部消息内容（保留核心格式，适合可读性复制）
 * @param {string} content - 原始内容
 * @returns {string} 保留格式的文本
 */
function copyAllMessageFormatted(content) {
  let formattedText = content

  // 处理代码块，保留语言标识/中文标识
  formattedText = formattedText.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
    const language = lang ? lang.trim() : 'code'
    if (language.toLowerCase() !== 'code') {
      return `\n\`\`\`${language}\n${code.trim()}\n\`\`\`\n`
    } else {
      return `\n【${language.toUpperCase()} 代码块】${code.trim()}【代码块结束】\n`
    }
  })

  // 保留核心格式，简化冗余标记
  formattedText = formattedText
    .replace(/`([^`]+)`/g, '`$1`')
    .replace(/^######\s+(.+)$/gm, '###### $1')
    .replace(/^#####\s+(.+)$/gm, '##### $1')
    .replace(/^####\s+(.+)$/gm, '#### $1')
    .replace(/^###\s+(.+)$/gm, '### $1')
    .replace(/^##\s+(.+)$/gm, '## $1')
    .replace(/^#\s+(.+)$/gm, '# $1')
    .replace(/\*\*\*([^*]+)\*\*\*/g, '*$1*')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '*$1*')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_(.*?)_/g, '_$1_')
    .replace(/~~([^~]+)~~/g, '~$1~')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, (match) => {
      const num = match.match(/\d+/)[0]
      return `${num}. `
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 (链接: $2)')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '图片: $1')
    .replace(/^>\s+(.*)$/gm, '引用: $1')
    .replace(/\n{3,}/g, '\n\n')

  return formattedText
}

// 导出所有方法
export {
  formatMessage,
  generateCacheKey,
  escapeHtml,
  restoreItems,
  preprocessContent,
  parseSpaceSeparatedTable,
  formatSQL,
  highlightCodeBlock,
  applyCodeHighlighting,
  copyMessage,
  copyAllMessage,
  copyAllMessageFormatted,
  setCache,
  clearFormatCache
}