import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Axios } from "@/lib/https";
import { POST_APIS } from "@/lib/urls";
import { constructUrl, parseTextEnclosedInBrackets } from "@/lib/utils";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import clsx from "clsx";
const CreateTemplate: React.FC<{
  foundationId: string;
  fetchTemplates: () => void;
}> = (props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [body, setBody] = useState<string>(
    "<h1>Hey!</h1><p>Welcome to this html wysiwyg editor</p>"
  );
  const [subject, setSubject] = useState<string>("Template");
  const [step, setStep] = useState<"subject" | "body">("subject");
  return (
    <Dialog
      modal
      open={open}
      onOpenChange={() => {
        setStep("subject");
        setOpen(!open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="items-center px-4 py-2 space-x-2 text-gray-100 whitespace-nowrap rounded-full  hover:bg-blue-600"
        >
          Create Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-w-full w-full">
        <DialogHeader>
          <DialogTitle>Create Template</DialogTitle>
        </DialogHeader>
        {step === "body" ? (
          <ReactQuill
            theme="snow" // Snow theme for a clean appearance
            value={body} // HTML content value
            onChange={setBody} // Change handler
          />
        ) : (
          <textarea
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        )}
        <DialogFooter className={clsx(step === "body" && "mt-8")}>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStep("subject");
                setOpen(false);
              }}
            >
              Close
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={() => {
              if (step === "subject") {
                setStep("body");
              } else {
                console.log(subject, body);
                const subjectVariables = parseTextEnclosedInBrackets(
                  subject
                ).map((variable) => {
                  return { type: "string", name: variable };
                });
                const bodyVariables = parseTextEnclosedInBrackets(body).map(
                  (variable) => {
                    return { type: "string", name: variable };
                  }
                );
                console.log(subjectVariables, bodyVariables);
                const requestBody = {
                  subject: {
                    contentType: "text/plain",
                    content: subject,
                    variables: subjectVariables,
                  },
                  body: {
                    contentType: "text/html",
                    content: body,
                    variables: bodyVariables,
                  },
                };
                console.log(requestBody);
                Axios.post(
                  constructUrl(POST_APIS.EMAIL_TEMPLATES, [props.foundationId]),
                  requestBody
                ).then(() => {
                  toast.success("Template Created successfully");
                  props.fetchTemplates();
                  setStep("subject");
                  setOpen(false);
                });
                setStep("subject");
                setOpen(false);
              }
            }}
          >
            {step === "subject" ? "Next" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplate;
