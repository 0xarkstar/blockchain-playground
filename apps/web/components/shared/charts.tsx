"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

const DEFAULT_COLORS = [
  "#228be6", // blue.6
  "#fa5252", // red.6
  "#40c057", // green.6
  "#fab005", // yellow.6
  "#7950f2", // violet.6
  "#fd7e14", // orange.6
  "#15aabf", // cyan.6
  "#e64980", // pink.6
];

interface BaseChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  height?: number;
}

interface CartesianChartProps extends BaseChartProps {
  xKey: string;
  yKeys: string[];
  colors?: string[];
}

interface PieChartProps extends BaseChartProps {
  nameKey: string;
  valueKey: string;
  colors?: string[];
}

interface BarChartComponentProps extends CartesianChartProps {
  grouped?: boolean;
}

function getColor(colors: string[] | undefined, index: number): string {
  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  return palette[index % palette.length];
}

export function SimpleLineChart({
  data,
  xKey,
  yKeys,
  colors,
  height = 300,
}: CartesianChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {yKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={getColor(colors, i)}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({
  data,
  xKey,
  yKeys,
  colors,
  height = 300,
  grouped = false,
}: BarChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {yKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={getColor(colors, i)}
            stackId={grouped ? undefined : "stack"}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimplePieChart({
  data,
  nameKey,
  valueKey,
  colors,
  height = 300,
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={getColor(colors, i)} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SimpleAreaChart({
  data,
  xKey,
  yKeys,
  colors,
  height = 300,
}: CartesianChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {yKeys.map((key, i) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={getColor(colors, i)}
            fill={getColor(colors, i)}
            fillOpacity={0.3}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
