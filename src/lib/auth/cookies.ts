import { cookies } from "next/headers";
import { SESSION_COOKIE, getUserFromSession } from "@/lib/auth/session";

function getBearerToken(request?: Request): string | undefined {
	const authorization = request?.headers.get("Authorization");
	if (!authorization?.startsWith("Bearer ")) return undefined;
	const token = authorization.slice(7).trim();
	return token || undefined;
}

export async function getCurrentUser(env: CloudflareEnv, request?: Request) {
	const bearerToken = getBearerToken(request);
	if (bearerToken) return getUserFromSession(env, bearerToken);

	const jar = await cookies();
	const token = jar.get(SESSION_COOKIE)?.value;
	return getUserFromSession(env, token);
}

export async function requireUser(env: CloudflareEnv, request?: Request) {
	const user = await getCurrentUser(env, request);
	if (!user) throw new Error("Unauthorized");
	return user;
}
