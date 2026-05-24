function validateRegisterInput({ username, email, password }) {
  const errors = {};

  if (!username || username.trim() === "") {
    errors.username = "Username is required";
  }

  if (!email || email.trim() === "") {
    errors.email = "Email is required";
  } 
  /*
  else if (!email.includes("@")) {
    errors.email = "Email is invalid";
  }
  */

  if (!password || password.trim() === "") {
    errors.password = "Password is required";
  } 
  /*
  else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  */
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  validateRegisterInput
};