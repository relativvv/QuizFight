<?php
namespace App\Service;

use App\Entity\Game;
use App\Entity\User;
use App\Exceptions\UserException;
use App\Repository\GameRepository;
use App\Repository\UserRepository;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class GameService {

    private UserRepository $userRepository;
    private GameRepository $gameRepository;
    private HttpClientInterface $client;

    public function __construct(
        UserRepository $userRepository,
        GameRepository $gameRepository,
        HttpClientInterface $client
    )
    {
        $this->userRepository = $userRepository;
        $this->gameRepository = $gameRepository;
        $this->client = $client;
    }

    public function createNewGame(ValidatorInterface $validator, Game $game): Game {
        return $this->gameRepository->createGame($validator, $game);
    }

    public function getGameByPlayer(User $user): ?Game {
        return $this->gameRepository->getGameByPlayer($user);
    }

    public function getGameById(int $id): ?Game {
        return $this->gameRepository->getGameById($id);
    }

    public function deleteGame(int $id): void {
        $this->gameRepository->deleteGame($id);
    }

    public function getAllGames(): array {
        return $this->gameRepository->getAllGames();
    }

    public function validatePlayer(string $username, string $password): bool {
        $toCompare = $this->userRepository->getUserByUsername($username);
        if ($password !== $toCompare->getPassword()) {
            throw new UserException("Sorry, this password is not correct!");
        }
        return true;
    }

    public function getNextFreePort(): int {
        if(count($this->getAllGames()) === 0) {
            return 49152;
        }
        foreach($this->getAllGames() as $game) {
            for($i = 49152; $i < 65535; $i++) {
                if($game->getPort() !== $i) {
                    return $i;
                }
            }
        }
    }
}