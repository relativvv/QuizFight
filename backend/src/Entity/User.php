<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=UserRepository::class)
 */
class User
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $email;

    /**
     * @ORM\Column(type="string", length=16)
     */
    private $username;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $password;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private ?string $resetToken;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $image;


    /**
     * @ORM\Column(type="integer")
     */
    private $money;

    /**
     * @ORM\Column(type="integer")
     */
    private $allTimeCorrect;

    /**
     * @ORM\Column(type="integer")
     */
    private $gamesWon;

    /**
     * @ORM\Column(type="integer")
     */
    private $gamesPlayed;

    /**
     * @ORM\Column(type="boolean")
     */
    private $queue;

    /**
     * @ORM\Column(type="boolean")
     */
    private $isAdmin;

    /**
     * @ORM\OneToOne(targetEntity=Game::class, mappedBy="p1", cascade={"remove"})
     */
    private $game;

    public function __construct(string $username, string $email, string $password, string $resetToken = null, int $allTimeCorrect = 0, int $gamesPlayed = 0, int $gamesWon = 0, int $money = 0, bool $isAdmin = false, string $image = null, bool $queue = null, int $id = null)
    {
        if($id !== null) {
            $this->id = $id;
        }
        $this->username = $username;
        $this->email = $email;
        $this->password = $password;
        $this->image = $image;
        $this->isAdmin = $isAdmin;
        $this->money = $money;
        $this->queue = $queue;
        $this->gamesWon = $gamesWon;
        $this->gamesPlayed = $gamesPlayed;
        $this->allTimeCorrect = $allTimeCorrect;
        $this->resetToken = $resetToken;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): self
    {
        $this->username = $username;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): self
    {
        $this->image = $image;

        return $this;
    }

    public function getMoney(): ?int
    {
        return $this->money;
    }

    public function setMoney(int $money): self
    {
        $this->money = $money;

        return $this;
    }

    public function addMoney(int $money): self
    {
        $this->money = $this->getMoney() + $money;

        return $this;
    }

    public function getResetToken(): ?string {
        return $this->resetToken;
    }

    public function setResetToken(?string $resetToken): self {
        $this->resetToken = $resetToken;

        return $this;
    }

    public function getAllTimeCorrect(): ?int
    {
        return $this->allTimeCorrect;
    }

    public function setAllTimeCorrect(int $correct): self
    {
        $this->allTimeCorrect = $correct;

        return $this;
    }

    public function addAllTimeCorrect(int $correct): self
    {
        $this->allTimeCorrect = $this->getAllTimeCorrect() + $correct;

        return $this;
    }

    public function getGamesWon(): ?int
    {
        return $this->gamesWon;
    }

    public function setGamesWon(int $won): self
    {
        $this->gamesWon = $won;

        return $this;
    }

    public function addGamesWon(int $won): self
    {
        $this->gamesWon = $this->getGamesWon() + $won;

        return $this;
    }

    public function getPlayedGames(): ?int
    {
        return $this->gamesPlayed;
    }

    public function setPlayedGames(int $played): self
    {
        $this->gamesPlayed = $played;

        return $this;
    }

    public function addPlayedGames(int $played): self
    {
        $this->gamesPlayed = $this->getPlayedGames() + $played;

        return $this;
    }

    public function isInQueue(): bool
    {
        return $this->queue;
    }

    public function setQueue(?bool $queue): self
    {
        $this->queue = $queue;

        return $this;
    }

    public function getIsAdmin(): ?bool
    {
        return $this->isAdmin;
    }

    public function setIsAdmin(?bool $isAdmin): self
    {
        $this->isAdmin = $isAdmin;

        return $this;
    }

    public function getGame(): ?Game
    {
        return $this->game;
    }

    public function setGame(Game $game): self
    {
        $this->game = $game;

        // set the owning side of the relation if necessary
        if ($game->getP1() !== $this) {
            $game->setP1($this);
        }

        return $this;
    }
}
