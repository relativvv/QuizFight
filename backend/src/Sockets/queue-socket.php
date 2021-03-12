<?php

use App\Sockets\Queue;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

require dirname(__DIR__) . '/../vendor/autoload.php';
require_once 'Queue.php';

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new Queue()
        )
    ),
    1414
);

$server->run();