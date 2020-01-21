# GraphQL Result Proxy

This module provides a Proxy implementation that takes the result of a graphql
execution and produces a version that will throw errors when the key that are
located at is accessed.

For example:

```js
const { execute } = require('graphql')
const { createResultProxy } = require('graphql-result-proxy')

const exampleFn = async () => {
  const result = await execute(/* args here */)
  // Let's assume this request is of the form
  // query {
  //   getItem {
  //     keyA
  //     keyB
  //   }
  // }
  // And that there is an error localized to getItem.keyB

  const data = createResultProxy(result)

  // This returns the value of keyA
  console.log(data.getItem.keyA)

  // This would throw the error at keyB
  console.log(data.getItem.keyB)

  // This would throw an error that keyC was not in the original graphql request
  console.log(data.getItem.keyC)
}
```
