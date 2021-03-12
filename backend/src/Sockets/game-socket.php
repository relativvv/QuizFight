<?php
header('Access-Control-Allow-Origin: *');

use App\Sockets\GameSocket;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

require dirname(__DIR__) . '/../vendor/autoload.php';
require_once 'GameSocket.php';

$port = $argv[1];

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new GameSocket()
        )
    ),
    $port
);

$server->run();