import styled from "styled-components";
import { EditButton } from "../../../components/EditButton";
import { BaseButton } from "../../../components/BaseButton";
import { COLORS } from "../../../styles/colors";

// Style
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
`;

const EditContainer = styled.div`
  display: flex;
  align-items: end;
  margin-left: auto;
`;

const ArrowButton = styled(BaseButton)`
  display: flex;
  align-items: end;
  color: #5383a1;
  border: 1px solid transparent;
  &:not(:disabled):hover {
    border: 1px solid #5383a1;
  }
  &:disabled {
    color: #0000002f;
    cursor: default;
  }
`;

export const HeaderButton = styled(EditButton)<{ $underline?: boolean }>`
  text-decoration: ${({ $underline }) =>
    $underline ? "underline" : "inherit"};
  color: ${COLORS.HEADER_TITLE};

  &:hover {
    text-decoration: underline;
  }
`;

// Component
const ArrowLeft = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 100 512"
    width="1em"
    height="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"></path>
  </svg>
);
const ArrowRight = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="100 0 200 512"
    width="1em"
    height="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"></path>
  </svg>
);

interface Props {
  title: string;
  onEdit?: () => void;
  index: number;
  total: number;
  onRight?: () => void;
  onLeft?: () => void;
  onClick?: () => void;
  underline?: boolean;
}

export const HeaderCell = ({
  title,
  onClick,
  onEdit,
  onRight,
  onLeft,
  index,
  total,
  underline,
}: Props) => {
  return (
    <HeaderContainer>
      <HeaderButton onClick={onClick} $underline={underline}>
        {title}
      </HeaderButton>
      <EditContainer>
        <div style={{ width: "4px" }} />
        <ArrowButton onClick={onLeft} disabled={index === 0}>
          <ArrowLeft />
        </ArrowButton>
        <ArrowButton onClick={onRight} disabled={index === total - 1}>
          <ArrowRight />
        </ArrowButton>
        <EditButton onClick={onEdit} style={{ fontWeight: "500" }}>
          edit
        </EditButton>
      </EditContainer>
    </HeaderContainer>
  );
};
