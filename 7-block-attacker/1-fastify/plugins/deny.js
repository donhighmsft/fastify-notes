const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  const { forbidden } = fastify.httpErrors;
  fastify.addHook("onRequest", function hook(request, reply, done) {
    console.log(request.ip);
    if (request.ip === "211.133.33.113") {
      throw forbidden();
    }
    done();
  });
});
