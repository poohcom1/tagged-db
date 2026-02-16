declare namespace NodeJS {
  interface ProcessEnv {
    DATA_DIR?: string;
    PORT?: string;
    LOG_JSON?: "true" | "false";

    HTTPS_ENABLED?: "true" | "false";
    CERTS_PATH?: string;
    HTTPS_KEY_PATH?: string;
    HTTPS_CERT_PATH?: string;

    AUTH_TYPE?: "none" | "passkey" | "user";
    AUTH_PASSKEY?: string;
    AUTH_JWT_SECRET?: string;
  }
}
