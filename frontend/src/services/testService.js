import API from "./api";

/**
 * Clean filter values to ensure only valid, non-empty values are sent to backend
 * @param {Object} filters - Raw filter object
 * @returns {Object} - Cleaned filter object
 */
const cleanFilters = (filters = {}) => {
  const cleaned = {};

  Object.entries(filters).forEach(([key, value]) => {
    // Skip null, undefined, empty strings, or "all" values
    if (value != null && value !== "" && value !== "all") {
      // Trim string values and ensure they're not just whitespace
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
          cleaned[key] = trimmed;
        }
      } else {
        // For non-string values (numbers, dates, etc.)
        cleaned[key] = value;
      }
    }
  });

  return cleaned;
};

export const getDashboardMetrics = async () => {
  const response = await API.get("/test-results/metrics/dashboard");
  return response.data;
};

export const getTestResults = async (filters = {}) => {
  const cleanedFilters = cleanFilters(filters);

  console.log("Sending filters:", cleanedFilters); // Debug log

  const response = await API.get("/test-results", { params: cleanedFilters });
  return response.data;
};

export const getAvailableStations = async () => {
  const response = await API.get("/test-results/available-stations");
  return response.data;
};

export const getFailureAnalysis = async (filters = {}) => {
  const cleanedFilters = cleanFilters(filters);

  const response = await API.get("/test-results/analysis/failures", {
    params: cleanedFilters,
  });
  return response.data;
};

export const getStationMetrics = async (stationId, filters = {}) => {
  const cleanedFilters = cleanFilters(filters);

  const response = await API.get(`/test-results/metrics/station/${stationId}`, {
    params: cleanedFilters,
  });
  return response.data;
};
