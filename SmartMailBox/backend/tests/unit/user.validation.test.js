const { validateRegisterInput } = require("../../utils/userValidation");

describe("validateRegisterInput", () => {
  test("returns valid when all fields are correct", () => {
    const result = validateRegisterInput({
      username: "marcel",
      email: "marcel@test.com",
      password: "password123"
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test("returns username error when username is missing", () => {
    const result = validateRegisterInput({
      username: "",
      email: "marcel@test.com",
      password: "password123"
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.username).toBe("Username is required");
  });

  test("returns username error when username is only spaces", () => {
    const result = validateRegisterInput({
      username: "     ",
      email: "marcel@test.com",
      password: "password123"
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.username).toBe("Username is required");
  });

  test("returns email error when email is missing", () => {
    const result = validateRegisterInput({
      username: "marcel",
      email: "",
      password: "password123"
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe("Email is required");
  });

  test("returns password error when password is missing", () => {
    const result = validateRegisterInput({
      username: "marcel",
      email: "marcel@test.com",
      password: ""
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.password).toBe("Password is required");
  });
});