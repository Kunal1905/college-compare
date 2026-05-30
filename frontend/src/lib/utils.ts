export const formatIndianCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatCompactIndianCurrency = (value: number) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  }

  return `₹${value}`;
};

export const formatPackage = (value: number) => `${value.toFixed(1)} LPA`;

export const formatPercentage = (value: number) => `${value.toFixed(0)}%`;

export const logDevelopmentError = (label: string, error: unknown) => {
  if (process.env.NODE_ENV === "development") {
    console.error(label, error);
  }
};

export const getErrorMessage = (error: unknown, fallback: string) => {
  logDevelopmentError("Frontend request failed:", error);

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return fallback;
};
