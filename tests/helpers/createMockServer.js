const { createKoaServer } = require('@ianwalter/test-server')

module.exports = async function createMockServer () {
  const server = await createKoaServer()

  server.use(ctx => {
    if (ctx.request.url === '/could-it-be') {
      ctx.status = 201
      ctx.body = { foo: 'Hello World!' }
    } else if (ctx.request.url === '/mirror') {
      ctx.body = ctx.request.body
    } else if (ctx.request.url === '/error') {
      ctx.status = 400
    }
  })

  return server
}
