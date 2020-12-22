<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201219123924 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE game (id INT AUTO_INCREMENT NOT NULL, p1_id INT NOT NULL, p2_id INT NOT NULL, p1_locked VARCHAR(255) DEFAULT NULL, p2_locked VARCHAR(255) DEFAULT NULL, p1_correct INT NOT NULL, p2_correct INT NOT NULL, question VARCHAR(255) DEFAULT NULL, answers LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:array)\', correct_answer VARCHAR(255) DEFAULT NULL, timer INT NOT NULL, question_number INT NOT NULL, UNIQUE INDEX UNIQ_232B318CEE679434 (p1_id), UNIQUE INDEX UNIQ_232B318CFCD23BDA (p2_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE game ADD CONSTRAINT FK_232B318CEE679434 FOREIGN KEY (p1_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE game ADD CONSTRAINT FK_232B318CFCD23BDA FOREIGN KEY (p2_id) REFERENCES user (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE game');
    }
}
