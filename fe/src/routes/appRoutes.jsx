import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/login/loginPage";
import RegisterPage from "../pages/register/register";
import PublicLayout from "../components/layout/PublicLayout";
import UserLayout from "../components/layout/UserLayout";
import HomePage from "../pages/home/homePage";
import LibraryPage from "../pages/library/library";
import FriendPage from "../pages/friend/friend";
import FlashCardPage from "../pages/flashCard/flashCard";
import ExercisePage from "../pages/exercise/exercise";
import TestPage from "../pages/test/test";
import VocabularyPage from "../pages/vocabulary/vocabulary";
import MyWordSetsPage from "../pages/myWordSets/myWordSets";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth/Public Layout */}
                <Route element={<PublicLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* User Layout */}
                <Route path="/" element={<UserLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="library" element={<LibraryPage />} />
                    <Route path="friend" element={<FriendPage />} />
                    <Route path="flash-card" element={<FlashCardPage />} />
                    <Route path="exercise" element={<ExercisePage />} />
                    <Route path="test" element={<TestPage />} />
                    <Route path="vocabulary" element={<VocabularyPage />} />
                    <Route path="my-sets" element={<MyWordSetsPage />} />
                    
                    {/* Hỗ trợ chuyển hướng từ /user về trang chủ / */}
                    <Route path="user" element={<Navigate to="/" replace />} />
                </Route>

                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;