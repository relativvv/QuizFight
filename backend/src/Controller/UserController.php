<?php

namespace App\Controller;

use App\Exceptions\UserException;
use App\Repository\UserRepository;
use App\Serializer\UserSerializer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Constraints\Json;
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
        if (!$this->repository->getUserByUsername($arr["username"])) {
            throw new UserException("User doesn't exist");
        }

        $toCompare = $this->repository->getUserByUsername($arr["username"]);
        if ($arr["password"] !== $toCompare->getPassword()) {
            throw new UserException("Sorry, this password is not correct!");
        }

        $this->repository->changeImage($toCompare, $arr["image"]);
        return new JsonResponse("Image changed");
    }

    public function changePassword(Request $request): JsonResponse
    {
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
     */
    public function sendResetPasswordMail(Request $request): JsonResponse {
        $arr = json_decode($request->getContent(), true);
        $email = $arr['email'];
        $url = $arr['url'];
        $token = $this->generateRandomToken(25);
        if(!$this->isUserExistingByEmail($email)) {
            throw new UserException("User doesn't exist");
        }
        mail($email, "QuizFight - Password reset", $url . "/resetpassword?token=" . $token);
        return new JsonResponse($arr);
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


    /** ------------------------ HELPER ------------------------ **/

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
