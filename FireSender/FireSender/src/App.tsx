import { BrowserRouter, Route, Routes } from "react-router-dom";
import Send from "./Send";
import EmailGenerator from "./EmailGenerator";
import Auth from "./Auth";
import SLC from "./SLC";

function App() {

  // const RootServer = '37.60.247.3';
  const RootServer = 'localhost';
  
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Send RootServer={RootServer} />}/>
        <Route path="email-generator" element={<EmailGenerator />}/>
        <Route path="suppression-list-cleaner" element={<SLC />}/>
        <Route path="auth" element={<Auth RootServer={RootServer}/>}/>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
