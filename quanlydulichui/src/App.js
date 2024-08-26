import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/chat" element={<Conversation />} />
        <Route path="/chat/:conversationId/" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
