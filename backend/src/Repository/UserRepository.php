<?php

namespace App\Repository;

use App\Entity\User;
use App\Exceptions\UserException;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * @method User|null find($id, $lockMode = null, $lockVersion = null)
 * @method User|null findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /* -------------------------- GET -------------------------- */
    public function getUserById(int $id): ?User {
        return $this->findOneBy(["id" => $id]);
    }

    public function getUserByUsername(string $username): ?User {
        return $this->findOneBy(["username" => $username]);
    }

    public function getUserByEMail(string $email): ?User {
        return $this->findOneBy(["email" => $email]);
    }

    public function getUserByResetToken(string $token): ?User {
        return $this->findOneBy(["resetToken" => $token]);
    }

    public function getAllUsers(): array {
        return $this->findAll();
    }


    /* -------------------------- UPDATE -------------------------- */
    public function changeImage(User $user, $image): void {
        $user->setImage($image);
        try {
            $this->getEntityManager()->flush();
        } catch (OptimisticLockException | ORMException $e) { throw new UserException("Image change failed!"); }
    }

    public function setToken(User $user, ?string $token): void {
        $user->setResetToken($token);
        try {
            $this->getEntityManager()->flush();
        } catch (OptimisticLockException | ORMException $e) { throw new UserException("Image change failed!"); }
    }

    public function changePassword($username, $newPassword): User {
        if($this->getUserByUsername($username)) {
            $user = $this->getUserByUsername($username);
            if($user) {
                try {
                    $user->setPassword($newPassword);
                    $this->getEntityManager()->flush();
                } catch (OptimisticLockException | ORMException $e) {
                }
                return $user;
            }
        }
        throw new UserException("User doesn't exist!");
    }

    public function updateUser($username, $email, $money, $allTimeCorrect, $playedGames, $won): User
    {
        if($this->getUserByUsername($username)) {
            $user = $this->getUserByUsername($username);
            if($user) {
                try {
                    $user->setEmail($email);
                    $user->setUsername($username);
                    $user->setMoney($money);
                    $user->setPlayedGames($playedGames);
                    $user->setGamesWon($won);
                    $user->setAllTimeCorrect($allTimeCorrect);
                    $this->getEntityManager()->flush();
                } catch (OptimisticLockException | ORMException $e) {
                }
                return $user;
            }
        }
        throw new UserException("User doesn't exist!");
    }

    public function addMoney($username, $money): User
    {
        if($this->getUserByUsername($username)) {
            $user = $this->getUserByUsername($username);
            if($user) {
                try {
                    $user->addMoney($money);
                    $this->getEntityManager()->persist($user);
                    $this->getEntityManager()->flush();
                } catch (OptimisticLockException | ORMException $e) {
                }
                return $user;
            }
        }
        throw new UserException("User doesn't exist!");
    }


    /* -------------------------- REGISTER -------------------------- */
    public function addUser(ValidatorInterface $validator, User $user) {
        if($user) {
            $errors = $validator->validate($user);
            if(count($errors) > 0) {
                return (string) $errors;
            }

            try {
                $this->getEntityManager()->persist($user);
                $this->getEntityManager()->flush();
            } catch (ORMException $e) { }
            return $user;
        }
        throw new UserException("No user given!");
    }




    /* -------------------------- DELETE -------------------------- */
    public function deleteUser(int $id): void {
        $user = $this->getUserById($id);
        if($user) {
            try {
                $this->getEntityManager()->remove($user);
                $this->getEntityManager()->flush();
            } catch (ORMException $e) {}
        } else {
            throw new UserException("User doesn't exist!");
        }
    }
}
