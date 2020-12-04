<?php
namespace App\Exceptions;

use Symfony\Component\Config\Definition\Exception\Exception;
use Throwable;

class UserException extends Exception {

    public static $ALREADYEXISTUSERNAME = 0;

    public static $ALREADYEXISTEMAIL = 1;

    public static $DOESNTEXIST = 2;

    public function __construct($message = "", $code = -1, Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
    }
}
