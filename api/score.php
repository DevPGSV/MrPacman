<?php

require_once(__DIR__.'/db.php');
header('Content-Type: application/json; charset=utf-8');

if ( empty($_GET['uid']) || !filter_var($_GET['uid'], FILTER_VALIDATE_INT, ['options'=>['min_range'=>0]]) ) {
  echo json_encode(['status' => 'error', 'errors' => "Empty or invalid uid"]);
  exit();
}
if ( empty($_GET['score']) || !filter_var($_GET['score'], FILTER_VALIDATE_INT, ['options'=>['min_range'=>0]]) ) {
  echo json_encode(['status' => 'error', 'errors' => "Empty or invalid score"]);
  exit();
}

$uid = $_GET['uid'];
$score = $_GET['score'];

$stmt = $db->prepare("INSERT INTO Scores VALUES(:person_uid, :score, :timestamp)");
$stmt->bindValue(':person_uid', $score, PDO::PARAM_INT);
$stmt->bindValue(':score', $uid, PDO::PARAM_INT);
$stmt->bindValue(':timestamp', time(), PDO::PARAM_INT);
$r = $stmt->execute();

if (!$r) {
  echo json_encode(['status' => 'error', 'errors' => "Error when saving score"]);
  exit();
}

echo json_encode(['status' => 'ok', 'errors' => "Saved score"]);
exit();
