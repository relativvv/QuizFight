<?php
namespace App\Exceptions;

use Symfony\Component\Config\Definition\Exception\Exception;
use Throwable;

class GameException extends Exception {

    public function __construct($message = "", $code = -1, Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
    }
}
