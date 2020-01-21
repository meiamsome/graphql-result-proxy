// @flow strict

import {
  type ExecutionResult
} from 'graphql'

import {
  createProxyLayer
} from './proxyLayer'

import {
  inlineErrors
} from './inlineErrors'

import {
  type Settings
} from './settings'

export const createResultProxy = (result: ExecutionResult, settings?: Settings): any => {
  const { data } = inlineErrors(result)

  return createProxyLayer({
    ...settings,
    data,
    path: []
  })
}
