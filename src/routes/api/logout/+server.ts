export async function GET({ cookies }) {
    cookies.delete("token", { path: "/" });

    return new Response();
}