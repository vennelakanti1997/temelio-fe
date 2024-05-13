import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Axios } from "@/lib/https";
import { DELETE_APIS, GET_APIS, POST_APIS } from "@/lib/urls";
import { constructUrl } from "@/lib/utils";
import { toast } from "react-toastify";
import { EmailsList } from "../sentEmails/index.tsx";
import { SignUpAndSignInForm } from "../createFoundation/signUpAndSignInForm";
import NavBar from "@/components/ui/navbar";
import IndeterminateCheckbox from "@/components/ui/indeterminateCheckbox.tsx";

type NonProfitsType = {
  id: string;
  email: string;
  address: string;
  name: string;
  isFoundation: boolean;
  isActive: boolean;
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

type SentEmailList = {
  [key: string]: SentEmail[];
};
const NonProfits: React.FC<{
  isModal: boolean;
  open: boolean;
  handleClose: () => void;
  templateId?: string;
  setTemplateId: () => void;
}> = (props) => {
  const [searchParams] = useSearchParams();

  const foundationId: string = decodeURIComponent(
    searchParams.get("foundationId") || ""
  );
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>(
    {}
  );

  const [nonProfits, setNonProfits] = useState<Array<NonProfitsType>>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const nonProfitsList = useQuery<Array<NonProfitsType>, Error>({
    queryKey: ["fetchNonProfits", foundationId],
    queryFn: () =>
      Axios.get(constructUrl(GET_APIS.NON_PROFITS, [foundationId]), {
        params: { isActive: true },
      }).then((response) => {
        setNonProfits(response.data);
        return response.data;
      }),
    enabled: true,
    refetchOnMount: true,
  });
  const [sentEmailsList, setsentEmailsList] = useState<SentEmailList>({});
  const deleteNonProfit = useMutation<NonProfitsType, Error, string>({
    mutationKey: ["deleteNonProfit"],
    mutationFn: (id: string): Promise<NonProfitsType> =>
      Axios.delete(constructUrl(DELETE_APIS.NON_PROFIT, [foundationId]), {
        params: { id },
      }),

    onSuccess: () => {
      toast.success("Deleted Successfully");
      nonProfitsList.refetch();
    },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });

  const selectColumns: ColumnDef<NonProfitsType>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <IndeterminateCheckbox
          className="text-center"
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
          }}
        />
      ),
      cell: ({ row }) => (
        <IndeterminateCheckbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      ),
    },
  ];
  const columns: ColumnDef<NonProfitsType>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          className="text-center"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          disabled={props.isModal}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          className="text-center"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          disabled={props.isModal}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "address",
      header: () => <div className="text-center">Address</div>,
      cell: ({ row }) => (
        <div className="text-left font-medium">{row.getValue("address")}</div>
      ),
    },
  ];

  const actionColumns: ColumnDef<NonProfitsType>[] = [
    {
      id: "actions",
      cell: ({ row }) => {
        const nonprofit = row.original;

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
                onClick={() => navigator.clipboard.writeText(nonprofit.email)}
              >
                Copy Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteNonProfit.mutate(nonprofit.id)}
              >
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  Axios.get(
                    constructUrl(GET_APIS.SENT_EMAILS, [foundationId]),
                    {
                      params: { nonProfitId: nonprofit.id },
                    }
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

  return !props.isModal ? (
    <>
      {"true" === sessionStorage.getItem("isAuthenticated") && <NavBar />}
      <DataTable
        columns={[...columns, ...actionColumns]}
        data={nonProfits}
        addRow={
          <SignUpAndSignInForm
            type="nonprofit"
            handler={() => nonProfitsList.refetch()}
          />
        }
      />
      <EmailsList
        isModal
        emails={sentEmailsList}
        open={showModal}
        handleClose={() => setShowModal(false)}
      />
    </>
  ) : (
    <Dialog modal open={props.open} onOpenChange={() => props.handleClose()}>
      <DialogContent className="sm:max-w-[425px] max-w-full w-full">
        <DialogHeader>
          <DialogTitle>NonProfits</DialogTitle>
          <DialogDescription>
            Select NonProfits to send emails
          </DialogDescription>
        </DialogHeader>
        <DataTable
          className="no-scrollbar overflow-auto"
          columns={[...selectColumns, ...columns]}
          data={nonProfits}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button
            disabled={nonProfitsList.data ? false : true}
            type="submit"
            onClick={() => {
              const nonprofitIds = Object.keys(rowSelection).map(
                (key: string) => {
                  const nonprofitIndex = parseInt(key);
                  const nonprofit = nonProfitsList.data?.[nonprofitIndex];
                  return nonprofit ? nonprofit.id : null;
                }
              );

              Axios.post(constructUrl(POST_APIS.SEND_EMAILS, [foundationId]), {
                templateId: props.templateId,
                nonProfitIds: nonprofitIds,
              })
                .then(() => {
                  props.setTemplateId();

                  toast.success("Emails Sent");
                  props.handleClose();
                })
                .catch((error) =>
                  toast.error(error.message || "Failed to send email")
                );
            }}
          >
            Send email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NonProfits;
