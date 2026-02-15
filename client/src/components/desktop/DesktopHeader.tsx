import styled from "styled-components";
import { COLORS } from "../../styles/colors";
import { border, center } from "../../styles/mixins";
import { FaGithub as GithubIcon } from "react-icons/fa";
import { BaseButton } from "../BaseButton";

const HeaderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 14px);
  height: 30px;

  background-color: ${COLORS.PANEL};
  ${border({})};

  display: flex;
  align-items: center;
  padding: 0 4px;
  gap: 8px;
`;

const StartButton = styled(BaseButton)`
  display: flex;
  align-items: center;
  padding: 0 4px;
  gap: 8px;

  font-family: monospace;
  color: ${COLORS.GREY};
  font-weight: 600;
`;

const EndRow = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

const EndRowButton = styled.a`
  width: 20px;
  height: 20px;

  ${center}

  background-color: ${COLORS.PANEL};
  ${border({ thickness: 2, isButton: true })};

  &:hover {
    cursor: pointer;
  }
`;

export const DesktopHeader = () => {
  return (
    <HeaderContainer>
      <StartButton onClick={() => (window.location.href = "/")}>
        <img height="16px" width="16px" src="/icon.png" />
        <div>PocchiOS</div>
        <div>|</div>
        <div>My Tagged DB</div>
      </StartButton>

      <EndRow>
        <EndRowButton
          href="https://github.com/poohcom1/tagged-db"
          title="GitHub"
          target="_blank"
        >
          <GithubIcon color="black" />
        </EndRowButton>
      </EndRow>
    </HeaderContainer>
  );
};
