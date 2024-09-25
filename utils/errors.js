const getInvalidUsernameError = () => {
  const error = new Error();
  error.name = 'InvalidUsername';
  return error;
};

const getIncorrectPasswordError = () => {
  const error = new Error();
  error.name = 'PasswordValidationFailed';
  return error;
};

export { getInvalidUsernameError, getIncorrectPasswordError };
