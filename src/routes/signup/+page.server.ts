import type { Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { schema } from "./schema";
import { db } from "$lib/db";
import { users } from "$lib/schema";
import jwt from "jsonwebtoken";
import { hash } from "bcrypt";
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

        let hashed = await hash(form.data.password, SALT_ROUNDS);

        if (await db.query.users.findFirst({
            where: eq(users.username, form.data.username)
        })) {
            return setError(form, "username", "Username taken");
        }

        await db
            .insert(users)
            .values({ username: form.data.username, password: hashed, start: "09:00", end: "17:00" });

        console.log("Created user");
        let token = jwt.sign(form.data.username, JWT_SECRET);

        event.cookies.set("token", token, { path: "/" });

        redirect(302, "/");

        return { form };
    },
};