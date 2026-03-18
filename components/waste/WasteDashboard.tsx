import React from 'react';
import { WasteLog } from '@/types/index';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingDown } from 'lucide-react';

interface WasteDashboardProps {
  logs: WasteLog[];
}

export const WasteDashboard: React.FC<WasteDashboardProps> = ({ logs }) => {
  const categoryData = logs.reduce(
    (acc, log) => {
      log.items.forEach((item) => {
        const existing = acc.find((d) => d.name === item.category);
        if (existing) {
          existing.value += item.weight;
        } else {
          acc.push({ name: item.category, value: item.weight });
        }
      });
      return acc;
    },
    [] as { name: string; value: number }[]
  );

  const dailyData = logs.reduce(
    (acc, log) => {
      const date = formatDate(log.date);
      const existing = acc.find((d) => d.date === date);
      const total = log.items.reduce((sum, item) => sum + item.weight, 0);
      if (existing) {
        existing.waste += total;
      } else {
        acc.push({ date, waste: total });
      }
      return acc;
    },
    [] as { date: string; waste: number }[]
  );

  const totalWaste = logs.reduce(
    (sum, log) => sum + log.items.reduce((itemSum, item) => itemSum + item.weight, 0),
    0
  );

  const avgWastePerDay = logs.length > 0 ? totalWaste / logs.length : 0;

  const COLORS = ['#C5A572', '#2D2D2D', '#9B7A42', '#6B5129', '#DFD8C8'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Total Waste Logged</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {totalWaste.toFixed(1)}
              </p>
              <p className="text-xs text-gray-400 mt-1">grams</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Average per Day</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {avgWastePerDay.toFixed(0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">grams</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Logs Created</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{logs.length}</p>
              <p className="text-xs text-gray-400 mt-1">entries</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {dailyData.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-gray-900">
              Daily Waste Trend
            </h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any) => `${value.toFixed(0)}g`} />
                <Bar dataKey="waste" fill="#C5A572" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-gray-900">
              Waste by Category
            </h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(0)}g`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value.toFixed(0)}g`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-gray-900">Recent Logs</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {logs.slice().reverse().slice(0, 5).map((log) => {
              const logTotal = log.items.reduce((sum, item) => sum + item.weight, 0);
              return (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {formatDate(log.date)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {log.items.length} items • {logTotal.toFixed(0)}g total
                    </p>
                    {log.notes && (
                      <p className="text-sm text-gray-500 italic mt-2">"{log.notes}"</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {log.items.map((item, idx) => (
                        <Badge key={idx} variant="secondary" size="sm">
                          {item.category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
