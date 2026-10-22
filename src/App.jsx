import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";
import AmbientBackground from "./components/AmbientBackground";
import BrandLoader from "./components/BrandLoader";

// Marketing / auth shell is eager so the first paint is fast.
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// Everything else is code-split on demand.
const ConfirmEmail = lazy(() => import("./pages/ConfirmEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const GoogleHandle = lazy(() => import("./pages/GoogleHandle"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Customers = lazy(() => import("./pages/Customers"));
const CustomerDetails = lazy(() => import("./pages/CustomerDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const GettingStarted = lazy(() => import("./pages/GettingStarted"));
const ManagingYourBusiness = lazy(() => import("./pages/ManagingYourBusiness"));
const AccountAndBilling = lazy(() => import("./pages/AccountAndBilling"));
const Troubleshooting = lazy(() => import("./pages/Troubleshooting"));
const ContactSupport = lazy(() => import("./pages/ContactSupport"));
const CustomerProfile = lazy(() => import("./pages/CustomerProfile"));
const GetMeasured = lazy(() => import("./pages/GetMeasured"));
const VendorLanding = lazy(() => import("./pages/VendorLanding"));
const PublicVendorProfile = lazy(() => import("./pages/PublicVendorProfile"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const FrontPhoto = lazy(() => import("./pages/FrontPhoto"));
const SidePhoto = lazy(() => import("./pages/SidePhoto"));
const Processing = lazy(() => import("./pages/Processing"));

function RouteFallback() {
  return <BrandLoader />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AmbientBackground />
      <Suspense fallback={<RouteFallback />}>
        <PageTransition>
          <Routes>

          {/* =========================
              PUBLIC ROUTES
          ========================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/signin"
            element={<SignIn />}
          />

          <Route
            path="/signup"
            element={<SignUp />}
          />

          <Route
            path="/confirm-email"
            element={<ConfirmEmail />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route
            path="/google-handle"
            element={<GoogleHandle />}
          />

          {/* =========================
              PUBLIC — CUSTOMER MEASUREMENT FLOW
              (reached from a shared link, no vendor auth)
          ========================== */}

          <Route path="/measure" element={<GetMeasured />} />

          <Route path="/how-it-works" element={<HowItWorks />} />

          <Route path="/front-photo" element={<FrontPhoto />} />

          <Route path="/side-photo" element={<SidePhoto />} />

          <Route path="/processing" element={<Processing />} />

          {/* Public vendor vanity link (guide §6.1) — shows a result page
              for inactive / not-found vendors and forwards active ones. */}

          <Route path="/v/:username" element={<VendorLanding />} />

          {/* Public vendor business profile shown to visiting customers. */}
          <Route path="/vendor/:username" element={<PublicVendorProfile />} />

          {/* =========================
              PROTECTED ROUTES
          ========================== */}

          <Route element={<ProtectedRoute />}>

            {/* Dashboard */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/subscription"
              element={<Subscription />}
            />

            {/* Customers */}

            <Route
              path="/customers"
              element={<Customers />}
            />

            {/* Customer Details */}

            <Route
              path="/customers/:id"
              element={<CustomerDetails />}
            />

            {/* Profile & Settings */}

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            {/* Legacy combined route — keep old links working. */}

            <Route
              path="/profile-settings"
              element={<Navigate to="/profile" replace />}
            />

            <Route
              path="/help-center"
              element={<HelpCenter />}
            />

            <Route
              path="/help-center/getting-started"
              element={<GettingStarted />}
            />

            <Route
              path="/help-center/managing-your-business"
              element={<ManagingYourBusiness />}
            />

            <Route
              path="/help-center/account-and-billing"
              element={<AccountAndBilling />}
            />

            <Route
              path="/help-center/troubleshooting"
              element={<Troubleshooting />}
            />

            <Route
              path="/contact-support"
              element={<ContactSupport />}
            />

            <Route
              path="/customer-profile"
              element={<CustomerProfile />}
            />

          </Route>

          {/* Catch-all: an unknown path (e.g. a bare /{username} link) would
              otherwise match nothing and render a blank page. Send it home. */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
        </PageTransition>
      </Suspense>
    </BrowserRouter>
  );
}
