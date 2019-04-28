<?php

require_once(__DIR__.'/db.php');
header('Content-Type: application/json; charset=utf-8');

$uid = intval($_POST['uid']);
$score = intval($_POST['score']);

if ( !isset($uid) || $uid < 0 ) {
  echo json_encode(['status' => 'error', 'errors' => "Empty or invalid uid"]);
  exit();
}
if ( !isset($score) || $score < 0 ) {
  echo json_encode(['status' => 'error', 'errors' => "Empty or invalid score"]);
  exit();
}

$stmt = $db->prepare("INSERT INTO Scores (person_uid, score, timestamp)VALUES(:person_uid, :score, :timestamp)");
$stmt->bindValue(':person_uid', $uid, PDO::PARAM_INT);
$stmt->bindValue(':score', $score, PDO::PARAM_INT);
$stmt->bindValue(':timestamp', time(), PDO::PARAM_INT);
$r = $stmt->execute();

if (!$r) {
  echo json_encode(['status' => 'error', 'errors' => "Error when saving score"]);
  exit();
}

echo json_encode(['status' => 'ok', 'errors' => "Saved score"]);
exit();
