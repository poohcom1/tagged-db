import { useEffect, useState } from "react";
import styled from "styled-components";
import { FaFileCsv } from "react-icons/fa6";
import { PiFoldersLight } from "react-icons/pi";
import { BasicButton } from "../../components/BasicButton";
import * as api from "../../lib/api";

interface Sheet {
  id: string;
  name: string;
  created: string;
  updated: string;
}

const Background = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;

  background-color: #008483;
`;

const FolderContainer = styled.div`
  margin: 32px;
  padding: 6px;
  color: black;
  background-color: #c4c4c4;
  height: 80%;
  width: 80%;
  border-top: 3px solid white;
  border-left: 3px solid white;
  border-bottom: 3px solid black;
  border-right: 3px solid black;
  display: flex;
  flex-direction: column;
`;

const FolderHeader = styled.div`
  color: white;
  background-color: #000082;
  padding: 4px 8px;
  margin-bottom: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const FolderButton = styled(BasicButton)`
  padding: 4px;
`;

const HSep = styled.div`
  margin: 4px 0;
  width: 100%;
  height: 1px;
  background-color: #4e4e4e;
  border-bottom: 1px solid white;
`;

const VSep = styled.div`
  margin: 0;
  width: 1px;
  height: 80%;
  background-color: #4e4e4e;
  border-right: 1px solid white;
`;

const FilesContainer = styled.div`
  color: black;
  background-color: white;
  padding: 8px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr 160px 160px;
  padding: 4px 8px;
  font-weight: bold;
  border-bottom: 1px solid #00000033;

  & > div:nth-child(2),
  & > div:nth-child(3) {
    text-align: right;
  }
`;

interface FileProps {
  $selected?: boolean;
}

const File = styled.a<FileProps>`
  color: inherit;
  text-decoration: none;
  height: 48px;
  display: grid;
  grid-template-columns: 1fr 160px 160px;
  align-items: center;
  padding: 0 8px;
  background: ${({ $selected }) => ($selected ? "#00000045" : "transparent")};
  border: 1px solid #00000000;

  &:hover {
    border: 1px solid #00000033;
    text-decoration: ${({ $selected }) =>
      $selected ? "underline" : "inherit"};
    cursor: pointer;
  }

  & > div:nth-child(2),
  & > div:nth-child(3) {
    text-align: right;
  }
`;

const FileCreating = styled.div`
  color: grey;
  font-size: small;
  height: 24px;
  display: grid;
  grid-template-columns: 1fr 160px 160px;
  align-items: center;
  padding: 0 8px;
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const MySheetsPage = () => {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [creatingSheet, setCreatingSheet] = useState<string>("");

  useEffect(() => {
    document.title = "My Sheets | TaggedDB";
  }, []);

  const fetchSheets = () => {
    api.getSheetsMeta().then((res) => {
      if (res.ok) {
        setSheets(res.value);
      } else {
        alert(res.error);
      }
    });
  };

  useEffect(fetchSheets, []);

  const onCreateSheet = () => {
    const title = prompt("Enter sheet title:");
    if (!title) return;

    if (sheets.find((sheet) => sheet.name === title)) {
      alert(`Error: Sheet "${title}" already exists!`);
      return;
    }

    setCreatingSheet(title);
    api.createSheet(title).then((res) => {
      setCreatingSheet("");
      if (res.ok) {
        setSheets([...sheets, res.value]);
        setSelectedSheet(res.value.id);
      } else {
        alert(res.error);
        fetchSheets();
      }
    });
  };

  const onRenameSheet = () => {
    if (!selectedSheet) {
      return;
    }

    const sheet = sheets.find((sheet) => sheet.id === selectedSheet);
    if (!sheet) {
      alert("Sheet not found");
      return;
    }
    const title = prompt(`Enter new sheet title:`, sheet.name);
    if (!title) {
      return;
    }
    sheet.name = title;
    setSheets([...sheets]);

    api.renameSheet(selectedSheet, title).then((res) => {
      if (!res.ok) {
        alert(res.error);
        fetchSheets();
      }
    });
  };

  const onDeleteSheet = () => {
    if (!selectedSheet) {
      return;
    }

    const sheet = sheets.find((sheet) => sheet.id === selectedSheet);
    if (!sheet) {
      alert("Sheet not found");
      return;
    }

    if (confirm(`Are you sure you want to delete "${sheet.name}"?`)) {
      api.deleteSheet(selectedSheet).then((res) => {
        if (res.ok) {
          setSheets(sheets.filter((sheet) => sheet.id !== selectedSheet));
        } else {
          alert(res.error);
          fetchSheets();
        }
      });
    }
  };

  return (
    <Background>
      <FolderContainer>
        <FolderHeader>
          <PiFoldersLight /> My Sheets
        </FolderHeader>
        <ButtonContainer>
          <FolderButton onClick={onCreateSheet} disabled={!!creatingSheet}>
            <u>N</u>ew
          </FolderButton>
          <VSep />
          <FolderButton onClick={onRenameSheet} disabled={!selectedSheet}>
            <u>R</u>ename
          </FolderButton>
          <FolderButton onClick={onDeleteSheet} disabled={!selectedSheet}>
            <u>D</u>elete
          </FolderButton>
        </ButtonContainer>
        <HSep />
        <FilesContainer onClick={() => setSelectedSheet("")}>
          <Columns>
            <div>Name</div>
            <div>Updated</div>
            <div>Created</div>
          </Columns>

          {sheets.map((sheet) => (
            <File
              key={sheet.id}
              href={
                sheet.id === selectedSheet ? `/sheet/${sheet.id}` : undefined
              }
              onClick={(e) => {
                e.stopPropagation();
                if (sheet.id !== selectedSheet) {
                  setTimeout(() => setSelectedSheet(sheet.id), 0);
                }
              }}
              $selected={sheet.id === selectedSheet}
            >
              <NameCell>
                <FaFileCsv />
                {sheet.name}
              </NameCell>
              <Time dateTime={sheet.updated} />
              <Time dateTime={sheet.created} />
            </File>
          ))}
          {creatingSheet && (
            <FileCreating key="_">Creating "{creatingSheet}"...</FileCreating>
          )}
        </FilesContainer>
      </FolderContainer>
    </Background>
  );
};

const TimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TimeText = styled.div`
  font-size: smaller;
`;

const Time = ({ dateTime }: { dateTime: string }) => {
  const timeString = new Date(dateTime).toLocaleString();

  const [date, time] = timeString.split(", ");
  return (
    <TimeContainer>
      <TimeText>{date}</TimeText>
      <TimeText>{time}</TimeText>
    </TimeContainer>
  );
};
