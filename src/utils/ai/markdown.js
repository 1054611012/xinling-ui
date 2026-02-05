import hljs from 'highlight.js'

/**
 * 生成缓存键
 */
function generateCacheKey(content) {
  // 使用内容的长度和前几个字符作为缓存键
  // 这样可以避免完整内容作为键导致的内存问题
  const prefix = content.substring(0, Math.min(50, content.length));
  const length = content.length;
  return `${length}:${prefix}`;
}

/**
 * HTML转义
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return text
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/'/g, '&#039;');
}

/**
 * 还原占位符为实际内容
 */
function restoreItems(content, type, items) {
  for (let i = 0; i < items.length; i++) {
    const placeholder = `__${type}_${i}__`
    content = content.replace(placeholder, items[i])
  }
  return content
}

/**
 * 解析空格分隔的表格
 */
function parseSpaceSeparatedTable(lines) {
  if (lines.length === 0) return null
  
  // 找到每列的边界位置
  const columnPositions = []
  
  // 分析第一行（通常为表头）来确定列位置
  const firstLine = lines[0]
  let inContent = false
  let currentPos = 0
  
  for (let i = 0; i < firstLine.length; i++) {
    const char = firstLine[i]
    
    if (char !== ' ' && !inContent) {
      // 进入新列的开始
      columnPositions.push(i)
      inContent = true
    } else if (char === ' ' && inContent) {
      // 检查是否是列之间的分隔（连续的空格）
      if (i < firstLine.length - 1 && firstLine[i + 1] === ' ') {
        inContent = false
      }
    }
  }
  
  // 如果没有找到足够的列位置，尝试另一种方法
  if (columnPositions.length < 2) {
    // 使用多个连续空格作为分隔符来检测列
    const sampleLine = lines[0].trim()
    const parts = sampleLine.split(/\s{2,}/) // 至少2个空格作为分隔
    if (parts.length >= 2) {
      let pos = 0
      columnPositions.length = 0 // 清空数组
      parts.forEach(part => {
        columnPositions.push(pos)
        pos += part.length
        // 找到下一个非空格字符的位置
        while (pos < sampleLine.length && sampleLine[pos] === ' ') {
          pos++
        }
      })
    }
  }
  
  if (columnPositions.length < 2) return null
  
  // 提取每行的列数据
  const rows = []
  for (let i = 0; i < lines.length; i++) {
    const row = []
    const line = lines[i]
    
    for (let j = 0; j < columnPositions.length; j++) {
      const start = columnPositions[j]
      const end = j < columnPositions.length - 1 ? columnPositions[j + 1] : line.length
      
      // 提取列内容，去除首尾空格
      let cellContent = line.substring(start, end).trim()
      row.push(cellContent)
    }
    
    rows.push(row)
  }
  
  // 将第一行作为表头，其余作为数据行
  const headers = rows.length > 0 ? rows[0] : []
  const dataRows = rows.length > 1 ? rows.slice(1) : []
  
  return {
    headers,
    rows: dataRows
  }
}

/**
 * 格式化SQL查询，使其更易读
 */
function formatSQL(sql) {
  if (!sql) return sql

  // 将SQL关键词转换为大写
  let formatted = sql.replace(/\b(SELECT|FROM|WHERE|ORDER BY|GROUP BY|HAVING|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|ON|AS|INSERT INTO|UPDATE|DELETE|CREATE|DROP|ALTER|UNION|LIMIT|OFFSET)\b/gi, (match) => {
    return match.toUpperCase()
  })

  // 添加适当的缩进和换行，但避免产生多余空行
  formatted = formatted
    .replace(/, /g, ',\n    ')  // 在逗号后换行并缩进
    .replace(/\bFROM\b/gi, '\nFROM')  // FROM前换行
    .replace(/\bWHERE\b/gi, '\nWHERE')  // WHERE前换行
    .replace(/\bORDER BY\b/gi, '\nORDER BY')  // ORDER BY前换行
    .replace(/\bGROUP BY\b/gi, '\nGROUP BY')  // GROUP BY前换行
    .replace(/\bHAVING\b/gi, '\nHAVING')  // HAVING前换行
    .replace(/\bLIMIT\b/gi, '\nLIMIT')  // LIMIT前换行

  // 处理JOIN语句
  formatted = formatted.replace(/\b(LEFT JOIN|RIGHT JOIN|INNER JOIN|JOIN)\b/gi, '\n$1')

  // 清理多余的空行和空格，但保留合理的格式
  // 替换多个连续的换行符为单个换行符
  formatted = formatted
    .replace(/\n\s*\n/g, '\n')  // 移除空行
    .replace(/^\s+|\s+$/g, '')  // 移除首尾空白

  return formatted
}

