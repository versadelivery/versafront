import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { checkCatalogItemCodes } from "@/api/requests/catalog_item/requests";

const DEBOUNCE_MS = 300;
const MIN_BARCODE_LENGTH = 8;

function useDebounced<T>(value: T, delay = DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

interface CodeCheckInput {
  barcode: string;
  scaleCode: string;
  exceptId?: string;
}

// Asks the API (300ms after the last keystroke or scan) which item already uses these codes.
export function useCodeCheck({ barcode, scaleCode, exceptId }: CodeCheckInput) {
  const barcodeValue = barcode.length >= MIN_BARCODE_LENGTH ? barcode : '';
  // Cada valor é debounced separado: um objeto novo a cada render rearmaria o timer para sempre
  const settled = { barcode: useDebounced(barcodeValue, DEBOUNCE_MS), scaleCode: useDebounced(scaleCode, DEBOUNCE_MS) };
  const typing = barcodeValue !== settled.barcode || scaleCode !== settled.scaleCode;
  const hasCode = !!(settled.barcode || settled.scaleCode);

  const { data, isFetching } = useQuery({
    queryKey: ["catalog-code-check", settled.barcode, settled.scaleCode, exceptId],
    queryFn: () => checkCatalogItemCodes({ barcode: settled.barcode, scale_code: settled.scaleCode, except_id: exceptId }),
    enabled: hasCode,
  });

  return {
    checking: typing || isFetching,
    barcodeOwner: typing ? null : data?.barcode_item ?? null,
    scaleCodeOwner: typing ? null : data?.scale_code_item ?? null,
    barcodeFree: !typing && !isFetching && !!settled.barcode && !!data && !data.barcode_item,
    scaleCodeFree: !typing && !isFetching && !!settled.scaleCode && !!data && !data.scale_code_item,
  };
}
