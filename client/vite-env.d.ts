/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly STORAGE_BACKEND: "localStorage" | "server";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
