// @flow strict

import {
  metadataKey
} from './metadataKey'

import {
  type Settings
} from './settings'

type LayerMetadata = {
  ...Settings,
  data: any,
  path: Array<string | number>
}

const isIgnoredKey = (metadata: LayerMetadata, key: string): bool => {
  return (metadata.ignoredInvalidKeys || ['then', 'toJSON', 'toString']).includes(key)
}

export const createProxyLayer = (metadata: LayerMetadata): any => {
  if (metadata.data === undefined) {
    if (metadata.throwOnInvalidKeys === false) {
      return undefined
    }
    throw new Error(`Access of key that was not requested: ${metadata.path.join('.')}`)
  }
  if (metadata.data instanceof Error) {
    throw metadata.data
  }
  if (!metadata.data) {
    return metadata.data
  }
  if (typeof metadata.data === 'string') {
    return metadata.data
  }
  if (typeof metadata.data !== 'object') {
    return metadata.data
  }
  return new Proxy(metadata.data, {
    get: (target, prop) => {
      if (prop === metadataKey) {
        return metadata
      }
      if (isIgnoredKey(metadata, prop) && !Object.prototype.hasOwnProperty.call(target, prop)) {
        return undefined
      }
      return createProxyLayer({
        ...metadata,
        data: target[prop],
        path: [...metadata.path, prop]
      })
    }
  })
}
