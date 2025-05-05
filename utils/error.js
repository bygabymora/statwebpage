const getError = (error) =>
  String(
    error?.response?.data?.message ||
      error?.message ||
      "An unexpected error occurred"
  );

export { getError };
