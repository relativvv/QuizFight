<?php

namespace App\Controller;

use App\Exceptions\GameException;
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
        $this->denyUnlessInternal($request);
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
        $this->denyUnlessInternal($request);
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


    public function updateUser(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
        $current = $this->repository->getUserByUsername($arr["username"]);
        if (!$this->isUserExistingByUsername($current->getUsername())) {
            throw new UserException("User doesn't exist!");
        }

        if ($this->isUserExistingByEmail($arr['email'])) {
            throw new UserException("E-Mail address already registered!");
        }

        $this->repository->updateUser($arr["username"], $arr["email"], $arr["money"], $arr["allTimeCorrect"], $arr["gamesPlayed"], $arr["gamesWon"]);
        return new JsonResponse($this->serializer->serializerUser($current));
    }

    public function getRank(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $id = $request->get('id');
        $rank = -1;
        $user = $this->repository->getUserById($id);
        $allUser = $this->repository->getAllUsers();
        $response = [];
        foreach($allUser as $key => $value) {
            $response[$value->getUsername()] = $value->getAllTimeCorrect();
        }
        arsort($response);
        $keys = array_keys($response);
        foreach($keys as $index => $val) {
            if($val === $user->getUsername()) {
                $rank = $index+1;
            }
        }

        return new JsonResponse($rank);
    }

    public function getTopList(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $allUser = $this->repository->getAllUsers();
        $response = [];
        foreach($allUser as $key => $value) {
            $response[$value->getId()] = $value->getAllTimeCorrect();
        }
        $finalResponse = [];
        arsort($response);
        foreach($response as $key => $value) {
            $finalResponse[] = $this->serializer->safeSerialize($this->repository->getUserById($key));
        }
        return new JsonResponse($finalResponse);
    }

    public function addMoney(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
        $current = $this->repository->getUserByUsername($arr["username"]);
        if (!$this->isUserExistingByUsername($current->getUsername())) {
            throw new UserException("User doesn't exist!");
        }

        if($this->validatePlayer($arr["username"], $arr["password"])) {

            $this->repository->addMoney($arr["username"], $arr["amount"]);
            return new JsonResponse($this->serializer->serializerUser($current));
        }
        throw new UserException("Action not permitted!");
    }


    public function deleteUser(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $id = $request->get('id');
        $arr = json_decode($request->getContent(), true);

        if($this->validatePlayer($arr["validateUsername"], $arr["validatePassword"])) {
            $this->repository->deleteUser($id);
            return new JsonResponse('User deleted');
        }
        return new JsonResponse("Action not permitted!");
    }


    /** --------------------------- IMAGE ------------------------ *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUserImage(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $name = $request->get('username');

        if (!$this->repository->getUserByUsername($name)) {
            throw new UserException("User doesn't exist!");
        }

        $user = $this->repository->getUserByUsername($name);
        return new JsonResponse($user->getImage());
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
        if($this->validatePlayer($arr["username"], $arr["password"])) {
            if (!$this->repository->getUserByUsername($arr["username"])) {
                throw new UserException("User doesn't exist");
            }

            $toCompare = $this->repository->getUserByUsername($arr["username"]);

            $this->repository->changeImage($toCompare, $arr["image"]);
            return new JsonResponse($this->serializer->serializerUser($toCompare));
        }
        throw new UserException("Unknown error");
    }

    public function changePassword(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
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




    /**  ------------------ PW RESET -----------------  */

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function sendResetPasswordMail(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
        $email = $arr['email'];
        $token = $this->generateRandomToken(25);
        if(!$this->isUserExistingByEmail($email)) {
            throw new UserException("User doesn't exist");
        }

        $user = $this->repository->getUserByEMail($arr['email']);
        $this->repository->setToken($user, $token);

        mail($email, "QuizFight - Password reset", "Hellooooo, so you rascal forgot your password? \nHere you have a code, you need it to reset your password!\nI wouldn't give this code to anyone if I were you. \n Your code: " . $token . " \n Greetings  ~QuizFight Team");
        return new JsonResponse($arr);
    }

    public function resetPassword(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
        $user = $this->repository->getUserByResetToken($arr['token']);
        $this->repository->setToken($user, null);
        $this->repository->changePassword($user->getUsername(), password_hash($arr['password'], PASSWORD_BCRYPT));
        return new JsonResponse('password changed');
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
        $this->denyUnlessInternal($request);
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
        $this->denyUnlessInternal($request);
        $name = $request->get('username');
        return new JsonResponse($this->repository->isUserInQueue($name));
    }

    public function getQueuedPlayers(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
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






    public function isUserAdmin(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $id = $request->get('id');

        if (!$this->repository->getUserById($id)) {
            throw new UserException("User doesn't exist!");
        }

        $user = $this->repository->getUserById($id);
        return new JsonResponse($user->getIsAdmin());
    }

    public function getAllUsers(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
        if(!$this->isUserExistingByUsername($arr["username"])) {
            throw new UserException("User doesn't exist!");
        }

        if ($this->validatePlayer($arr["username"], $arr["password"])) {

            $list = $this->repository->getAllUsers();
            $toReturn = array();
            foreach($list as $user) {
                array_push($toReturn, $this->serializer->serializerUser($user));
            }

            return new JsonResponse($toReturn);
        }
        throw new UserException("Unknown error");
    }

    /** ------------------------ HELPER ------------------------ **/

    public function validatePlayer(string $username, string $password): bool {
        $toCompare = $this->repository->getUserByUsername($username);
        if ($password !== $toCompare->getPassword() || password_verify($password, $toCompare->getPassword())) {
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
        if ($this->repository->getUserByUsername($username)) {
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

    private function denyUnlessInternal(Request $request) {
        if($request->getHost() !== 'localhost') {
            throw new UserException('Permission denied!');
        }
    }
}
