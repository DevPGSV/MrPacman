<?php

require_once(__DIR__.'/db.php');
header('Content-Type: application/json; charset=utf-8');

$db->exec("
  CREATE TABLE `Person` (
    `uid` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(32) NOT NULL,
    `surname` varchar(11) NOT NULL,
    `email` int(11) NOT NULL,
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
