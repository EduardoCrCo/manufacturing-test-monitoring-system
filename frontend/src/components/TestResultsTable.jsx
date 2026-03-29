import React from "react";

const TestResultsTable = ({ data }) => {
  // Ensure data is an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p>No test results available.</p>;
  }

  return (
    <div className="table">
      <h2 className="table__title">Recent Test Results</h2>
      <table className="table__element">
        <thead>
          <tr className="table__header">
            <th className="table__header-cell">Station</th>
            <th className="table__header-cell">Board Serial</th>
            <th className="table__header-cell">Result</th>
            <th className="table__header-cell">Duration (s)</th>
            <th className="table__header-cell">Timestamp</th>
            <th className="table__header-cell">Operator</th>
          </tr>
        </thead>
        <tbody>
          {data.map((test) => (
            <tr key={test._id} className="table__row">
              <td className="table__cell">{test.stationId}</td>
              <td className="table__cell">{test.boardSerial}</td>
              <td className="table__cell">
                <span
                  className={`table__result ${test.result === "PASS" ? "table__result--pass" : "table__result--fail"}`}
                >
                  {test.result}
                </span>
              </td>
              <td className="table__cell">{test.testDuration || "N/A"}</td>
              <td className="table__cell">
                {new Date(test.timestamp).toLocaleString()}
              </td>
              <td className="table__cell">
                {test.operatorId?.username || "Unknown"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestResultsTable;
