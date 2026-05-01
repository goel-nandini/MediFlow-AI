"use client";

import React from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ConsultEffectivenessChartProps {
  severity: number;
}

export function ConsultEffectivenessChart({ severity }: ConsultEffectivenessChartProps) {
  // Mock data showing frequency of visits vs treatment effectiveness (score 0-100)
  const data = [
    { month: "Jan", consults: 1, effectiveness: 45 },
    { month: "Feb", consults: 2, effectiveness: 55 },
    { month: "Mar", consults: 1, effectiveness: 65 },
    { month: "Apr", consults: 3, effectiveness: 60 },
    { month: "May", consults: 1, effectiveness: 85 },
    { month: "Jun", consults: 2, effectiveness: Math.min(100, Math.max(30, 95 - severity * 4)) },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#BEE9E8" vertical={false} />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 11, fill: "#1B4965", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          yAxisId="left" 
          tick={{ fontSize: 10, fill: "#1B4965" }} 
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "#5FA8D3" }} 
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
        />
        <Legend 
          wrapperStyle={{ fontSize: "11px", fontWeight: 600, color: "#1B4965" }}
        />
        <Bar 
          yAxisId="left" 
          dataKey="consults" 
          name="Consults" 
          barSize={20} 
          fill="#1B4965" 
          radius={[4, 4, 0, 0]}
        />
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="effectiveness" 
          name="Effectiveness (%)" 
          stroke="#5FA8D3" 
          strokeWidth={3} 
          dot={{ r: 4, fill: "#fff", stroke: "#5FA8D3", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
