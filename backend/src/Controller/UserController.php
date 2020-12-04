<?php

namespace App\Controller;

use App\Exceptions\UserException;
use App\Repository\UserRepository;
use App\Serializer\UserSerializer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
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
    public function getUserImageByUsername(Request $request): JsonResponse
    {
        $name = $request->get('username');
        if ($this->isUserExistingByUsername($name)) {
            $user = $this->repository->getUserByUsername($name);
            return new JsonResponse($user->getImage());
        }
        throw new UserException("User doesn't exist!");
    }

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

            if (password_verify($arr["password"], $toCompare->getPassword())) {
                return new JsonResponse($serialized);
            } else {
                throw new UserException("Sorry, this password is not correct!");
            }
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
