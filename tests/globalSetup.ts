const backendUrl = process.env.E2E_BACKEND_URL || "http://127.0.0.1:8000";

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const waitForBackend = async (): Promise<void> => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${backendUrl}/api/test/health`);
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
  await fetch(`${backendUrl}/api/test/reset`, { method: "POST" });
}

export default globalSetup;
