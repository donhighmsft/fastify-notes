"use strict";
const data = require("../data");
const util = require("util");

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    //console.dir(data());
    //return { data: await data() };
    //reply.send(await data());
    return (await data()).toString();
  });
};
