/* eslint-disable react/prop-types */
import {
  Button,
  Dialog,
  DialogBody,
  Typography,
} from "@material-tailwind/react";
import { useCookies } from "react-cookie";
import { GiFireGem } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

export default function QuestModal({ open, result, quest }) {
  const navigate = useNavigate();
  const [cookies] = useCookies([]);

  function assignExp() {
    let exp = 0;
    if (result.isPassed && cookies.event === "Bonus") {
      exp = quest.exp * 2;
    } else if (!result.isPassed && cookies.event === "Bonus") {
      exp = Math.floor(quest.exp / 2) * 2;
    } else if (result.isPassed) {
      exp = quest.exp;
    } else if (!result.isPassed) {
      exp = Math.floor(quest.exp / 2);
    }

    return exp;
  }

  return (
    <Dialog open={open} className="bg-secondary pt-6">
      <DialogBody className="flex items-center">
        <div className="w-2/5 flex justify-center">
          <img src="/complete.png" className="w-1/2" alt="" />
        </div>
        <div className="w-3/5">
          <Typography
            variant="h4"
            className="text-gray-900 font-montserrat font-bold"
          >
            {result.isPassed ? "You Passed!" : "Opps..."}
          </Typography>
          <Typography
            variant="sm"
            className="text-gray-800 font-montserrat mt-2"
          >
            You completed a quest
          </Typography>
          <Typography
            variant="paragraph"
            className="text-gray-800 font-montserrat mt-4 flex gap-2"
          >
            <div className="flex items-center gap-1 font-bold">
              <GiFireGem className="text-red-600 text-lg" />
              {assignExp()} XP
            </div>
            earned
          </Typography>
          <Typography
            variant="paragraph"
            className="text-gray-800 font-montserrat mt-4 flex gap-2"
          >
            Score: {result.score} / {quest.questions.length}
          </Typography>

          <div className="mt-6 flex flex-col justify-center">
            <Button
              variant="filled"
              color="green"
              onClick={() => navigate("/quest")}
            >
              <span>Continue</span>
            </Button>
            <Button
              variant="text"
              color="red"
              className="mt-2"
              onClick={() => navigate(`/quest/${quest._id}/result`)}
            >
              <span>View Result</span>
            </Button>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}
