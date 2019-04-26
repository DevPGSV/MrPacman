<?php

require_once(__DIR__.'/db.php');
header('Content-Type: application/json; charset=utf-8');

$db->exec("
  CREATE TABLE `Person` (
    `uid` INT(11) NOT NULL PRIMARY KEY,
    `name` VARCHAR(32) NOT NULL,
    `surname` VARCHAR(11) NOT NULL,
    `email` int(11) NOT NULL
  )
");


$db->exec("
  CREATE TABLE `Scores` (
    `person_uid` INT(11) NOT NULL,
    `score` INT(11) NOT NULL,
    `timestamp` INT(11) NOT NULL,
    FOREIGN KEY (person_uid) REFERENCES Person(uid)
  )
");
