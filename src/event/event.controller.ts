// deno-lint-ignore-file no-explicit-any
import { Context } from "@hono/hono";
import { Event } from "./event.interface.ts";
import { EventService } from "./event.service.ts";
import { ref } from "node:process";


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
                attending: []
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

    async joinEvent(c: Context) {
        try {
            const { eventId, username, referrer } = await c.req.json();
            const result = await this.eventService.joinEvent(eventId, username, referrer);
            return c.json({
                data: result
            })
        } catch (error: any) {
            if (error.message === "user already attending") return c.newResponse("Duplicate record", {status: 409});
            else if(error.message === "No such event") return c.newResponse("Resource missing", {status: 409});
            else console.log(error)
        }
    }

    async leave(c: Context) {
        try {
            const { eventId, username } = await c.req.json();
            const result = await this.eventService.removeAttendee(eventId, username);
            return c.json(
                {
                    data: result
                }
            );
        } catch(error: any) {
            if (error.message === "No such event") return c.newResponse("Resource missing", {status: 409});
            if (error.message === "No such username") return c.newResponse("Resource missing", {status: 409});
        }
    }

    async postLeaderboard(c: Context) {
        try {
            const { referral, eventId } = await c.req.json();
            const result  = await this.eventService.createLeaderboard(referral, eventId);
            return c.json({
                data: result
            })
        } catch (error: any) {
            if (error.message === "user already exist in leaderboard") return c.newResponse("Duplicate record", {status: 409});
            else if(error.message === "there is no such event") return c.newResponse("Resource missing", {status: 404});
            else if (error.message === "Error editing this data") return c.newResponse("Bad input or internal error", {status: 400});
            else if (error.message === "Unable to create leaderboard") return c.newResponse("Failed to process request", {status: 500});
            else console.log(error)
        }
    }

    async writePoint(c: Context) {
        try {
            const { referral, eventId } = await c.req.json();
            const result = await this.eventService.addPoint(referral, eventId);
            return c.json({
                data: result
            })
        } catch (error: any) {
            if (error.message === "there is a problem adding points") return c.newResponse("Invalid data: unable to add points", {status: 400});
            else if (error.message === "user already exist in leaderboard") return c.newResponse("Duplicate record", {status: 409});
            else if(error.message === "there is no such event") return c.newResponse("Resource missing", {status: 404});
            else if (error.message === "Error editing this data") return c.newResponse("Bad input or internal error", {status: 400});
            else if (error.message === "Unable to create leaderboard") return c.newResponse("Failed to process request", {status: 500});
            else console.log(error)
        }
    }

    async getAllLeaderboard(c: Context) {
        try {
            const result  = await this.eventService.readAllLeaderboard();
            return c.json({
                data: result
            })
        } catch (error: any) {
            console.log(error)
        }
    }
}