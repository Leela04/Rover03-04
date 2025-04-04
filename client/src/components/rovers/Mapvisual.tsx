import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { SensorData as SensorDataType } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export interface SensorDataProps {
  className?: string;
  roverId: number;
}

const MapVisual = ({ className, roverId }: SensorDataProps) => {
  const { data: sensorData, isLoading } = useQuery<SensorDataType[]>({
    queryKey: [`/api/rovers/${roverId}/sensor-data`],
    refetchInterval: 2000,
  });

  // Get latest sensor data
  const latestSensorData =
    sensorData && sensorData.length > 0 ? sensorData[0] : null;

  // Format chart data - last 20 entries in reverse order for timeline
  const chartData = sensorData
    ? [...sensorData]
        .reverse()
        .slice(0, 20)
        .map((data) => ({
          time: new Date(data.timestamp).toLocaleTimeString(),
          temperature: data.temperature,
          //*humidity: data.humidity,
          //*pressure: data.pressure ? data.pressure / 10 : 0, // Scale down for visualization
          cpuUsage: data.cpuUsage,
          memoryUsage: data.memoryUsage,
          distanceTraveled: data.distanceTraveled,
          trips: data.trips,
          lastposition: data.lastPosition || { latitude: 0, longitude: 0 },
        }))
    : [];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {/* Position & Orientation */}
      <div>
        <h4 className="text-sm font-medium mb-3">Position & Orientation</h4>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-center h-40">
          <div className="w-full h-full relative">
            {latestSensorData?.latitude && latestSensorData?.longitude ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-medium">Map Visualization</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Position: {latestSensorData.latitude.toFixed(4)}°,{" "}
                    {latestSensorData.longitude.toFixed(4)}°
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No position data available
              </div>
            )}

            {latestSensorData?.latitude && (
              <>
                <div className="absolute top-2 right-2 bg-white bg-opacity-75 p-1 rounded text-xs">
                  GPS Signal:{" "}
                  {(latestSensorData.signalStrength || 0) > 70
                    ? "Strong"
                    : "Weak"}
                </div>
                <div className="absolute bottom-2 left-2 bg-white bg-opacity-75 p-1 rounded text-xs">
                  Coordinates: {latestSensorData.latitude.toFixed(4)}°,{" "}
                  {latestSensorData.longitude.toFixed(4)}°
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
            <div className="text-xs text-muted-foreground">Distance</div>
            <div className="font-medium text-sm">
              {latestSensorData?.distanceTraveled?.toFixed(0) || "--"}m
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
            <div className="text-xs text-muted-foreground">Trips Count</div>
            <div className="font-medium text-sm">
              {latestSensorData?.trips?.toFixed(0) || "--"}
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
            <div className="text-xs text-muted-foreground">Last Position</div>
            <div className="font-medium text-sm">
              {latestSensorData?.lastPosition
                ? `${latestSensorData.lastPosition.latitude?.toFixed(
                    2
                  )}, ${latestSensorData.lastPosition.longitude?.toFixed(2)}`
                : "--"}
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
            <div className="text-xs text-muted-foreground">Speed</div>
            <div className="font-medium text-sm">
              {latestSensorData?.speed?.toFixed(1) || "--"}m/s
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MapVisual;
