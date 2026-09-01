/**
 * 按需注册的 highlight.js 实例。
 *
 * 直接 `import hljs from 'highlight.js'` 会把全部 190+ 种语言打进包里（1MB 以上），
 * 而站内实际只需要常见语言。这里改用核心包并显式注册高频语言。
 *
 * 未注册的语言不会报错：调用方先用 hljs.getLanguage(name) 判断，
 * 取不到时回退到 highlightAuto，最坏情况只是不高亮而已。
 */
import hljs from 'highlight.js/lib/core'

import bash from 'highlight.js/lib/languages/bash'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import go from 'highlight.js/lib/languages/go'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import less from 'highlight.js/lib/languages/less'
import markdown from 'highlight.js/lib/languages/markdown'
import php from 'highlight.js/lib/languages/php'
import plaintext from 'highlight.js/lib/languages/plaintext'
import python from 'highlight.js/lib/languages/python'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import scss from 'highlight.js/lib/languages/scss'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

const languages = {
  bash,
  cpp,
  csharp,
  css,
  diff,
  go,
  ini,
  java,
  javascript,
  json,
  kotlin,
  less,
  markdown,
  php,
  plaintext,
  python,
  ruby,
  rust,
  scss,
  shell,
  sql,
  swift,
  typescript,
  xml,
  yaml
}

// javascript 同时支撑 js / jsx，xml 同时支撑 html / vue
Object.entries(languages).forEach(([name, definition]) => {
  hljs.registerLanguage(name, definition)
})

hljs.registerAliases(['js', 'jsx'], { languageName: 'javascript' })
hljs.registerAliases(['html', 'vue', 'svg'], { languageName: 'xml' })
hljs.registerAliases(['py'], { languageName: 'python' })
hljs.registerAliases(['ts', 'tsx'], { languageName: 'typescript' })
hljs.registerAliases(['sh', 'zsh', 'console'], { languageName: 'shell' })
hljs.registerAliases(['c', 'c++'], { languageName: 'cpp' })
hljs.registerAliases(['yml'], { languageName: 'yaml' })
hljs.registerAliases(['c#', 'cs'], { languageName: 'csharp' })
hljs.registerAliases(['golang'], { languageName: 'go' })
hljs.registerAliases(['text', 'txt'], { languageName: 'plaintext' })

export default hljs
