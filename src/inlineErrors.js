// @flow strict

import {
  type ExecutionResult
} from 'graphql'

import {
  ResultProxyError,
  SingleResultProxyError
} from './ResultProxyError'

export const inlineErrors = (result: ExecutionResult) => {
  const data = result.data

  if (result.errors) {
    for (const returnedError of result.errors) {
      const fullPath = returnedError.path || []
      const originalError = returnedError.originalError || returnedError
      const error = new SingleResultProxyError(originalError)
      let elem: any = data
      let found = false
      for (const key of fullPath) {
        if (key === undefined || key === null) {
          throw new Error(`Badly formatted underlying error: ${originalError.message}`)
        }
        if (elem === undefined || elem === null) {
          break
        }
        if (elem[key] instanceof ResultProxyError) {
          elem[key] = elem[key].combine(error)
          found = true
          break
        }
        if (elem[key] === null) {
          elem[key] = error
          found = true
          break
        }
        elem = elem[key]
      }
      if (found) {
        continue
      }
      throw new Error(`Badly formatted underlying error: ${originalError.message}`)
    }
  }

  return { data }
}
