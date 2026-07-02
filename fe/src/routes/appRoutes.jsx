import {BrowserRouter, Routes, Route} from "react-router-dom";
import LoginPage from "../pages/login/loginPage";
import RegisterPage from "../pages/register/register";
function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;