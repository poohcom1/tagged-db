import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiBackend } from "./apiBackend";
import { localStorageBackend } from "./localStorageBackend";
import { StorageBackend } from "./storageBackend";

export const REMOTE_URL_PARAM = "remote";

const getCurrentBackend = (searchParamString: string): StorageBackend => {
  const searchParam = new URLSearchParams(searchParamString);
  const url = searchParam.get(REMOTE_URL_PARAM);
  if (url) {
    return apiBackend(url);
  }
  return localStorageBackend;
};

export const useStorageBackend = () => {
  const { search } = useLocation();

  const [currentStorage, setCurrentStorage] = useState<StorageBackend>(
    getCurrentBackend(search),
  );

  // Set storage key based on URL
  const currentBackendId = useRef(currentStorage.id);
  useEffect(() => {
    const backend = getCurrentBackend(search);
    if (backend.id !== currentBackendId.current) {
      setCurrentStorage(getCurrentBackend(search));
      currentBackendId.current = backend.id;
    }
  }, [search]);

  // Update URL base on storage key
  useEffect(() => {
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}${currentStorage.queryParam ? `?${currentStorage.queryParam}` : ""}`,
    );
  }, [currentStorage.queryParam]);

  const setUseLocalStorage = useCallback(() => {
    if (
      currentStorage.backendType === "local" &&
      currentStorage.id === localStorageBackend.id
    )
      return;
    setCurrentStorage(localStorageBackend);
  }, [currentStorage]);

  const setUseRemoteBackend = useCallback(
    (url: string) => {
      if (currentStorage.backendType === "api" && currentStorage.url === url)
        return;
      setCurrentStorage(apiBackend(url));
    },
    [currentStorage],
  );

  return {
    storageBackend: currentStorage,
    setUseLocalStorage,
    setUseRemoteBackend,
  };
};
