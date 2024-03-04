import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";
import { error } from "@sveltejs/kit";
import { db } from "$lib/db.js";
import { eq } from "drizzle-orm";
import { tasks, users } from "$lib/schema.js";
import { getTasks, getUser } from "$lib/tasks.js";
import { generateSchedule } from "$lib/schedule.js";

export async function GET({ cookies }) {
    const token = cookies.get("token");
    if (token == null) {
        return error(401);
    }

    const user = await getUser(token);
    if (typeof user == "number") {
        return error(user);
    }

    const tasks = await getTasks(user);
    if (typeof tasks == "number") {
        return error(tasks);
    }

    return new Response(JSON.stringify(tasks));
}

export async function POST({ request, cookies }) {
    let { deadline, duration, title, repeat } = await request.json();
    let deadlineDate = new Date(deadline);
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

    const task = await db.insert(tasks).values({ deadline: deadlineDate, duration, title, user_id: user.id, repeat }).returning({ id: tasks.id });


    const taskList = await getTasks(user);
    if (typeof taskList === "number") {
        return error(taskList);
    }
    await generateSchedule(user, taskList);

    return new Response(JSON.stringify({ id: task[0].id }));
}

export async function DELETE({ request, cookies }) {
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

    await db.delete(tasks).where(eq(tasks.id, id));

    const taskList = await getTasks(user);
    if (typeof taskList === "number") {
        return error(taskList);
    }
    await generateSchedule(user, taskList);

    return new Response();
}

export async function PATCH({ request, cookies }) {
    const { id, deadline, duration, title, repeat } = await request.json();
    let deadlineDate = new Date(deadline);

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

    await db.update(tasks).set({ deadline: deadlineDate, duration, title, repeat }).where(eq(tasks.id, id));

    const taskList = await getTasks(user);
    if (typeof taskList === "number") {
        return error(taskList);
    }
    await generateSchedule(user, taskList);

    return new Response();
}
