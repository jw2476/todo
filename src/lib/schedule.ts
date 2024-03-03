import type { User } from "./schema";
import type { Task } from "./types";

export type ScheduledTask = {
    task: Task,
    start: Date,
}

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

export function generateSchedule(user: User, tasks: Array<Task>): Array<ScheduledTask> {
    const sorted: Array<Task> = tasks.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    let start: Date = new Date(Date.now());
    let schedule: Array<ScheduledTask> = [];
    sorted.forEach(task => {
        const next_day = nextDay(user.start, start);
        const day_end = end(user.end, start);
        if (day_end.getTime() < (start.getTime() + task.duration * 1000)) { // If the task would finish after the day's ended, move it to the beginning of the next day
            start = next_day;
        }

        schedule.push({ start, task }); // Add the task to the schedule
        start =  new Date(start.getTime() + task.duration * 1000); // Advance the start time by the task's duration
    });
    return schedule;
}