# Инструкция по запуску бэкенда

Для запуска бэкенда выполните следующие шаги в указанном порядке:

1. **Настройка переменных окружения**  
   Создайте или отредактируйте файл `.env` в корне проекта и добавьте следующие переменные:  
   ```
   NODE_ENV="development"
   PORT="4000"

   POSTGRES_USER="root"
   POSTGRES_PASSWORD="admin"
   POSTGRES_HOST="localhost"
   POSTGRES_PORT="5432"
   POSTGRES_DB="mydb"

   MINIO_ENDPOINT="http://localhost:9000"
   MINIO_ROOT_USER="admin"
   MINIO_ROOT_PASSWORD="adminadmin"
   MINIO_BUCKET="audio"

   DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

   GRAPHQL_PREFIX="/graphql"

   ALLOWED_ORIGIN="http://localhost:3000"
   PRESIGNED_EXPIRES="3600"
   ```

2. **Запуск Minio и базы данных**  
   Используйте Docker Compose для запуска сервисов Minio и базы данных в фоновом режиме:  
   ```
   docker compose up --build -d
   ```

3. **Установка зависимостей**  
   Установите все необходимые зависимости проекта:  
   ```
   npm install
   ```

4. **Генерация Prisma Client**  
   Сгенерируйте Prisma Client для работы с базой данных:  
   ```
   npx prisma generate
   ```

5. **Синхронизация схемы базы данных**  
   Примените схему Prisma к базе данных:  
   ```
   npx prisma db push
   ```

6. **Сборка проекта**  
   Выполните сборку приложения для продакшена:  
   ```
   npm run build
   ```

7. **Запуск бэкенда**  
   Запустите сервер бэкенда:  
   ```
   npm run start
   ```

После выполнения этих команд бэкенд будет запущен и готов к обработке запросов по адресу `http://localhost:4000/graphql`. Убедитесь, что все сервисы (база данных, Minio) доступны и переменные окружения настроены корректно.
