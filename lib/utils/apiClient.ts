export async function fetchApi(url: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(url, {
    cache: "no-store", // Prevents aggressive Next.js fetch caching
    ...options,
    headers,
    credentials: "include", // Send cookies automatically
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `API error ${res.status}`);
  }
  return res.json();
}
