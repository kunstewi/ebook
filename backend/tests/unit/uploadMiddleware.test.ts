/// <reference types="jest" />
import { checkFileType } from "../../src/middlewares/uploadMiddleware";

describe("checkFileType", () => {
  it("accepts supported image files", () => {
    const callback = jest.fn();

    checkFileType(
      {
        originalname: "cover.jpg",
        mimetype: "image/jpeg",
      } as Express.Multer.File,
      callback as any
    );

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it("rejects non-image files", () => {
    const callback = jest.fn();

    checkFileType(
      {
        originalname: "notes.txt",
        mimetype: "text/plain",
      } as Express.Multer.File,
      callback as any
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(callback.mock.calls[0][0].message).toBe("Error: Images Only!");
  });
});
