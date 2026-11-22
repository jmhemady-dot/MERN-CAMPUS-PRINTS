function errorMessage(error) {
  if (!error.response) return 'Cannot reach Campus Prints API. Check that the Express server is running.';
  return error.response.data?.error || 'Something went wrong. Please try again.';
}


export { errorMessage };
