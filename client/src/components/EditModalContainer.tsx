import { IoMdClose } from "react-icons/io";
import { BaseButton } from "./BaseButton";
import styled from "styled-components";
import Modal from "react-modal";

// Styles
const Container = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
`;

// Component
interface Props {
  children?: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}

export const EditModalContainer = ({ children, isOpen, onClose }: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.664)",
        },
        content: {
          position: "absolute",
          width: "fit-content",
          height: "fit-content",
          minWidth: "20%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      <Container>
        {children}
        <BaseButton onClick={onClose}>
          <IoMdClose />
        </BaseButton>
      </Container>
    </Modal>
  );
};
