export interface ProcessLogData {
  timestamp: string;
  status: string;
  message: string;
  details: {
    totalOrdersProcessed?: number; // Optional, to be included only when successful
    durationInMilliseconds: number; // Renamed for clarity
  };
}
