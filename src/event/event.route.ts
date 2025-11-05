import { Hono } from "@hono/hono";
import { EventController } from "./event.controller.ts";
import { EventService } from "./event.service.ts";
import { init_db } from "../db.ts";

const eventRouter = new Hono();
const db = await init_db()
const eventSevice = new EventService(db)
const eventController = new EventController(eventSevice)

// eventRouter.get("/event", (c) => c.text("router alive")); // quick GET probe
eventRouter.post("/event", async (c) => await eventController.writeEvent(c));
eventRouter.get("/events", async (c) => await eventController.getAllEvent(c));
eventRouter.get("/events/:id", async (c) => await eventController.readEvent(c));
eventRouter.put("/event/:id", async (c) => await eventController.updateEvent(c));
eventRouter.delete("/event/:id", async (c) => await eventController.delete(c))

export default eventRouter;