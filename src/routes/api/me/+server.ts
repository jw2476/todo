import { getUser } from '$lib/tasks.js';
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
    const { username, start, end } = user;

    return new Response(JSON.stringify({ username, start, end }));
}
