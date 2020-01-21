// @flow strict

import { GraphQLError } from 'graphql'

import {
  SingleResultProxyError,
  MultipleResultProxyError
} from './ResultProxyError'

import {
  inlineErrors
} from './inlineErrors'

describe('inlineErrors', () => {
  it('does nothing with no errors', () => {
    const data = {
      a: []
    }
    expect(inlineErrors({
      data
    })).toEqual({ data })
  })

  it('throws for errors without a path', () => {
    expect(() => inlineErrors({
      data: {},
      errors: [
        new GraphQLError(
          'test error'
        )
      ]
    })).toThrow('Badly formatted underlying error: test error')
  })

  it('throws for top-level errors', () => {
    const error = new GraphQLError(
      'test error',
      null,
      null,
      null,
      []
    )
    expect(() => inlineErrors({
      data: null,
      errors: [error]
    })).toThrow('Badly formatted underlying error: test error')
  })

  it('throws for invalid path', () => {
    const error = new GraphQLError(
      'test error',
      null,
      null,
      null,
      // $FlowFixMe null is not valid here, but the test is for an invalid case
      [null, 'an', 'invalid', 'path']
    )
    expect(() => inlineErrors({
      data: null,
      errors: [error]
    })).toThrow('Badly formatted underlying error: test error')
  })

  it('throws for path that doesn\'t exist at all', () => {
    const error = new GraphQLError(
      'test error',
      null,
      null,
      null,
      ['an', 'invalid', 'path']
    )
    expect(() => inlineErrors({
      data: {},
      errors: [error]
    })).toThrow('Badly formatted underlying error: test error')
  })

  it('works for second-level errors', () => {
    const error = new GraphQLError(
      'test error',
      null,
      null,
      null,
      ['exampleQuery']
    )
    const result: any = inlineErrors({
      data: {
        exampleQuery: null
      },
      errors: [error]
    })

    expect(result.data.exampleQuery).toBeInstanceOf(SingleResultProxyError)
    expect(result.data.exampleQuery.error).toBe(error)
  })

  it('works for deep errors', () => {
    const error = new GraphQLError(
      'test error',
      null,
      null,
      null,
      ['exampleQuery', 'with', 'a', 'deep', 'field', 0, 'query']
    )
    const result: any = inlineErrors({
      data: {
        exampleQuery: {
          with: {
            a: {
              deep: {
                field: [
                  {
                    query: null
                  }
                ]
              }
            }
          }
        }
      },
      errors: [error]
    })

    expect(result.data.exampleQuery.with.a.deep.field[0].query).toBeInstanceOf(SingleResultProxyError)
    expect(result.data.exampleQuery.with.a.deep.field[0].query.error).toBe(error)
  })

  it('works for deep errors with a null at a higher position', () => {
    const error = new GraphQLError(
      'test error',
      null,
      null,
      null,
      ['exampleQuery', 'with', 'a', 'deep', 'field', 0, 'query']
    )
    const result: any = inlineErrors({
      data: {
        exampleQuery: {
          with: {
            a: null
          }
        }
      },
      errors: [error]
    })

    expect(result.data.exampleQuery.with.a).toBeInstanceOf(SingleResultProxyError)
    expect(result.data.exampleQuery.with.a.error).toBe(error)
  })

  it('collects deep errors with a null at a higher position', () => {
    const error1 = new GraphQLError(
      'test error',
      null,
      null,
      null,
      ['exampleQuery', 'with', 'a', 'deep', 'field', 0, 'query']
    )
    const error2 = new GraphQLError(
      'test error',
      null,
      null,
      null,
      ['exampleQuery', 'with', 'a', 'deep', 'field', 1, 'query']
    )
    const result: any = inlineErrors({
      data: {
        exampleQuery: {
          with: {
            a: null
          }
        }
      },
      errors: [error1, error2]
    })

    expect(result.data.exampleQuery.with.a).toBeInstanceOf(MultipleResultProxyError)
    expect(result.data.exampleQuery.with.a.errors).toEqual([error1, error2])
  })
})
