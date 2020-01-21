// @flow strict

import {
  ResultProxyError
} from './ResultProxyError'

import {
  metadataKey
} from './metadataKey'

import {
  type Settings
} from './settings'
import { createProxyLayer } from './proxyLayer'

const throwOnErrorsInTree = (node): any => {
  let error: ResultProxyError | null = node instanceof ResultProxyError ? node : null
  for (const key in node) {
    const result = throwOnErrorsInTree(node[key])
    if (result instanceof ResultProxyError) {
      if (error) {
        error = error.combine(result)
      } else {
        error = result
      }
    }
  }
  return error || node
}

export const getData = (layer: any): any => {
  const result = throwOnErrorsInTree(layer[metadataKey].data)
  if (result instanceof ResultProxyError) {
    throw result
  }
  return result
}

export const getDataWithErrorsInline = (layer: any): any => {
  return layer[metadataKey].data
}

export const getPath = (layer: any): Array<string | number> => {
  return layer[metadataKey].path
}

export const getSettings = (layer: any): Settings => {
  const {
    data,
    path,
    ...settings
  } = layer[metadataKey]

  return settings
}

export const changeSettings = (layer: any, updateSettings: Settings): any => {
  return createProxyLayer({
    ...layer[metadataKey],
    ...updateSettings
  })
}
