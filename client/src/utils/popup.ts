// Types
type PopupInfo =
  | {
      type: "alert" | "confirm";
      message: string;
      title?: string;
    }
  | {
      type: "prompt";
      message: string;
      title?: string;
      defaultPrompt?: string;
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
    };

// API
export const popupAlert = async (message: string): Promise<void> => {
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
): Promise<string | null> => {
  setPopupAlert({ type: "prompt", message, defaultPrompt, title });
  const response = await new Promise<PopupResponse>((resolve) => {
    currentDoneCallback = resolve;
  });
  currentDoneCallback = null;
  return response.type === "prompt" ? response.response : null;
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
