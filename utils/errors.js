const getInvalidPasswordError = () => {
  return createErrorWithName('InvalidPassword');
};

const getIncorrectPasswordError = () => {
  return createErrorWithName('IncorrectPassword');
};

const getNoTokenProvidedError = () => {
  return createErrorWithName('NoTokenProvided');
};

const getTokenInvalidError = () => {
  return createErrorWithName('InvalidToken');
};

const getDeleteBlogFailedError = () => {
  return createErrorWithName('DeleteBlogFailed');
};

const getBlogNotFoundError = () => {
  return createErrorWithName('BlogNotFound');
};

const getUserNotFound = () => {
  return createErrorWithName('UserNotFound');
};

function createErrorWithName(name) {
  const error = new Error();
  error.name = name;
  return error;
}

export {
  getInvalidPasswordError,
  getIncorrectPasswordError,
  getTokenInvalidError,
  getNoTokenProvidedError,
  getDeleteBlogFailedError,
  getUserNotFound,
  getBlogNotFoundError,
};
