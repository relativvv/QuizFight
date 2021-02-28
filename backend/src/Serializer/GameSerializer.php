<?php
namespace App\Serializer;

use App\Entity\Game;
use App\Repository\UserRepository;

class GameSerializer {

    private $userRepository;
    private $userSerializer;

    public function __construct(UserRepository $userRepository, UserSerializer $userSerializer) {
        $this->userRepository = $userRepository;
        $this->userSerializer = $userSerializer;
    }

    public function deserializeGame(array $toDeserialize): ?Game
    {

        $id = null;
        if(isset($toDeserialize["id"])) {
            $id = $toDeserialize["id"];
        }

        $p1 = null;
        if(isset($toDeserialize["p1"])) {
            $p1 = $this->userRepository->getUserByUsername($this->userSerializer->deserializeUser($toDeserialize["p1"])->getUsername());
        }

        $p2 = null;
        if(isset($toDeserialize["p1"])) {
            $p2 = $this->userRepository->getUserByUsername($this->userSerializer->deserializeUser($toDeserialize["p2"])->getUsername());
        }

        $p1Correct = $toDeserialize["p1Correct"];
        $p2Correct = $toDeserialize["p2Correct"];
        $questionNumber = $toDeserialize["questionNumber"];

        $p1Locked = null;
        if(isset($toDeserialize['p1Locked'])) {
            $p1Locked = $toDeserialize["p1Locked"];
        }

        $p2Locked = null;
        if(isset($toDeserialize['p2Locked'])) {
            $p2Locked = $toDeserialize["p2Locked"];
        }

        $question = null;
        if(isset($toDeserialize['question'])) {
            $question = $toDeserialize["question"];
        }

        $mode = $toDeserialize["mode"];

        $answers = null;
        if(isset($toDeserialize['answers'])) {
            $answers = $toDeserialize["answers"];
        }

        $correctAnswer = null;
        if(isset($toDeserialize['correctAnswer'])) {
            $correctAnswer = $toDeserialize["correctAnswer"];
        }

        $p1Status = $toDeserialize["p1Status"];
        $p2Status = $toDeserialize["p2Status"];
        $p1HP = $toDeserialize["p1HP"];
        $p2HP = $toDeserialize["p2HP"];
        $currentDifficulty = $toDeserialize["currentDifficulty"];

        $game = new Game($p1Correct, $p2Correct, $questionNumber, $mode, $p1Status, $p2Status, $p1HP, $p2HP, $currentDifficulty, $p1, $p2, $p1Locked, $p2Locked, $question, $answers, $correctAnswer);
        if($id != null) {
            $game->setId($id);
        }
        return $game;
    }

    public function deserializeWithoutAnswer(array $toDeserialize): ?Game
    {
        $id = null;
        if(isset($toDeserialize["id"])) {
            $id = $toDeserialize["id"];
        }
        $p1 = null;
        if(isset($toDeserialize["p1"])) {
            $p1 = $this->userRepository->getUserByUsername($this->userSerializer->deserializeUser($toDeserialize["p1"])->getUsername());
        }

        $p2 = null;
        if(isset($toDeserialize["p1"])) {
            $p2 = $this->userRepository->getUserByUsername($this->userSerializer->deserializeUser($toDeserialize["p2"])->getUsername());
        }

        $p1Correct = $toDeserialize["p1Correct"];
        $p2Correct = $toDeserialize["p2Correct"];
        $questionNumber = $toDeserialize["questionNumber"];

        $question = null;
        if(isset($toDeserialize['question'])) {
            $question = $toDeserialize["question"];
        }

        $mode = $toDeserialize["mode"];

        $answers = null;
        if(isset($toDeserialize['answers'])) {
            $answers = $toDeserialize["answers"];
        }

        $p1Status = $toDeserialize["p1Status"];
        $p2Status = $toDeserialize["p2Status"];
        $p1HP = $toDeserialize["p1HP"];
        $p2HP = $toDeserialize["p2HP"];
        $currentDifficulty = $toDeserialize["currentDifficulty"];

        $game = new Game($p1Correct, $p2Correct, $questionNumber, $mode, $p1Status, $p2Status, $p1HP, $p2HP, $currentDifficulty, $p1, $p2, null, null, $question, $answers, null);
        if($id != null) {
            $game->setId($id);
        }
        return $game;
    }


    public function serializeGame(Game $game): array {
        $finalResponse = array();

        $finalResponse["id"] = $game->getId();
        $finalResponse["p1"] = $this->userSerializer->serializerUser($game->getP1());
        $finalResponse["p2"] = $this->userSerializer->serializerUser($game->getP2());
        $finalResponse["p1Correct"] = $game->getP1Correct();
        $finalResponse["p2Correct"] = $game->getP2Correct();
        $finalResponse["questionNumber"] = $game->getQuestionNumber();
        $finalResponse["p1Locked"] = $game->getP1Locked();
        $finalResponse["p2Locked"] = $game->getP2Locked();
        $finalResponse["question"] = $game->getQuestion();
        $finalResponse["answers"] = $game->getAnswers();
        $finalResponse["mode"] = $game->getMode();
        $finalResponse["correctAnswer"] = $game->getCorrectAnswer();
        $finalResponse["p1Status"] = $game->getP1Status();
        $finalResponse["p2Status"] = $game->getP2Status();
        $finalResponse["p1HP"] = $game->getP1HP();
        $finalResponse["p2HP"] = $game->getP2HP();
        $finalResponse["currentDifficulty"] = $game->getCurrentDifficulty();

        return $finalResponse;
    }

    public function serializeWithoutCorrectAnswer(Game $game, ?String $type = null): array {
        $finalResponse = array();

        $finalResponse["id"] = $game->getId();
        $finalResponse["p1"] = $this->userSerializer->serializerUser($game->getP1());
        $finalResponse["p2"] = $this->userSerializer->serializerUser($game->getP2());
        $finalResponse["p1Correct"] = $game->getP1Correct();
        $finalResponse["p2Correct"] = $game->getP2Correct();
        $finalResponse["questionNumber"] = $game->getQuestionNumber();
        $finalResponse["question"] = $game->getQuestion();
        $finalResponse["answers"] = $game->getAnswers();
        $finalResponse["mode"] = $game->getMode();
        $finalResponse["currentDifficulty"] = $game->getCurrentDifficulty();
        $finalResponse["p1Status"] = $game->getP1Status();
        $finalResponse["p2Status"] = $game->getP2Status();
        $finalResponse["p1HP"] = $game->getP1HP();
        $finalResponse["p2HP"] = $game->getP2HP();
        if(isset($type)) {
            $finalResponse['type'] = $type;
        }

        return $finalResponse;
    }
}
