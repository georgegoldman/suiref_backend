// deno-lint-ignore-file no-explicit-any
import { Context } from "@hono/hono";
import { Event } from "./event.interface.ts";
import { EventService } from "./event.service.ts";


export class EventController {
    constructor(private readonly eventService: EventService) {}

    async writeEvent(c: Context) {
        try {
            const { 
                name, 
                eventLocaction, 
                description, 
                free, 
                requireApproval, 
                capacity, 
                imageUrl 
            }: Event = await c.req.json();

            const getCurrentTime = new Date();

            const createdEvent = await this.eventService.createEvent({ 
                name,
                startTime: getCurrentTime,
                endTime: getCurrentTime,
                eventLocaction,
                description, 
                free,
                requireApproval,
                capacity,
                imageUrl,
                leaderBoard: []
            });

            return c.json({
                data: createdEvent
            })
        } catch (error: any) {
            if (error.message === "Record already exist") {
                return c.newResponse(`Event must me unique, by time`, { status: 403})
            }else {
                console.log(error)
            }
        }
    }

    async getAllEvent(c: Context) {
        try {
            const allEvent = await this.eventService.getAllEvent();
            return c.json({
                data: allEvent
            })
        } catch (error: any) {
            console.log(error);
        }
    }

    async readEvent(c: Context) {
        try {
            const id  = c.req.param("id");
            const event = await this.eventService.getEvent(id);
            if (event === null) return c.newResponse(`${id} not found`, {status: 404});
            return c.json({
                data: event
            })
        } catch (error: any) {
            console.log(error)
        }
    }

    async updateEvent(c: Context) {
        try {
            const id  = c.req.param("id");
            const event: Event =  await c.req.json();
            const result = await this.eventService.editEvent(id, event);
            return c.json({
                data: result
            })
        } catch (error: any) {
            console.log(error)
        }
    }
    
    async delete(c: Context) {
        try {
            const id = c.req.param("id");
            const result  = await this.eventService.deleteEvent(id);
            return c.json({
                data: result
            })
        } catch (error: any) {
            if (error.message === "Event record does not exist"){
                return c.newResponse("Event record does not exist", {status: 403})
            }else {
                console.log(error)
            }
        }
    }
}