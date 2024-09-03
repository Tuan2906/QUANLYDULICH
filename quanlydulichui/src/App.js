import "./App.css";
import {Route, Routes}

function App {
  return (
      <Routes>
        <Route path="/chat" element={<Conversation />} />
        <Route path="/chat/:conversationId/" element={<Chat />} />
        <Route path="/news" element={<PostNews />} />
        <Route path="/news/details/:id" element={<PostNews />} />
      </Routes>
  );
}

export default App;
