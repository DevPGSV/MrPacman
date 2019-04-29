# MrPacman

Juego de Pacman para MrHouston.

    Entrega: 30/04
    Lanzamiento: 08/05 Y 09/05

## Instalación

Se requiere de PHP y MySQL/MariaDB

En el sistema gestor de base de datos crear una base de datos, un usuario (con una contraseña) y dar permiso al usuario para trabajar con la base de datos.

Modificar "$\_SQL" en api/setupDatabase.php para permitir la xonexión a la base de datos.

Ejecutar el archivo "api/setupDatabase.php" (por terminal o desde el navegador) para inicializar la base de datos.

## Especificaciones técnicas:

* Pantalla de resolución nativa Full HD 1920 x 1080
* Colores corporativos:
  * Naranja MrH: hex(#ED6E00), rgb(237/110/0)

## Requerimientos:

- [x] Estética Mr Houston (cambiado a #ED6E00)
- [x] Poner logo MrH en HTML
- [ ] Cambiar los fantasmas por virus
- [x] Cambiar pacman por sprite
- [x] Realizar nuevo mapa en función de la dimensión de la pantalla
- [ ] Ranking (para cada día)
- [ ] Registro de usuario
