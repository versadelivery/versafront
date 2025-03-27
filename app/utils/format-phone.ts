export const formatPhone = (value: string): string => {
  if (!value) return "";
  const cleaned = value.replace(/\D/g, '');
  const limited = cleaned.slice(0, 13);
  
  if (limited.length <= 2) {
    return `+${limited}`;
  } else if (limited.length <= 4) {
    return `+${limited.slice(0, 2)} (${limited.slice(2)}`;
  } else if (limited.length <= 6) {
    return `+${limited.slice(0, 2)} (${limited.slice(2, 4)}) ${limited.slice(4)}`;
  } else if (limited.length <= 11) {
    return `+${limited.slice(0, 2)} (${limited.slice(2, 4)}) ${limited.slice(4, 9)}-${limited.slice(9)}`;
  } else {
    return `+${limited.slice(0, 2)} (${limited.slice(2, 4)}) ${limited.slice(4, 9)}-${limited.slice(9, 13)}`;
  }
};