import { Hono } from "@hono/hono";
import eventRouter from "./event/event.route.ts";

const app = new Hono()

app.use('*', async (c, next) => {
  console.log('INCOMING:', c.req.method, c.req.path);
  await next();
})

app.route("/api", eventRouter);

app.notFound((c) => {
  console.log('NOT FOUND:', c.req.method, c.req.path);
  return c.json({ error: 'Route not found', path: c.req.path }, 404);
});



Deno.serve(app.fetch)