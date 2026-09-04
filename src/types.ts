export interface NPKData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export interface SensorData {
  soilMoisture: number;
  npk: NPKData;
  temperature: number;
  humidity: number;
  timestamp: string;
}

export interface ChartDataPoint {
  time: string;
  moisture: number;
  temp: number;
}

export interface NotificationItem {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'moisture' | 'weather' | 'pest' | 'market' | 'npk' | 'system';
}

