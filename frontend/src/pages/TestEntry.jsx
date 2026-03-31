import React, { useState, useEffect } from "react";
import API from "../services/api";
import { getAvailableStations } from "../services/testService";
import { useToast } from "../context/ToastContext";

const TestEntry = () => {
  const [form, setForm] = useState({
    boardSerial: "",
    result: "",
    stationId: "",
    failureType: "",
    failureDescription: "",
    testDuration: "",
  });

  const [failureTypes, setFailureTypes] = useState([]);
  const [stations, setStations] = useState([]);
  const [errors, setErrors] = useState({});
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // Load failure types for the dropdown
    const loadFailureTypes = async () => {
      try {
        const response = await API.get("/failure-types");
        setFailureTypes(response.data.data || []);
      } catch (error) {
        console.error("Error loading failure types:", error);
      }
    };

    // Load available stations for the dropdown
    const loadStations = async () => {
      try {
        const response = await getAvailableStations();
        setStations(response.data || []);
      } catch (error) {
        console.error("Error loading stations:", error);
      }
    };

    loadFailureTypes();
    loadStations();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Board Serial validation
    if (!form.boardSerial.trim()) {
      newErrors.boardSerial = "Board Serial Number is required";
    } else if (form.boardSerial.length < 8) {
      newErrors.boardSerial = "Board Serial must be at least 8 characters long";
    }

    // Station ID validation
    if (!form.stationId.trim()) {
      newErrors.stationId = "Please select a station";
    } else {
      // Validate that selected station exists in available stations
      const validStation = stations.find(
        (station) => station.stationId === form.stationId,
      );
      if (!validStation) {
        newErrors.stationId = "Please select a valid station from the list";
      }
    }

    // Result validation
    if (!form.result) {
      newErrors.result = "Please select a test result";
    }

    // Test Duration validation (optional but if provided, should be positive)
    if (form.testDuration && parseFloat(form.testDuration) < 0) {
      newErrors.testDuration = "Test duration must be a positive number";
    }

    // Failure-specific validations (only when result is FAIL)
    if (form.result === "FAIL") {
      if (!form.failureType) {
        newErrors.failureType = "Please select a failure type";
      }
      if (!form.failureDescription.trim()) {
        newErrors.failureDescription = "Failure description is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      showError("Please correct the errors before submitting");
      return;
    }

    try {
      // Prepare data for backend
      const submitData = {
        stationId: form.stationId,
        boardSerial: form.boardSerial,
        result: form.result.toUpperCase(),
      };

      // Add failure-related fields if result is FAIL
      if (form.result.toUpperCase() === "FAIL") {
        if (form.failureType) {
          submitData.failureType = form.failureType;
        }
        if (form.failureDescription) {
          submitData.failureDescription = form.failureDescription;
        }
      }

      // Add test duration if provided
      if (form.testDuration) {
        submitData.testDuration = parseFloat(form.testDuration);
      }

      console.log("Sending data to backend:", submitData);
      const response = await API.post("/test-results", submitData);
      console.log("Test entry submitted:", response.data);
      showSuccess("Test entry submitted successfully!");

      // Reset the form after submission
      setForm({
        boardSerial: "",
        result: "",
        stationId: "",
        failureType: "",
        failureDescription: "",
        testDuration: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error submitting test entry:", error);
      console.error("Error response:", error.response?.data);
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map((err) => err.msg)
          .join(", ");
        showError(`Validation Error: ${validationErrors}`);
      } else if (error.response?.data?.message) {
        showError(`Error: ${error.response.data.message}`);
      } else {
        showError(
          "Error submitting test entry. Please check all required fields.",
        );
      }
    }
  };

  return (
    <div className="test-entry">
      <div className="test-entry__header">
        <h1 className="test-entry__title">Test Entry</h1>
        <p className="test-entry__description">
          Test Entry page for Manufacturing Test Monitoring System
        </p>
      </div>

      <form onSubmit={handleSubmit} className="test-entry__form">
        <div className="test-entry__form-grid">
          <div className="test-entry__field">
            <label className="test-entry__label test-entry__label--required">
              Board Serial Number
            </label>
            <input
              type="text"
              name="boardSerial"
              value={form.boardSerial}
              onChange={handleChange}
              placeholder="Board Serial Number"
              className={`test-entry__input ${
                errors.boardSerial ? "test-entry__input--error" : ""
              }`}
              required
            />
            {errors.boardSerial && (
              <div className="test-entry__field-error">
                {errors.boardSerial}
              </div>
            )}
          </div>

          <div className="test-entry__field">
            <label className="test-entry__label test-entry__label--required">
              Station
            </label>
            <select
              name="stationId"
              value={form.stationId}
              onChange={handleChange}
              className={`test-entry__select ${
                errors.stationId ? "test-entry__select--error" : ""
              }`}
              required
            >
              <option value="">Select a Station</option>
              {stations.map((station) => (
                <option key={station.stationId} value={station.stationId}>
                  {station.stationId} - {station.name}
                </option>
              ))}
            </select>
            {errors.stationId && (
              <div className="test-entry__field-error">{errors.stationId}</div>
            )}
          </div>

          <div className="test-entry__field">
            <label className="test-entry__label test-entry__label--required">
              Test Result
            </label>
            <select
              name="result"
              value={form.result}
              onChange={handleChange}
              className={`test-entry__select ${
                errors.result ? "test-entry__select--error" : ""
              }`}
              required
            >
              <option value="">Select Test Result</option>
              <option value="PASS">Pass</option>
              <option value="FAIL">Fail</option>
            </select>
            {errors.result && (
              <div className="test-entry__field-error">{errors.result}</div>
            )}
          </div>

          <div className="test-entry__field">
            <label className="test-entry__label">Test Duration (seconds)</label>
            <input
              type="number"
              name="testDuration"
              value={form.testDuration}
              onChange={handleChange}
              placeholder="Test duration in seconds"
              className={`test-entry__input ${
                errors.testDuration ? "test-entry__input--error" : ""
              }`}
              min="0"
              step="0.1"
            />
            {errors.testDuration && (
              <div className="test-entry__field-error">
                {errors.testDuration}
              </div>
            )}
          </div>
        </div>

        {form.result === "FAIL" && (
          <div className="test-entry__conditional">
            <h3 className="test-entry__conditional-title">
              🔴 Failure Details
            </h3>

            <div className="test-entry__field">
              <label className="test-entry__label test-entry__label--required">
                Failure Type
              </label>
              <select
                name="failureType"
                value={form.failureType}
                onChange={handleChange}
                className={`test-entry__select ${
                  errors.failureType ? "test-entry__select--error" : ""
                }`}
                required={form.result === "FAIL"}
              >
                <option value="">Select Failure Type</option>
                {failureTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.code} - {type.name}
                  </option>
                ))}
              </select>
              {errors.failureType && (
                <div className="test-entry__field-error">
                  {errors.failureType}
                </div>
              )}
            </div>

            <div className="test-entry__field">
              <label className="test-entry__label test-entry__label--required">
                Failure Description
              </label>
              <textarea
                name="failureDescription"
                value={form.failureDescription}
                onChange={handleChange}
                placeholder="Describe the failure in detail..."
                className={`test-entry__textarea ${
                  errors.failureDescription ? "test-entry__textarea--error" : ""
                }`}
                required={form.result === "FAIL"}
                maxLength="500"
              />
              {errors.failureDescription && (
                <div className="test-entry__field-error">
                  {errors.failureDescription}
                </div>
              )}
            </div>
          </div>
        )}

        <button type="submit" className="test-entry__submit">
          Submit Test Entry
        </button>
      </form>
    </div>
  );
};

export default TestEntry;