/**
 * 预处理内容，提取代码块、表格等元素
 */
function preprocessContent(content) {
  const codeBlocks = []
  const inlineCodes = []
  const tables = []
      
  let processedContent = content
      
  // 提取并保存代码块（带语言标识）- 支持 ```语言\n 格式
  processedContent = processedContent.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
    const language = lang || 'sql'  // 对于SQL查询，默认语言为sql

    // 保留原始代码用于属性
    const originalCode = code
    
    // 如果是SQL代码，先格式化
    let processedCode = language === 'sql' ? formatSQL(code) : code

    // 确保SQL代码格式化后没有多余的首尾空白
    processedCode = processedCode.trim()

    // 使用 highlight.js 高亮代码
    let highlightedCode
    try {
      if (language && language !== 'plaintext' && hljs.getLanguage(language)) {
        highlightedCode = hljs.highlight(language, processedCode).value
      } else {
        highlightedCode = hljs.highlightAuto(processedCode).value
      }
    } catch (e) {
      highlightedCode = escapeHtml(processedCode)
    }

    // 生成带复制按钮和执行SQL按钮的代码块
    const escapedCodeForAttr = originalCode.replace(/"/g, '&quot;').replace(/'/g, '&#039;')
    // 如果是SQL代码，添加执行按钮（在复制按钮旁边）
    let buttonsHtml = ``  // 先不添加任何按钮
    if (language.toLowerCase() === 'sql') {
      buttonsHtml += `<button class="sql-execute-btn" data-sql="${escapedCodeForAttr}" title="执行SQL"><i class="el-icon-video-play"></i></button>`
    }
    buttonsHtml += `<button class="code-copy-btn" data-code="${escapedCodeForAttr}" title="复制代码"><i class="el-icon-document-copy"></i></button>`
    // 保存原始代码，以便后续重新高亮
    
    const codeBlock = `<div class="code-block-wrapper"><div class="code-language-tag">${language}</div><div class="code-buttons">${buttonsHtml}</div><pre><code class="hljs language-${language}" data-original-code="${escapedCodeForAttr}" data-highlighted="true">${highlightedCode}</code></pre></div>`

    // 将代码块内容预先处理，替换其中的换行符为特殊标记，避免后续全局替换
    const processedCodeBlock = codeBlock.replace(/\n/g, '__CODE_BLOCK_NEWLINE__')

    codeBlocks.push(processedCodeBlock)
    return placeholder
  })

  // 提取并保存代码块（无语言标识）- 支持 ```\n 格式
  processedContent = processedContent.replace(/```\n([\s\S]*?)\n```/g, (match, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
    
    // 保留原始代码用于属性
    const originalCode = code
    
    // 检测是否是SQL代码，如果是则进行格式化
    let processedCode = code
    // 检查是否包含SQL关键词，如果是，则格式化
    if (code.toUpperCase().includes('SELECT') && (code.toUpperCase().includes('FROM') || code.toUpperCase().includes('WHERE'))) {
      processedCode = formatSQL(code)
    }

    // 确保代码没有多余的首尾空白
    processedCode = processedCode.trim()

    // 自动检测语言
    let highlightedCode
    try {
      const result = hljs.highlightAuto(processedCode)
      highlightedCode = result.value
    } catch (e) {
      highlightedCode = escapeHtml(processedCode)
    }

    const escapedCodeForAttr = originalCode.replace(/"/g, '&quot;').replace(/'/g, '&#039;')
    // 检测是否是SQL代码，如果是则添加执行按钮
    let isSqlCode = false;
    if (originalCode.toUpperCase().includes('SELECT') && (originalCode.toUpperCase().includes('FROM') || originalCode.toUpperCase().includes('WHERE'))) {
      isSqlCode = true;
    }
    // 生成带复制按钮和可能的执行SQL按钮的代码块
    let buttonsHtml = ``  // 先不添加任何按钮
    if (isSqlCode) {
      buttonsHtml += `<button class="sql-execute-btn" data-sql="${escapedCodeForAttr}" title="执行SQL"><i class="el-icon-video-play"></i></button>`
    }
    buttonsHtml += `<button class="code-copy-btn" data-code="${escapedCodeForAttr}" title="复制代码"><i class="el-icon-document-copy"></i></button>`
    // 保存原始代码，以便后续重新高亮
    const codeBlock = `<div class="code-block-wrapper"><div class="code-language-tag">code</div><div class="code-buttons">${buttonsHtml}</div><pre><code class="hljs" data-original-code="${escapedCodeForAttr}" data-highlighted="true">${highlightedCode}</code></pre></div>`

    // 将代码块内容预先处理，替换其中的换行符为特殊标记，避免后续全局替换
    const processedCodeBlock = codeBlock.replace(/\n/g, '__CODE_BLOCK_NEWLINE__')

    codeBlocks.push(processedCodeBlock)
    return placeholder
  })

  // 处理未闭合的代码块（流式输出时）
  // 匹配 ```语言\n 开头但没有结束的代码块
  // 重要：只匹配真正未闭合的，否则会干扰已完成的代码块
  if (!processedContent.includes('```\n```') && /```\w*\n[\s\S]*$/.test(processedContent) && !processedContent.match(/```\w*\n[\s\S]*?\n```/)) {
    processedContent = processedContent.replace(/```(\w+)?\n([\s\S]*)$/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
    const language = lang || 'plaintext'

    // 使用 highlight.js 高亮代码
    let highlightedCode
    try {
      if (language && language !== 'plaintext' && hljs.getLanguage(language)) {
        highlightedCode = hljs.highlight(language, code).value
      } else {
        highlightedCode = hljs.highlightAuto(code).value
      }
    } catch (e) {
      highlightedCode = escapeHtml(code)
    }

    const escapedCodeForAttr = code.replace(/"/g, '&quot;').replace(/'/g, '&#039;')
    // 如果是SQL代码，添加执行按钮（在复制按钮旁边）
    let buttonsHtml = ``  // 先不添加任何按钮
    if (language.toLowerCase() === 'sql') {
      buttonsHtml += `<button class="sql-execute-btn" data-sql="${escapedCodeForAttr}" title="执行SQL"><i class="el-icon-video-play"></i></button>`
    }
    buttonsHtml += `<button class="code-copy-btn" data-code="${escapedCodeForAttr}" title="复制代码"><i class="el-icon-document-copy"></i></button>`
    // 保存原始代码，以便后续重新高亮
    const codeBlock = `<div class="code-block-wrapper streaming-code"><div class="code-language-tag">${language}</div><div class="code-buttons">${buttonsHtml}</div><pre><code class="hljs language-${language}" data-original-code="${escapedCodeForAttr}" data-highlighted="true">${highlightedCode}</code></pre></div>`

    // 将代码块内容预先处理，替换其中的换行符为特殊标记，避免后续全局替换
    const processedCodeBlock = codeBlock.replace(/\n/g, '__CODE_BLOCK_NEWLINE__')

    codeBlocks.push(processedCodeBlock)
    return placeholder
    })
  }

  // 提取并保存行内代码
  processedContent = processedContent.replace(/`([^`\n]+)`/g, (match, code) => {
    const placeholder = `__INLINE_CODE_${inlineCodes.length}__`
    const escapedCode = escapeHtml(code)
    inlineCodes.push(`<code class="inline-code">${escapedCode}</code>`)
    return placeholder
  })

  // 处理 Markdown 表格（必须在HTML转义之前！）
  // 先处理 | 分隔的表格（支持最后一行无换行符）
  processedContent = processedContent.replace(/((?:\|[^\n]+\|(?:\n|$))+)/g, (match) => {
    const lines = match.trim().split('\n').filter(line => line.trim())
    if (lines.length < 2) return match
  
    // 检查第二行是否是分隔线
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
  
    // 处理单元格内的Markdown格式（粗体、斜体等）
    const processCell = (text) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 粗体
        .replace(/\*(.*?)\*/g, '<em>$1</em>')  // 斜体
    }
      
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
      
  // 再处理 Tab 分隔的表格（AI返回的表格通常是这种格式）
  processedContent = processedContent.replace(/((?:[^\n]*\t[^\n]*(?:\n|$))+)/gm, (match) => {
    const lines = match.trim().split('\n').filter(line => line.includes('\t'))
    if (lines.length < 2) return match
      
    // 第一行作为表头
    const headers = lines[0].split('\t').map(c => c.trim()).filter(c => c)
    if (headers.length < 2) return match  // 至少要有2列
      
    // 解析数据行
    const rows = []
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split('\t').map(c => c.trim())
      // 确保每行的列数与表头一致
      if (cells.length >= headers.length) {
        rows.push(cells.slice(0, headers.length))
      }
    }
      
    if (rows.length === 0) return match
      
    // 处理单元格内的Markdown格式（粗体、斜体等）
    const processCell = (text) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 粗体
        .replace(/\*(.*?)\*/g, '<em>$1</em>')  // 斜体
    }
      
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
      
  // 处理以空格分隔的表格（对齐格式的表格）
  processedContent = processedContent.replace(/((?:[^\n]*\s{2,}[^\n]*(?:\n|$))+)/gm, (match) => {
    // 检查是否是真正的表格格式（至少包含2行，每行至少有2个由多个空格分隔的字段）
    const lines = match.trim().split('\n').filter(line => line.trim())
    if (lines.length < 2) return match
          
    // 检查每行是否有多个由多个空格分隔的字段
    const hasMultipleFields = lines.every(line => line.split(/\s{2,}/).length >= 2)
    if (!hasMultipleFields) return match
          
    // 使用更复杂的算法来检测和解析空格分隔的表格
    const tableData = parseSpaceSeparatedTable(lines)
    if (!tableData || tableData.rows.length === 0) return match
          
    // 处理单元格内的Markdown格式（粗体、斜体等）
    const processCell = (text) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 粗体
        .replace(/\*(.*?)\*/g, '<em>$1</em>')  // 斜体
    }
      
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
 * 高效的代码高亮处理
 */
function highlightCodeBlock(code, language = null) {
  try {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value
    } else {
      return hljs.highlightAuto(code).value
    }
  } catch (e) {
    // 如果高亮失败，返回转义后的原始代码
    return escapeHtml(code)
  }
}

/**
 * 应用代码高亮
 */
function applyCodeHighlighting() {
  // 仅在浏览器环境中执行DOM操作
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // 使用nextTick机制确保DOM更新完成后再处理
    setTimeout(() => {
      // 只对未高亮的代码块进行处理
      const codeBlocks = document.querySelectorAll('pre code[data-original-code]:not([data-highlighted="true"])')
      
      codeBlocks.forEach(block => {
        try {
          // 获取原始代码
          const originalCode = block.getAttribute('data-original-code')
          
          // 使用原始代码重新设置内容并高亮
          block.innerHTML = originalCode
          
          // 获取语言信息
          const language = block.getAttribute('class')?.match(/language-(\w+)/)?.[1]
          
          if (language && hljs.getLanguage(language)) {
            // 如果有指定语言且支持该语言，则使用指定语言高亮
            block.innerHTML = hljs.highlight(originalCode, { language }).value
          } else {
            // 否则使用自动检测
            block.innerHTML = hljs.highlightAuto(originalCode).value
          }
          
          // 标记为已高亮，避免重复处理
          block.setAttribute('data-highlighted', 'true')
        } catch (e) {
          console.warn('代码高亮失败:', e)
          // 即使失败也标记为已处理，避免重复尝试
          block.setAttribute('data-highlighted', 'true')
        }
      })
    }, 0)
  }
}

/**
 * 格式化消息内容
 */
function formatMessage(content, formatMessageCache = new Map(), cacheSizeLimit = 100) {
  if (!content) return ''
      
  // 检查缓存
  const cacheKey = generateCacheKey(content);
  const cachedResult = formatMessageCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }
      
  // 预处理：使用占位符保存代码块，避免在其他处理中被影响
  const { content: processedContent, codeBlocks, inlineCodes, tables } = preprocessContent(content)
      
  let formatted = processedContent
      
  // HTML转义（在表格提取之后执行）
  formatted = escapeHtml(formatted)

  // 处理标题（### 标题）
  formatted = formatted.replace(/^######\s*(.+)$/gm, '<h6><strong>$1</strong></h6>')
  formatted = formatted.replace(/^#####\s*(.+)$/gm, '<h5><strong>$1</strong></h5>')
  formatted = formatted.replace(/^####\s*(.+)$/gm, '<h4><strong>$1</strong></h4>')
  formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3><strong>$1</strong></h3>')
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2><strong>$1</strong></h2>')
  formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1><strong>$1</strong></h1>')

  // 处理粗体
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // 1. 处理多级列表（支持嵌套）
  // 首先，替换不同级别的列表项
  // 匹配可能包含前导空格的列表项，用于确定级别
  formatted = formatted.replace(/^(\s*)-\s+(.*?)$/gm, function(match, spaces, content) {
    const level = Math.floor(spaces.length / 2); // 每2个空格为一个缩进级别
    return `${'<ul>'.repeat(level)}<li>${content}</li>${'</ul>'.repeat(level)}
  `})
  
  // 2. 合并相邻的相同层级的ul标签，处理连续的列表项
  // 首先处理连续的<li>标签，将它们放入同一个<ul>中
  formatted = formatted.replace(/(<ul><li>.*?<\/li><\/ul>\n?)+/g, function(match) {
    // 移除相邻的ul/li包装，然后整体用一个ul包装
    const items = match.match(/<ul><li>(.*?)<\/li><\/ul>/g);
    if (items) {
      const innerHTML = items.map(item => item.replace(/<ul><li>/, '').replace(/<\/li><\/ul>/, '')).join('\n');
      return `<ul><li>${innerHTML.replace(/<\/ul>\n<ul><li>/g, '</li><li>')}</li></ul>`;
    }
    return match;
  });
  
  // 更精确的列表处理：合并相邻的ul标签
  formatted = formatted.replace(/<\/ul>\n<ul>/g, '');
  formatted = formatted.replace(/<\/li><\/ul>\n<ul><li>/g, '</li><li>');
  
  // 处理嵌套列表的正确结构
  while (formatted.includes('</ul>\n<ul>') || formatted.includes('</li></ul>\n<ul><li>')) {
    formatted = formatted.replace(/<\/ul>\n<ul>/g, '');
    formatted = formatted.replace(/<\/li><\/ul>\n<ul><li>/g, '</li><li>');
  }

  // 处理斜体
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // 还原表格（必须在处理换行符之前！）
  formatted = restoreItems(formatted, 'TABLE', tables)
      
  // 还原行内代码（必须在处理换行符之前！）
  formatted = restoreItems(formatted, 'INLINE_CODE', inlineCodes)

  // 还原代码块（必须在处理换行符之前！）
  formatted = restoreItems(formatted, 'CODE_BLOCK', codeBlocks)

  // 最后处理换行符（在所有占位符还原之后）
  // 代码块中的换行符已使用特殊标记(__CODE_BLOCK_NEWLINE__)，在这里还原
  formatted = formatted.replace(/__CODE_BLOCK_NEWLINE__/g, '\n')

  // 将剩余的普通换行符替换为<br>标签，但排除各种HTML标签内的换行
  // 首先保存各种HTML标签内容，临时替换，处理完换行后再还原
  const htmlTagPlaceholders = [];
  // 保护标题、列表、段落等标签内容
  formatted = formatted.replace(/<(h[1-6]|ul|ol|li|p|div|pre|code|table|thead|tbody|tr|th|td)[^>]*>[\s\S]*?<\/\1>/g, (match) => {
    const placeholder = `__HTML_TAG_${htmlTagPlaceholders.length}__`;
    htmlTagPlaceholders.push(match);
    return placeholder;
  });

  // 将剩余的普通换行符替换为<br>标签（不在HTML标签中的）
  formatted = formatted.replace(/\n/g, '<br>');

  // 还原HTML标签内容
  formatted = htmlTagPlaceholders.reduce((result, tag, index) => {
    return result.replace(`__HTML_TAG_${index}__`, tag);
  }, formatted);

  // 处理可能产生的连续<br>标签，保留适当的间距
  formatted = formatted.replace(/(<br>\s*){3,}/g, '<br><br>'); // 将3个或更多的连续<br>减少为2个<br>，保留一定间距
  
  // 清理<br>标签前后的多余空白
  formatted = formatted.replace(/\s*<br>\s*/g, '<br>'); // 去除<br>标签前后的空白字符
  
  // 处理HTML标签与<br>标签之间的关系，移除冗余的<br>标签
  formatted = formatted.replace(/(<\/div>|<\/p>|<\/li>|<\/h[1-6]>|<\/th>|<\/td>|<\/tr>)\s*<br>/g, '$1'); // 移除特定闭合标签后的<br>
  // 对于标题前的<br>标签，保留一个以确保标题与上方内容之间有适当间距
  formatted = formatted.replace(/<br>\s*(<ul|<ol|<li|<div|<p|<table|<tr|<th|<td)/g, '$1'); // 移除特定HTML标签前的<br>
  // 特别处理标题前的<br>，保留一个间距
  formatted = formatted.replace(/(<br>\s*)+<h([1-6])/g, '<br><h$2'); // 确保标题前最多只有一个<br>
      
  // 存储到缓存
  setCache(formatMessageCache, cacheKey, formatted, cacheSizeLimit);

  return formatted
}

/**
 * 设置缓存
 */
function setCache(formatMessageCache, key, value, cacheSizeLimit) {
  // 如果缓存已满，删除最旧的条目
  if (formatMessageCache.size >= cacheSizeLimit) {
    const firstKey = formatMessageCache.keys().next().value;
    formatMessageCache.delete(firstKey);
  }
      
  formatMessageCache.set(key, value);
}

/**
 * 清空缓存
 */
function clearFormatCache(formatMessageCache) {
  formatMessageCache.clear();
}

/**
 * 复制消息内容
 */
function copyMessage(content) {
  const plainText = content
    .replace(/```[\w]*\n[\s\S]*?\n```/g, (match) => {
      return match.replace(/```[\w]*\n/g, '').replace(/\n```/g, '')
    })
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')

  return plainText;
}

/**
 * 复制全部消息内容（包含代码块）
 */
function copyAllMessage(content) {
  // 提取纯文本，移除 Markdown 标记但保留代码
  const plainText = content
    // 移除行内代码标记（保留代码内容）
    .replace(/`([^`]+)`/g, '$1')
    // 移除加粗/斜体/删除线
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1') // 移除加粗+斜体（***内容***）
    .replace(/\*\*(.*?)\*\*/g, '$1')     // 移除加粗（**内容**）
    .replace(/\*(.*?)\*/g, '$1')         // 移除斜体（*内容*）
    .replace(/__(.*?)__/g, '$1')         // 移除加粗（__内容__）
    .replace(/_(.*?)_/g, '$1')           // 移除斜体（_内容_）
    .replace(/~~(.*?)~~/g, '$1')         // 移除删除线（~~内容~~）
    // 移除标题标记（兼容无空格/多空格的不规范写法）
    .replace(/^#{6}\s*(.*?)$/gm, '$1')   // 六级标题
    .replace(/^#{5}\s*(.*?)$/gm, '$1')   // 五级标题
    .replace(/^#{4}\s*(.*?)$/gm, '$1')   // 四级标题
    .replace(/^#{3}\s*(.*?)$/gm, '$1')   // 三级标题
    .replace(/^#{2}\s*(.*?)$/gm, '$1')   // 二级标题
    .replace(/^#{1}\s*(.*?)$/gm, '$1')   // 一级标题
    // 移除列表标记
    .replace(/^(\s*)-\s+(.*?)$/gm, '$2') // 无序列表（- 内容）
    .replace(/^(\s*)\*\s+(.*?)$/gm, '$2') // 无序列表（* 内容）
    .replace(/^(\s*)\d+\.\s+(.*?)$/gm, '$2') // 有序列表（1. 内容）
    // 移除链接标记（保留链接文本）
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 行内链接 [文本](链接)
    .replace(/\[([^\]]+)\]\[(.*?)\]/g, '$1') // 参考式链接 [文本][标签]
    // 移除图片标记（保留图片描述）
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // ![描述](链接)
    // 移除分割线
    .replace(/^-{3,}$/gm, '')
    .replace(/^\*{3,}$/gm, '')
    .replace(/^_{3,}$/gm, '')
    // 移除块引用
    .replace(/^>\s*(.*?)$/gm, '$1')
    // 移除脚注标记
    .replace(/\[\^.+?\](: .*?$)?/g, '')
    // 清理多余的空行和空格
    .replace(/^\s+|\s+$/gm, '') // 移除行首行尾空格
    .replace(/\n{3,}/g, '\n\n'); // 多个空行合并为两个

  return plainText;
}

/**
 * 复制全部消息内容（保留格式）
 */
function copyAllMessageFormatted(content) {
  // 保留格式的复制，将Markdown转换为更易读的格式
  let formattedText = content;
  
  // 处理代码块：保留内容并添加适当的格式
  formattedText = formattedText.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
    const language = lang ? lang.trim() : 'code';
    if (language.toLowerCase() !== 'code') {  // 如果有指定语言，使用标准格式
      return `
        \`\`\`${language}
        ${code.trim()}
        \`\`\`
        `;
    } else {  // 如果没有指定语言，使用中文格式
      return `【${language.toUpperCase()} 代码块】${code.trim()}【代码块结束】`;
    }
  });
  
  // 处理行内代码
  formattedText = formattedText.replace(/`([^`]+)`/g, '`$1`');
  
  // 处理标题，保留层级结构
  formattedText = formattedText.replace(/^######\s+(.+)$/gm, '###### $1');
  formattedText = formattedText.replace(/^#####\s+(.+)$/gm, '##### $1');
  formattedText = formattedText.replace(/^####\s+(.+)$/gm, '#### $1');
  formattedText = formattedText.replace(/^###\s+(.+)$/gm, '### $1');
  formattedText = formattedText.replace(/^##\s+(.+)$/gm, '## $1');
  formattedText = formattedText.replace(/^#\s+(.+)$/gm, '# $1');
  
  // 处理粗体和斜体
  formattedText = formattedText.replace(/\*\*\*([^*]+)\*\*\*/g, '*$1*'); // 粗体+斜体 -> 斜体
  formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '$1'); // 移除粗体标记但保留内容
  formattedText = formattedText.replace(/\*([^*]+)\*/g, '*$1*'); // 保留斜体
  
  // 处理下划线标记
  formattedText = formattedText.replace(/__([^_]+)__/g, '$1'); // 移除下划线粗体
  formattedText = formattedText.replace(/_([^_]+)_/g, '_$1_'); // 保留下划线斜体
  
  // 处理删除线
  formattedText = formattedText.replace(/~~([^~]+)~~/g, '~$1~'); // 简化删除线
  
  // 处理列表
  formattedText = formattedText.replace(/^\s*[-*+]\s+/gm, '• '); // 无序列表
  formattedText = formattedText.replace(/^\s*\d+\.\s+/gm, (match) => {
    // 保持有序列表的数字
    const num = match.match(/\d+/)[0];
    return `${num}. `;
  });
  
  // 处理链接（保留链接文本，格式化链接）
  formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 (链接: $2)');
  
  // 处理图片（保留描述）
  formattedText = formattedText.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '图片: $1');
  
  // 处理引用
  formattedText = formattedText.replace(/^>\s+(.*)$/gm, '引用: $1');
  
  // 清理多余的空行
  formattedText = formattedText.replace(/\n{3,}/g, '\n\n');
  
  return formattedText;
}

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