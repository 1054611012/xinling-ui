import request from '@/utils/request'

const BASE_URL = '/api/stock/analysis'

// 健康检查
export function healthCheck() {
  return request({
    url: `${BASE_URL}/health`,
    method: 'get'
  })
}

// 个股分析
export function getStockAnalysis(stockCode, params = {}) {
  return request({
    url: `${BASE_URL}/stock/${stockCode}`,
    method: 'get',
    params: {
      type: 'daily',
      deep: false,
      ...params
    }
  })
}

// 板块分析
export function getSectorAnalysis(sectorCode, params = {}) {
  return request({
    url: `${BASE_URL}/sector/${sectorCode}`,
    method: 'get',
    params: {
      type: 'daily',
      deep: false,
      ...params
    }
  })
}

// 基金分析
export function getFundAnalysis(fundCode, params = {}) {
  return request({
    url: `${BASE_URL}/fund/${fundCode}`,
    method: 'get',
    params: {
      deep: false,
      ...params
    }
  })
}

// 智能分析（通用接口）
export function analyze(data) {
  return request({
    url: `${BASE_URL}/analyze`,
    method: 'post',
    data: {
      symbolType: 'stock',
      analysisType: 'daily',
      deepAnalysis: false,
      ...data
    }
  })
}

// 快捷分析 - 个股
export function analyzeStock(stockCode, options = {}) {
  return analyze({
    symbolType: 'stock',
    symbolCode: stockCode,
    analysisType: options.type || 'daily',
    deepAnalysis: options.deep || false
  })
}

// 快捷分析 - 板块
export function analyzeSector(sectorCode, options = {}) {
  return analyze({
    symbolType: 'sector',
    symbolCode: sectorCode,
    analysisType: options.type || 'daily',
    deepAnalysis: options.deep || false
  })
}

// 快捷分析 - 基金
export function analyzeFund(fundCode, options = {}) {
  return analyze({
    symbolType: 'fund',
    symbolCode: fundCode,
    analysisType: options.type || 'daily',
    deepAnalysis: options.deep || false
  })
}
