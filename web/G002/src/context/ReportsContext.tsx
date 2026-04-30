import React, { createContext, useContext, useState } from 'react';
import { initialReports } from '../data/initialData';
import type { Report } from '../types';

interface ReportsContextValue {
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  return (
    <ReportsContext.Provider value={{ reports, setReports }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used inside ReportsProvider');
  return ctx;
}
