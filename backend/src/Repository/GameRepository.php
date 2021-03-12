<?php

namespace App\Repository;

use App\Entity\Game;
use App\Entity\User;
use App\Exceptions\GameException;
use App\Exceptions\UserException;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * @method Game|null find($id, $lockMode = null, $lockVersion = null)
 * @method Game|null findOneBy(array $criteria, array $orderBy = null)
 * @method Game[]    findAll()
 * @method Game[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class GameRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Game::class);
    }

    public function getAllGames(): array
    {
        return $this->findAll();
    }

    public function createGame(ValidatorInterface $validator, Game $game) {
        if($game) {
            $errors = $validator->validate($game);
            if(count($errors) > 0) {
                return (string) $errors;
            }

            try {
                $this->getEntityManager()->persist($game);
                $this->getEntityManager()->flush();
            } catch (ORMException $e) { }
            return $game;
        }
        throw new UserException("No game given!");
    }

    public function getGameByPlayer(User $user): ?Game
    {
        if($this->findOneBy(["p1" => $user])) {
            return $this->findOneBy(["p1" => $user]);
        } else if($this->findOneBy(["p2" => $user])) {
            return $this->findOneBy(["p2" => $user]);
        }
        return null;
    }

    public function getGameById(int $id): ?Game {
        return $this->findOneBy(["id" => $id]);
    }

    public function deleteGame(int $id): void {
        $game = $this->getGameById($id);
        if($game) {
            try {
                $this->getEntityManager()->remove($game);
                $this->getEntityManager()->flush();
            } catch (ORMException $e) {}
        } else {
            throw new GameException("Game doesn't exist!");
        }
    }
}
