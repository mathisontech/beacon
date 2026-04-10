import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Usage metrics for date range
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Validate client exists
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get usage metrics grouped by day and type
    const metrics = await prisma.usageMetric.findMany({
      where: {
        clientId: id,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Aggregate metrics by day for charts
    const dailyMetrics: Record<string, any> = {};
    const metricTotals: Record<string, number> = {};

    metrics.forEach((metric) => {
      const day = metric.timestamp.toISOString().split('T')[0];

      if (!dailyMetrics[day]) {
        dailyMetrics[day] = {
          date: day,
          api_calls: 0,
          map_loads: 0,
          alerts_sent: 0,
          active_users: 0,
        };
      }

      dailyMetrics[day][metric.metricType] =
        (dailyMetrics[day][metric.metricType] || 0) + metric.value;

      metricTotals[metric.metricType] =
        (metricTotals[metric.metricType] || 0) + metric.value;
    });

    // Convert to array and sort by date
    const chartData = Object.values(dailyMetrics).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );

    // Get user counts
    const emUsers = await prisma.publicUser.count({
      where: {
        userType: 'em',
        lastActive: { gte: startDate },
      },
    });

    const publicUsers = await prisma.publicUser.count({
      where: {
        userType: 'public',
        lastActive: { gte: startDate },
      },
    });

    // Calculate feature usage for pie chart
    const featureUsage = [
      { name: 'Map Views', value: metricTotals['map_loads'] || 0 },
      { name: 'API Calls', value: metricTotals['api_calls'] || 0 },
      { name: 'Alerts', value: metricTotals['alerts_sent'] || 0 },
      { name: 'Help Requests', value: metricTotals['help_requests'] || 0 },
    ].filter(item => item.value > 0);

    return NextResponse.json({
      success: true,
      data: {
        chartData,
        totals: {
          apiCalls: metricTotals['api_calls'] || 0,
          mapLoads: metricTotals['map_loads'] || 0,
          alertsSent: metricTotals['alerts_sent'] || 0,
          helpRequests: metricTotals['help_requests'] || 0,
          emUsers,
          publicUsers,
        },
        featureUsage,
        period: {
          start: startDate.toISOString(),
          end: new Date().toISOString(),
          days,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching usage metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage metrics' },
      { status: 500 }
    );
  }
}
