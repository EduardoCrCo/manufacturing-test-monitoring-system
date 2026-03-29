import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BarChartComponent = ({ data, stationData = [], type = "basic" }) => {
  if (!data && !stationData.length) return null;

  let chartData;
  let title;

  if (type === "stations" && stationData.length > 0) {
    // Show data by station
    chartData = stationData.map((station) => ({
      name: station.stationId,
      passed: station.passedBoards || 0,
      failed: station.failedBoards || 0,
      total: station.totalBoards || 0,
      yield: station.firstPassYield || 0,
    }));
    title = "Performance by Station";
  } else if (data) {
    // Basic comparison
    chartData = [
      { name: "Passed", value: data.passed, fill: "#4CAF50" },
      { name: "Failed", value: data.failed, fill: "#F44336" },
    ];
    title = "Test Results Comparison";
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      if (type === "stations") {
        const data = payload[0].payload;
        return (
          <div
            className="chart-tooltip"
            style={{
              backgroundColor: "#fff",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold", color: "#333" }}>
              Station: {data.name}
            </p>
            <p style={{ margin: "4px 0 0 0", color: "#4CAF50" }}>
              Passed: <strong>{data.passed}</strong>
            </p>
            <p style={{ margin: "2px 0 0 0", color: "#F44336" }}>
              Failed: <strong>{data.failed}</strong>
            </p>
            <p style={{ margin: "2px 0 0 0", color: "#666" }}>
              Yield: <strong>{data.yield.toFixed(1)}%</strong>
            </p>
          </div>
        );
      } else {
        return (
          <div
            className="chart-tooltip"
            style={{
              backgroundColor: "#fff",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold", color: "#333" }}>
              {label}: <strong>{payload[0].value}</strong>
            </p>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: "#ddd" }}
          />
          <YAxis tick={{ fontSize: 12 }} axisLine={{ stroke: "#ddd" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "10px" }} />

          {type === "stations" ? (
            <>
              <Bar
                dataKey="passed"
                fill="#4CAF50"
                name="Passed Tests"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="failed"
                fill="#F44336"
                name="Failed Tests"
                radius={[2, 2, 0, 0]}
              />
            </>
          ) : (
            <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Test Count" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
