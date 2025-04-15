import React, { useState } from "react";
import { Shield, Zap, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import RoverList from "@/components/rovers/RoverList";

export interface StatsProps {
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isActive: boolean;
  onClick?: () => void;
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  isActive,
  onClick,
}: StatCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:shadow-lg transition ${
        isActive ? "border-2 border-blue-500 bg-blue-100" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className={`${color} p-3 rounded-full mr-4`}>{icon}</div>
          <div>
            <h3 className="text-muted-foreground text-sm">{title}</h3>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatsData {
  registeredRovers: number;
  enabledRovers: number;
  activeRovers: number;
  inactiveRovers: number;
  systemLogs: number;
}

const Stats = ({ className }: StatsProps) => {
  const [activeCard, setActiveCard] = useState<string>("Active Rovers");

  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className={`grid grid-cols-5  gap-4 mb-6 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 animate-pulse bg-muted rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    /*{
      title: "Registered Rovers",
      value: data?.registeredRovers ?? 0,
      icon: <Shield className="h-6 w-6 text-primary" />,
      color: "bg-primary/10",
      content: (
        <p className="p-4 bg-blue-100 rounded">Registered Rovers Details...</p>
      ),
    },
    {
      title: "Enabled Rovers",
      value: data?.enabledRovers ?? 0,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      color: "bg-green-100",
      content: (
        <p className="p-4 bg-green-100 rounded">Enabled Rovers Details...</p>
      ),
    },*/
    {
      title: "Active Rovers",
      value: data?.activeRovers ?? 0,
      icon: <Zap className="h-6 w-6 text-yellow-300" />,
      color: "bg-secondary/10",
      content: <RoverList /> /*(
        <p className="p-4 bg-yellow-100 rounded">Active Rovers Details...</p>
      ),*/,
    },

    {
      title: "Inactive Rovers",
      value: data?.inactiveRovers ?? 0,
      icon: <XCircle className="h-6 w-6 text-accent-100" />,
      color: "bg-gray-100",
      // <p className="p-4 bg-gray-100 rounded">Inactive Rovers Details...</p>
      content: <RoverList />,
    },
    {
      title: "Inactive Rovers",
      value: data?.inactiveRovers ?? 0,
      icon: <XCircle className="h-6 w-6 text-accent-100" />,
      color: "bg-gray-100",
      // <p className="p-4 bg-gray-100 rounded">Inactive Rovers Details...</p>
      content: <RoverList />,
    },
    /*
    {
      title: "System Logs",
      value: data?.systemLogs ?? 0,
      icon: <AlertCircle className="h-6 w-6 text-destructive" />,
      color: "bg-accent/10",
      content: <p className="p-4 bg-red-100 rounded">System Logs Details...</p>,
    },*/
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            isActive={activeCard === stat.title}
            onClick={() =>
              setActiveCard(activeCard === stat.title ? null : stat.title)
            }
          />
        ))}
      </div>

      {/* Row 2, Col 1: RoverList */}
      {activeCard && (
        <div className="col-span-1 bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">{activeCard}</h2>
          {stats.find((stat) => stat.title === activeCard)?.content}

          {/* Takes half the width on larger screens 
          <RoverList />*/}
        </div>
      )}
    </div>
  );
};

export default Stats;
