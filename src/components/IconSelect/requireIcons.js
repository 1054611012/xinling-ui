// Vite 使用 import.meta.glob 代替 Webpack 的 require.context
const icons = Object.keys(import.meta.glob('../../assets/icons/svg/*.svg')).map(path => {
  const filename = path.split('/').pop()
  return filename.replace('.svg', '')
}).filter(Boolean)

export default icons
