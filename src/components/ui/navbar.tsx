const NavBar: React.FC = () => {
  return (
    <div
      id="
    navbar-container"
      className="w-full h-fit mb-2 no-scrollbar shadow-md justify-start items-start top-0 sticky left-0 z-50"
    >
      <span className="mr-5">
        <a
          id="nonProfitsLink"
          href={`/nonProfits?foundationId=${sessionStorage.getItem(
            "foundationId"
          )}`}
        >
          Non Profits
        </a>
      </span>
      <span className="mr-5">
        <a
          id="emailTemplatesLink"
          href={`/templates?foundationId=${sessionStorage.getItem(
            "foundationId"
          )}`}
        >
          Email Templates
        </a>
      </span>
      <span className="mr-5">
        <a
          id="sentEmailsLink"
          href={`/emails?foundationId=${sessionStorage.getItem(
            "foundationId"
          )}`}
        >
          Sent Email
        </a>
      </span>
    </div>
  );
};

export default NavBar;
