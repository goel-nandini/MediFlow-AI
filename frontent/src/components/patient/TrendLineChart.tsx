"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface TrendLineChartProps {
  severity: number;
}

export function TrendLineChart({ severity }: TrendLineChartProps) {
  // Generate plausible mock trend anchored at current severity
  const trend = [
    { day: "Mon", score: Math.max(1, severity - 3) },
    { day: "Tue", score: Math.max(1, severity - 1) },
    { day: "Wed", score: severity               },
    { day: "Thu", score: Math.min(10, severity + 1) },
    { day: "Fri", score: Math.min(10, severity + 2) },
    { day: "Sat", score: Math.min(10, severity + 1) },
    { day: "Sun", score: severity               },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#5FA8D3" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#5FA8D3" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#BEE9E8" vertical={false} />
        <XAxis
          dataKey="day"
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
          formatter={(value: number) => [`${value} / 10`, "Severity"]}
        />
        <ReferenceLine
          y={7}
          stroke="#DC2626"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: "Alert", position: "right", fontSize: 10, fill: "#DC2626", fontWeight: 700 }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#5FA8D3"
          strokeWidth={2.5}
          fill="url(#trendGrad)"
          dot={{ r: 4, fill: "#1B4965", stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "#5FA8D3", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
