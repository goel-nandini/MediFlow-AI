"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SeverityBarChartProps {
  severity: number;
}

const SEVERITY_SCALE = [
  { label: "Minimal", range: "1–2", value: 2,  fill: "#16A34A" },
  { label: "Mild",    range: "3–4", value: 4,  fill: "#5FA8D3" },
  { label: "Moderate",range: "5–6", value: 6,  fill: "#F59E0B" },
  { label: "High",    range: "7–8", value: 8,  fill: "#F97316" },
  { label: "Severe",  range: "9–10",value: 10, fill: "#DC2626" },
];

export function SeverityBarChart({ severity }: SeverityBarChartProps) {
  const data = SEVERITY_SCALE.map((item) => ({
    ...item,
    current: severity >= item.value ? item.value : severity > item.value - 2 ? severity - (item.value - 2) : 0,
  }));

  const activeIndex = SEVERITY_SCALE.findIndex(
    (item) => severity <= item.value
  );

  const chartData = SEVERITY_SCALE.map((item, idx) => ({
    name: item.label,
    value: idx === activeIndex ? severity : idx < activeIndex ? item.value : 0,
    fill: item.fill,
    active: idx === activeIndex,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#BEE9E8" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#1B4965", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fontSize: 10, fill: "#1B4965" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #BEE9E8",
            fontSize: "12px",
            fontWeight: 600,
            color: "#1B4965",
          }}
          cursor={{ fill: "rgba(202,233,255,0.3)" }}
          formatter={(value: number) => [`${value} / 10`, "Score"]}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.active ? entry.fill : "#BEE9E8"}
              opacity={entry.active ? 1 : 0.45}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
