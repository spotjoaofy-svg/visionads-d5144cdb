import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: { v: number }[];
  positive?: boolean;
}

export function SparklineChart({ data, positive = true }: SparklineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={positive ? "hsl(160, 84%, 39%)" : "hsl(0, 72%, 59%)"}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
