// deno-lint-ignore-file no-explicit-any
import { Context } from "@hono/hono";
import { UserService } from "./user.service.ts";
import { User } from "./user.interface.ts";

export class UserController {
    constructor(private readonly userService: UserService) {}

    async writeUser(c: Context){
        // destruct data from json
        try {
            const {
                username,
                avatar,
                address,
            }: User = await c.req.json();
            
            const v = await this.userService.createUser({
                username,
                avatar,
                address,
                ntfs: []
            });
            return c.json({
                data: v
            })
        } catch (error: any) {
            if (error.message === "user already taken") return c.newResponse(`Username already take`, { status: 403});
            console.log(error)
        }
    }

    async readUser(c: Context){
        try {
            const id:string = c.req.param("id");
            const u = await this.userService.getUser(id);
            if (!u) return c.newResponse(`${id} not found`, {status: 404});
            return c.json({
                data: u
            })
        } catch (error) {
            console.log(error)
        }
    }

    async readUserByFromUsername(c: Context) {
        try {
            const username = c.req.param("username");
            if(!username) return c.newResponse("username must be provided", {status: 400});
            const r = await this.userService.getUserByUsername(username);
            return c.json(
                {data: r}
            )
        } catch (error: any) {
            if (error.message === "User lookup failed: record not found.") return c.newResponse("Resource missing", {status: 404});
            console.log(error);
        }
    }

    async readAll(c: Context) {
        try {
            const v = await this.userService.getAllUsers();
            return c.json({
                data: v
            });
        } catch (error) {
            console.log(error)
        }
    }

    async editUser(c: Context){
        try {
            const id: string = await c.req.param("id");
            const upatedUser = await c.req.json();
            const result  = await this.userService.editUser(id, upatedUser);
            return c.json({
                data: result
            })
        } catch (error: any) {
            if (error.message === `no such record`) return c.newResponse("User record does not exist", {status: 403});
            console.log(error)
        }
    }

    async deleteUser(c: Context){
        try {
            const id:string = c.req.param("id");
            const r = await this.userService.removeUser(id);
            return c.json({
                data: r
            })
        } catch (error: any) {
            if (error.message === "no such record") return c.newResponse("User record does not exist", { status: 403 });
            console.log(error)
        }
    }
}