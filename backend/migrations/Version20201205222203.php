<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201205222203 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D649477B5BAE');
        $this->addSql('DROP TABLE queue');
        $this->addSql('DROP INDEX IDX_8D93D649477B5BAE ON user');
        $this->addSql('ALTER TABLE user ADD queue TINYINT(1) NOT NULL, DROP queue_id');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE queue (id INT AUTO_INCREMENT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE `utf8_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE user ADD queue_id INT DEFAULT NULL, DROP queue');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D649477B5BAE FOREIGN KEY (queue_id) REFERENCES queue (id)');
        $this->addSql('CREATE INDEX IDX_8D93D649477B5BAE ON user (queue_id)');
    }
}
