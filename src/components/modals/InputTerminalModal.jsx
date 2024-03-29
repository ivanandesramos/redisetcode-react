/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Textarea,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { HiXCircle } from "react-icons/hi";

export default function InputTerminalModal({
  open,
  handleOpen,
  size,
  userInput,
  handleUserInput,
  onSubmit,
}) {
  return (
    <>
      <Dialog size="lg" open={open} handler={handleOpen} className="">
        <DialogHeader className="bg-secondary text-gray-900 flex justify-between">
          <p>Enter Input</p>
          <button onClick={handleOpen}>
            <HiXCircle className="text-red-500" />
          </button>
        </DialogHeader>
        <DialogBody className="bg-primary text-gray-900 h-60 overflow-y-auto">
          <Textarea
            className="h-full"
            label={`Please enter ${size} input separated by comma(,).\nEx: 10,John Doe,USA`}
            value={userInput}
            onChange={(e) => handleUserInput(e.target.value)}
          />
        </DialogBody>
        <DialogFooter>
          <Button onClick={onSubmit}>Continue</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
