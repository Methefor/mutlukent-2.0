'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SalesTrend } from "@/lib/actions/dashboard"
import ReactECharts from 'echarts-for-react'
import React from 'react'

interface SalesChartProps {
    data: SalesTrend[]
}

export function SalesChart({ data }: SalesChartProps) {
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        const checkMobile = () => {
             setIsMobile(window.innerWidth < 768)
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

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
            left: isMobile ? 40 : 60,
            right: isMobile ? 20 : 40,
            bottom: isMobile ? 40 : 60,
            top: 60,
            containLabel: true
        },
        legend: {
            orient: isMobile ? 'horizontal' : 'vertical',
            bottom: isMobile ? 0 : 'auto',
            right: isMobile ? 'auto' : 10,
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
                <ReactECharts option={option} style={{ height: isMobile ? '300px' : '400px' }} />
            </CardContent>
        </Card>
    )
}
