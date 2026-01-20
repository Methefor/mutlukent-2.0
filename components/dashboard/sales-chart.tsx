'use client'

import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SalesTrend } from "@/lib/actions/dashboard"

interface SalesChartProps {
    data: SalesTrend[]
}

export function SalesChart({ data }: SalesChartProps) {
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: function (params: any) {
                const param = params[0]
                return `
          <div class="font-bold">${param.name}</div>
          <div>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(param.value)}</div>
        `
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.map(item => item.date),
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                lineStyle: {
                    color: '#f3f4f6'
                }
            },
            axisLabel: {
                formatter: (value: number) => {
                    if (value >= 1000) {
                        return `${(value / 1000).toFixed(0)}k`
                    }
                    return value
                }
            }
        },
        series: [
            {
                name: 'Satış',
                type: 'line',
                data: data.map(item => item.amount),
                smooth: true,
                showSymbol: false,
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(14, 165, 233, 0.5)' // sky-500
                        }, {
                            offset: 1, color: 'rgba(14, 165, 233, 0)'
                        }]
                    }
                },
                itemStyle: {
                    color: '#0ea5e9'
                },
                lineStyle: {
                    width: 3,
                    color: '#0ea5e9'
                }
            }
        ]
    };

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Haftalık Satış Trendi</CardTitle>
            </CardHeader>
            <CardContent>
                <ReactECharts option={option} style={{ height: '350px' }} />
            </CardContent>
        </Card>
    )
}
