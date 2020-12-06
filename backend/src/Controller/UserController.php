<?php

namespace App\Controller;

use App\Exceptions\UserException;
use App\Repository\UserRepository;
use App\Serializer\UserSerializer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UserController extends AbstractController
{
    private $repository;
    private $serializer;

    public function __construct(UserRepository $repository, UserSerializer $serializer)
    {
        $this->repository = $repository;
        $this->serializer = $serializer;
    }

    /** --------------------------- USER-MANAGEMENT --------------------------- */

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function loginUser(Request $request): JsonResponse
    {
        $arr = json_decode($request->getContent(), true);
        if ($this->isUserExistingByUsername($arr["username"])) {
            $toCompare = $this->repository->getUserByUsername($arr["username"]);
            $serialized = $this->serializer->serializerUser($toCompare);

            if (!password_verify($arr["password"], $toCompare->getPassword())) {
                throw new UserException("Sorry, this password is not correct!");
            }
            return new JsonResponse($serialized);
        }
        throw new UserException("User doesn't exist");
    }

    /**
     * @param ValidatorInterface $validator
     * @param Request $request
     * @return JsonResponse
     */
    public function registerUser(ValidatorInterface $validator, Request $request): JsonResponse
    {
        $arr = json_decode($request->getContent(), true);
        $toAdd = $this->serializer->deserializeUser($arr);
        if ($this->isUserExistingByUsername($toAdd->getUsername())) {
            throw new UserException("Username already given!");
        }

        if ($this->isUserExistingByEmail($toAdd->getEmail())) {
            throw new UserException("E-Mail address already registered!");
        }

        $this->repository->addUser($validator, $toAdd);
        return new JsonResponse($this->serializer->serializerUser($toAdd));
    }


    /** --------------------------- IMAGE ------------------------ **/

    /*
     * @param Request $request
     * @return JsonResponse
     */
    public function getUserImage(Request $request): JsonResponse
    {
        $name = $request->get('username');

        if (!$this->repository->getUserByUsername($name)) {
            throw new UserException("User doesn't exist!");
        }

        $user = $this->repository->getUserByUsername($name);
        return new JsonResponse($user->getImage());
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $arr = json_decode($request->getContent(), true);
        if($this->validatePlayer($arr["username"], $arr["password"])) {
            if (!$this->repository->getUserByUsername($arr["username"])) {
                throw new UserException("User doesn't exist");
            }

            $toCompare = $this->repository->getUserByUsername($arr["username"]);

            $this->repository->changeImage($toCompare, $arr["image"]);
            return new JsonResponse("Image changed");
        }
        throw new UserException("Unknown error");
    }

    public function changePassword(Request $request): JsonResponse
    {
        $arr = json_decode($request->getContent(), true);
        if ($this->validatePlayer($arr["username"], $arr["oldPassword"])) {
            if (!$this->repository->getUserByUsername($arr["username"])) {
                throw new UserException("User doesn't exist");
            }

            $toCompare = $this->repository->getUserByUsername($arr["username"]);
            if (!password_verify($arr["oldPassword"], $toCompare->getPassword())) {
                throw new UserException("Sorry, this password is not correct!");
            }

            $newPassword = password_hash($arr["newPassword"], PASSWORD_BCRYPT);
            $this->repository->changePassword($toCompare->getUsername(), $newPassword);
            return new JsonResponse($this->serializer->serializerUser($toCompare));
        }
        throw new UserException("Unknown error");
    }




    /**  ------------------ PW RESET -----------------  */

    /**
     * @param Request $request
     */
    public function sendResetPasswordMail(Request $request): JsonResponse {
//        $arr = json_decode($request->getContent(), true);
//        $email = $arr['email'];
//        $url = $arr['url'];
//        $token = $this->generateRandomToken(25);
//        if(!$this->isUserExistingByEmail($email)) {
//            throw new UserException("User doesn't exist");
//        }
//        mail($email, "QuizFight - Password reset", $url . "/resetpassword?token=" . $token);
//        return new JsonResponse($arr);
    }

    private function generateRandomToken(int $length): string {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    /** ------------------ PW RESET ----------------- */



    public function getMoney(Request $request): JsonResponse {
        $name = $request->get('username');

        if (!$this->repository->getUserByUsername($name)) {
            throw new UserException("User doesn't exist!");
        }

        $user = $this->repository->getUserByUsername($name);
        return new JsonResponse($user->getMoney());
    }



    /** -------------------------- Queue ------------------------------------ */

    public function getAmountOfPlayersInQueue(): JsonResponse {
        return new JsonResponse(array($this->repository->getAmountInQueue()));
    }

    public function userIsInQueue(Request $request): JsonResponse {
        $name = $request->get('username');
        return new JsonResponse($this->repository->isUserInQueue($name));
    }

    public function getQueuedPlayers(Request $request): JsonResponse {
        $toReturn = array();
        foreach($this->repository->getUserInQueue() as $user) {
            $toReturn[] = $this->serializer->serializerUser($user);
        }
        return new JsonResponse($toReturn);
    }

    public function addPlayerToQueue(ValidatorInterface $validator, Request $request): JsonResponse {
        $arr = json_decode($request->getContent(), true);
        if ($this->isUserExistingByUsername($arr["username"])) {
            if($this->validatePlayer($arr["username"], $arr["password"])) {
                $user = $this->repository->getUserByUsername($arr["username"]);
                $this->repository->addToQueue($validator, $user);
            }
        }
        throw new UserException("User doesn't exist");
    }

    public function removePlayerFromQueue(Request $request): JsonResponse {
        $arr = json_decode($request->getContent(), true);
        if($this->isUserExistingByUsername($arr["username"])) {
            if($this->validatePlayer($arr["username"], $arr["password"])) {
                $user = $this->repository->getUserByUsername($arr["username"]);
                $this->repository->removeFromQueue($user);
            }
        }
        throw new UserException("User doesn't exist");
    }


    /** ------------------------ HELPER ------------------------ **/

    public function validatePlayer(string $username, string $password): bool {
        $toCompare = $this->repository->getUserByUsername($username);
        if ($password !== $toCompare->getPassword()) {
            throw new UserException("Sorry, this password is not correct!");
        }
        return true;
    }

     /**
     * @param string $username
     * @return bool
     */
    public function isUserExistingByUsername(string $username): bool
    {
        if ($this->repository->getUserByUsername($username) != null) {
            return true;
        }
        return false;
    }

    public function  isUserExistingByEmail(string $email): bool
    {
        if ($this->repository->getUserByEmail($email) != null) {
            return true;
        }
        return false;
    }
}
