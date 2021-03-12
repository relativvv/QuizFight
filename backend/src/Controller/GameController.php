<?php

namespace App\Controller;

use App\Entity\Game;
use App\Exceptions\GameException;
use App\Exceptions\UserException;
use App\Serializer\GameSerializer;
use App\Serializer\UserSerializer;
use App\Service\GameService;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Process\Process;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class GameController extends AbstractController
{
    private UserService $userService;
    private UserSerializer $userSerializer;
    private GameSerializer $gameSerializer;
    private GameService $gameService;

    public function __construct(
        UserService $userService,
        UserSerializer $userSerializer,
        GameSerializer $gameSerializer,
        GameService $gameService
    )
    {
        $this->userService = $userService;
        $this->userSerializer = $userSerializer;
        $this->gameSerializer = $gameSerializer;
        $this->gameService = $gameService;
    }

    public function isIngame(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $id = $request->get("id");
        if($this->gameService->getGameByPlayer($this->userService->getUserById($id)) !== null) {
            return new JsonResponse(["ingame" => true]);
        }
        return new JsonResponse(["ingame" => false]);
    }

    public function createNewGame(ValidatorInterface $validator, Request $request): JsonResponse {
        $this->denyUnlessInternal($request);

        $data = json_decode($request->getContent(), true);

        $port = $this->gameService->getNextFreePort();

        if(false === $this->userService->validatePlayer($data["validateUsername"], $data["validatePassword"])) {
            throw new UserException("User not permitted");
        }

        if($this->gameService->getGameByPlayer($this->userService->getUserByUserName($data["game"]["p1"])) !== null) {
            return new JsonResponse("");
        }

        if($this->gameService->getGameByPlayer($this->userService->getUserByUserName($data["game"]["p2"])) !== null) {
            return new JsonResponse("");
        }

        $p1 = $this->userService->getUserByUserName($data["game"]["p1"]);
        $p2 = $this->userService->getUserByUserName($data["game"]["p2"]);

        $game = new Game($port, $p1, $p2, 123);

        $game = $this->gameService->createNewGame($validator, $game);

        if($game === null) {
            throw new GameException("Game creation failed!");
        }

        return new JsonResponse($this->gameSerializer->serializeGame($game));
    }

    public function runProcess(Request $request) {
        $this->denyUnlessInternal($request);
        ini_set('max_execution_time', 0);
        $port = $request->get('port');
        $process = new Process(["php", getcwd() . "/../src/Sockets/game-socket.php", $port]);
        $process->setTimeout(25*60);
        $process->setIdleTimeout(25*60);
        $response = new JsonResponse("socket started");
        $response->send();
        $process->run();
    }

    public function getGame(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $data = json_decode($request->getContent(), true);
        if($this->gameService->validatePlayer($data["username"], $data["password"])) {
            $game = $this->gameService->getGameByPlayer($this->userService->getUserByUsername($data["username"]));

            if($game === null) {
                throw new GameException("Deserialization failed!");
            }

            return new JsonResponse($this->gameSerializer->serializeGame($game));
        }
        throw new GameException("Unknown error");
    }
    
    public function deleteGame(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $data = json_decode($request->getContent(), true);
        if($this->gameService->validatePlayer($data["validateUsername"], $data["validatePassword"])) {
            if($this->gameService->getGameById($data["id"])) {
                $game = $this->gameService->getGameById($data["id"]);
                shell_exec("kill " . $game->getSocketPID());
                shell_exec("taskkill /F /PID " . $game->getSocketPID());
                $this->gameService->deleteGame($data["id"]);
            }
        }
        return new JsonResponse("");
    }


    private function denyUnlessInternal(Request $request) {
        if($request->getHost() !== "api.relativv.de") {
            throw new GameException("Permission denied!");
        }
    }
}
