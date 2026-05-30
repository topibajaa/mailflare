"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authFetch, clearClientSessionToken } from "@/lib/auth/client";

export function LogoutButton() {
	const router = useRouter();
	return (
		<Button
			variant="outline"
			className="w-full"
			onClick={async () => {
				await authFetch("/api/auth/logout", { method: "POST", redirectOnUnauthorized: false });
				clearClientSessionToken();
				router.push("/login");
			}}
		>
			Log out
		</Button>
	);
}
