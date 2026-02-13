import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiBackend } from "./apiBackend";
import { localStorageBackend } from "./localStorageBackend";
import { StorageBackend } from "./storageBackend";

export const REMOTE_URL_PARAM = "remote";

const getCurrentBackendKey = (searchParamString: string): StorageBackend => {
  const searchParam = new URLSearchParams(searchParamString);
  const url = searchParam.get(REMOTE_URL_PARAM);
  if (url) {
    return apiBackend(url);
  }
  return localStorageBackend;
};

export const useStorageBackend = () => {
  const { search } = useLocation();

  const [selectedStorage, setSelectedStorage] = useState<StorageBackend>(
    getCurrentBackendKey(search),
  );

  // Set storage key based on URL
  useEffect(() => {
    setSelectedStorage(getCurrentBackendKey(search));
  }, [search]);

  // Set backend based on storage key
  const storageBackend = useMemo(() => {
    if (selectedStorage.backendType === "local") {
      return localStorageBackend;
    }
    return apiBackend(selectedStorage.url);
  }, [selectedStorage]);

  // Update URL base on storage key
  useEffect(() => {
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}${storageBackend.queryParam ? `?${storageBackend.queryParam}` : ""}`,
    );
  }, [storageBackend.queryParam]);

  const setUseLocalStorage = useCallback(
    () => setSelectedStorage(localStorageBackend),
    [],
  );

  const setUseRemoteBackend = useCallback(
    (url: string) => setSelectedStorage(apiBackend(url)),
    [],
  );

  return {
    storageBackend,
    setUseLocalStorage,
    setUseRemoteBackend,
  };
};
