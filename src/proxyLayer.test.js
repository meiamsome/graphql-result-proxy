// @flow strict
import {
  type Settings
} from './settings'

import {
  createProxyLayer
} from './proxyLayer'

import {
  metadataKey
} from './metadataKey'

describe('createProxyLayer', () => {
  let settings: Settings = {}

  beforeEach(() => {
    settings = {}
  })

  describe('default settings', () => {
    it('throws on invalid key access', () => {
      expect(() => createProxyLayer({
        ...settings,
        data: undefined,
        path: ['a', 'b']
      })).toThrow('Access of key that was not requested: a.b')
    })

    it('throws the data error', () => {
      const error = new Error('test error')
      expect(() => createProxyLayer({
        ...settings,
        data: error,
        path: ['a', 'b']
      })).toThrow(error)
    })

    it('directly returns a null value', () => {
      expect(createProxyLayer({
        ...settings,
        data: null,
        path: ['a', 'b']
      })).toBe(null)
    })

    it('directly returns a string value', () => {
      expect(createProxyLayer({
        ...settings,
        data: 'test string',
        path: ['a', 'b']
      })).toEqual('test string')
    })

    it('directly returns a numeric value', () => {
      expect(createProxyLayer({
        ...settings,
        data: 4,
        path: ['a', 'b']
      })).toEqual(4)
    })

    it('creates a sub-key proxy for an object', () => {
      const layer: any = createProxyLayer({
        ...settings,
        data: {
          key: {}
        },
        path: ['a', 'b']
      })
      const subKey = layer.key
      expect(subKey[metadataKey]).toEqual({
        ...settings,
        data: {},
        path: ['a', 'b', 'key']
      })
    })

    it('creates a sub-key proxy for an array', () => {
      const layer: any = createProxyLayer({
        ...settings,
        data: [{}],
        path: ['a', 'b']
      })
      const subKey = layer[0]
      expect(subKey[metadataKey]).toEqual({
        ...settings,
        data: {},
        path: ['a', 'b', '0']
      })
    })

    it('doesn\'t fail for Symbol lookups', () => {
      const key = Symbol('test')
      const data = [{}, 1, 's']
      const layer: any = createProxyLayer({
        ...settings,
        data,
        path: ['a', 'b']
      })
      expect(layer[key]).toBeUndefined()
      expect(layer[Symbol.iterator]).toBeInstanceOf(Function)
      expect(layer[Symbol.isConcatSpreadable]).not.toBeDefined()
    })

    it('allows then without throwing', () => {
      const layer = createProxyLayer({
        ...settings,
        data: {},
        path: ['a', 'b']
      })
      expect(layer.then).toBeUndefined()
    })
  })

  describe('throwOnInvalidKeys = true', () => {
    beforeEach(() => {
      settings.throwOnInvalidKeys = true
    })

    it('throws on invalid key access', () => {
      expect(() => createProxyLayer({
        ...settings,
        data: undefined,
        path: ['a', 'b']
      })).toThrow('Access of key that was not requested: a.b')
    })
  })

  describe('throwOnInvalidKeys = false', () => {
    beforeEach(() => {
      settings.throwOnInvalidKeys = false
    })

    it('doesn\'t throw on invalid key access', () => {
      expect(() => createProxyLayer({
        ...settings,
        data: undefined,
        path: ['a', 'b']
      })).not.toThrow()
    })
  })

  describe('ignoredInvalidKeys = []', () => {
    beforeEach(() => {
      settings.ignoredInvalidKeys = []
    })

    it('throws on then key access', () => {
      const layer = createProxyLayer({
        ...settings,
        data: {},
        path: ['a', 'b']
      })
      expect(() => layer.then).toThrow('Access of key that was not requested: a.b.then')
    })
  })
})
