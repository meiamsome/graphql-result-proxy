// @flow strict

export class ResultProxyError extends Error {
  combine (other: ResultProxyError): ResultProxyError {
    throw new Error('Unimplemented')
  }
}

export class SingleResultProxyError extends ResultProxyError {
  error: Error

  constructor (err: Error) {
    super(`GraphQL error: ${err.message}`)
    this.error = err
  }

  // eslint-disable-next-line no-use-before-define
  combine (other: ResultProxyError): MultipleResultProxyError {
    if (other instanceof MultipleResultProxyError) {
      return other.combine(this)
    }
    if (other instanceof SingleResultProxyError) {
      return new MultipleResultProxyError([
        this.error,
        other.error
      ])
    }
    throw new Error('Cannot combine error types')
  }
}

export class MultipleResultProxyError extends ResultProxyError {
  errors: Array<Error>
  constructor (errors: Array<Error>) {
    super(`Multiple GraphQL errors occurred: ${errors.map(e => e.message).join(', and ')}`)
    this.errors = [...errors]
  }

  combine (other: ResultProxyError): MultipleResultProxyError {
    if (other instanceof MultipleResultProxyError) {
      return new MultipleResultProxyError([
        ...this.errors,
        ...other.errors
      ])
    }
    if (other instanceof SingleResultProxyError) {
      return new MultipleResultProxyError([
        ...this.errors,
        other.error
      ])
    }
    throw new Error('Cannot combine error types')
  }
}
