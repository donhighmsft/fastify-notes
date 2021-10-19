"use strict";

module.exports = async function (fastify, opts) {
  const urlOpts = {
    querystring: {
      type: "object",
      properties: {
        url: { type: "string" },
      },
    },
  };

  fastify.get("/", urlOpts, async function (request, reply) {
    const { url } = request.query;
    const { badRequest, notFound } = fastify.httpErrors;

    try {
      new URL(url);
    } catch (error) {
      throw badRequest();
    }

    try {
      return reply.from(url);
    } catch (error) {
      console.log(`This is an Error`);
      console.log(error);
      //throw notFound();
    }
  });
};
