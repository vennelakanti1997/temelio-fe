import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NavBar from "@/components/ui/navbar";
import { Axios } from "@/lib/https";
import { constructUrl } from "@/lib/utils";
import { GET_APIS } from "@/lib/urls";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

export const EmailsList: React.FC<{
  emails: {
    [key: string]: {
      id: string;
      toEmail: string;
      isSent: boolean;
      subject: string;
      body: string;
      failureReason: string;
      nonProfitId: string;
      templateId: string;
      nonProfitName: string;
    }[];
  };
  isModal: boolean;
  open: boolean;
  handleClose: () => void;
}> = (props) => {
  const [searchParams] = useSearchParams();

  const foundationId: string = decodeURIComponent(
    searchParams.get("foundationId") || ""
  );
  const [emails, setEmails] = useState<
    {
      id: string;
      toEmail: string;
      isSent: boolean;
      subject: string;
      body: string;
      failureReason: string;
      nonProfitId: string;
      templateId: string;
      nonProfitName: string;
    }[]
  >([]);

  useEffect(() => {
    const localEmails: {
      id: string;
      toEmail: string;
      isSent: boolean;
      subject: string;
      body: string;
      failureReason: string;
      nonProfitId: string;
      templateId: string;
      nonProfitName: string;
    }[] = [];
    if (!props.isModal) {
      Axios.get(constructUrl(GET_APIS.SENT_EMAILS, [foundationId]))
        .then((response) => {
          const data: {
            [key: string]: {
              id: string;
              toEmail: string;
              isSent: boolean;
              subject: string;
              body: string;
              failureReason: string;
              nonProfitId: string;
              templateId: string;
              nonProfitName: string;
            }[];
          } = response.data;
          for (const key in data) {
            localEmails.push(...data[key]);
          }
          setEmails(localEmails);
        })
        .catch((err) => toast.error(err.message || "Failed to fetch emails"));
    } else if (props.open) {
      localEmails.push(...Object.values(props.emails)[0]);
      setEmails(localEmails);
    }
  }, [props.open, props.isModal]);

  const columns: ColumnDef<{
    id: string;
    toEmail: string;
    isSent: boolean;
    subject: string;
    body: string;
    failureReason: string;
    nonProfitId: string;
    templateId: string;
    nonProfitName: string;
  }>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          className="text-center"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Id
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "nonProfitName",
      header: ({ column }) => (
        <Button
          className="text-center"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Non Profit Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium">
          {row.getValue("nonProfitName")}
        </div>
      ),
    },
    {
      accessorKey: "toEmail",
      header: ({ column }) => (
        <Button
          className="text-center"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium">{row.getValue("toEmail")}</div>
      ),
    },
    {
      accessorKey: "subject",
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
        <div className="text-left font-medium">{row.getValue("subject")}</div>
      ),
    },
    {
      accessorKey: "isSent",
      header: ({ column }) => (
        <Button
          className="text-center"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium">
          {row.getValue("isSent") ? "Success" : "Failure"}
        </div>
      ),
    },
  ];
  return props.isModal ? (
    <Dialog
      open={props.open}
      defaultOpen={false}
      modal
      onOpenChange={props.handleClose}
    >
      <DialogContent className="sm:max-w-[425px] max-w-full w-full">
        <DialogHeader>
          <DialogTitle>Emails Sent</DialogTitle>
        </DialogHeader>
        <DataTable
          className="no-scrollbar overflow-auto"
          columns={columns}
          data={emails}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={props.handleClose}
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <>
      {"true" === sessionStorage.getItem("isAuthenticated") && <NavBar />}
      <DataTable
        className="no-scrollbar overflow-auto"
        columns={columns}
        data={emails}
      />
    </>
  );
};
