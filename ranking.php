<?php

require_once(__DIR__.'/api/db.php');

$stmt = $db->query("
  SELECT DISTINCT Person.uid 'uid', Person.nick 'nick', MAX(Scores.score) 'MaxScore'
  FROM Scores JOIN Person ON Scores.person_uid = Person.uid
  GROUP BY Person.uid
  ORDER BY MaxScore DESC, Person.uid ASC
");
$scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
?><html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/font_Permanent_Marker.css" />
  <script src="js/modernizr.min.js"></script>
  <script src="js/jquery.min.js"></script>
  <script src="js/script.js"></script>
  <link rel="icon" href="img/cropped-mrH-32x32.png" sizes="32x32" />

  <meta http-equiv="refresh" content="10">
</head>
<body>
  <div id="logo">
    <a href="https://mrhouston.net/" target="_blank"><img src="img/logo_mrHoustonblanco.png" alt="Mr. Houston logo"/></a>
  </div>
    <h1>We have a problem</h1>
    <div id="ranking">
    <table class="ranking">
      <tr>
        <th id="posicion">Posición</th>
        <th>Nickname</th>
        <th>Puntuación</th>
      </tr>
      <?php
      $pos = 0;
      foreach ($scores as $score) {
        $pos++;
        echo "<tr>\n";
        echo "  <td>$pos</td>\n";
        echo "  <td>{$score['nick']}</td>\n";
        echo "  <td>{$score['MaxScore']}</td>\n";
        echo "</tr>\n";
      }
      ?>
      </table>
    </div>
</body>
<html>
