import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const WaterCharts = ({ chartData, qualityData, COLORS }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "20px",
        marginTop: "30px"
      }}
    >
      <div>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            marginBottom: "12px",
            color: "#01579b",
            textAlign: "center"
          }}
        >
          Parameter Values vs Safe Limits
        </h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0288d1" name="Current Value" />
              <Bar dataKey="max" fill="#ff6b6b" name="Max Safe Limit" />
              <Bar dataKey="min" fill="#4caf50" name="Min Safe Limit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Water Quality Status */}
      <div>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            marginBottom: "12px",
            color: "#01579b",
            textAlign: "center"
          }}
        >
          Water Quality Status
        </h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={qualityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {qualityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WaterCharts;
