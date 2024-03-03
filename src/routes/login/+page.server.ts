import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { schema } from "./schema";
import { db } from "$lib/db";
import { users } from "$lib/schema";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import { JWT_SECRET } from "$env/static/private";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;

export const actions: Actions = {
    default: async (event) => {
        const form = await superValidate(event, zod(schema));
        if (!form.valid) {
            return fail(400, {
                form,
            });
        }

        let user = await db.query.users.findFirst({ where: eq(users.username, form.data.username) });
        if (user == null) {
            return setError(form, "username", "User not found");
        }

        if (!await compare(form.data.password, user.password)) {
            return setError(form, "password", "Incorrect password");
        }

        let token = jwt.sign(form.data.username, JWT_SECRET);

        event.cookies.set("token", token, { path: "/" });

        return { form };
    },
};