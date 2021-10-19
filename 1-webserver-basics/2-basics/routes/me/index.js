"use strict";

module.exports = async (fastify, opts) => {
  fastify.get("/", async (request, reply) => {
    const { greeting = "Hello from Me " } = request.query;
    return reply.view(`me.hbs`, { greeting });
  });
};
