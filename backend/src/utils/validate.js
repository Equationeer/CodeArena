const validator = require("validator");

const validate = (data) => {
  const mandatoryFields = ["firstName", "emailId", "password"];
  const isAllowed = mandatoryFields.every((k) => Object.keys(data).includes(k));

  if (!isAllowed) {
    throw new Error("Missing required credentials (firstName, emailId, password)");
  }
  if (!data.firstName || data.firstName.trim().length < 3) {
    throw new Error("Name must be at least 3 characters long");
  }
  if (!validator.isEmail(data.emailId)) {
    throw new Error("Please enter a valid email address");
  }
  if (!validator.isStrongPassword(data.password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })) {
    throw new Error("Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character");
  }
};

module.exports = validate;