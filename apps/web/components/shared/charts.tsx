"use client";

import { useTheme } from "next-themes";
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

const LIGHT_COLORS = [
  "#228be6", // blue.6
  "#fa5252", // red.6
  "#40c057", // green.6
  "#fab005", // yellow.6
  "#7950f2", // violet.6
  "#fd7e14", // orange.6
  "#15aabf", // cyan.6
  "#e64980", // pink.6
];

const DARK_COLORS = [
  "#4dabf7", // blue.4 (brighter)
  "#ff6b6b", // red.4
  "#69db7c", // green.4
  "#ffd43b", // yellow.4
  "#9775fa", // violet.4
  "#ffa94d", // orange.4
  "#3bc9db", // cyan.4
  "#f06595", // pink.4
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

function getColor(
  colors: string[] | undefined,
  index: number,
  isDark: boolean,
): string {
  if (colors && colors.length > 0) {
    return colors[index % colors.length];
  }
  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;
  return palette[index % palette.length];
}

export function SimpleLineChart({
  data,
  xKey,
  yKeys,
  colors,
  height = 300,
}: CartesianChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
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
            stroke={getColor(colors, i, isDark)}
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
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
            fill={getColor(colors, i, isDark)}
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
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
            <Cell key={`cell-${i}`} fill={getColor(colors, i, isDark)} />
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
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
            stroke={getColor(colors, i, isDark)}
            fill={getColor(colors, i, isDark)}
            fillOpacity={0.3}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
