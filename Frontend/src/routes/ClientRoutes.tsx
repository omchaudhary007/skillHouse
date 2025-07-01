import { Routes, Route, useLocation } from "react-router-dom";
import ClientHomepage from "@/pages/clients/ClientHomepage";
import ProtectedRoutes from "../components/protectedRoutes/ProtectedRoutes";
import NotFound from "@/components/error/NotFound";
import ClientProfile from "@/pages/clients/ClientProfile";
import PostJob from "@/pages/clients/PostJob";
import ClientNav from "@/components/client/ClientNav";
import Footer from "@/components/landing/Footer";
import JobDetail from "@/components/job/JobDetails";
import EditJob from "@/pages/clients/EditJob";
import ViewFreelancer from "@/pages/clients/ViewFreelancer";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import ViewContracts from "@/pages/clients/ViewContracts";
import ClientContractDetails from "@/pages/clients/ClientContractDetails";
import PaymentSuccessPage from "@/pages/clients/PaymentSuccessPage";
import ResetPassword from "@/components/resetPassword/ResetPassword";
import Chat from "@/pages/common/Chat";
import Earnings from "@/pages/freelancer/Earnings";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const ClientRoutes = () => {
    const location = useLocation();

    const hideFooterPaths = ["/client/messages"];

    const shouldHideFooter = hideFooterPaths.includes(location.pathname);

    return (
        <div>
            <ClientNav />
            <Routes>
                <Route
                    path="home"
                    element={
                        <ProtectedRoutes requiredRole="client">
                            <ClientHomepage />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <ProtectedRoutes requiredRole="client">
                            <ClientProfile />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="post-job"
                    element={
                        <ProtectedRoutes requiredRole="client">
                            <PostJob />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="job/view-job/:id"
                    element={
                        <ProtectedRoutes requiredRole="client">
                            <Elements stripe={stripePromise}>
                                <JobDetail />
                            </Elements>
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="job/edit-job/:id"
                    element={
                        <ProtectedRoutes requiredRole="client">
                            <EditJob />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="job/applied-freelancer/:freelancerId"
                    element={
                        <ProtectedRoutes requiredRole="client">
                            <ViewFreelancer />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="contracts"
                    element={
                        <ProtectedRoutes requiredRole="client">
                            <ViewContracts />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="contract/:id"
                    element={
                        <ProtectedRoutes requiredRole="client">
                            <Elements stripe={stripePromise}>
                                <ClientContractDetails />
                            </Elements>
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="contract/payment-success"
                    element={
                        <ProtectedRoutes requiredRole="client">
                            <PaymentSuccessPage />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="profile-settings"
                    element={
                        <ProtectedRoutes requiredRole="client">
                            <ResetPassword />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="messages"
                    element={
                        <ProtectedRoutes requiredRole="client">
                            <Chat />
                        </ProtectedRoutes>
                    }
                />
                <Route
                    path="earnings"
                    element={
                        <ProtectedRoutes requiredRole="client">
                            <Earnings />
                        </ProtectedRoutes>
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>

            {!shouldHideFooter && <Footer />}
        </div>
    );
};

export default ClientRoutes;