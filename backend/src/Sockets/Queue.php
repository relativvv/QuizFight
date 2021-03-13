<?php
namespace App\Sockets;

use App\Entity\Game;
use App\Entity\User;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Queue implements MessageComponentInterface {
    protected $clients;
    private $usernames = [];
    private $waitingPlayers = [];
    private $readyToCreate = [];

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
                $this->waitingPlayers[] = $from->resourceId;
                if(count($this->waitingPlayers) >= 2 && count($this->waitingPlayers) % 2 === 0) {
                    foreach($this->clients as $client) {
                        if(in_array($client->resourceId, $this->waitingPlayers) && !in_array($client->resourceId, $this->readyToCreate)) {
                            $client->send(json_encode(array("type" => "gameFound")));
                            $this->readyToCreate[] = $client->resourceId;
                            if (($key = array_search($client->resourceId, $this->waitingPlayers)) !== false) {
                                unset($this->waitingPlayers[$key]);
                            }
                        }
                    }
                }
                break;
            case 'readyToCreate':
                $unames = [];
                foreach($this->usernames as $resourceId => $username) {
                    $unames[] = $username;
                }

                $from->send(json_encode(array("type" => "initiateCreation", "p1" => $unames[0], "p2" => $unames[1])));

                if (($key = array_search($from->resourceId, $this->readyToCreate)) !== false) {
                    unset($this->readyToCreate[$key]);
                }
                break;
            case 'redirectUsers':
                foreach($this->clients as $client) {
                    if(!in_array($client->resourceId, $this->waitingPlayers) && !in_array($client->resourceId, $this->readyToCreate)) {
                        $client->send(json_encode(array("type" => "redirect")));
                        unset($this->usernames[$client->resourceId]);
                    }
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
        $conn->close();
    }
}