```js
//Copy and Paste Info
//npm i fastify-cli -g #install cli
//npm init fastify -- --integrate #(if package.json already exists)

//npm i --save fastify-static
//npm i --save point-of-view 
//npm i --save got
//npm i --save fastify-reply-from
//npm i --save fastify-http-proxy

//Views and Layouts
"use strict";
const path = require("path");
const AutoLoad = require("fastify-autoload");
const pointOfView = require("point-of-view");
const handlebars = require("handlebars");

module.exports = async function (fastify, opts) {
  fastify.register(pointOfView, {
    engine: { handlebars },
    root: path.join(__dirname, "views"),
    layout: "layout.hbs",
  });
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });

  fastify.setNotFoundHandler((request, reply) => {
    if (request.method !== "GET") {
      reply.status(405);
      return "Method Not Allowed\n";
    }
    return "Not Found\n";
  });
};

//index route
"use strict";

module.exports = async (fastify, opts) => {
  fastify.get("/", async (request, reply) => {
    return reply.view("index.hbs");
  });
};

//main route
"use strict";

module.exports = async (fastify, opts) => {
  fastify.get("/", async (request, reply) => {
    const { greeting = "Hello from Me " } = request.query;
    return reply.view(`me.hbs`, { greeting });
  });
};


//Get Rest Services   
"use strict";
const { boat } = require("../../model");
const { promisify } = require("util");

const read = promisify(boat.read);

module.exports = async function (fastify, opts) {
  const { notFound, internalServerError } = fastify.httpErrors;

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
};

//Post and Deletes Services
"use strict";
const { boat } = require("../../model");
const { promisify } = require("util");

const read = promisify(boat.read);
const create = promisify(boat.create);
const del = promisify(boat.del);

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

 //Validate the Querystring
 //http://www.test.com?name=test&excitement=1
 const queryOptions = {
    schema: {
        querystring: {
        type: "object",
        required: ["name", "excitement"],
        properties: {
            name: { type: "string" },
            excitement: { type: "integer" },
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
     
    } catch (error) {
      reply
        .code(500)
        .type("application / json")
        .send({ message: internalServerError() });
    }
  });

  fastify.delete("/:id", async function (request, reply) {
    const { id } = request.params;
    try {
      reply.code(204);
      return await del(id);
    } catch (error) {
      if (error.code === "E_NOT_FOUND") {
        throw notFound();
      } else {
        throw internalServerError();
      }
    }
  });
};


//Aggregating services
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

      reply.type("application/json").send({
        id: boatsvc.id,
        color: boatsvc.color,
        brand: brandsvc.name,
      });
    } catch (err) {
      
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

//proxy app.js
const replyFrom = require("fastify-reply-from");
fastify.register(replyFrom);
   
"use strict";

module.exports = async function (fastify, opts) {
  const urlOpts = {
    querystring: {
      type: "object",
      required:["url"],
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
      throw notFound();
    }
  });

  //full proxy
  const proxy = require("fastify-http-proxy");
  
  fastify.register(proxy, {
    upstream: "https://jsonplaceholder.typicode.com",
  });

  //validate 
  "use strict";
const { promisify } = require("util");
const { boat } = require("../../model");
const { uid } = boat;
const read = promisify(boat.read);
const create = promisify(boat.create);
const del = promisify(boat.del);

module.exports = async (fastify, opts) => {
  const { notFound } = fastify.httpErrors;
  //const DATA_500 = randomBytes(2).toString("hex");

  const postOptions = {
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
  };

  fastify.post("/", { schema: postOptions }, async (request, reply) => {
    const { data } = request.body;
    const id = uid();
    await create(id, data);
    reply.code(201);
    return { id };
  });

  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      await del(id);
      reply.code(204);
    } catch (err) {
      if (err.message === "not found") throw notFound();
      throw err;
    }
  });

  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      return await read(id);
    } catch (err) {
      if (err.message === "not found") throw notFound();
      throw err;
    }
  });
};

//Block Attack
//deny.js
const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  const { forbidden } = fastify.httpErrors;
  fastify.addHook("onRequest", function hook(request, reply, done) {
    if (request.ip === "211.133.33.113") {
      throw forbidden();
    }
    done();
  });
});

```