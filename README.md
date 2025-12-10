# Онлайн‑кинотеатр

## 🎯 Цель работы
Разработать веб‑приложение «Онлайн‑кинотеатр» с использованием:
- **NestJS (TypeScript)** — серверная часть (REST API, авторизация, бизнес‑логика).
- **Vue 3 (TypeScript)** — клиентская часть (интерфейс пользователя и админ‑панель).
- **PostgreSQL + Drizzle ORM** — база данных и миграции.

Приложение поддерживает авторизацию, управление пользователями, работу с фильмами, жанрами, актёрами, подписками, избранным и персонализацией.

---

## 📝 Задание
**Продемонстрировать работу приложения.**  
Подготовить руководство пользователя с описанием основных функций и интерфейсов.

---

## ⚙️ Архитектура проекта
- **Backend (NestJS)**  
  - REST API для всех сущностей.  
  - Авторизация JWT, проверка ролей и статуса пользователя.  
  - Сервисы для фильмов, жанров, актёров, подписок, избранного, просмотров и отзывов.  
  - Middleware для журналирования действий.  

- **Frontend (Vue 3 + TS)**  
  - Интерфейс для пользователей и администраторов.  
  - Просмотр фильмов, поиск, фильтрация.  
  - Управление подписками и избранным.  
  - Админ‑панель для управления пользователями, фильмами, жанрами, актёрами.  

- **Database (PostgreSQL + Drizzle ORM)**  
  - Схема разделена по namespace: `User`, `Movie`, `Genre`, `Actor`, `Subscription`, `Favorites`, `Comment`, `View`, `ActionLog`.  
  - Связи многие‑ко‑многим: `Movie_Genre`, `Movie_Actor`, `User_Role`, `User_Subscription`.  
  - Все внешние ключи настроены с `ON DELETE CASCADE`.  

---

## 📖 Руководство пользователя

### 1. Авторизация
- Ввод логина и пароля.  
- Проверка статуса пользователя (активен/заблокирован).  
- Определение роли (администратор / пользователь).  

### 2. Управление пользователями
- Создание нового пользователя.  
- Удаление пользователя.  
- Просмотр списка пользователей.  
- Обновление данных (ФИО, email, статус).  
- Назначение и снятие ролей.  

### 3. Журналирование действий
- Запись каждого действия (авторизация, просмотр фильма, добавление/удаление данных).  
- Просмотр истории действий администратором.  

### 4. Работа с фильмами
- Просмотр списка всех фильмов.  
- Поиск по названию.  
- Фильтрация по жанру.  
- Просмотр информации (год выпуска, описание, актёры, жанры, рейтинг).  
- Добавление, удаление и редактирование фильма (администратор).  

### 5. Жанры и актёры
- Добавление/редактирование жанров и актёров (администратор).  
- Просмотр списков жанров и актёров.  
- Просмотр информации об актёре и фильмах с его участием.  
- Установка связей «фильм‑жанр» и «фильм‑актёр».  

### 6. Просмотры фильмов
- Начало просмотра.  
- Сохранение позиции останова.  
- Продолжение просмотра с места останова.  
- Просмотр истории просмотров пользователя.  

### 7. Отзывы
- Добавление отзыва и рейтинга.  
- Просмотр отзывов других пользователей.  
- Подсчёт среднего рейтинга фильма.  

### 8. Подписки
- Просмотр списка доступных тарифов.  
- Оформление подписки.  
- Проверка статуса (активна/завершена).  
- Продление или завершение подписки.  

### 9. Избранное
- Добавление фильма в избранное.  
- Удаление фильма из избранного.  
- Просмотр списка избранных фильмов.  
- Проверка доступности фильма с учётом подписки.  

### 10. Фильтрация по региону
- Фильтрация по языку.  
- Фильтрация по стране производства.  
- Отображение популярных фильмов по региону.  

### 11. Персонализация
- Рекомендации на основе избранного.  
- Уведомления о новых фильмах в любимом жанре.  
- Подборка «Похожие на ваши избранные».  

---

## 🖥️ Интерфейсы
- **Главная страница**: список фильмов, поиск, фильтрация.  
- **Страница фильма**: описание, актёры, жанры, отзывы, кнопка «Добавить в избранное».  
- **Профиль пользователя**: данные, подписка, избранное, история просмотров.  
- **Админ‑панель**: управление пользователями, фильмами, жанрами, актёрами.  

---

## 🎬 Демонстрация работы
1. Пользователь регистрируется и входит в систему.  
2. Просматривает список фильмов, фильтрует по жанру.  
3. Начинает просмотр фильма, останавливается и продолжает позже.  
4. Добавляет фильм в избранное.  
5. Оставляет отзыв и рейтинг.  
6. Администратор добавляет новый фильм и жанр.  
7. Администратор просматривает журнал действий пользователей.  

---

## ✅ Итог
Приложение «Онлайн‑кинотеатр» реализует полный цикл работы:  
- Авторизация и управление пользователями.  
- Работа с фильмами, жанрами и актёрами.  
- Подписки, избранное, просмотры и отзывы.  
- Персонализация и фильтрация по региону.  

Руководство пользователя демонстрирует основные функции и интерфейсы, обеспечивая удобство работы как для обычных пользователей, так и для администраторов.








<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
