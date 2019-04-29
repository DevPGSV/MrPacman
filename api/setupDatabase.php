<?php

require_once(__DIR__.'/db.php');
header('Content-Type: application/json; charset=utf-8');

$db->exec("
  CREATE TABLE `Person` (
    `uid` int(11) NOT NULL AUTO_INCREMENT,
    `nombre` varchar(32) NOT NULL,
    `apellidos` varchar(64) NOT NULL,
    `nick` varchar(32) NOT NULL,
    `email` varchar(128) NOT NULL,
    `twitter` varchar(32),
    `empresa` varchar(64) NOT NULL,
    `cargo` varchar(64) NOT NULL,
    `comunicados` TINYINT NOT NULL,
    `condiciones` TINYINT NOT NULL,
    PRIMARY KEY (`uid`)
  )
");


$db->exec("
  CREATE TABLE `Scores` (
    `person_uid` int(11) NOT NULL,
    `score` int(11) NOT NULL,
    `timestamp` int(11) NOT NULL,
    KEY `person_uid` (`person_uid`),
    CONSTRAINT `Scores_ibfk_1` FOREIGN KEY (`person_uid`) REFERENCES `Person` (`uid`)
  )
");

$stmt = $db->prepare("INSERT INTO Person (uid, nombre, apellidos, nick, email, empresa, cargo, comunicados, condiciones)
  VALUES(1, 'Anonymous', 'Anonymous', 'Anonymous', '', '', '', false, false)");
$r = $stmt->execute();
