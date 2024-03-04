import { JWT_SECRET } from '$env/static/private';
import { db } from '$lib/db.js';
import { generateSchedule } from '$lib/schedule.js';
import { tasks, users } from '$lib/schema.js';
import { getTasks } from '$lib/tasks.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function POST({ request, cookies }) {
    const { id } = await request.json();
    const token = cookies.get("token");
    if (token == null) {
        return error(401);
    }

    let username = await jwt.verify(token, JWT_SECRET);
    if (typeof username != "string") { return error(400, "Bad token"); }
    const user = await db.query.users.findFirst({ where: eq(users.username, username) });
    if (user == null) {
        return error(404);
    }

    const task = await db.query.tasks.findFirst({ where: eq(tasks.id, id) });
    if (task == null) {
        return error(404);
    }

    if (task.user_id != user.id) {
        return error(401);
    }

    if (task.repeat) {
        await db.update(tasks).set({ 
            startAfter: new Date(task.startAfter.getTime() + task.repeat * (24 * 3600 * 1000)),
            deadline: new Date(task.deadline.getTime() + task.repeat * (24 * 3600 * 1000)) 
        }).where(eq(tasks.id, task.id));
    } else {
        await db.delete(tasks).where(eq(tasks.id, task.id));
    }

    const taskList = await getTasks(user);
    if (typeof taskList === "number") {
        return error(taskList);
    }
    await generateSchedule(user, taskList);

    return new Response()
}