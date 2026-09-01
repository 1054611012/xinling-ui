/**
 * 统一维护「请求中」状态。
 *
 * 背景：@/utils/request 已经在响应拦截器里统一弹出了错误提示，
 * 但组件里若写成 `loading.value = true; api().then(res => { ...; loading.value = false })`，
 * 一旦请求失败，then 不会执行，loading 就永远停在 true，页面一直转圈且必须手动刷新。
 *
 * 用法：
 *   withLoading(loading, listUser(queryParams)).then(res => { ... })
 *
 * @param {import('vue').Ref<boolean>} loadingRef - 控制加载态的响应式引用
 * @param {Promise} request - 待执行的请求
 * @returns {Promise} 原请求，成功失败都会关闭加载态
 */
export function withLoading(loadingRef, request) {
  loadingRef.value = true
  return request.finally(() => {
    loadingRef.value = false
  })
}

export default withLoading
