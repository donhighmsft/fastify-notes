"use strict";
const { boat } = require("../../model");
const { promisify } = require("util");

const read = promisify(boat.read);

module.exports = async function (fastify, opts) {
  const { notFound, internalServerError } = fastify.httpErrors;

  fastify.get("/:id", async function (request, reply) {
    const { id } = request.params;
    try {
      //console.log("The Funtion");
      return await read(id);
    } catch (error) {
      if (error.code === "E_NOT_FOUND") {
        throw notFound();
      } else {
        throw internalServerError();
      }
    }
  });
};
