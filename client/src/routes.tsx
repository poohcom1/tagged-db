import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MySheetsPage } from "./pages/mySheetsPage/MySheetsPage";
import { SheetPage } from "./pages/sheetPage/SheetPage";

export const PageRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element={<MySheetsPage />}
        handle={{ title: "Tagged DB" }}
      />
      <Route
        path="/sheet/:id"
        element={<SheetPage />}
        handle={{ title: "Tagged DB" }}
      />
    </Routes>
  </BrowserRouter>
);
