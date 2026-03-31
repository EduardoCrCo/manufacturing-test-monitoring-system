import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  getDashboardMetrics,
  getTestResults,
  getAvailableStations,
  getFailureAnalysis,
  getStationMetrics,
} from "../services/testService";
import { useToast } from "../context/ToastContext";
import YieldChart from "../components/YieldChart";
import BarChartComponent from "../components/BarChartComponent";
import KpiCard from "../components/KpiCard";
import TestResultsTable from "../components/TestResultsTable";
import FilterSection from "../components/FilterSection";

const Dashboard = () => {
  const { showError, showSuccess } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [tests, setTests] = useState([]);
  const [failureAnalysis, setFailureAnalysis] = useState([]);
  const [stationMetrics, setStationMetrics] = useState([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New filter state structure - separate quick and advanced filters
  const [quickFilters, setQuickFilters] = useState({
    result: "all",
    stationId: "",
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    boardSerial: "",
    operator: "",
    failureType: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [availableStations, setAvailableStations] = useState([]);

  // Debounce refs
  const debounceRef = useRef({});

  // Fetch available stations
  const fetchAvailableStations = async () => {
    try {
      const data = await getAvailableStations();
      setAvailableStations(data.data || []);
    } catch (error) {
      console.error("Error fetching available stations:", error);
      setAvailableStations([]);
    }
  };

  // Fetch dashboard data with error handling
  const fetchData = async () => {
    try {
      setError(null); // Reset error before fetch
      const data = await getDashboardMetrics();
      setMetrics(data.data); // Extract data from response
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard metrics. Please try again.");
    }
  };

  // Fetch failure analysis data
  const fetchFailureAnalysis = async (filters = {}) => {
    try {
      setError(null);
      const data = await getFailureAnalysis(filters);
      setFailureAnalysis(data.data || []);
    } catch (error) {
      console.error("Error fetching failure analysis:", error);
      setFailureAnalysis([]);
    }
  };

  // Fetch station metrics for multiple stations
  const fetchStationMetrics = async () => {
    try {
      setError(null);
      if (availableStations.length > 0) {
        const stationPromises = availableStations.map(async (station) => {
          try {
            const data = await getStationMetrics(station.stationId);
            return {
              stationId: station.stationId,
              ...data.data,
            };
          } catch (error) {
            console.error(
              `Error fetching metrics for station ${station.stationId}:`,
              error,
            );
            return null;
          }
        });

        const results = await Promise.all(stationPromises);
        const validResults = results.filter((result) => result !== null);

        setStationMetrics(validResults);
      }
    } catch (error) {
      console.error("Error fetching station metrics:", error);
      setStationMetrics([]);
    }
  };

  // Fetch test results with error handling and filters
  const fetchTestResults = async (filters = {}) => {
    try {
      setError(null); // Reset error before fetch
      console.log("Fetching test results with filters:", filters);

      const combinedFilters = {
        ...filters,
        result: filters.result || quickFilters.result,
        stationId: filters.stationId || quickFilters.stationId,
        boardSerial: filters.boardSerial || advancedFilters.boardSerial,
        operator: filters.operator || advancedFilters.operator,
        failureType: filters.failureType || advancedFilters.failureType,
      };

      const testData = await getTestResults(combinedFilters);
      setTests(testData.data?.results || []); // Safe access with fallback

      console.log(
        "Test results fetched:",
        testData.data?.results?.length || 0,
        "results",
      );
    } catch (error) {
      console.error("Error fetching test results:", error);

      if (error.type === "NETWORK_ERROR") {
        setError("Network connection failed. Please check your connection.");
        showError("Network connection failed. Please check your connection.");
      } else if (error.type === "TIMEOUT_ERROR") {
        setError("Request timed out. Please try again.");
        showError("Request timed out. Please try again.");
      } else {
        setError("Failed to load test results. Please try again.");
        showError(
          error.message || "Failed to load test results. Please try again.",
        );
      }

      setTests([]); // Set empty array on error
      throw error; // Re-throw for filter handlers to catch
    }
  };

  // Combined fetch function for initial load and retry
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Add minimum 1-second delay to show loading state + fetch data
      await Promise.all([
        fetchData(),
        fetchTestResults(),
        fetchFailureAnalysis(),
        new Promise((resolve) => setTimeout(resolve, 1000)), // 1 second minimum delay
      ]);
    } catch (error) {
      // Errors are handled in individual fetch functions
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchAvailableStations();
  }, []);

  // Fetch station metrics when available stations are loaded
  useEffect(() => {
    if (availableStations.length > 0) {
      fetchStationMetrics();
    }
  }, [availableStations]);

  // Count active filters for display
  const getActiveFiltersCount = () => {
    let count = 0;
    if (quickFilters.result !== "all") count++;
    if (quickFilters.stationId !== "") count++;
    if (showAdvanced) {
      if (advancedFilters.boardSerial !== "") count++;
      if (advancedFilters.operator !== "") count++;
      if (advancedFilters.failureType !== "") count++;
    }
    return count;
  };

  // Filter handlers - now trigger backend calls
  const applyFilters = useCallback(
    async (combinedFilters, showToast = true) => {
      try {
        await fetchTestResults(combinedFilters);
        if (showToast) {
          const activeFilters = Object.entries(combinedFilters)
            .filter(([key, value]) => value && value !== "all")
            .map(([key, value]) => `${key}: ${value}`);
          if (activeFilters.length > 0) {
            showSuccess(`Filters applied: ${activeFilters.join(", ")}`);
          }
        }
      } catch (error) {
        console.error("Filter error:", error);
        showError("Failed to apply filters. Please try again.");
      }
    },
    [fetchTestResults, showSuccess, showError],
  );

  const handleQuickFilterChange = (field, value) => {
    setQuickFilters((prev) => {
      const newFilters = { ...prev, [field]: value };
      const combinedFilters = {
        result: field === "result" ? value : prev.result,
        stationId: field === "stationId" ? value : prev.stationId,
        boardSerial: advancedFilters.boardSerial,
        operator: advancedFilters.operator,
        failureType: advancedFilters.failureType,
      };

      // For select dropdowns, apply immediately
      if (field === "result") {
        applyFilters(combinedFilters, true);
      } else {
        // For text inputs, use debouncing
        if (debounceRef.current.quickFilter) {
          clearTimeout(debounceRef.current.quickFilter);
        }
        debounceRef.current.quickFilter = setTimeout(() => {
          applyFilters(combinedFilters, false);
        }, 500);
      }

      return newFilters;
    });
  };

  const handleAdvancedFilterChange = (field, value) => {
    setAdvancedFilters((prev) => {
      const newFilters = { ...prev, [field]: value };
      const combinedFilters = {
        result: quickFilters.result,
        stationId: quickFilters.stationId,
        boardSerial: field === "boardSerial" ? value : prev.boardSerial,
        operator: field === "operator" ? value : prev.operator,
        failureType: field === "failureType" ? value : prev.failureType,
      };

      // Clear existing debounce for this field
      if (debounceRef.current[field]) {
        clearTimeout(debounceRef.current[field]);
      }

      // Debounce the API call to prevent spam
      debounceRef.current[field] = setTimeout(() => {
        applyFilters(combinedFilters, false);
      }, 500);

      return newFilters;
    });
  };

  const handleToggleAdvanced = () => {
    setShowAdvanced((prev) => !prev);
  };

  const handleClearFilters = async () => {
    try {
      // Clear all debounced timeouts
      Object.values(debounceRef.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
      debounceRef.current = {};

      setQuickFilters({ result: "all", stationId: "" });
      setAdvancedFilters({ boardSerial: "", operator: "", failureType: "" });
      setShowAdvanced(false);
      // Fetch all data without filters
      await fetchTestResults({});
      showSuccess("All filters cleared successfully.");
    } catch (error) {
      console.error("Clear filters error:", error);
      showError("Failed to clear filters. Please try again.");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
      </div>
      <p className="dashboard__description">
        Dashboard for Manufacturing Test Monitoring System
      </p>

      {/* Loading State */}
      {isLoading && (
        <div className="dashboard__loading">
          <div className="dashboard__spinner"></div>
          <h3 className="dashboard__loading-title">Loading Dashboard...</h3>
          <p className="dashboard__loading-text">
            Fetching your manufacturing test data
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="dashboard__error">
          <h3 className="dashboard__error-title">⚠️ Error Loading Data</h3>
          <p className="dashboard__error-text">{error}</p>
          <button onClick={fetchAllData} className="dashboard__error-btn">
            🔄 Retry
          </button>
        </div>
      )}

      {/* Success State - Show Dashboard Content */}
      {!isLoading && !error && metrics && (
        <div className="dashboard__content">
          {/* KPI Cards and Charts */}
          <div className="dashboard__metrics">
            <div className="dashboard__cards">
              <KpiCard title="Total Tests" value={metrics.totalBoards} />
              <KpiCard title="Passed Tests" value={metrics.passedBoards} />
              <KpiCard title="Failed Tests" value={metrics.failedBoards} />
              <KpiCard
                title="Yield"
                value={`${metrics.firstPassYield?.toFixed(2)}%`}
              />
            </div>
            <div className="dashboard__charts">
              <YieldChart
                data={{
                  passed: metrics.passedBoards,
                  failed: metrics.failedBoards,
                }}
                failureAnalysis={failureAnalysis}
              />
              <BarChartComponent
                data={{
                  passed: metrics.passedBoards,
                  failed: metrics.failedBoards,
                }}
                stationData={stationMetrics}
                type={stationMetrics.length > 0 ? "stations" : "basic"}
              />
            </div>
          </div>

          {/* New Filter Section */}
          <FilterSection
            quickFilters={quickFilters}
            advancedFilters={advancedFilters}
            showAdvanced={showAdvanced}
            onQuickFilterChange={handleQuickFilterChange}
            onAdvancedFilterChange={handleAdvancedFilterChange}
            onToggleAdvanced={handleToggleAdvanced}
            onClearFilters={handleClearFilters}
            availableStations={availableStations}
            activeFiltersCount={getActiveFiltersCount()}
          />

          {/* Test Results Table */}
          {tests.length > 0 ? (
            <TestResultsTable data={tests} />
          ) : (
            <div className="dashboard__no-results">
              <p className="dashboard__no-results-text">
                No test results found matching current filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="dashboard__clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
