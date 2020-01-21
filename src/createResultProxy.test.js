// @flow strict
import { GraphQLError } from 'graphql'

import {
  createResultProxy
} from './createResultProxy'
import { changeSettings } from './metadataFunctions'

describe('createResultProxy', () => {
  it('allows data access', () => {
    const result = createResultProxy({
      data: {
        a: [
          {
            b: 1
          }
        ]
      }
    })

    expect(result.a[0].b).toBe(1)
  })

  it('Handles errors at different stages', () => {
    const result = createResultProxy({
      data: {
        a: [
          {
            b: 1,
            c: null
          },
          null
        ]
      },
      errors: [
        new GraphQLError('test error 1', null, null, null, ['a', 0, 'c']),
        new GraphQLError('test error 2', null, null, null, ['a', 1])
      ]
    })

    expect(result.a[0].b).toBe(1)
    expect(() => result.a[0].c).toThrow('GraphQL error: test error 1')
    expect(() => result.a[1]).toThrow('GraphQL error: test error 2')
  })

  it('Handles multiple errors at one location', () => {
    const result = createResultProxy({
      data: {
        a: [
          {
            b: 1,
            c: null
          },
          null
        ]
      },
      errors: [
        new GraphQLError('test error 1', null, null, null, ['a', 0, 'c']),
        new GraphQLError('test error 2', null, null, null, ['a', 1, 'b']),
        new GraphQLError('test error 3', null, null, null, ['a', 1, 'c'])
      ]
    })

    expect(result.a[0].b).toBe(1)
    expect(() => result.a[0].c).toThrow('GraphQL error: test error 1')
    expect(() => result.a[1]).toThrow('Multiple GraphQL errors occurred: test error 2, and test error 3')
  })

  it('Can throw on invalid keys', () => {
    const result = createResultProxy({
      data: {
        a: [
          {
            b: 1,
            c: null
          },
          null
        ]
      }
    })

    expect(() => result.a.length).not.toThrow()
    expect(() => result.a[2]).toThrow('Access of key that was not requested: a.2')

    const elem = changeSettings(result.a, { throwOnInvalidKeys: false })
    expect(() => elem.length).not.toThrow()
    expect(() => elem[2]).not.toThrow()
    // But coming from result keeps its own settings
    expect(() => result.a[2]).toThrow('Access of key that was not requested: a.2')

    const elem2 = changeSettings(elem, { throwOnInvalidKeys: true })
    expect(() => elem2.length).not.toThrow()
    expect(() => elem2[2]).toThrow('Access of key that was not requested: a.2')
  })

  it('is thennable by default', () => {
    return Promise.resolve(createResultProxy({
      data: {
        a: [
          {
            b: 1
          }
        ]
      }
    })).then(result => {
      expect(result.a[0].b).toBe(1)
    })
  })

  it('allows thennable to be turned off', () => {
    return expect(Promise.resolve(createResultProxy({
      data: {
        a: [
          {
            b: 1
          }
        ]
      }
    }, {
      ignoredInvalidKeys: []
    }))).rejects.toThrow('Access of key that was not requested: then')
  })
})
