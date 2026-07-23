import request from '@/utils/request'

export function listProperty(query) {
  return request({
    url: '/ai/ontology/property/list',
    method: 'get',
    params: query
  })
}

export function getProperty(propertyId) {
  return request({
    url: '/ai/ontology/property/' + propertyId,
    method: 'get'
  })
}

export function listPropertyByConcept(conceptId) {
  return request({
    url: '/ai/ontology/property/concept/' + conceptId,
    method: 'get'
  })
}

export function addProperty(data) {
  return request({
    url: '/ai/ontology/property',
    method: 'post',
    data: data
  })
}

export function updateProperty(data) {
  return request({
    url: '/ai/ontology/property',
    method: 'put',
    data: data
  })
}

export function delProperty(propertyIds) {
  return request({
    url: '/ai/ontology/property/' + propertyIds,
    method: 'delete'
  })
}

export function exportProperty(query) {
  return request({
    url: '/ai/ontology/property/export',
    method: 'post',
    data: query
  })
}

export function listInstance(query) {
  return request({
    url: '/ai/ontology/instance/list',
    method: 'get',
    params: query
  })
}

export function getInstance(instanceId) {
  return request({
    url: '/ai/ontology/instance/' + instanceId,
    method: 'get'
  })
}

export function listInstanceByConcept(conceptId) {
  return request({
    url: '/ai/ontology/instance/concept/' + conceptId,
    method: 'get'
  })
}

export function addInstance(data) {
  return request({
    url: '/ai/ontology/instance',
    method: 'post',
    data: data
  })
}

export function updateInstance(data) {
  return request({
    url: '/ai/ontology/instance',
    method: 'put',
    data: data
  })
}

export function delInstance(instanceIds) {
  return request({
    url: '/ai/ontology/instance/' + instanceIds,
    method: 'delete'
  })
}

export function exportInstance(query) {
  return request({
    url: '/ai/ontology/instance/export',
    method: 'post',
    data: query
  })
}

export function listInstanceValue(query) {
  return request({
    url: '/ai/ontology/instance/value/list',
    method: 'get',
    params: query
  })
}

export function getInstanceValue(valueId) {
  return request({
    url: '/ai/ontology/instance/value/' + valueId,
    method: 'get'
  })
}

export function listInstanceValueByInstance(instanceId) {
  return request({
    url: '/ai/ontology/instance/value/by-instance/' + instanceId,
    method: 'get'
  })
}

export function addInstanceValue(data) {
  return request({
    url: '/ai/ontology/instance/value',
    method: 'post',
    data: data
  })
}

export function updateInstanceValue(data) {
  return request({
    url: '/ai/ontology/instance/value',
    method: 'put',
    data: data
  })
}

export function delInstanceValue(valueIds) {
  return request({
    url: '/ai/ontology/instance/value/' + valueIds,
    method: 'delete'
  })
}

export function listRule(query) {
  return request({
    url: '/ai/ontology/rule/list',
    method: 'get',
    params: query
  })
}

export function getRule(ruleId) {
  return request({
    url: '/ai/ontology/rule/' + ruleId,
    method: 'get'
  })
}

export function listRuleByConcept(conceptId) {
  return request({
    url: '/ai/ontology/rule/concept/' + conceptId,
    method: 'get'
  })
}

export function listEnabledRule() {
  return request({
    url: '/ai/ontology/rule/enabled',
    method: 'get'
  })
}

export function addRule(data) {
  return request({
    url: '/ai/ontology/rule',
    method: 'post',
    data: data
  })
}

export function updateRule(data) {
  return request({
    url: '/ai/ontology/rule',
    method: 'put',
    data: data
  })
}

export function delRule(ruleIds) {
  return request({
    url: '/ai/ontology/rule/' + ruleIds,
    method: 'delete'
  })
}

export function exportRule(query) {
  return request({
    url: '/ai/ontology/rule/export',
    method: 'post',
    data: query
  })
}

export function listAction(query) {
  return request({
    url: '/ai/ontology/action/list',
    method: 'get',
    params: query
  })
}

export function getAction(actionId) {
  return request({
    url: '/ai/ontology/action/' + actionId,
    method: 'get'
  })
}

export function listActionByConcept(conceptId) {
  return request({
    url: '/ai/ontology/action/concept/' + conceptId,
    method: 'get'
  })
}

export function addAction(data) {
  return request({
    url: '/ai/ontology/action',
    method: 'post',
    data: data
  })
}

export function updateAction(data) {
  return request({
    url: '/ai/ontology/action',
    method: 'put',
    data: data
  })
}

export function delAction(actionIds) {
  return request({
    url: '/ai/ontology/action/' + actionIds,
    method: 'delete'
  })
}

export function exportAction(query) {
  return request({
    url: '/ai/ontology/action/export',
    method: 'post',
    data: query
  })
}

export function listFieldMapping(query) {
  return request({
    url: '/ai/ontology/field-mapping/list',
    method: 'get',
    params: query
  })
}

export function getFieldMapping(fieldMappingId) {
  return request({
    url: '/ai/ontology/field-mapping/' + fieldMappingId,
    method: 'get'
  })
}

export function listFieldMappingByMapping(mappingId) {
  return request({
    url: '/ai/ontology/field-mapping/by-mapping/' + mappingId,
    method: 'get'
  })
}

export function addFieldMapping(data) {
  return request({
    url: '/ai/ontology/field-mapping',
    method: 'post',
    data: data
  })
}

export function updateFieldMapping(data) {
  return request({
    url: '/ai/ontology/field-mapping',
    method: 'put',
    data: data
  })
}

export function delFieldMapping(fieldMappingIds) {
  return request({
    url: '/ai/ontology/field-mapping/' + fieldMappingIds,
    method: 'delete'
  })
}