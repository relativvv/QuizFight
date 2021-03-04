<?php

namespace App\Controller;

use App\Entity\Game;
use App\Exceptions\GameException;
use App\Exceptions\UserException;
use App\Repository\GameRepository;
use App\Repository\UserRepository;
use App\Serializer\GameSerializer;
use App\Serializer\UserSerializer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class GameController extends AbstractController
{

    private $userRepository;
    private $userSerializer;
    private $gameSerializer;
    private $gameRepository;
    private $client;

    public function __construct(HttpClientInterface $client, UserRepository $userRepository, GameRepository $gameRepository, UserSerializer $userSerializer, GameSerializer $gameSerializer)
    {
        $this->userRepository = $userRepository;
        $this->userSerializer = $userSerializer;
        $this->gameSerializer = $gameSerializer;
        $this->gameRepository = $gameRepository;
        $this->client = $client;
    }

    public function getAllRunning(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
        if(!$this->isUserExistingByUsername($arr["validateUsername"])) {
            throw new UserException("User doesn't exist!");
        }

        if ($this->validatePlayer($arr["validateUsername"], $arr["validatePassword"])) {

            $list = $this->gameRepository->getAllGames();
            $toReturn = array();
            foreach($list as $game) {
                array_push($toReturn, $this->gameSerializer->serializeGame($game));
            }

            return new JsonResponse($toReturn);
        }
    }

    public function isIngame(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $id = $request->get('id');
        if($this->gameRepository->getGameByPlayer($this->userRepository->getUserById($id)) !== null) {
            return new JsonResponse(['ingame' => true]);
        }
        return new JsonResponse(['ingame' => false]);
    }

    public function createNewGame(ValidatorInterface $validator, Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $data = json_decode($request->getContent(), true);
        if($this->gameRepository->getGameByPlayer($this->userRepository->getUserByUsername($data['validateUsername'])) !== null) {
            return new JsonResponse($this->gameSerializer->serializeGame($this->gameRepository->getGameByPlayer($this->userRepository->getUserByUsername($data['validateUsername']))));
        }

            if($this->validatePlayer($data['validateUsername'], $data['validatePassword'])) {
                $game = $this->gameSerializer->deserializeGame($data['game']);
                $this->updateQuestionOnGame($game);
                $this->gameRepository->createGame($validator, $game);
                return new JsonResponse($data['game']);
            }

        throw new GameException('An error ocurred');
    }

    public function getFullGame(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $data = json_decode($request->getContent(), true);
        if($this->validatePlayer($data['username'], $data['password'])) {
            $game = $this->gameRepository->getGameByPlayer($this->userRepository->getUserByUsername($data['username']));
            return new JsonResponse($this->gameSerializer->serializeGame($game));
        }
        throw new GameException('Unknown error');
    }

    public function getGame(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $data = json_decode($request->getContent(), true);
        if($this->validatePlayer($data['username'], $data['password'])) {
            $game = $this->gameRepository->getGameByPlayer($this->userRepository->getUserByUsername($data['username']));
            return new JsonResponse($this->gameSerializer->serializeWithoutCorrectAnswer($game, null));
        }
        throw new GameException('Unknown error');
    }

    public function updateGame(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $data = json_decode($request->getContent(), true);
        if($this->validatePlayer($data['validateUsername'], $data['validatePassword'])) {
            $game = $this->gameSerializer->deserializeGame($data['game']);
            if(isset($data['type'])) {
                if($data['type'] === 'p1') {
                    $this->gameRepository->updateGameP1($game);
                } else {
                    $this->gameRepository->updateGameP2($game);
                }
            } else {
                $this->gameRepository->updateGame($game);
            }
            if(isset($data['type'])) {
                return new JsonResponse($this->gameSerializer->serializeWithoutCorrectAnswer($game, $data['type']));
            } else {
                return new JsonResponse($this->gameSerializer->serializeWithoutCorrectAnswer($game));
            }
        }
        throw new GameException('Unknown error');
    }
    
    public function deleteGame(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $data = json_decode($request->getContent(), true);
        if($this->validatePlayer($data['validateUsername'], $data['validatePassword'])) {
            if($this->gameRepository->getGameById($data['id'])) {
                $this->gameRepository->deleteGame($data['id']);
            }
        }
    }

    public function updateQuestion(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $data = json_decode($request->getContent(), true);
        if($this->validatePlayer($data['validateUsername'], $data['validatePassword'])) {
            $game = $this->gameRepository->getGameByPlayer($this->userRepository->getUserByUsername($data['validateUsername']));
            $this->updateQuestionOnGame($game);
            $this->gameRepository->updateGame($game);
            return new JsonResponse($this->gameSerializer->serializeWithoutCorrectAnswer($game));
        }
        throw new GameException("Question cannot be get");
    }


    private function updateQuestionOnGame(Game $game): void {
        try {
            $resp = $this->client->request(
                'GET',
                'https://opentdb.com/api.php?amount=1&type=multiple'
            );

            $content = $resp->toArray();
            $game->setQuestion($content['results'][0]['question']);
            $game->setCorrectAnswer($content['results'][0]['correct_answer']);
                $answers = [];
                array_push($answers, $content['results'][0]['correct_answer']);
                array_push($answers, $content['results'][0]['incorrect_answers'][0]);
                array_push($answers, $content['results'][0]['incorrect_answers'][1]);
                array_push($answers, $content['results'][0]['incorrect_answers'][2]);
            $game->setAnswers($answers);
            $game->setCurrentDifficulty($content['results'][0]['difficulty']);
        } catch (ClientExceptionInterface | RedirectionExceptionInterface | ServerExceptionInterface | DecodingExceptionInterface | TransportExceptionInterface | TransportExceptionInterface $e) {
        }
    }


    /** ------------------------ HELPER ------------------------ **/

    public function validatePlayer(string $username, string $password): bool {
        $toCompare = $this->userRepository->getUserByUsername($username);
        if ($password !== $toCompare->getPassword()) {
            throw new UserException("Sorry, this password is not correct!");
        }
        return true;
    }

    /**
     * @param string $username
     * @return bool
     */
    public function isUserExistingByUsername(string $username): bool
    {
        if ($this->userRepository->getUserByUsername($username) != null) {
            return true;
        }
        return false;
    }

    public function  isUserExistingByEmail(string $email): bool
    {
        if ($this->userRepository->getUserByEmail($email) != null) {
            return true;
        }
        return false;
    }

    private function denyUnlessInternal(Request $request) {
        if($request->getHost() !== 'localhost') {
            throw new GameException('Permission denied!');
        }
    }
}
