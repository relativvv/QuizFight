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

    public function isUserInQueue(string $username): bool {
        return $this->getUserByUsername($username)->isInQueue();
    }

    public function userExistByUsername(string $username): int {
        return $this->count(["username" => $username]);
    }

    public function getAmountInQueue(): int {
        return $this->count(["queue" => true]);
    }

    public function addToQueue(ValidatorInterface $validator, User $user)
    {
        $user->setQueue(true);
        try {
            $this->getEntityManager()->flush();
        } catch (OptimisticLockException | ORMException $e) {}
    }


    public function removeFromQueue(User $user) {
        $user->setQueue(false);
        try {
            $this->getEntityManager()->flush();
        } catch (OptimisticLockException | ORMException $e) {}
    }

    public function getUserInQueue() {
        return $this->findBy(['queue' => 1]);
    }


    /* -------------------------- UPDATE -------------------------- */
    public function changeImage(User $user, $image): void {
        $user->setImage($image);
        try {
            $this->getEntityManager()->flush();
        } catch (OptimisticLockException | ORMException $e) { throw new UserException("Image change failed!"); }
    }

    public function changePassword($username, $newPassword): User {
        if($this->getUserByUsername($username)) {
            $user = $this->getUserByUsername($username);
            if($user) {
                $user->setPassword($newPassword);
                $this->getEntityManager()->flush();
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
