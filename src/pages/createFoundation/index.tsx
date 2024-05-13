import { SignUpAndSignInForm } from "@/pages/createFoundation/signUpAndSignInForm";

const Foundation = () => {
  return (
    <>
      <div className="flex" id="container">
        <div className="w-1/2 pr-2 mr-1">
          <SignUpAndSignInForm type="signup" />
        </div>
        <div className="w-1/2">
          <SignUpAndSignInForm type="signin" />
        </div>
      </div>
    </>
  );
};

export default Foundation;
