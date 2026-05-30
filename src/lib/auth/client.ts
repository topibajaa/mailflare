"use client";

import type { AuthFetchOptions, AuthSessionResponse } from "./client-types";

const SESSION_STORAGE_KEY = "mailflare-session-token";

export function getClientSessionToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function setClientSessionToken(token: string): void {
	localStorage.setItem(SESSION_STORAGE_KEY, token);
}

export function clearClientSessionToken(): void {
	localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getAuthHeaders(headers?: HeadersInit): Headers {
	const nextHeaders = new Headers(headers);
	const token = getClientSessionToken();
	if (token && !nextHeaders.has("Authorization")) {
		nextHeaders.set("Authorization", `Bearer ${token}`);
	}
	return nextHeaders;
}

export async function authFetch(input: RequestInfo | URL, init: AuthFetchOptions = {}): Promise<Response> {
	const { redirectOnUnauthorized = true, headers, ...requestInit } = init;
	const response = await fetch(input, {
		...requestInit,
		headers: getAuthHeaders(headers),
	});

	if (response.status === 401 && redirectOnUnauthorized && typeof window !== "undefined") {
		clearClientSessionToken();
		window.location.assign("/login");
	}

	return response;
}

export async function persistAuthSession(response: Response): Promise<AuthSessionResponse> {
	const data = (await response.json()) as AuthSessionResponse;
	if (response.ok && data.token) setClientSessionToken(data.token);
	return data;
}
