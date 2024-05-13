import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NavBar from "@/components/ui/navbar";
import { Axios } from "@/lib/https";
import { DELETE_APIS, GET_APIS } from "@/lib/urls";
import { constructUrl } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { EmailsList } from "../sentEmails";
import NonProfits from "../nonprofits";
import CreateTemplate from "./createTemplate";

type TemplateResponse = { isActive: boolean; templateId: string };
export type EmailTemplate = {
  isActive: boolean;
  templateId: string;
  subjectAndVariables: {
    content: string;
    contentType: string | null;
    variables:
      | { name: string; type: string; format: string | null }[]
      | null
      | [];
  };
  bodyAndVariables: {
    content: string;
    contentType: string | null;
    variables:
      | { name: string; type: string; format: string | null }[]
      | null
      | [];
  };
};

type EmailTemplateTable = {
  isActive: boolean;
  templateId: string;
  subjectAndVariables: string;
  bodyAndVariables: string;
};

type SentEmail = {
  id: string;
  toEmail: string;
  isSent: boolean;
  subject: string;
  body: string;
  failureReason: string;
  nonProfitId: string;
  templateId: string;
  nonProfitName: string;
};

const EmailTemplates: React.FC = () => {
  const [searchParams] = useSearchParams();

  const foundationId: string = decodeURIComponent(
    searchParams.get("foundationId") || ""
  );
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplateTable[]>(
    []
  );
  const [sentEmailsList, setsentEmailsList] = useState<SentEmail[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const emailTemplateList = useQuery<Array<EmailTemplate>, Error>({
    queryKey: ["emailTemplateList", foundationId],
    queryFn: () =>
      Axios.get(constructUrl(GET_APIS.EMAIL_TEMPLATES, [foundationId]), {
        params: { isActive: true },
      }).then((response) => {
        const data: EmailTemplate[] = response.data;
        setEmailTemplates(
          data.map((item) => ({
            isActive: item.isActive,
            templateId: item.templateId,
            subjectAndVariables: item.subjectAndVariables.content,
            bodyAndVariables: item.bodyAndVariables.content,
          }))
        );
        return data;
      }),
    enabled: true,
    refetchOnMount: true,
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showNonProfitModal, setShowNonProfitModal] = useState<boolean>(false);
  const deleteTemplate = useMutation<TemplateResponse, Error, string>({
    mutationKey: ["deleteNonProfit"],
    mutationFn: (id: string): Promise<TemplateResponse> =>
      Axios.delete(constructUrl(DELETE_APIS.EMAIL_TEMPLATE, [foundationId]), {
        params: { id },
      }),

    onSuccess: () => {
      toast.success("Deleted Successfully");
      emailTemplateList.refetch();
    },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });

  const columns: ColumnDef<EmailTemplateTable>[] = [
    {
      accessorKey: "templateId",
      header: ({ column }) => (
        <Button
          className="text-center"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium">
          {row.getValue("templateId")}
        </div>
      ),
    },
    {
      accessorKey: "subjectAndVariables",
      header: ({ column }) => (
        <Button
          className="text-center"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Subject
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium">
          {row.getValue("subjectAndVariables")}
        </div>
      ),
    },
    {
      accessorKey: "bodyAndVariables",
      header: ({ column }) => (
        <Button
          className="text-center"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Body
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium">
          {row.getValue("bodyAndVariables")}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const template = row.original;

        return (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => deleteTemplate.mutate(template.templateId)}
              >
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setShowNonProfitModal(true);
                  setSelectedTemplate(template.templateId);
                }}
              >
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  Axios.get(
                    constructUrl(GET_APIS.SENT_EMAILS_BY_TEMPLATE, [
                      foundationId,
                      template.templateId,
                    ])
                  )
                    .then((response) => {
                      setsentEmailsList(response.data);
                      setShowModal(true);
                    })
                    .catch((err) =>
                      toast.error(err.message || "Failed to fetch emails")
                    );
                }}
              >
                View Sent Emails
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  return (
    <>
      {"true" === sessionStorage.getItem("isAuthenticated") && <NavBar />}
      <DataTable
        columns={columns}
        data={emailTemplates}
        footerElement={
          <CreateTemplate
            foundationId={foundationId}
            fetchTemplates={() => emailTemplateList.refetch()}
          />
        }
      />
      <NonProfits
        isModal
        open={showNonProfitModal}
        handleClose={() => setShowNonProfitModal(false)}
        templateId={selectedTemplate}
        setTemplateId={() => setSelectedTemplate("")}
      />
      <EmailsList
        isModal
        emails={{ placeHolder: sentEmailsList }}
        open={showModal}
        handleClose={() => setShowModal(false)}
      />
    </>
  );
};

export default EmailTemplates;
