import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import EmailVerify from "./pages/EmailVerify";
import Dashboard from "./pages/Dashboard";
import Subscription from "./pages/Subscription";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import ProfileSettings from "./pages/ProfileSettings";
import HelpCenter from "./pages/HelpCenter";
import GettingStarted from "./pages/GettingStarted";
import ManagingYourBusiness from "./pages/ManagingYourBusiness";
import AccountAndBilling from "./pages/AccountAndBilling";
import Troubleshooting from "./pages/Troubleshooting";
import ContactSupport from "./pages/ContactSupport";
import CustomerProfile from "./pages/CustomerProfile";
import GetMeasured from "./pages/GetMeasured";
import HowItWorks from "./pages/HowItWorks";
import FrontPhoto from "./pages/FrontPhoto";
import SidePhoto from "./pages/SidePhoto";
import Processing from "./pages/Processing";


import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
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
          path="/verify-email"
          element={<EmailVerify />}
        />


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
            path="/profile-settings"
            element={<ProfileSettings />}
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

<Route
  path="/get-measured"
  element={<GetMeasured />}
/>

<Route path="/how-it-works"
 element={<HowItWorks />} />

 <Route
  path="/front-photo"
  element={<FrontPhoto />}
/>

<Route
  path="/side-photo"
  element={<SidePhoto />}
/>
 
 <Route path="/processing"
  element={<Processing />} />
 

        </Route>

      </Routes>
    </BrowserRouter>
  );
}