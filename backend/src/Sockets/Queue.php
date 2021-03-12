<?php
namespace App\Sockets;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Queue implements MessageComponentInterface {
    protected $clients;
    private $usernames = [];
    private $allUsernames = [];

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        echo "Websocket started\n";
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg);
        $type = $data->type;
        switch($type) {
            case 'joined':
                $this->usernames[$from->resourceId] = $data->username;
                if(count($this->usernames) >= 2) {
                    foreach($this->clients as $client) {
                        $client->send(json_encode(array("type" => "gameFound")));
                    }
                }
                break;
            case 'readyToCreate':
                $unames = [];
                foreach($this->usernames as $resourceId => $username) {
                    $unames[] = $username;
                }

                $from->send(json_encode(array("type" => "initiateCreation", "p1" => $unames[0], "p2" => $unames[1])));
                break;
            case 'redirectUsers':
                foreach($this->clients as $client) {
                    $client->send(json_encode(array("type" => "redirect")));
                    unset($this->usernames[$client->resourceId]);
                }
                break;
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        unset($this->usernames[$conn->resourceId]);
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        unset($this->usernames[$conn->resourceId]);
        $conn->close();
    }
}