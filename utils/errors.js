const getInvalidUsernameError = () => {
  return createErrorWithName('InvalidUsername');
};

const getIncorrectPasswordError = () => {
  return createErrorWithName('PasswordValidationFailed');
};

const getNoTokenProvidedError = () => {
  return createErrorWithName('NoTokenProvided');
};

const getTokenInvalidError = () => {
  return createErrorWithName('InvalidToken');
};

function createErrorWithName(name) {
  const error = new Error();
  error.name = name;
  return error;
}

export {
  getInvalidUsernameError,
  getIncorrectPasswordError,
  getTokenInvalidError,
  getNoTokenProvidedError,
};
