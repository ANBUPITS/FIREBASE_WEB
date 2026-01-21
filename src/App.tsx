import { Routes, Route} from "react-router-dom";
import Signup from "./screens/Signup";
import Signin from "./screens/Signin";
import { ToastContainer } from "react-toastify";
import Chat from "./screens/Chat";

const App = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<Signin />} />
      <Route path="/Signup" element={<Signup />} />
      <Route path="/Chat" element={<Chat />}></Route>
    </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
      </>
    
  );
}

export default App;

