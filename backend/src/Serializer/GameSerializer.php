<?php
namespace App\Serializer;

use App\Entity\Game;
use App\Exceptions\GameException;
use App\Repository\UserRepository;

class GameSerializer {

    private $userRepository;
    private $userSerializer;

    public function __construct(UserRepository $userRepository, UserSerializer $userSerializer) {
        $this->userRepository = $userRepository;
        $this->userSerializer = $userSerializer;
    }

    public function serializeGame(Game $game): array {
        $finalResponse = array();

        $finalResponse["id"] = $game->getId();
        $finalResponse["p1"] = $this->userSerializer->safeSerialize($game->getP1());
        $finalResponse["p2"] = $this->userSerializer->safeSerialize($game->getP2());
        $finalResponse["port"] = $game->getPort();
        $finalResponse["socketPID"] = $game->getSocketPID();

        return $finalResponse;
    }

}
