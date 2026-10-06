'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PRINTER_CONFIG, getPrinterConfig, PrinterConfig } from '@/services/printer-config';

export function usePrinterConfig() {
  const [config, setConfig] = useState<PrinterConfig>(DEFAULT_PRINTER_CONFIG);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setConfig(await getPrinterConfig());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);
  return { config, setConfig, loading, reload };
}
