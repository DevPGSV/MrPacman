<?php

require_once(__DIR__.'/api/db.php');

$stmt = $db->query("
  SELECT DISTINCT Person.uid 'uid', Person.nick 'nick', MAX(Scores.score) 'MaxScore'
  FROM Scores JOIN Person ON Scores.person_uid = Person.uid
  GROUP BY Person.uid
  ORDER BY MaxScore DESC, Person.uid ASC
");
$scores = $stmt->fetchAll(PDO::FETCH_ASSOC);

$highlightUid = empty($_GET['uid']) ? -1 : intval($_GET['uid']);
$redirTime = empty($_GET['redirtime']) ? 10 : intval($_GET['redirtime']);
$redirPage = empty($_GET['redirpage']) ? '' : $_GET['redirpage'];
if (!in_array($redirPage, ['.', 'index.html', 'ranking.php', 'aviso-legal.html'])) {
  $redirPage = '';
}
$redirCode = '';
if (empty($redirPage)) {
  $redirCode = "<meta http-equiv='refresh' content='$redirTime'>";
} else {
  $redirCode = "<meta http-equiv='refresh' content='$redirTime; url=$redirPage'>";
}


?><html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/font_Permanent_Marker.css" />
  <script src="js/modernizr.min.js"></script>
  <script src="js/jquery.min.js"></script>
  <script src="js/script.js"></script>
  <link rel="icon" href="img/cropped-mrH-32x32.png" sizes="32x32" />
  <?php echo $redirCode; ?>
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
      $maxPos = 10;
      foreach ($scores as $score) {
        $pos++;
        if ($pos > $maxPos && $highlightUid !== $score['uid']) {
          continue;
        }
        if ($highlightUid === $score['uid']) {
          if ($pos > $maxPos+1) {
            echo "<tr>\n";
            echo "  <td>11 ··· " . ($pos-1) . "</td>\n";
            echo "  <td>···</td>\n";
            echo "  <td>···</td>\n";
            echo "</tr>\n";
          }
          echo "<tr class='highlight'>\n";
          $selectedUidDisplayed = true;
        } else {
          echo "<tr>\n";
        }
        echo "  <td>$pos</td>\n";
        echo "  <td>".htmlentities($score['nick'])."</td>\n";
        echo "  <td>{$score['MaxScore']}</td>\n";
        echo "</tr>\n";
      }
      ?>
      </table>
    </div>
</body>
<html>
