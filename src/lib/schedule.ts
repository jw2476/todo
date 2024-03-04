import { eq } from "drizzle-orm";
import { db } from "./db";
import type { User } from "./schema";
import * as schema from "./schema";
import type { Task } from "./types";

function end(time: string, day: Date): Date {
    let day_copy = new Date(day.getTime());
    let hours = parseInt(time.substring(0, 2));
    let minutes = parseInt(time.substring(3, 5));
    day_copy.setHours(hours);
    day_copy.setMinutes(minutes);
    day_copy.setSeconds(0);
    return day_copy;
}

function nextDay(time: string, day: Date): Date {
    let day_copy = new Date(day.getTime());
    let hours = parseInt(time.substring(0, 2));
    let minutes = parseInt(time.substring(3, 5));
    day_copy.setHours(hours);
    day_copy.setMinutes(minutes);
    day_copy.setSeconds(0);
    day_copy.setMilliseconds(0);
    return new Date(day_copy.getTime() + 24 * 3600 * 1000);
}

export async function generateSchedule(user: User, tasks: Array<Task>) {
    const sorted: Array<Task> = tasks.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    let start: Date = new Date(Date.now());
    sorted.forEach(task => {
        const next_day = nextDay(user.start, start);
        const day_end = end(user.end, start);
        if (day_end.getTime() < (start.getTime() + task.duration * 1000)) { // If the task would finish after the day's ended, move it to the beginning of the next day
            start = next_day;
        }
        
        if (start.getTime() < task.startAfter.getTime()) {
            start = task.startAfter;
        }

        task.scheduled = start; // Schedule in this task
        (async () => await db.update(schema.tasks).set({ scheduled: start }).where(eq(schema.tasks.id, task.id)))();
        start = new Date(start.getTime() + task.duration * 1000); // Advance the start time by the task's duration
    });
}