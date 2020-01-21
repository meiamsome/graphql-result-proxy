// @flow strict

import {
  SingleResultProxyError,
  MultipleResultProxyError
} from './ResultProxyError'

describe('SingleResultProxyError', () => {
  it('combines with SingleResultProxyError', () => {
    const error1 = new SingleResultProxyError(new Error('aaa'))
    const error2 = new SingleResultProxyError(new Error('bbb'))

    const result = error1.combine(error2)

    expect(result).toBeInstanceOf(MultipleResultProxyError)
    expect(result.errors).toEqual(expect.arrayContaining([
      new Error('aaa'),
      new Error('bbb')
    ]))
  })

  it('combines with MultipleResultProxyError', () => {
    const error1 = new SingleResultProxyError(new Error('aaa'))
    const error2 = new MultipleResultProxyError([new Error('bbb'), new Error('ccc')])

    const result = error1.combine(error2)

    expect(result).toBeInstanceOf(MultipleResultProxyError)
    expect(result.errors).toEqual(expect.arrayContaining([
      new Error('aaa'),
      new Error('bbb'),
      new Error('ccc')
    ]))
  })
})

describe('MultipleResultProxyError', () => {
  it('combines with SingleResultProxyError', () => {
    const error1 = new MultipleResultProxyError([new Error('aaa'), new Error('bbb')])
    const error2 = new SingleResultProxyError(new Error('ccc'))

    const result = error1.combine(error2)

    expect(result).toBeInstanceOf(MultipleResultProxyError)
    expect(result.errors).toEqual(expect.arrayContaining([
      new Error('aaa'),
      new Error('bbb'),
      new Error('ccc')
    ]))
  })

  it('combines with MultipleResultProxyError', () => {
    const error1 = new MultipleResultProxyError([new Error('aaa'), new Error('bbb')])
    const error2 = new MultipleResultProxyError([new Error('ccc'), new Error('ddd')])

    const result = error1.combine(error2)

    expect(result).toBeInstanceOf(MultipleResultProxyError)
    expect(result.errors).toEqual(expect.arrayContaining([
      new Error('aaa'),
      new Error('bbb'),
      new Error('ccc'),
      new Error('ddd')
    ]))
  })
})
