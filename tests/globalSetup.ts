const backendUrl = process.env.E2E_BACKEND_URL || "http://127.0.0.1:8000";
const requestTimeoutMs = 2_000;

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (
  input: string,
  init?: RequestInit
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const waitForBackend = async (): Promise<void> => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetchWithTimeout(`${backendUrl}/api/test/health`);
      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Retry until the e2e server is ready.
    }

    await sleep(500);
  }

  throw new Error(`Timed out waiting for e2e backend at ${backendUrl}`);
};

async function globalSetup(): Promise<void> {
  await waitForBackend();
  const response = await fetchWithTimeout(`${backendUrl}/api/test/reset`, {
    method: "POST",
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Failed to reset e2e backend at ${backendUrl}: ${response.status} ${response.statusText}${responseText ? ` - ${responseText}` : ""}`
    );
  }
}

export default globalSetup;
