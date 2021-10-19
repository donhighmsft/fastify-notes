"use strict";
const { boat } = require("../../model");
const { promisify } = require("util");

const read = promisify(boat.read);
const create = promisify(boat.create);

module.exports = async function (fastify, opts) {
  const { notFound, internalServerError } = fastify.httpErrors;

  const boatOpts = {
    schema: {
      body: {
        type: "object",
        required: ["data"],
        additionalProperties: false,
        properties: {
          data: {
            type: "object",
            required: ["brand", "color"],
            additionalProperties: false,
            properties: {
              brand: { type: "string" },
              color: { type: "string" },
            },
          },
        },
      },
    },
  };
  const boatOpts2 = {
    schema: {
      body: {
        type: "object",
        required: ["brand", "color"],
        additionalProperties: false,
        properties: {
          brand: { type: "string" },
          color: { type: "string" },
        },
      },
    },
  };

  fastify.get("/:id", async function (request, reply) {
    const { id } = request.params;
    try {
      return await read(id);
    } catch (error) {
      if (error.code === "E_NOT_FOUND") {
        throw notFound();
      } else {
        throw internalServerError();
      }
    }
  });

  fastify.post("/", boatOpts, async function (request, reply) {
    const { brand, color } = request.body.data;

    try {
      reply
        .code(201)
        .type("application/json")
        .send({ id: await create(boat.uid(), { brand, color }) });
      //return await create(boat.uid(), request.body);
    } catch (error) {
      reply
        .code(500)
        .type("application / json")
        .send({ message: internalServerError() });
      //.throw internalServerError();

      //console.log(error);
    }
  });
};
