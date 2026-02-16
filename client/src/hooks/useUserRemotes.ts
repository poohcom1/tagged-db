import { useState, useEffect, useCallback } from "react";
import { clearAuthToken } from "../utils/authStore";

interface RemoteBackend {
  url: string;
}

const LS_KEY_REMOTES = "tagged_db.remotes";

const getRemoteBackends = () => {
  const backendsString = localStorage.getItem(LS_KEY_REMOTES);
  return backendsString ? (JSON.parse(backendsString) as RemoteBackend[]) : [];
};

// User set remotes
export const useUserRemotes = () => {
  const [remotes, setRemotes] = useState<RemoteBackend[]>(getRemoteBackends());

  // Load from localStorage on mount
  useEffect(() => {
    const backendsString = localStorage.getItem(LS_KEY_REMOTES);
    if (backendsString) {
      setRemotes(JSON.parse(backendsString));
    }
  }, []);

  // Persist whenever backends change
  useEffect(() => {
    localStorage.setItem(LS_KEY_REMOTES, JSON.stringify(remotes));
  }, [remotes]);

  const addRemoteBackend = useCallback((backend: RemoteBackend) => {
    setRemotes((prev) => [...prev, backend]);
  }, []);

  const removeRemoteBackend = useCallback((backend: RemoteBackend) => {
    setRemotes((prev) => prev.filter((b) => b.url !== backend.url));
    clearAuthToken(backend.url);
  }, []);

  return {
    remotes,
    addRemote: addRemoteBackend,
    removeRemote: removeRemoteBackend,
  };
};
