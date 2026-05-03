export function getBackendUrl(): string {
	const url = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
	if (!url) return "http://localhost:4000";
	return url.replace(/\/$/, "");
}
