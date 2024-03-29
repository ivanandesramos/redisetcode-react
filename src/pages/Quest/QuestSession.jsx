import {
  Button,
  Card,
  CardBody,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../../components/modals/ConfirmModal";
import QuestModal from "../../components/modals/QuestModal";

export default function QuestSession() {
  const [cookies] = useCookies(["jwt"]);
  const [quest, setQuest] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userResponses, setUserResponses] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [result, setResult] = useState({});
  const [openQuestModal, setOpenQuestModal] = useState(false);

  const [timeLimit, setTimeLimit] = useState(1 * 60);
  // Use a separate state variable to track whether the time limit has been set
  const [timeLimitSet, setTimeLimitSet] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  const { questId } = useParams();
  const navigate = useNavigate();

  // Fetch quest with API
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${cookies.jwt}`,
          },
        };

        const response = await axios.get(
          `http://localhost:8000/api/v1/quests/${questId}`,
          config
        );
        const { quest } = response.data.data;
        setQuest(quest);

        // Update userResponses after fetching quest data
        const initialResponses = quest.questions.map((question) => ({
          questionText: question.questionText,
          answer: null,
        }));
        setUserResponses(initialResponses);

        setTimeLimit(2700);
        setTimeLimitSet(true);
        setIsLoading(false);
      } catch (error) {
        if (error.response.status === 400) {
          navigate("/quest");
        } else {
          // If status 500 then display server error page
          navigate("/server-error");
        }
        setIsLoading(false);
      }
    }
    fetchData();
  }, [cookies.jwt, questId, navigate]);

  // Define the handleSubmit function using useCallback
  const handleSubmit = useCallback(async () => {
    try {
      setTimeLimitSet(false);
      setOpenModal(false);
      setIsLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${cookies.jwt}`,
        },
      };

      // Filter out questions with no selected answer
      const selectedResponses = userResponses.filter(
        (response) => response.answer !== null
      );

      const data = {
        userResponses: selectedResponses,
        bonus: cookies.event === "Bonus",
      };

      const response = await axios.post(
        `http://localhost:8000/api/v1/quests/${questId}/submit`,
        data,
        config
      );

      const jsonData = response.data.data;
      setResult(jsonData.result);

      console.log("DONE");
      setIsLoading(false);
      setOpenQuestModal(true);
    } catch (error) {
      navigate("/server-error");
    }
  }, [
    cookies.jwt,
    userResponses,
    questId,
    setOpenModal,
    setIsLoading,
    setResult,
    setOpenQuestModal,
    navigate,
    cookies.event,
  ]);

  // Timer
  useEffect(() => {
    let timer;
    if (timeLimitSet && timeLimit > 0 && timeRemaining > 0) {
      // Initialize the timer when the component is mounted
      timer = setInterval(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Automatically submit the quiz when the time is up
      handleSubmit();
    }

    return () => {
      clearInterval(timer);
    };
  }, [timeRemaining, timeLimitSet, timeLimit, handleSubmit]);

  // Create a function to format the time remaining
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const handleAnswerSelection = (questionIndex, selectedOptionIndex) => {
    const updatedUserResponses = [...userResponses];
    updatedUserResponses[questionIndex].answer =
      quest.questions[questionIndex].options[selectedOptionIndex];
    setUserResponses(updatedUserResponses);
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (isLoading)
    return (
      <div className="h-screen bg-primary flex items-center justify-center">
        <Spinner color="indigo" />
      </div>
    );

  return (
    <main className="p-4 h-screen bg-primary">
      <nav className="mb-6 flex justify-between items-center">
        <Typography
          variant="h4"
          className="font-montserrat text-gray-900 font-bold"
        >
          {quest.name}
        </Typography>
        <Typography
          variant="h4"
          className="font-montserrat text-gray-900 font-bold"
        >
          {formatTime(timeRemaining)}
        </Typography>
      </nav>
      <Card className="h-[80vh] relative  bg-secondary">
        <CardBody className="flex flex-col justify-center items-center h-full">
          <p className="absolute top-0 left-0 ml-4 mt-4 text-gray-800 font-montserrat text-2xl">
            {currentQuestionIndex + 1}/{quest.questions.length}
          </p>
          <div className="absolute bottom-0 right-0 mr-4 mb-4">
            <div className="flex space-x-6">
              <Button
                className="flex gap-3"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <HiOutlineArrowLeft className="" />
                <p>Previous</p>
              </Button>
              {currentQuestionIndex === quest.questions.length - 1 ? (
                <Button
                  color="green"
                  className=""
                  onClick={() => setOpenModal(true)}
                >
                  Submit
                </Button>
              ) : (
                <Button
                  className="flex gap-3"
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex === quest.questions.length - 1}
                >
                  <p>Next</p>
                  <HiOutlineArrowRight className="" />
                </Button>
              )}
            </div>
          </div>

          <Typography
            variant="h4"
            className="text-gray-800 font-montserrat font-bold text-center"
          >
            {quest.questions[currentQuestionIndex].questionText}
          </Typography>

          <div className="w-full lg:w-1/2 mx-auto grid grid-rows-4 lg:grid-cols-2 gap-4 mt-10 relative">
            {quest.questions[currentQuestionIndex].options.map(
              (option, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  className="rounded-full"
                  onClick={() =>
                    handleAnswerSelection(currentQuestionIndex, index)
                  }
                  color={
                    userResponses[currentQuestionIndex].answer === option
                      ? "green" // Highlight selected answer
                      : "light-blue"
                  }
                >
                  {option}
                </Button>
              )
            )}
          </div>
        </CardBody>
      </Card>

      <ConfirmModal
        open={openModal}
        handleOpen={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />

      <QuestModal open={openQuestModal} quest={quest} result={result} />
    </main>
  );
}
