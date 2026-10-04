"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const config = {
  reads: { label: "Reads", color: "var(--brand)" },
} satisfies ChartConfig

/** Single-series reads chart: brand line, 8% area fill, hairline grid. */
function ReadsChart({
  data,
}: {
  data: { label: string; reads: number }[]
}) {
  return (
    <ChartContainer config={config} className="aspect-[800/260] w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--hairline)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={Math.floor(data.length / 3)}
          tick={{ fill: "var(--ink-subtle)", fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={32}
          tick={{ fill: "var(--ink-subtle)", fontSize: 12 }}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area
          dataKey="reads"
          type="monotone"
          stroke="var(--color-reads)"
          strokeWidth={2.5}
          fill="var(--color-reads)"
          fillOpacity={0.08}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export { ReadsChart }
