import { Result } from "@app/shared/result";
import { SheetData, SheetMeta } from "@app/shared/types/sheet";
import { localStorageBackend } from "./localStorageBackend";
import { SheetAction } from "@app/shared/types/action";
import { apiBackend } from "./apiBackend";

export interface StorageBackend {
  getSheets(): Promise<Result<SheetMeta[]>>;
  renameSheet(id: string, title: string): Promise<Result<void>>;
  deleteSheet(id: string): Promise<Result<void>>;
  createSheet(title: string): Promise<Result<SheetMeta>>;

  getSheetData(sheetId: string): Promise<Result<SheetData>>;
  updateSheet(sheetId: string, SheetAction: SheetAction): Promise<Result<void>>;
}

export const REMOTE_URL_PARAM = "remote";

export const setCurrentRemote = (remoteUrl: string) => {
  if (!remoteUrl) {
    window.history.pushState(null, "", window.location.pathname);
    return;
  }
  window.history.pushState(
    null,
    "",
    `${window.location.pathname}?${REMOTE_URL_PARAM}=${remoteUrl}`,
  );
};

export const getCurrentRemote = (searchParam: string): StorageBackend => {
  const remoteUrl = getCurrentRemoteUrl(searchParam);
  if (remoteUrl) {
    return apiBackend(remoteUrl);
  }
  return localStorageBackend;
};

export const getCurrentRemoteUrl = (searchParamString: string): string => {
  const searchParam = new URLSearchParams(searchParamString);
  return searchParam.get(REMOTE_URL_PARAM) || "";
};
