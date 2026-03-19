export async function proxyFetch(
  url: string,
  init: RequestInit,
  maxRedirects = 5
): Promise<Response> {
  let currentUrl = url;
  let remaining = maxRedirects;

  while (remaining > 0) {
    const res = await fetch(currentUrl, { ...init, redirect: "manual" });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) break;
      currentUrl = new URL(location, currentUrl).toString();
      remaining--;
      continue;
    }

    return res;
  }

  return fetch(currentUrl, init);
}
