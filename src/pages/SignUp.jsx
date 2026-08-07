import AuthPage from "../components/AuthPage";

const SignUp = () => (
  <AuthPage
    hidePanelOnMobile
    pageTitle="Create your account"
    submitLabel="Create account"
    isSignUp
  />
);

export default SignUp;