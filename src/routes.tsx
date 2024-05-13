import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NotFound } from "./pages/NotFound";
import Foundation from "./pages/createFoundation";
import NonProfits from "./pages/nonprofits";
import { EmailsList } from "./pages/sentEmails";
import EmailTemplates from "./pages/emailTemplates";

const router = createBrowserRouter([
  { path: "/", element: <Foundation />, index: true },

  {
    path: "/nonprofits",
    element: (
      <NonProfits
        isModal={false}
        open={false}
        handleClose={() => console.log("no-op")}
        setTemplateId={() => console.log("no-op")}
      />
    ),
  },
  { path: "/templates", element: <EmailTemplates /> },
  {
    path: "/emails",
    element: (
      <EmailsList
        isModal={false}
        emails={{}}
        open={false}
        handleClose={() => console.log("no-op")}
      />
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const RootStackNavigator: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default RootStackNavigator;
