import { getTasks, getUser } from '$lib/tasks.js';
import { error } from '@sveltejs/kit';

export async function load({ cookies }) {
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

    return { tasks };
}