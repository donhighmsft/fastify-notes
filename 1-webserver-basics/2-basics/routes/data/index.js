"use strict";

const stream = require("../../stream");
const { promisify } = require("util");
//const data = promisify(stream);

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    return stream();
  });
};
