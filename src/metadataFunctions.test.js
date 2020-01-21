// @flow strict

import {
  SingleResultProxyError
} from './ResultProxyError'

import {
  type Settings
} from './settings'

import {
  createProxyLayer
} from './proxyLayer'

import {
  getData,
  getDataWithErrorsInline,
  getPath,
  getSettings,
  changeSettings
} from './metadataFunctions'

describe('getData', () => {
  it('returns the raw layer data', () => {
    const data = {}
    const layer = createProxyLayer({
      data,
      path: ['a']
    })
    expect(getData(layer)).toBe(data)
  })

  it('works with all standard graphql types', () => {
    const data = {
      a: 'test',
      b: [0, 1, 'a'],
      c: true
    }
    const layer = createProxyLayer({
      data,
      path: ['a']
    })
    expect(getData(layer)).toBe(data)
  })

  it('throws on object subkey error', () => {
    const data = {
      a: new SingleResultProxyError(new Error('Test error'))
    }
    const layer = createProxyLayer({
      data,
      path: ['a']
    })
    expect(() => getData(layer)).toThrow('Test error')
  })

  it('throws on array subkey error', () => {
    const data = [
      new SingleResultProxyError(new Error('Test error'))
    ]
    const layer = createProxyLayer({
      data,
      path: ['a']
    })
    expect(() => getData(layer)).toThrow('Test error')
  })

  it('throws on deep subkey error', () => {
    const data = [
      {
        a: [new SingleResultProxyError(new Error('Test error'))]
      }
    ]
    const layer = createProxyLayer({
      data,
      path: ['a']
    })
    expect(() => getData(layer)).toThrow('Test error')
  })

  it('combines errors', () => {
    const data = [
      {
        a: [new SingleResultProxyError(new Error('Test error'))],
        b: new SingleResultProxyError(new Error('Test error 2'))
      }
    ]
    const layer = createProxyLayer({
      data,
      path: ['a']
    })
    expect(() => getData(layer)).toThrow('Multiple GraphQL errors occurred: Test error, and Test error 2')
  })
})

describe('getDataWithErrorsInline', () => {
  it('returns the raw layer data', () => {
    const data = {}
    const layer = createProxyLayer({
      data,
      path: ['a']
    })
    expect(getDataWithErrorsInline(layer)).toBe(data)
  })

  it('works with all standard graphql types', () => {
    const data = {
      a: 'test',
      b: [0, 1, 'a'],
      c: true
    }
    const layer = createProxyLayer({
      data,
      path: ['a']
    })
    expect(getDataWithErrorsInline(layer)).toBe(data)
  })

  it('does not throw on object subkey error', () => {
    const data = {
      a: new SingleResultProxyError(new Error('Test error'))
    }
    const layer = createProxyLayer({
      data,
      path: ['a']
    })
    expect(getDataWithErrorsInline(layer)).toBe(data)
  })

  it('does not throw on array subkey error', () => {
    const data = [
      new SingleResultProxyError(new Error('Test error'))
    ]
    const layer = createProxyLayer({
      data,
      path: ['a']
    })
    expect(getDataWithErrorsInline(layer)).toBe(data)
  })

  it('does not throw on deep subkey error', () => {
    const data = [
      {
        a: [new SingleResultProxyError(new Error('Test error'))]
      }
    ]
    const layer = createProxyLayer({
      data,
      path: ['a']
    })
    expect(getDataWithErrorsInline(layer)).toBe(data)
  })
})

describe('getPath', () => {
  it('gets the current path', () => {
    const path = ['a', 'b']
    const layer = createProxyLayer({
      data: {},
      path
    })

    expect(getPath(layer)).toEqual(path)
  })
})

describe('getSettings', () => {
  it('gets the current settings back', () => {
    const settings: Settings = {
      throwOnErrors: true
    }
    const layer = createProxyLayer({
      ...settings,
      data: {},
      path: ['a']
    })

    expect(getSettings(layer)).toEqual(settings)
  })
})

describe('changeSettings', () => {
  it('merges settings', () => {
    const settings: Settings = {
      throwOnErrors: true
    }
    const layer1 = createProxyLayer({
      throwOnErrors: false,
      data: {},
      path: ['a']
    })
    const layer2 = changeSettings(layer1, settings)
    expect(getSettings(layer1)).toEqual({
      throwOnErrors: false
    })
    expect(getSettings(layer2)).toEqual(settings)
  })
})
