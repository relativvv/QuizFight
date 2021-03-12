<?php
namespace App\Sockets;

use App\Exceptions\GameException;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class GameSocket implements MessageComponentInterface {
    protected $clients;

    private array $readyPlayers = [];

    private string $question;
    private string $correctAnswer;
    private string $currentDifficulty;
    private string $p1Locked;
    private string $p2Locked;
    private string $currentMode;

    private int $money;
    private int $p1HP = 100;
    private int $p2HP = 100;
    private int $p1Correct = 0;
    private int $p2Correct = 0;

    private array $answers;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        echo "Websocket started\n";
    }

    public function onOpen(ConnectionInterface $conn) {
        if(count($this->clients) < 2) {
            $this->clients->attach($conn);
            echo "New connection! ({$conn->resourceId})\n";
        } else {
            throw new GameException("Sorry this game is full!");
        }
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg);
        $type = $data->type;
        switch($type) {
            case 'joined':
                $this->readyPlayers[] = $data->userType;
                if(count($this->readyPlayers) === 2) {
                    $this->updateQuestion();
                    foreach($this->clients as $client) {
                        $client->send(json_encode(array(
                            "type" => "firstQuestion",
                            "questionString" => $this->question,
                            "answers" => $this->answers,
                            "correctAnswer" => $this->correctAnswer,
                            "money" => $this->money,
                            "difficulty" => $this->currentDifficulty,
                            "currentMode" => 'ingame',
                            "p1Correct" => $this->p1Correct,
                            "p2Correct" => $this->p2Correct,
                            "p1HP" => $this->p1HP,
                            "p2HP" => $this->p2HP
                        )));
                    }
                    $this->readyPlayers = [];
                }
                break;
            case 'lockAnswer':
                $this->lockAnswer($data->userType, $data->answerString);
                break;
            case 'readyQuestion':
                $this->readyPlayers[] = $data->userType;
                if(count($this->readyPlayers) === 2) {
                    foreach($this->clients as $client) {
                        $client->send(json_encode(array(
                            "type" => "questionFinish",
                            "correctAnswer" => $this->correctAnswer,
                            "p1Locked" => $this->p1Locked,
                            "p2Locked" => $this->p2Locked
                        )));
                    }
                    $this->updateQuestion();
                    $this->readyPlayers = [];
                }
                break;
            case 'readyQuestionFinish':
                if(isset($data->p1HP)) {
                    $this->p1HP = $data->p1HP;
                }

                if(isset($data->p2HP)) {
                    $this->p2HP = $data->p2HP;
                }

                if(isset($data->p1Correct)) {
                    $this->p1Correct = $data->p1Correct;
                }

                if(isset($data->p2Correct)) {
                    $this->p2Correct = $data->p2Correct;
                }

                $this->readyPlayers[] = $data->userType;
                if(count($this->readyPlayers) === 2) {
                    foreach($this->clients as $client) {
                        $client->send(json_encode(array(
                            "type" => "updatePlayerData",
                            "p1HP" => $this->p1HP,
                            "p2HP" => $this->p2HP,
                            "p1Correct" => $this->p1Correct,
                            "p2Correct" => $this->p2Correct
                        )));
                    }
                    $this->updateQuestion();
                    $this->readyPlayers = [];
                }
                break;
            case 'emitStartCountUp':
                $this->readyPlayers[] = $data->userType;
                if(count($this->readyPlayers) === 2) {
                    $this->updateQuestion();
                    foreach($this->clients as $client) {
                        $client->send(json_encode(array(
                            "type" => "startCountUp",
                        )));
                    }
                    $this->readyPlayers = [];
                }
                break;

            case 'readyCountUp':
                $this->readyPlayers[] = $data->userType;
                if(count($this->readyPlayers) === 2) {
                    foreach($this->clients as $client) {
                        $client->send(json_encode(array(
                            "type" => "nextQuestion",
                            "questionString" => $this->question,
                            "answers" => $this->answers,
                            "correctAnswer" => $this->correctAnswer,
                            "money" => $this->money,
                            "difficulty" => $this->currentDifficulty,
                            "currentMode" => 'ingame',
                        )));
                    }
                    $this->readyPlayers = [];
                }
                break;
            case 'endGame':
                $from->close();
                exit();
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        unset($this->usernames[$conn->resourceId]);
        echo "Connection {$conn->resourceId} has disconnected\n";
        if(count($this->clients) <= 1) {
            $conn->close();
            exit();
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        unset($this->usernames[$conn->resourceId]);
        if(count($this->clients) <= 1) {
            $conn->close();
            exit();
        }
    }

    private function updateQuestion()
    {
        $this->resetAnswers();
        /**
         * 9 = General Knowledge
         * 10 = Entertainment: Books
         * 11 = Entertainment: Film
         * 12 = Entertainment: Music
         * 13 = Entertainment: Musical & Theatres
         * 14 = Entertainment: Television
         * 15 = Entertainment: Video Games
         * 16 = Entertainment: Board Games
         * 17 = Science & Nature
         * 18 = Science: Computers
         * 19 = Science Mathematics
         * 20 = Mythology
         * 21 = Sports
         * 22 = Geography
         * 23 = History
         * 24 = Politics
         * 25 = Art
         * 26 = Celebrities
         * 27 = Animals
         * 28 = Vehicles
         * 29 = Entertainment: Comics
         * 30 = Science: Gadgets
         * 31 = Entertainment: Japanese Anime & Manga
         * 32 = Entertainment: Cartoon & Animations
         */
        $categoryIds = ['9', '15', '17', '18', '19', '23', '24', '26', '27', '28', '29', '30', '31', '32'];
        $category = $categoryIds[array_rand($categoryIds)];
        $response = file_get_contents('https://opentdb.com/api.php?amount=1&type=multiple&category=' . $category);

        $content = json_decode($response, true);
        $this->question = $content['results'][0]['question'];
        $this->correctAnswer = $content['results'][0]['correct_answer'];

        array_push($this->answers, $content['results'][0]['correct_answer']);
        array_push($this->answers, $content['results'][0]['incorrect_answers'][0]);
        array_push($this->answers, $content['results'][0]['incorrect_answers'][1]);
        array_push($this->answers, $content['results'][0]['incorrect_answers'][2]);

        $this->currentDifficulty = $content['results'][0]['difficulty'];
        $this->getMoney();
    }

    private function resetAnswers() {
        $this->p1Locked = '';
        $this->p2Locked = '';
        $this->correctAnswer = '';
        $this->answers = [];
    }

    private function getMoney() {
        switch ($this->currentDifficulty) {
          case 'easy':
            $this->money = 5;
            break;
          case 'medium':
            $this->money = 15;
            break;
          case 'hard':
            $this->money = 25;
            break;
        }
    }

    private function lockAnswer(string $player, string $answerString) {
        if($player === "p1") {
            $this->p1Locked = $answerString;
        } else if($player === "p2") {
            $this->p2Locked = $answerString;
        }
    }
}