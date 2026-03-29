import React, { useState, useEffect } from "react";
import API from "../services/api";

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
    loadFailureTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      alert("Test entry submitted successfully!");

      // Reset the form after submission
      setForm({
        boardSerial: "",
        result: "",
        stationId: "",
        failureType: "",
        failureDescription: "",
        testDuration: "",
      });
    } catch (error) {
      console.error("Error submitting test entry:", error);
      console.error("Error response:", error.response?.data);
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map((err) => err.msg)
          .join(", ");
        alert(`Validation Error: ${validationErrors}`);
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Error submitting test entry. Please check all required fields.");
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
              className="test-entry__input"
              required
            />
          </div>

          <div className="test-entry__field">
            <label className="test-entry__label test-entry__label--required">
              Station ID
            </label>
            <input
              type="text"
              name="stationId"
              value={form.stationId}
              onChange={handleChange}
              placeholder="Station ID"
              className="test-entry__input"
              required
            />
          </div>

          <div className="test-entry__field">
            <label className="test-entry__label test-entry__label--required">
              Test Result
            </label>
            <select
              name="result"
              value={form.result}
              onChange={handleChange}
              className="test-entry__select"
              required
            >
              <option value="">Select Test Result</option>
              <option value="PASS">Pass</option>
              <option value="FAIL">Fail</option>
            </select>
          </div>

          <div className="test-entry__field">
            <label className="test-entry__label">Test Duration (seconds)</label>
            <input
              type="number"
              name="testDuration"
              value={form.testDuration}
              onChange={handleChange}
              placeholder="Test duration in seconds"
              className="test-entry__input"
              min="0"
              step="0.1"
            />
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
                className="test-entry__select"
                required={form.result === "FAIL"}
              >
                <option value="">Select Failure Type</option>
                {failureTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.code} - {type.name}
                  </option>
                ))}
              </select>
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
                className="test-entry__textarea"
                required={form.result === "FAIL"}
                maxLength="500"
              />
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
