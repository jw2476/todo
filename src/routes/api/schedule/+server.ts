import { generateSchedule } from '$lib/schedule.js';
import { getTasks, getUser } from '$lib/tasks.js';
import { error } from '@sveltejs/kit';

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

    let schedule = generateSchedule(user, tasks);

    return new Response(JSON.stringify(schedule));
}
