<?php
$basicAuthUser = 'houston';
$basicAuthPassword = 'mrpacman';

if (!isset($_SERVER['PHP_AUTH_USER']) || $_SERVER['PHP_AUTH_USER'] !== $basicAuthUser || $_SERVER['PHP_AUTH_PW'] !== $basicAuthPassword) {
    header('WWW-Authenticate: Basic realm="MrPacman-MrHoston"');
    header('HTTP/1.0 401 Unauthorized');
    ?>
<html>
<head><title>404 Not Found</title></head>
<body bgcolor="white">
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.14.1</center>
</body>
</html>
    <?php
    exit;
}

require_once(__DIR__.'/api/db.php');

$stmt = $db->query("
  SELECT DISTINCT Person.uid 'uid', Person.nombre 'nombre', Person.apellidos 'apellidos', Person.nick 'nick', Person.email 'email', Person.twitter 'twitter', Person.empresa 'empresa', Person.cargo 'cargo', MAX(Scores.score) 'MaxScore'
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
</head>
<body>
    <div id="ranking">
    <table class="ranking">
      <tr>
        <th id="posicion">Posición</th>
        <th>Nombre</th>
        <th>Apellidos</th>
        <th>Nickname</th>
        <th>Email</th>
        <th>Twitter</th>
        <th>Empresa</th>
        <th>Cargo</th>
        <th>Puntuación</th>
      </tr>
      <?php
      $pos = 0;
      $maxPos = 10;
      foreach ($scores as $score) {
        $pos++;
        if ($highlightUid === $score['uid']) {
          echo "<tr class='highlight'>\n";
        } else {
          echo "<tr>\n";
        }
        echo "  <td>$pos</td>\n";
        echo "  <td>".htmlentities($score['nombre'])."</td>\n";
        echo "  <td>".htmlentities($score['apellidos'])."</td>\n";
        echo "  <td>".htmlentities($score['nick'])."</td>\n";
        echo "  <td>".htmlentities($score['email'])."</td>\n";
        if (!empty($score['twitter'])) {
          echo "  <td><a href='http://twitter.com/".htmlentities($score['twitter'])."' target='_blank' title='@".htmlentities($score['twitter'])."'>@".htmlentities($score['twitter'])."</a></td>\n";
        } else {
          echo "  <td></td>\n";
        }
        echo "  <td>".htmlentities($score['empresa'])."</td>\n";
        echo "  <td>".htmlentities($score['cargo'])."</td>\n";
        echo "  <td>{$score['MaxScore']}</td>\n";
        echo "</tr>\n";
      }
      ?>
      </table>
    </div>
</body>
<html>
