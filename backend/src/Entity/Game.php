<?php

namespace App\Entity;

use App\Repository\GameRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=GameRepository::class)
 */
class Game
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\OneToOne(targetEntity=User::class, inversedBy="game")
     * @ORM\JoinColumn(nullable=true)
     */
    private $p1;

    /**
     * @ORM\OneToOne(targetEntity=User::class, inversedBy="game")
     * @ORM\JoinColumn(nullable=true)
     */
    private $p2;

    /**
     * @ORM\Column(type="integer")
     */
    private $port;

    /**
     * @ORM\Column(type="integer")
     */
    private $socketPID;


    public function __construct(int $port, ?User $p1 = null, ?User $p2 = null, ?int $socketPid)
    {
        $this->p1 = $p1;
        $this->p2 = $p2;
        $this->port = $port;
        $this->socketPID = $socketPid;
    }


    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getP1(): ?User
    {
        return $this->p1;
    }

    public function setP1(?User $p1): self
    {
        $this->p1 = $p1;

        return $this;
    }

    public function getP2(): ?User
    {
        return $this->p2;
    }


    public function getPort(): int
    {
        return $this->port;
    }

    public function setPort(int $port): void
    {
        $this->port = $port;
    }

    public function getSocketPID(): ?int
    {
        return $this->socketPID;
    }

    public function setSocketPID(?int $socketPID): void
    {
        $this->socketPID = $socketPID;
    }
}
