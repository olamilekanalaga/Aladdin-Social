import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import type { Token } from "./models";
export default function Spark({
  token,
  big = false,
}: {
  token: Token;
  big?: boolean;
}) {
  return (
    <div
      className={big ? "spark big" : "spark"}
      role="img"
      aria-label={`${token.ticker} simulated price history`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={token.history.map((value, i) => ({ value, i }))}>
          <defs>
            <linearGradient
              id={`fill-${token.id}-${big}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0"
                stopColor={token.change > 0 ? "#00d99b" : "#f05260"}
                stopOpacity={0.25}
              />
              <stop offset="1" stopColor="#00d99b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              background: "#131b25",
              border: "1px solid #263441",
              fontSize: 11,
            }}
            labelFormatter={() => "Simulated sample"}
          />
          <Area
            type="linear"
            dataKey="value"
            stroke={token.change > 0 ? "#00d99b" : "#f05260"}
            strokeWidth={1.5}
            fill={`url(#fill-${token.id}-${big})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
