import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Axios } from "@/lib/https";
import { GET_APIS, POST_APIS } from "@/lib/urls";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Foundation from ".";
import { Navigate } from "react-router-dom";
import clsx from "clsx";

type FormType = {
  type: "signin" | "signup" | "nonprofit";
  handler?: () => void;
};

type Foundation = { id: string };
export const SignUpAndSignInForm: React.FC<FormType> = ({ type, handler }) => {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setEmail("");
    setName("");
    setAddress("");
  }, []);

  const signUp = useMutation({
    mutationKey: ["fetchFundationId"],
    mutationFn: () =>
      Axios.post(
        type === "nonprofit" ? POST_APIS.NON_PROFIT : POST_APIS.FOUNDATION,
        { email, name, address },
        { params: { foundationId: sessionStorage.getItem("foundationId") } }
      ),
    onSuccess: () => {
      setOpen(false);
      toast.success(
        type === "nonprofit"
          ? "Saved NonProfit successfully"
          : "SignUp successful"
      );
      if (type === "nonprofit" && handler) {
        handler();
      }
    },
    onError: (err) =>
      toast.error(
        err.message || type === "nonprofit"
          ? "Failed to save NonProfit"
          : "Sign Up Failed"
      ),
  });

  const signIn = useQuery<Foundation, Error>({
    queryKey: ["foundation"],
    queryFn: () =>
      Axios.get(GET_APIS.FOUNDATION, {
        params: {
          email: email,
          userName: name,
        },
      }).then((response) => {
        sessionStorage.setItem("foundationId", response.data?.id);
        sessionStorage.setItem("isAuthenticated", "true");
        return response.data;
      }),
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const foundationId: string = signIn.data?.id || "";

  // Serialize the list of objects into a string

  return type === "signin" && signIn.isSuccess ? (
    <Navigate
      replace
      to={`/nonprofits?foundationId=${encodeURIComponent(foundationId)}`}
    />
  ) : (
    <Dialog modal open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className={clsx(
            "items-center px-4 py-2 space-x-2 text-gray-100 whitespace-nowrap",
            type !== "nonprofit"
              ? "transition duration-150 bg-[#ffbf33] rounded hover:bg-[#ffbf33]"
              : "rounded-full  hover:bg-blue-600"
          )}
        >
          {type === "signup"
            ? "Sign Up"
            : type === "nonprofit"
            ? "Add NonProfit"
            : "Sign In"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === "signup"
              ? "Sign Up"
              : type === "nonprofit"
              ? "Add NonProfit"
              : "Sign In"}
          </DialogTitle>
          {type !== "nonprofit" && (
            <DialogDescription>Welcome to Temelio</DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="email" className="text-right">
              Email
            </label>
            <input
              id="email"
              placeholder="johndoe@gmail.com"
              className="col-span-3"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right">
              Username
            </label>
            <input
              id="username"
              placeholder="john doe"
              className="col-span-3"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {type !== "signin" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="address" className="text-right">
                Address
              </label>
              <textarea
                id="address"
                placeholder="296 Boyle Flats"
                className="col-span-3"
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={() => {
              type === "signin" ? signIn.refetch() : signUp.mutate();
            }}
          >
            {type === "signin" ? "Login" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
