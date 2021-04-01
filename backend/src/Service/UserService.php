<?php
namespace App\Service;

use App\Entity\User;
use App\Exceptions\UserException;
use App\Repository\UserRepository;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UserService {

    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getUserById(int $id): User {
        return $this->userRepository->getUserById($id);
    }

    public function getUserByUserName(string $username): User {
        return $this->userRepository->getUserByUsername($username);
    }

    public function getUserByEmail(string $email): User {
        return $this->userRepository->getUserByEMail($email);
    }

    public function getAllUsers(): array {
        return $this->userRepository->getAllUsers();
    }

    public function addUser(ValidatorInterface $validator, User $user): User {
        return $this->userRepository->addUser($validator, $user);
    }

    public function updateUser(string $username, string $email, int $money, int $allTimeCorrect, int $gamesPlayed, int $gameswon): User {
        return $this->userRepository->updateUser($username, $email, $money, $allTimeCorrect, $gamesPlayed, $gameswon);
    }

    public function addMoney(string $username, int $money): User {
        return $this->userRepository->addMoney($username, $money);
    }

    public function changeImage(User $user, $img): void {
        $this->userRepository->changeImage($user, $img);
    }

    public function deleteUser(int $userId): void {
        $this->userRepository->deleteUser($userId);
    }

    public function changePassword(string $username, string $password): User {
        return $this->userRepository->changePassword($username, $password);
    }

    public function setToken(User $user, ?string $token): void {
        $this->userRepository->setToken($user, $token);
    }

    public function getUserByResetToken(string $token): User {
        return $this->userRepository->getUserByResetToken($token);
    }

    public function validatePlayer(string $username, string $password): bool {
        $toCompare = $this->userRepository->getUserByUsername($username);
        if ($password !== $toCompare->getPassword() || password_verify($password, $toCompare->getPassword())) {
            throw new UserException("Sorry, this password is not correct!");
        }
        return true;
    }

    public function isUserExistingByUsername(string $username): bool
    {
        if ($this->userRepository->getUserByUsername($username)) {
            return true;
        }
        return false;
    }

    public function isUserExistingByEmail(string $email): bool
    {
        if ($this->userRepository->getUserByEmail($email) != null) {
            return true;
        }
        return false;
    }

}