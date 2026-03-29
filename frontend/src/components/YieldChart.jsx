import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const YieldChart = ({ data, failureAnalysis = [] }) => {
  if (!data && !failureAnalysis.length) return null;

  // If we have failure analysis data, show breakdown by failure type
  let chartData;
  let title;

  if (failureAnalysis.length > 0 && data) {
    // Show passed tests + breakdown of failure types
    chartData = [
      { name: "Passed", value: data.passed, category: "success" },
      ...failureAnalysis.slice(0, 4).map((failure) => ({
        name: failure.failureTypeCode || failure.failureTypeName,
        value: failure.count,
        category: "failure",
        fullName: failure.failureTypeName,
      })),
    ];

    // If there are more than 4 failure types, group the rest as "Others"
    if (failureAnalysis.length > 4) {
      const otherFailures = failureAnalysis
        .slice(4)
        .reduce((sum, failure) => sum + failure.count, 0);
      if (otherFailures > 0) {
        chartData.push({
          name: "Other Failures",
          value: otherFailures,
          category: "failure",
        });
      }
    }

    title = "Test Results & Failure Types";
  } else if (data) {
    // Fallback to simple pass/fail
    chartData = [
      { name: "Passed", value: data.passed, category: "success" },
      { name: "Failed", value: data.failed, category: "failure" },
    ];
    title = "Test Results Distribution";
  }

  // Enhanced color palette
  const getColor = (entry, index) => {
    if (entry.category === "success") return "#4CAF50";
    if (entry.category === "failure") {
      const failureColors = [
        "#F44336",
        "#FF7043",
        "#FF5722",
        "#D84315",
        "#BF360C",
      ];
      return failureColors[index % failureColors.length];
    }
    return "#757575";
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
            {data.fullName || data.name}
          </p>
          <p style={{ margin: "4px 0 0 0", color: "#666" }}>
            Count: <strong>{data.value}</strong>
          </p>
          {data.category === "failure" && (
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#999" }}>
              Failure Type
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  }) => {
    if (percent < 0.05) return null; // Hide labels for slices smaller than 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={20}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry, index)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "14px",
            }}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {entry.payload.fullName || value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default YieldChart;
