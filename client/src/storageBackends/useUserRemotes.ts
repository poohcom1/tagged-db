import { useState, useEffect, useCallback } from "react";

interface RemoteBackend {
  url: string;
}

const LS_KEY_REMOTES = "remotes";

const getRemoteBackends = () => {
  const backendsString = localStorage.getItem(LS_KEY_REMOTES);
  return backendsString ? (JSON.parse(backendsString) as RemoteBackend[]) : [];
};

// User set remotes
export const useUserRemotes = () => {
  const [remotes, setBackends] = useState<RemoteBackend[]>(getRemoteBackends());

  // Load from localStorage on mount
  useEffect(() => {
    const backendsString = localStorage.getItem(LS_KEY_REMOTES);
    if (backendsString) {
      setBackends(JSON.parse(backendsString));
    }
  }, []);

  // Persist whenever backends change
  useEffect(() => {
    localStorage.setItem(LS_KEY_REMOTES, JSON.stringify(remotes));
  }, [remotes]);

  const addRemoteBackend = useCallback((backend: RemoteBackend) => {
    setBackends((prev) => [...prev, backend]);
  }, []);

  const removeRemoteBackend = useCallback((backend: RemoteBackend) => {
    setBackends((prev) => prev.filter((b) => b.url !== backend.url));
  }, []);

  return {
    remotes,
    addRemote: addRemoteBackend,
    removeRemote: removeRemoteBackend,
  };
};
