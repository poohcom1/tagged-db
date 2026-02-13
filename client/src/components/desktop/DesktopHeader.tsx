import styled from "styled-components";
import { COLORS } from "../../styles/colors";
import { border } from "../../styles/mixins";

const HeaderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 14px);
  height: 24px;

  background-color: ${COLORS.PANEL};
  ${border({})};

  display: flex;
  align-items: center;
  padding: 0 4px;
  gap: 8px;

  font-family: monospace;
  color: ${COLORS.GREY};
  font-weight: 600;
`;

export const DesktopHeader = () => {
  return (
    <HeaderContainer>
      <img height="16px" width="16px" src="/favicon.ico" />
      <div>PocchiOS</div>
      <div>|</div>
      <div>My Tagged DB</div>
    </HeaderContainer>
  );
};
