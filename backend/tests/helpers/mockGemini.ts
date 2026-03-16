type GeminiMode = "json" | "text" | "error";

const state: {
  mode: GeminiMode;
  text: string;
  error: Error;
} = {
  mode: "text",
  text: "Mock Gemini response",
  error: new Error("Mock Gemini error"),
};

export const mockGeminiSuccessJson = (payload: unknown): void => {
  state.mode = "json";
  state.text = JSON.stringify(payload);
};

export const mockGeminiSuccessRawText = (text: string): void => {
  state.mode = "text";
  state.text = text;
};

export const mockGeminiError = (message = "Mock Gemini error"): void => {
  state.mode = "error";
  state.error = new Error(message);
};

export const resetGeminiMock = (): void => {
  state.mode = "text";
  state.text = "Mock Gemini response";
  state.error = new Error("Mock Gemini error");
};

export const googleGenerativeAiModuleMock = {
  GoogleGenerativeAI: class GoogleGenerativeAIMock {
    constructor(_apiKey: string) {}

    getGenerativeModel() {
      return {
        generateContent: async () => {
          if (state.mode === "error") {
            throw state.error;
          }

          return {
            response: Promise.resolve({
              text: () => state.text,
            }),
          };
        },
      };
    }
  },
};
