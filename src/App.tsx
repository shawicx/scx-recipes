import { Layout } from "antd";

import { ErrorProvider } from "./lib/ErrorContext";

import "./styles/globals.css";

function App() {
  return (
    <ErrorProvider>
      <Layout className="min-h-screen"></Layout>
    </ErrorProvider>
  );
}

export default App;
