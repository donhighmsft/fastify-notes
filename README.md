### **Main vscode plugins**

- #### ***JavaScript Pack***

- #### ***node-snippets*** 

- #### ***Node.js Extension Pack***

- #### ***Fastify Snippets***

- #### ***Bracket Pair Colorizer***

- #### ***Fastify code snippets***

- #### ***Node.js Modules Intellisense***  
<br/>

### **Creating starters**

### **express**

```sh
npm i -g express-generator@4 
express --hbs express-web-server
```

### **fastify**

```sh
npm init fastify
npm install
```

***or***

```sh
npm init fastify -- --integrate #(if package.json already exists)
npm install
```

### **Main Fastify Plugins**

```sh
npm i --save fastify-static
npm i --save point-of-view 
npm i --save got
npm i fastify-reply-from
npm i fastify-http-proxy fastify
npm i --save-dev fastify-static
```

----
***Serving web content***

- fastify plugin (fastify-static)

we can then configure fastify static in the app.js file. Here we define our static folder to be public

```jsx
const fastifyStatic = dev && require('fastify-static')

if (dev) {
    fastify.register(fastifyStatic, {
      root: path.join(__dirname, 'public')
    })
  }
```

we can create static html files in public folder, and if we link to other files, we have to add the .html extension

```jsx
<a href='/hello.html'>Hello</a>
```

However, if we want to alias hello to hello.html we can create a hello folder in routes, with an index.js file that defines "sendFile" for that route '/hello'

```jsx
module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    return reply.sendFile('hello.html')
  })
}
```

It will now to serve it from public bcz we've defined public there in app.js

----

### Using Templates with Fastify

install dependencies and view rendering plugin

```bash
npm install point-of-view handlebars
```

then in app.js

```jsx
const pointOfView = require('point-of-view')
const handlebars = require('handlebars')

fastify.register(pointOfView, {
    engine: { handlebars },
    root: path.join(__dirname, 'views'),
    layout: 'layout.hbs'
  })
```

we can then create templates in the 'views' folder and put our handlebars

in routes/root.js we need to set a file to render the index.hbs from the views folder

```jsx
module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    return reply.view('index.hbs')
  })
}
```

We can pass any template parameters in the second param of `reply.view`

----
consuming other services

you can use got package

```npm install got```

code sample here <https://github.com/abbathaw/fastify-got>

----

proxying requests (single route, multi origin proxy)

use fastify plugin

```
const replyFrom = require('fastify-reply-from')
fastify.register(replyFrom)

```

In code then you can do sth like this

```js
'use strict'

const { Readable } = require('stream')
async function * upper (res) {
  for await (const chunk of res) {
    yield chunk.toString().toUpperCase()
  }
}

module.exports = async function (fastify, opts) {
  const { httpErrors } = fastify
  fastify.get('/', async function (request, reply) {
    const {url } = request.query
    if (!url) {
      throw httpErrors.badRequest();
    }
    try {
      new URL(url)
    } catch (e) {
      throw httpErrors.badRequest();
    }
    return reply.from(url)
    
    //modifying the reply to uppercase
    // return reply.from(url, {
    //   onResponse (request, reply, res) {
    //     reply.send(Readable.from(upper(res)))
    //   }
    // })
    
  })
}
```

full proxy example (single origin, multi route proxy)

- npm install fastify-http-proxy

then in app.js

```js
'use strict'
const proxy = require('fastify-http-proxy')
module.exports = async function (fastify, opts) {
  fastify.register(proxy, {
    upstream: 'htt‌ps://news.ycombinator.com/'
  })
}
```

- adding a prehandler to the proxy (with fastify-sensible)

```js
const proxy = require('fastify-http-proxy')
const sensible = require('fastify-sensible')
module.exports = async function (fastify, opts) {
  fastify.register(sensible)
  fastify.register(proxy, {
    upstream: 'https://news.ycombinator.com/',
    async preHandler(request, reply) {
      if (request.query.token !== 'abc') {
        throw fastify.httpErrors.unauthorized()
      }
    }
  })
}
```

----

preventing parameter pollution (lab)

- question:
This is a small Express service that uppercases any input sent via a ​un​ query string parameter,but it waits one second before sending the response.This service is vulnerable to parameter pollution. A URL such as<http://localhost:3000/?un=a&un=b>​ will cause the service to crash, assuming the service islistening on port 3000.Fix it, without changing any of the current functionality.

```js

'use strict'
const express = require('express')
const app = express()
const router = express.Router()
const { PORT = 3000 } = process.env

router.get('/', (req, res, next) => {
  
  if (!req.query.un) {
    var error = new Error('Bad Request')
    error.status = 400
    next(error);
    return
  }
  if (Array.isArray(req.query.un)) {
    console.log("what is", req.query.un)
    res.send(req.query.un.map(o=> {
    setTimeout(() => {
        return (o || '').toUpperCase()
      }, 1000)
    }))
  } else {
    setTimeout(() => {
      res.send((req.query.un || '').toUpperCase())
    }, 1000)
  }
})

app.use(router)
```

### **Validation and Response**

```js
//Validate the Post
{
    data: {
        brand: "samsung",
        color: "black"
    }
}

const postOptions = {
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
```

```js
//Validate the Querystring

http://www.test.com?name=test&excitement=1

const queryOptions = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        name: { type: "string" },
        excitement: { type: "integer" },
      },
    },
  },
};
```
