import { useEffect, useState } from "react";
import type { Sheet } from "@app/shared";

export const MySheetsPage = () => {
  const [sheets, setSheets] = useState<Sheet[]>([]);

  useEffect(() => {
    fetch("/api/my-sheets")
      .then((res) => res.json())
      .then(setSheets);
  }, []);

  return sheets.map((sheet) => <div key={sheet.id}>{sheet.name}</div>);
};
