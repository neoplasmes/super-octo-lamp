# Пояснение

- Так как практика 2.0. предусматривает эмуляцию работы с таблицами, всё было сразу сделано через библиотеку redis для node js. 
По сути под капотом находится всё тот же redis-cli, который только представлен через удобный API.

- Библиотека redis для node js - это аналог JDBC и подобных библиотек

- Для работы использовался образ на докере с RedisStack, из которого для эмуляции работы с таблицами были использованы RedisJSON и redisSearch

- В центре всего находится класс RedisJsonRepo, предоставляющий более удобно API для работы с redis'ом, Всё остальное - обёртка вокруг него.

- Все SQL-задания выполнены в папке server/repositories/advancedCasesRepository

- В работе с запросами много JavaScript кода, но это вынужденная необходимость, так как в Redis невозможно сымитировать JOIN'ы из SQL. API redis'а старался использоваться по максимуму

- Мы рассчитываем на максимальную оценку))

# Инфра:

## общие положения
- windows 11 + WSL 2 с Ubuntu.
- на win 11 устанавливаем Docker Desktop, и у нас автоматически доступен Docker в терминале WSL
- в WLS запускаем команду ```docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest``` и у нас запускается <b>redis-stack</b> с вообще всеми плюшками
- потом уже из node.js коннектимся к этому всему

## код
- для запуска одной командой сразу и сервака и фронта юзаем "concurrently" (см. <i>package.json</i> в корне)
- как запустить одной командой ещё и докер я не знаю

