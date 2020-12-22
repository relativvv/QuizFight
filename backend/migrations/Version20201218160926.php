<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201218160926 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE game (id INT AUTO_INCREMENT NOT NULL, first_player_id INT NOT NULL, second_player_id INT NOT NULL, p1correct INT NOT NULL, p2correct INT NOT NULL, current_question VARCHAR(255) NOT NULL, correct_answer VARCHAR(255) NOT NULL, question_number INT NOT NULL, UNIQUE INDEX UNIQ_232B318C65EB6591 (first_player_id), UNIQUE INDEX UNIQ_232B318CA40D7457 (second_player_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE game ADD CONSTRAINT FK_232B318C65EB6591 FOREIGN KEY (first_player_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE game ADD CONSTRAINT FK_232B318CA40D7457 FOREIGN KEY (second_player_id) REFERENCES user (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE game');
    }
}
