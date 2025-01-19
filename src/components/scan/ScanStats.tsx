import { Card } from "@/components/ui/card";
import {
  ChartContainer,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

interface ScanStatsProps {
  scanResult: string;
}

export const ScanStats = ({ scanResult }: ScanStatsProps) => {
  // Parse CSV data from scanResult
  const parseData = () => {
    if (!scanResult) return { portData: [], stateData: [] };
    
    const rows = scanResult.split('\n');
    const ports: { [key: string]: number } = {};
    const states: { [key: string]: number } = {};
    
    rows.forEach(row => {
      const columns = row.split(';');
      if (columns[4]) { // Port column
        ports[columns[4]] = (ports[columns[4]] || 0) + 1;
      }
      if (columns[6]) { // State column
        states[columns[6]] = (states[columns[6]] || 0) + 1;
      }
    });

    const portData = Object.entries(ports).map(([port, count]) => ({
      port,
      count,
    }));

    const stateData = Object.entries(states).map(([name, value]) => ({
      name,
      value,
    }));

    return { portData, stateData };
  };

  const { portData, stateData } = parseData();
  const COLORS = ['#00f2ea', '#ffa500', '#ff6b6b', '#4ecdc4'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/80 p-2 rounded-lg border shadow-sm">
          <p className="text-sm font-medium">
            {payload[0].name === "count" ? `Port: ${label}` : payload[0].name}
          </p>
          <p className="text-sm text-muted-foreground">
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card p-6 animate-enter">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-4">Port Distribution</h3>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                bar: {
                  theme: {
                    light: "var(--cyber-teal)",
                    dark: "var(--cyber-teal)",
                  },
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portData}>
                  <XAxis dataKey="port" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Port States</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
};