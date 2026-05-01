"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface HealthPieChartProps {
  severity: number;
  hasConditions: boolean;
  hasAllergies: boolean;
}

export function HealthPieChart({
  severity,
  hasConditions,
  hasAllergies,
}: HealthPieChartProps) {
  const symptomScore  = Math.round((severity / 10) * 50);
  const conditionScore = hasConditions ? 30 : 15;
  const riskScore      = hasAllergies  ? 20 : 10;
  const total          = symptomScore + conditionScore + riskScore;

  const data = [
    { name: "Symptoms",   value: symptomScore,  color: "#1B4965" },
    { name: "Conditions", value: conditionScore, color: "#5FA8D3" },
    { name: "Risk",       value: riskScore,      color: "#62B6CB" },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent,
  }: {
    cx: number; cy: number; midAngle: number;
    innerRadius: number; outerRadius: number; percent: number;
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={85}
          innerRadius={42}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
          strokeWidth={2}
          stroke="#fff"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #BEE9E8",
            fontSize: "12px",
            fontWeight: 600,
            color: "#1B4965",
          }}
          formatter={(value: number) => [`${((value / total) * 100).toFixed(1)}%`, ""]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "11px", fontWeight: 600, color: "#1B4965" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
