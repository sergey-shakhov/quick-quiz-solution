# QuickQuiz

QuickQuiz (QQ for short) is a simple and modern tool for creating and running tests. It can be used to evaluate knowledge and skills in companies and educational institutions.

## Status

QQ is under active development now. There's no stable version officially released so far. Stay tuned!

## Install

### 1. Install PostgreSQL, create and configure database

You can download and start PostgreSQL database server using [official documentation](https://www.postgresql.org/download/). Alternatively you can use MySQL, MariaDB or SQLite if you want. We assume you use PostgreSQL in all steps below.

Start PostgreSQL server after installation is completed:

```
# systemctl start postgresql
```

Run `psql` with appropriate privileges (usually under `postgres` user):

```
[postgres@machine /]$ psql
```

Create user:

```
postgres=# CREATE USER qq_user WITH PASSWORD 'your-database-password';
```

Create database:

```
postgres=# CREATE DATABASE qq_db WITH OWNER qq_user;
```

### 2. Install Node

Follow [official instructions](https://nodejs.org/en/download/) to download and install Node.js for your system.

### 3. Run QQ backend

Open configuration file `./qq-backend/etc/qq.config.yaml` and put your database password and service API key there:

```yaml
service:
  # API Key: create strong password and keep it safe
  apiKey: your-service-key
  templateDirectory: templates

database:
  # Put your database password here instead of <your-database-password>
  connectionUrl: postgres://qq_user:<your-database-password>@127.0.0.1:5432/qq_db
```

You can also configure SMTP server setting if you'd like to have e-mail notitications.

Then execute the following command from Git repositiry root to start QQ backend in development mode:

```
[user@machine quick-quiz-solution]$ cd qq-backend && yarn && yarn start
```

### 4. Run QQ frontend

Execute the following command from Git repositiry root to start QQ frontend in development mode:

```
[user@machine quick-quiz-solution]$ cd qq-frontend && yarn && yarn start
```

### 5. Happy hacking!

You're done with installation. Then you need to create a quiz and run it, continue reading.

## Using QQ

## How to create quiz

```
[user@machine quick-quiz-solution]$ curl --verbose -X POST -H 'Content-Type: application/json' -H 'X-API-Key: <your-service-key>' -d '{"quizTemplateTechnicalName": "demo", "quizName": "Demo quiz", "expiresAt": "2023-06-10", "assignee": {"firstName": "Fyodor", "lastName": "Dostoevsky", "email": "dostoevsky@example.com"}}' http://localhost:8080/quizzes
```

Copy `id` of the quiz from JSON response.

## How to run the quiz you've just created

Start the browser and type in address bar:

```
http://localhost:3000/quiz/<quiz-if-you-have-copied-from-json-response>
```

For example:

```
http://localhost:3000/quiz/3e730127-c293-4e7d-b713-53b4cc4104cf
```

Good luck! You can [create an issue](https://github.com/sergey-shakhov/quick-quiz-solution/issues/new) if you have any idea about the project.
