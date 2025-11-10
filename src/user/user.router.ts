import { Hono } from "@hono/hono";
import { init_db } from "../db.ts";
import { UserService } from "./user.service.ts";
import { UserController } from "./user.controller.ts";

const userRouter = new Hono();
const db = await init_db();
const userService = new UserService(db);
const userControler = new UserController(userService)

userRouter.post("/user", async (c) => await userControler.writeUser(c));
userRouter.get("/users", async (c) => await userControler.readAll(c));
userRouter.get("/user/:id", async (c) => await userControler.readUser(c));
userRouter.get("/user-by-username/:username", async (c) => await userControler.readUserByFromUsername(c))
userRouter.put("/user/:id", async (c) => await userControler.editUser(c));
userRouter.delete("/user/:id", async (c) => await userControler.deleteUser(c));

export default userRouter;