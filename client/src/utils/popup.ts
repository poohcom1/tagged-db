// Types
export type PopupInfo =
  | {
      type: "alert" | "confirm";
      message: string;
      title?: string;
    }
  | PopupInfoPrompt
  | PopupInfoOptions;

export type PopupInfoPrompt = {
  type: "prompt";
  message: string;
  title?: string;
  defaultPrompt?: string;
  password?: boolean;
};

export type PopupInfoOptions = {
  type: "options";
  title?: string;
  options: string[];
};

type PopupResponse =
  | {
      type: "alert";
    }
  | {
      type: "confirm";
      response: boolean;
    }
  | {
      type: "prompt";
      response: string | null;
    }
  | {
      type: "options";
      response: string | null;
    };

const DELAY_PADDING = 10;

// API
export const popupAlert = async (message: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, DELAY_PADDING));
  setPopupAlert({ type: "alert", message });
  await new Promise<PopupResponse>((resolve) => {
    currentDoneCallback = resolve;
  });
  currentDoneCallback = null;
};

export const popupConfirm = async (
  message: string,
  title?: string,
): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, DELAY_PADDING));
  setPopupAlert({ type: "confirm", message, title });
  const response = await new Promise<PopupResponse>((resolve) => {
    currentDoneCallback = resolve;
  });
  currentDoneCallback = null;
  return response.type === "confirm" && response.response;
};

export const popupPrompt = async (
  message: string,
  title?: string,
  defaultPrompt?: string,
  password: boolean = false,
): Promise<string | null> => {
  setPopupAlert({ type: "prompt", message, defaultPrompt, title, password });
  await new Promise((resolve) => setTimeout(resolve, DELAY_PADDING));
  const response = await new Promise<PopupResponse>((resolve) => {
    currentDoneCallback = resolve;
  });
  currentDoneCallback = null;
  return response.type === "prompt" ? response.response : null;
};

export const popupOptions = async <T extends string>(
  options: T[],
  title?: string,
): Promise<T | null> => {
  setPopupAlert({ type: "options", options, title });
  await new Promise((resolve) => setTimeout(resolve, DELAY_PADDING));
  const response = await new Promise<PopupResponse>((resolve) => {
    currentDoneCallback = resolve;
  });
  currentDoneCallback = null;
  return response.type === "options" ? (response.response as T) : null;
};

// Store
let currentAlert: PopupInfo | null = null;
let currentDoneCallback: ((info: PopupResponse) => void) | null = null;
const subscribers: (() => void)[] = [];

const subscribePopupAlert = (fn: () => void) => {
  subscribers.push(fn);
  return () => {
    subscribers.splice(subscribers.indexOf(fn), 1);
  };
};
const setPopupAlert = (info: PopupInfo) => {
  currentAlert = info;
  subscribers.forEach((fn) => fn());
};
const getPopupAlert = () => currentAlert;
const clearPopupAlert = (response: PopupResponse) => {
  if (currentAlert === null) return;
  if (currentAlert.type !== response.type) return;
  currentAlert = null;
  subscribers.forEach((fn) => fn());
  currentDoneCallback?.(response);
};

export const popupStore = {
  subscribe: subscribePopupAlert,
  get: getPopupAlert,
  clear: clearPopupAlert,
};
