"use strict";

const { promisify } = require("util");
const got = require("got");
const { dir } = require("console");

const { BOAT_SERVICE_PORT, BRAND_SERVICE_PORT } = process.env;

module.exports = async function (fastify, opts) {
  fastify.get("/:id", async function (request, reply) {
    const { id } = request.params;
    const { notFound, internalServerError, badRequest } = fastify.httpErrors;

    try {
      const boatsvc = await got(`http://localhost:${BOAT_SERVICE_PORT}/${id}`, {
        timeout: 600,
        retry: 0,
      }).json();
      const brandsvc = await got(
        `http://localhost:${BRAND_SERVICE_PORT}/${boatsvc.brand}`,
        { timeout: 600, retry: 0 }
      ).json();

      //console.log(brandsvc);
      //console.log(boatsvc);

      reply.type("application/json").send({
        id: boatsvc.id,
        color: boatsvc.color,
        brand: brandsvc.name,
      });
    } catch (err) {
      //console.log(`myerror:`, err);
      if (!err.response) throw err;
      if (err.response.statusCode === 400) {
        throw badRequest();
      }
      if (err.response.statusCode === 404) {
        throw notFound();
      }
      if (err.response.statusCode === 200) {
        throw internalServerError();
      }
    }
  });
};
