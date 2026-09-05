import { useState, useCallback } from 'react';

export function useHistory() {
  const [records, setRecords] = useState([]);

  const addRecord = useCallback((result, file) => {
    setRecords((prev) => [
      {
        id: Date.now(),
        timestamp: new Date(),
        filename: file?.name || 'Unknown',
        status: result.status,
        risk_score: result.risk_score,
        document: result.document,
        checks: result.checks,
        reasons: result.reasons,
        result,
      },
      ...prev,
    ]);
  }, []);

  const clearHistory = useCallback(() => setRecords([]), []);

  return { records, addRecord, clearHistory };
}
