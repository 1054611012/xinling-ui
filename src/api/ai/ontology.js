import request from '@/utils/request'

// 概念 CRUD

export function listConcept(query) {
  return request({
    url: '/ai/ontology/concept/list',
    method: 'get',
    params: query
  })
}

export function getConcept(conceptId) {
  return request({
    url: '/ai/ontology/concept/' + conceptId,
    method: 'get'
  })
}

export function addConcept(data) {
  return request({
    url: '/ai/ontology/concept',
    method: 'post',
    data: data
  })
}

export function updateConcept(data) {
  return request({
    url: '/ai/ontology/concept',
    method: 'put',
    data: data
  })
}

export function delConcept(conceptIds) {
  return request({
    url: '/ai/ontology/concept/' + conceptIds,
    method: 'delete'
  })
}

export function listEnabledConcept() {
  return request({
    url: '/ai/ontology/concept/enabled',
    method: 'get'
  })
}

export function listConceptChildren(parentId) {
  return request({
    url: '/ai/ontology/concept/children/' + parentId,
    method: 'get'
  })
}

// 关系 CRUD

export function listRelation(query) {
  return request({
    url: '/ai/ontology/relation/list',
    method: 'get',
    params: query
  })
}

export function getRelation(relationId) {
  return request({
    url: '/ai/ontology/relation/' + relationId,
    method: 'get'
  })
}

export function addRelation(data) {
  return request({
    url: '/ai/ontology/relation',
    method: 'post',
    data: data
  })
}

export function updateRelation(data) {
  return request({
    url: '/ai/ontology/relation',
    method: 'put',
    data: data
  })
}

export function delRelation(relationIds) {
  return request({
    url: '/ai/ontology/relation/' + relationIds,
    method: 'delete'
  })
}

export function listRelationByConcept(conceptId) {
  return request({
    url: '/ai/ontology/relation/concept/' + conceptId,
    method: 'get'
  })
}

export function getRelationBetween(sourceId, targetId) {
  return request({
    url: '/ai/ontology/relation/between',
    method: 'get',
    params: { sourceId, targetId }
  })
}

// 本体推理

export function ontologyReason(query) {
  return request({
    url: '/ai/ontology/reason',
    method: 'post',
    data: { query }
  })
}

export function getOntologyKnowledge() {
  return request({
    url: '/ai/ontology/knowledge',
    method: 'get'
  })
}

export function getRelatedConcept(conceptId) {
  return request({
    url: '/ai/ontology/related/' + conceptId,
    method: 'get'
  })
}