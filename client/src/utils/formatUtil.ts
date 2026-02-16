import { StorageBackend } from "../storageBackends/storageBackend";

export function formatBackendName(remote: StorageBackend): string {
  switch (remote.backendType) {
    case "local":
      return "Local Storage";
    case "api":
      return remote.url;
  }
}
