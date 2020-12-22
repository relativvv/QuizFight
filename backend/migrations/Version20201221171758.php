<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201221171758 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE game ADD p1_hp INT NOT NULL, ADD p2_hp INT NOT NULL');
        $this->addSql('ALTER TABLE user ADD all_time_correct INT NOT NULL, ADD games_won INT NOT NULL, ADD games_played INT NOT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE game DROP p1_hp, DROP p2_hp');
        $this->addSql('ALTER TABLE user DROP all_time_correct, DROP games_won, DROP games_played');
    }
}
