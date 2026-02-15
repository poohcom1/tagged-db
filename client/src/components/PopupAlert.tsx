import styled from "styled-components";
import Modal from "react-modal";
import { COLORS } from "../styles/colors";
import { WindowHeader } from "./desktop/WindowHeader";
import { POPUP_CONTAINER_Z_INDEX } from "../styles/zIndexes";
import { JSX, useEffect, useState, useSyncExternalStore } from "react";
import { popupStore } from "../utils/popup";

// Styles
const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  gap: 4px;
`;

export const ConfirmRow = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

// Component
export const PopupAlert = () => {
  const currentAlert = useSyncExternalStore(
    popupStore.subscribe,
    popupStore.get,
  );

  // Prompt State
  const [promptValue, setPromptValue] = useState("");

  useEffect(() => {
    if (!currentAlert) {
      return;
    }
    if (currentAlert.type === "prompt") {
      setPromptValue(currentAlert.defaultPrompt ?? "");
    }
  }, [currentAlert]);

  if (!currentAlert) return null;
  let alertComponent: JSX.Element | null = null;

  switch (currentAlert.type) {
    case "alert":
      alertComponent = (
        <>
          <WindowHeader>{currentAlert.title ?? "Alert"}</WindowHeader>
          <Container>{currentAlert?.message}</Container>
          <ConfirmRow>
            <button onClick={() => popupStore.clear({ type: "alert" })}>
              Close
            </button>
          </ConfirmRow>
        </>
      );
      break;
    case "confirm":
      alertComponent = (
        <>
          <WindowHeader>{currentAlert.title ?? "Please confirm"}</WindowHeader>
          <Container>{currentAlert?.message}</Container>
          <ConfirmRow>
            <button
              autoFocus
              onClick={() =>
                popupStore.clear({ type: "confirm", response: true })
              }
            >
              Yes
            </button>
            <button
              onClick={() =>
                popupStore.clear({ type: "confirm", response: false })
              }
            >
              No
            </button>
          </ConfirmRow>
        </>
      );
      break;
    case "prompt":
      alertComponent = (
        <>
          <WindowHeader>{currentAlert.title ?? "Prompt"}</WindowHeader>
          <Container>
            <div>
              {currentAlert?.message}
              <span>:</span>
            </div>
            <input
              style={{ flexGrow: 1 }}
              autoFocus
              type="text"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  popupStore.clear({ type: "prompt", response: promptValue });
                  setPromptValue("");
                }
              }}
            />
          </Container>
          <ConfirmRow>
            <button
              disabled={!promptValue}
              onClick={() => {
                popupStore.clear({ type: "prompt", response: promptValue });
                setPromptValue("");
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => {
                popupStore.clear({ type: "prompt", response: null });
                setPromptValue("");
              }}
            >
              Cancel
            </button>
          </ConfirmRow>
        </>
      );
      break;
  }

  return (
    <Modal
      isOpen={!!currentAlert}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.664)",
          zIndex: POPUP_CONTAINER_Z_INDEX,
        },
        content: {
          position: "absolute",
          width: "fit-content",
          height: "fit-content",
          minWidth: "18%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: COLORS.PANEL,
          borderTop: "3px solid white",
          borderLeft: "3px solid white",
          borderRight: "3px solid black",
          borderBottom: "3px solid black",
          borderRadius: "0",
          padding: "8px",
          zIndex: POPUP_CONTAINER_Z_INDEX,
        },
      }}
    >
      {alertComponent}
    </Modal>
  );
};
