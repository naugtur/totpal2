// @ts-check

const data = {};

const styles = `
<style>
@import url('https://fonts.googleapis.com/css?family=Crafty+Girls&display=swap');
* {
    font-family: 'Crafty Girls', cursive;
    font-size: 15pt;
    text-align: center;
    margin: 1em auto;
    padding: 0.3em;
    color:#333;
}
input, a {
    background: #fff;
    border: 1px solid #555;
    text-decoration: none;
    cursor: pointer;
}
small, small * {
    font-size: 0.7em;
    border: none;
}
</style>
`;

const head = `
    <head>
        <meta charset="UTF-8">
        <!-- hello from fastify -->
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${styles}
    </head>
`;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const fastify = require("fastify")({
  logger: true,
});

fastify.get("/", async (request, reply) => {
  reply.redirect(`/${Math.random().toFixed(5).substring(2)}`);
});

fastify.decorateRequest("game", "");

fastify.addHook("preHandler", async (request, reply) => {
  if (request.params.game) {
    const game = request.params.game.replace(/[^0-9]+/g, "");
    if (!data[game]) {
      data[game] = [];
    }
    request.game = game;
  }
  return;
});

fastify.get("/:game", async (request, reply) => {
  if (request.query.entry) {
    data[request.game].push(request.query.entry);
    return reply.redirect(`/${request.game}`); //FIXME
  }
  if (request.query.clear) {
    data[request.game] = [];
    return reply.redirect(`/${request.game}`);
  }

  reply.type("text/html").code(200);
  return `
    ${head}
    <h2>Two of these people are lying.</h2>
    <small>Game ${request.game}</small>
    <form method="GET">
    <input type="text" name="entry" autofocus>
    &nbsp;
    <input type="submit" value="add">
    </form>
    Added ${data[request.game].length} articles
    <p>
    <a href="/${request.game}/pick">pick one</a>
    <a onclick=" navigator.clipboard.writeText('${request.headers.host}/${
    request.game
  }')">copy game link</a>
    </p>
    <br>
    <p><small><a href="https://www.youtube.com/watch?v=3yFEfOYTNoE">Learn the rules of the game</a></small></p>
    `;
});

fastify.get("/:game/pick", async (request, reply) => {
  const result = pickRandom(data[request.game]);
  reply.type("text/html").code(200);
  return `${head}<h1>${result}</h1><a href="/${request.game}?clear=y">clear</a>&nbsp;<a href="/${request.game}">back</a>`;
});

fastify.get("/trustmeimrandom", (request, reply) => {
  const list = ["A", "B", "C"];
  const scores = { A: 0, B: 0, C: 0 };

  for (let i = 0; i < 10000000; i++) {
    scores[pickRandom(list)]++;
  }
  reply.type("application/json").code(200);
  return scores;
});

fastify.listen(3000, (err, address) => {
  if (err) throw err;
  fastify.log.info(`> ${address}`);
});
