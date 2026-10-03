import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface BidChartPoint {
  time: string;
  price: number;
}

// 입찰가 추이 그래프. recharts가 무거워 상품 상세에서 지연 로딩한다
export default function BidChart({ data }: { data: BidChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="time"
          stroke="#9ca3af"
          style={{ fontSize: "11px" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#9ca3af"
          style={{ fontSize: "11px" }}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            fontSize: "12px",
            padding: "8px 12px",
          }}
          formatter={(value: number) => [`${value.toLocaleString()}원`, "입찰가"]}
          labelStyle={{ fontWeight: "600", marginBottom: "4px", fontSize: "11px" }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#000"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
