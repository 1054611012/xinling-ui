/**
 * 菜单图标兜底映射
 *
 * 后端 /getRouters 返回的菜单数据中，meta.icon 可能为空，
 * 此时侧边栏会显示一个没有图标的菜单项，视觉上不统一。
 *
 * 本工具在后端未配置 icon 时，按「标题精确 → 标题包含 → 路径包含」
 * 三级匹配给出默认图标，覆盖项目中常见的菜单命名。
 *
 * 规则：
 * 1. FORCE_ICON_MAP 中的标题会强制覆盖后端 icon（用于专门设计的专属图标）
 * 2. 其他菜单：仅在 meta.icon 为空时生效，不会覆盖后端显式配置的图标
 * 图标名对应 src/assets/icons/svg/ 目录下的 svg 文件名（不含扩展名）。
 */

// 强制覆盖映射：这些菜单使用专门设计的专属图标，优先级高于后端 meta.icon
// key 为菜单标题（meta.title），value 为 svg 文件名
const FORCE_ICON_MAP = {
  '模型管理': 'model',
  '会话配置管理': 'session-config',
  '会话配置': 'session-config',
  '系统配置': 'system-config',
  '存储配置': 'storage-config',
  '存储': 'storage-config'
}

// 按菜单标题匹配（标题即后端 meta.title）
const TITLE_ICON_MAP = {
  // 通用
  '首页': 'dashboard',
  '工作台': 'dashboard',
  'Dashboard': 'dashboard',
  '主页': 'dashboard',
  // AI 相关
  'AI管理': 'ai',
  'AI助手': 'ai',
  '智能助手': 'ai',
  'AI': 'ai',
  'AI分析': 'chart',
  '股票分析': 'chart',
  '量化分析': 'chart',
  '行情': 'chart',
  '行情中心': 'chart',
  // 本体 / 知识图谱
  '知识图谱': 'tree',
  '本体管理': 'tree',
  '概念管理': 'star',
  '概念': 'star',
  '关系管理': 'link',
  '关系': 'link',
  // 会话 / 提示词 / 模型
  '会话配置管理': 'session-config',
  '会话配置': 'session-config',
  '会话管理': 'message',
  '会话': 'message',
  '对话': 'message',
  '提示词': 'clipboard',
  'Prompt': 'clipboard',
  '模型管理': 'model',
  '模型': 'model',
  // 工具
  '工具管理': 'tool',
  '工具': 'tool',
  // 系统管理
  '系统配置': 'system-config',
  '系统管理': 'system',
  '系统': 'system',
  '存储配置': 'storage-config',
  '存储': 'storage-config',
  '用户管理': 'user',
  '用户': 'user',
  '角色管理': 'peoples',
  '角色': 'peoples',
  '菜单管理': 'tree-table',
  '菜单': 'tree-table',
  '部门管理': 'tree',
  '部门': 'tree',
  '组织管理': 'tree',
  '岗位管理': 'post',
  '岗位': 'post',
  '字典管理': 'dict',
  '字典': 'dict',
  '参数设置': 'edit',
  '参数': 'edit',
  '通知公告': 'message',
  '公告': 'message',
  '通知': 'message',
  // 日志 / 监控
  '日志管理': 'log',
  '日志': 'log',
  '操作日志': 'log',
  '登录日志': 'logininfor',
  '在线用户': 'online',
  '定时任务': 'job',
  '任务': 'job',
  '服务监控': 'monitor',
  '监控': 'monitor',
  '缓存监控': 'redis',
  '缓存': 'redis',
  '缓存列表': 'redis-list',
  '系统接口': 'swagger',
  '接口': 'swagger',
  // 开发
  '表单构建': 'form',
  '表单': 'form',
  '代码生成': 'code',
  '代码': 'code',
  '代码预览': 'code',
  '文档': 'documentation',
  '文件管理': 'file',
  '文件': 'file',
  // 其他
  '个人中心': 'user',
  '帮助': 'question',
  '关于': 'guide',
  '主题': 'theme',
  '皮肤': 'theme'
}

// 按路径片段匹配（兜底，路径转小写后做包含判断）
const PATH_ICON_MAP = {
  dashboard: 'dashboard',
  index: 'dashboard',
  home: 'dashboard',
  ai: 'ai',
  stock: 'chart',
  analysis: 'chart',
  market: 'chart',
  ontology: 'tree',
  concept: 'star',
  relation: 'link',
  knowledge: 'tree',
  model: 'model',
  'session-config': 'session-config',
  session: 'session-config',
  'system-config': 'system-config',
  'storage-config': 'storage-config',
  storage: 'storage-config',
  tool: 'tool',
  system: 'system',
  user: 'user',
  role: 'peoples',
  menu: 'tree-table',
  dept: 'tree',
  org: 'tree',
  post: 'post',
  dict: 'dict',
  config: 'edit',
  notice: 'message',
  log: 'log',
  logininfor: 'logininfor',
  online: 'online',
  job: 'job',
  monitor: 'monitor',
  server: 'monitor',
  cache: 'redis',
  redis: 'redis',
  swagger: 'swagger',
  api: 'swagger',
  gen: 'code',
  code: 'code',
  form: 'form',
  doc: 'documentation',
  file: 'file'
}

// 标题包含匹配时，按 key 长度降序，保证更具体的词优先命中
// 例如「AI分析」应命中 chart 而不是被「AI」抢先命中 ai
const TITLE_KEYS_BY_LEN = Object.keys(TITLE_ICON_MAP).sort((a, b) => b.length - a.length)
const PATH_KEYS_BY_LEN = Object.keys(PATH_ICON_MAP).sort((a, b) => b.length - a.length)

/**
 * 获取菜单图标：优先使用后端配置的 icon，为空时按标题/路径兜底
 * @param {string} icon 后端配置的 meta.icon
 * @param {string} title 菜单标题 meta.title
 * @param {string} [path=''] 菜单路径
 * @returns {string} 图标名（对应 src/assets/icons/svg 下的文件名），无匹配返回空串
 */
export function resolveMenuIcon(icon, title, path = '') {
  // 0. 强制覆盖：专门设计的专属图标，无视后端 meta.icon
  if (title) {
    const t = String(title).trim()
    if (FORCE_ICON_MAP[t]) {
      return FORCE_ICON_MAP[t]
    }
  }

  // 1. 后端显式配置优先
  if (icon && String(icon).trim()) {
    return icon
  }

  // 2. 标题精确匹配
  if (title) {
    const t = String(title).trim()
    if (TITLE_ICON_MAP[t]) {
      return TITLE_ICON_MAP[t]
    }
    // 3. 标题包含匹配（长 key 优先）
    for (const key of TITLE_KEYS_BY_LEN) {
      if (t.includes(key)) {
        return TITLE_ICON_MAP[key]
      }
    }
  }

  // 4. 路径包含匹配（长 key 优先）
  if (path) {
    const p = String(path).toLowerCase()
    for (const key of PATH_KEYS_BY_LEN) {
      if (p.includes(key)) {
        return PATH_ICON_MAP[key]
      }
    }
  }

  return ''
}
