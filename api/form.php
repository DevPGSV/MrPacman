<?php

require_once(__DIR__.'/db.php');
header('Content-Type: application/json; charset=utf-8');


$requiredFields = ['nombre', 'apellidos', 'nick', 'email', 'empresa', 'cargo', 'comunicados', 'condiciones'];

$requiredFieldsEmpty = [];
foreach ($requiredFields as $field) {
  if (empty($_POST[$field])) {
    $requiredFieldsEmpty[] = $field;
  }
}
if (count($requiredFieldsEmpty) > 0) {
  echo json_encode(['status' => 'error', 'errors' => "Some empty fields are required: " . implode($requiredFieldsEmpty, ', ') ]);
  exit();
}

if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL) ) {
  echo json_encode(['status' => 'error', 'errors' => "Invalid email" ]);
  exit();
}
if ( $_POST['comunicados'] !== 'on' ) {
  echo json_encode(['status' => 'error', 'errors' => "Autorizo a recibir comunicados: required" ]);
  exit();
}
if ( $_POST['condiciones'] !== 'on' ) {
  echo json_encode(['status' => 'error', 'errors' => "Acepto los términos y condiciones: required" ]);
  exit();
}


$stmt = $db->prepare("INSERT INTO Person (nombre, apellidos, nick, email, empresa, cargo, comunicados, condiciones) VALUES(:nombre, :apellidos, :nick, :email, :empresa, :cargo, :comunicados, :condiciones)");
$stmt->bindValue(':nombre', $_POST['nombre'], PDO::PARAM_STR);
$stmt->bindValue(':apellidos', $_POST['apellidos'], PDO::PARAM_STR);
$stmt->bindValue(':nick', $_POST['nick'], PDO::PARAM_STR);
$stmt->bindValue(':email', $_POST['email'], PDO::PARAM_STR);
$stmt->bindValue(':empresa', $_POST['empresa'], PDO::PARAM_STR);
$stmt->bindValue(':cargo', $_POST['cargo'], PDO::PARAM_STR);
$stmt->bindValue(':comunicados', $_POST['comunicados'] === 'on', PDO::PARAM_INT);
$stmt->bindValue(':condiciones', $_POST['condiciones'] === 'on', PDO::PARAM_INT);
$r = $stmt->execute();

if (!$r) {
  echo json_encode(['status' => 'error', 'errors' => "Error when saving form data"]);
  exit();
}
$uid = $db->lastInsertId();
echo json_encode(['status' => 'ok', 'errors' => "Saved form data", 'uid' => $uid]);
exit();
