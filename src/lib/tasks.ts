import { JWT_SECRET } from "$env/static/private";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, type User, tasks } from "./schema";
import jwt from "jsonwebtoken";
import {type Task} from "$lib/types";

export async function getUser(token: string): Promise<User | number> {
    let username = await jwt.verify(token, JWT_SECRET);
    if (typeof username != "string") { return 400; }
    let user = await db.query.users.findFirst({
        where: eq(users.username, username)
    });

    if (user == null) {
        return 404;
    }

    return user;
}

export async function getTasks(user: User): Promise<Array<Task> | number> {
    const ts = await db.query.tasks.findMany({
        where: eq(tasks.user_id, user.id)
    });

    if (ts == null) {
        return 404;
    }

    return ts;
}