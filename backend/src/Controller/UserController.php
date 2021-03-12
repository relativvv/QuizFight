<?php

namespace App\Controller;

use App\Exceptions\GameException;
use App\Exceptions\UserException;
use App\Repository\UserRepository;
use App\Serializer\UserSerializer;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UserController extends AbstractController
{
    private UserService $userService;
    private $serializer;

    public function __construct(
        UserSerializer $serializer,
        UserService $userService
    )
    {
        $this->serializer = $serializer;
        $this->userService = $userService;
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
        if ($this->userService->isUserExistingByUsername($arr["username"])) {
            $toCompare = $this->userService->getUserByUsername($arr["username"]);
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
        if ($this->userService->isUserExistingByUsername($toAdd->getUsername())) {
            throw new UserException("Username already given!");
        }

        if ($this->userService->isUserExistingByEmail($toAdd->getEmail())) {
            throw new UserException("E-Mail address already registered!");
        }

        $this->userService->addUser($validator, $toAdd);
        return new JsonResponse($this->serializer->serializerUser($toAdd));
    }


    public function updateUser(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
        $current = $this->userService->getUserByUsername($arr["username"]);

        if (!$this->userService->isUserExistingByUsername($current->getUsername())) {
            throw new UserException("User doesn't exist!");
        }

        $this->userService->updateUser($arr["username"], $arr["email"], $arr["money"], $arr["allTimeCorrect"], $arr["gamesPlayed"], $arr["gamesWon"]);
        return new JsonResponse($this->serializer->serializerUser($current));
    }

    public function getRank(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $id = $request->get('id');
        $rank = -1;
        $user = $this->userService->getUserById($id);
        $allUser = $this->userService->getAllUsers();
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
        $allUser = $this->userService->getAllUsers();
        $response = [];
        foreach($allUser as $key => $value) {
            $response[$value->getId()] = $value->getAllTimeCorrect();
        }
        $finalResponse = [];
        arsort($response);
        foreach($response as $key => $value) {
            $finalResponse[] = $this->serializer->safeSerialize($this->userService->getUserById($key));
        }
        return new JsonResponse($finalResponse);
    }

    public function getUserByName(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $data = json_decode($request->getContent(), true);
        $this->userService->validatePlayer($data["validateUsername"], $data["validatePassword"]);

        $name = $request->get('name');
        $user = $this->userService->getUserByUserName($name);
        return new JsonResponse($this->serializer->serializerUser($user));
    }

    public function addMoney(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
        $current = $this->userService->getUserByUsername($arr["username"]);
        if (!$this->userService->isUserExistingByUsername($current->getUsername())) {
            throw new UserException("User doesn't exist!");
        }

        if($this->userService->validatePlayer($arr["username"], $arr["password"])) {

            $this->userService->addMoney($arr["username"], $arr["amount"]);
            return new JsonResponse($this->serializer->serializerUser($current));
        }
        throw new UserException("Action not permitted!");
    }


    public function deleteUser(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $id = $request->get('id');
        $arr = json_decode($request->getContent(), true);

        if($this->userService->validatePlayer($arr["validateUsername"], $arr["validatePassword"])) {
            $this->userService->deleteUser($id);
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

        if (!$this->userService->getUserByUsername($name)) {
            throw new UserException("User doesn't exist!");
        }

        $user = $this->userService->getUserByUsername($name);
        return new JsonResponse($user->getImage());
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
        if($this->userService->validatePlayer($arr["username"], $arr["password"])) {
            if (!$this->userService->getUserByUsername($arr["username"])) {
                throw new UserException("User doesn't exist");
            }

            $toCompare = $this->userService->getUserByUsername($arr["username"]);

            $this->userService->changeImage($toCompare, $arr["image"]);
            return new JsonResponse($this->serializer->serializerUser($toCompare));
        }
        throw new UserException("Unknown error");
    }

    public function changePassword(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
            if (!$this->userService->getUserByUsername($arr["username"])) {
                throw new UserException("User doesn't exist");
            }

            $toCompare = $this->userService->getUserByUsername($arr["username"]);
            if (!password_verify($arr["oldPassword"], $toCompare->getPassword())) {
                throw new UserException("Sorry, this password is not correct!");
            }

            $newPassword = password_hash($arr["newPassword"], PASSWORD_BCRYPT);
            $this->userService->changePassword($toCompare->getUsername(), $newPassword);
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
        if(!$this->userService->isUserExistingByEmail($email)) {
            throw new UserException("User doesn't exist");
        }

        $user = $this->userService->getUserByEMail($arr['email']);
        $this->userService->setToken($user, $token);

        mail($email, "QuizFight - Password reset", "Hellooooo, so you rascal forgot your password? \nHere you have a code, you need it to reset your password!\nI wouldn't give this code to anyone if I were you. \n Your code: " . $token . " \n Greetings  ~QuizFight Team");
        return new JsonResponse($arr);
    }

    public function resetPassword(Request $request): JsonResponse {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
        $user = $this->userService->getUserByResetToken($arr['token']);
        $this->userService->setToken($user, null);
        $this->userService->changePassword($user->getUsername(), password_hash($arr['password'], PASSWORD_BCRYPT));
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

        if (!$this->userService->getUserByUsername($name)) {
            throw new UserException("User doesn't exist!");
        }

        $user = $this->userService->getUserByUsername($name);
        return new JsonResponse($user->getMoney());
    }


    public function isUserAdmin(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $id = $request->get('id');

        if (!$this->userService->getUserById($id)) {
            throw new UserException("User doesn't exist!");
        }

        $user = $this->userService->getUserById($id);
        return new JsonResponse($user->getIsAdmin());
    }

    public function getAllUsers(Request $request): JsonResponse
    {
        $this->denyUnlessInternal($request);
        $arr = json_decode($request->getContent(), true);
        if(!$this->userService->isUserExistingByUsername($arr["username"])) {
            throw new UserException("User doesn't exist!");
        }

        if ($this->userService->validatePlayer($arr["username"], $arr["password"])) {

            $list = $this->userService->getAllUsers();
            $toReturn = array();
            foreach($list as $user) {
                array_push($toReturn, $this->serializer->serializerUser($user));
            }

            return new JsonResponse($toReturn);
        }
        throw new UserException("Unknown error");
    }


    private function denyUnlessInternal(Request $request) {
        if($request->getHost() !== 'localhost') {
            throw new UserException('Permission denied!');
        }
    }
}
