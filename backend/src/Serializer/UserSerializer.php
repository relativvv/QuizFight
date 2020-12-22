<?php
namespace App\Serializer;

use App\Entity\User;
use App\Exceptions\UserException;

class UserSerializer {

    public function __construct() { }

    public function deserializeUser(array $toDeserialize): User {
        if(!isset($toDeserialize["username"], $toDeserialize["password"], $toDeserialize["email"])) {
            throw new UserException("Not all values are set.");
        }

        $username = $toDeserialize["username"];
        $password = password_hash($toDeserialize["password"], PASSWORD_BCRYPT);
        $email = $toDeserialize["email"];
        $image = $toDeserialize["image"];
        $admin = $toDeserialize["isAdmin"];
        $queue = $toDeserialize["queue"];
        $money = $toDeserialize["money"];
        $allTimeCorrect = $toDeserialize["allTimeCorrect"];
        $won = $toDeserialize["gamesWon"];
        $played = $toDeserialize["gamesPlayed"];

        return new User($username, $email, $password, $allTimeCorrect, $played, $won, $money, $admin, $image, $queue);
    }


    public function serializerUser(User $user): array {
        $finalResponse = array();
        $finalResponse["id"] = $user->getId();
        $finalResponse["username"] = $user->getUsername();
        $finalResponse["password"] = $user->getPassword();
        $finalResponse["email"] = $user->getEmail();
        $finalResponse["image"] = $user->getImage();
        $finalResponse["isAdmin"] = $user->getIsAdmin();
        $finalResponse["queue"] = $user->isInQueue();
        $finalResponse["money"] = $user->getMoney();
        $finalResponse["allTimeCorrect"] = $user->getAllTimeCorrect();
        $finalResponse["gamesWon"] = $user->getGamesWon();
        $finalResponse["gamesPlayed"] = $user->getPlayedGames();

        return $finalResponse;
    }

    public function safeSerialize(User $user): array {
        $finalResponse = array();
        $finalResponse["id"] = $user->getId();
        $finalResponse["username"] = $user->getUsername();
        $finalResponse["image"] = $user->getImage();
        return $finalResponse;
    }
}
