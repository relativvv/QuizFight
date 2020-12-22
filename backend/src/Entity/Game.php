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
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $p1Locked;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $p2Locked;

    /**
     * @ORM\Column(type="integer")
     */
    private $p1Correct;

    /**
     * @ORM\Column(type="integer")
     */
    private $p2Correct;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $question;

    /**
     * @ORM\Column(type="array", nullable=true)
     */
    private $answers = [];

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $correctAnswer;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $currentDifficulty;

    /**
     * @ORM\Column(type="integer")
     */
    private $questionNumber;

    /**
     * @ORM\Column(type="integer")
     */
    private $p1HP;

    /**
     * @ORM\Column(type="integer")
     */
    private $p2HP;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $mode;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $p1Status;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $p2Status;

    public function __construct(int $p1Correct, int $p2Correct, int $questionNumber, string $mode, string $p1Status, string $p2Status, int $p1HP, int $p2HP, ?string $currentDifficulty, ?User $p1 = null, ?User $p2 = null, ?string $p1Locked = null, ?string $p2Locked = null, ?string $question = null, ?array $answers = null, ?string $correctAnswer = null)
    {
        $this->p1 = $p1;
        $this->p2 = $p2;
        $this->p1Correct = $p1Correct;
        $this->p2Correct = $p2Correct;
        $this->questionNumber = $questionNumber;
        $this->p1Locked = $p1Locked;
        $this->p2Locked = $p2Locked;
        $this->question = $question;
        $this->answers = $answers;
        $this->mode = $mode;
        $this->currentDifficulty = $currentDifficulty;
        $this->correctAnswer = $correctAnswer;
        $this->p1Status = $p1Status;
        $this->p2Status = $p2Status;
        $this->p1HP = $p1HP;
        $this->p2HP = $p2HP;
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

    public function setP2(?User $p2): self
    {
        $this->p2 = $p2;

        return $this;
    }

    public function getP1Locked(): ?string
    {
        return $this->p1Locked;
    }

    public function setP1Locked(?string $p1Locked): self
    {
        $this->p1Locked = $p1Locked;

        return $this;
    }

    public function getP2Locked(): ?string
    {
        return $this->p2Locked;
    }

    public function setP2Locked(?string $p2Locked): self
    {
        $this->p2Locked = $p2Locked;

        return $this;
    }

    public function getP1Correct(): ?int
    {
        return $this->p1Correct;
    }

    public function setP1Correct(int $p1Correct): self
    {
        $this->p1Correct = $p1Correct;

        return $this;
    }

    public function getP2Correct(): ?int
    {
        return $this->p2Correct;
    }

    public function setP2Correct(int $p2Correct): self
    {
        $this->p2Correct = $p2Correct;

        return $this;
    }

    public function getP1Status(): string
    {
        return $this->p1Status;
    }

    public function setP1Status(string $p1Status): void
    {
        $this->p1Status = $p1Status;
    }

    public function getP2Status(): string
    {
        return $this->p2Status;
    }

    public function setP2Status(string $p2Status): void
    {
        $this->p2Status = $p2Status;
    }

    public function getCurrentDifficulty(): ?string
    {
        return $this->currentDifficulty;
    }

    public function setCurrentDifficulty(?string $currentDifficulty): void
    {
        $this->currentDifficulty = $currentDifficulty;
    }

    public function getMode(): string
    {
        return $this->mode;
    }

    public function setMode($mode): void
    {
        $this->mode = $mode;
    }

    public function getQuestion(): ?string
    {
        return $this->question;
    }

    public function setQuestion(?string $question): self
    {
        $this->question = $question;

        return $this;
    }

    public function getAnswers(): ?array
    {
        return $this->answers;
    }

    public function setAnswers(?array $answers): self
    {
        $this->answers = $answers;

        return $this;
    }

    public function getCorrectAnswer(): ?string
    {
        return $this->correctAnswer;
    }

    public function setCorrectAnswer(?string $correctAnswer): self
    {
        $this->correctAnswer = $correctAnswer;

        return $this;
    }

    public function getQuestionNumber(): ?int
    {
        return $this->questionNumber;
    }

    public function setQuestionNumber(int $questionNumber): self
    {
        $this->questionNumber = $questionNumber;

        return $this;
    }

    public function getP1HP(): ?int
    {
        return $this->p1HP;
    }

    public function setP1HP(int $p1HP): self
    {
        $this->p1HP = $p1HP;

        return $this;
    }

    public function removeP1HP(int $p1HP): self
    {
        $this->p1HP = $this->getP1() - $p1HP;

        return $this;
    }

    public function addP1HP(int $p1HP): self
    {
        $this->p1HP = $this->getP1HP() + $p1HP;

        return $this;
    }

    public function getP2HP(): ?int
    {
        return $this->p2HP;
    }

    public function setP2HP(int $p2HP): self
    {
        $this->p2HP = $p2HP;

        return $this;
    }

    public function removeP2HP(int $p2HP): self
    {
        $this->p2HP = $this->getP2() - $p2HP;

        return $this;
    }

    public function addP2HP(int $p2HP): self
    {
        $this->p2HP = $this->getP2HP() + $p2HP;

        return $this;
    }
}
