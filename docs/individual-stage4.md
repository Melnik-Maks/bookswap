# Індивідуальне завдання. Етап 4: автоматизація тестування та IaC

Усі команди нижче призначені для PowerShell. Тексти про успішні результати
вставляй у звіт після отримання відповідного результату у своєму середовищі.
Реальні ключі AWS, паролі, файли `.env`, Terraform state та `terraform.tfvars`
до звіту й репозиторію не додавай.

## Мета

Автоматизувати перевірку API та вебінтерфейсу BookSwap за допомогою PyTest
і Cypress, інтегрувати перевірки в GitHub Actions та підготувати
Terraform-конфігурацію розгортання застосунку в AWS.

## 1. PyTest: перевірка backend

Файли: `backend/tests/conftest.py`, `test_main.py`, `test_books.py`.
Спільна fixture створює окрему SQLite-базу для кожного тесту та запускає
життєвий цикл FastAPI. Робоча PostgreSQL у цих перевірках не використовується.

```powershell
cd M:\UNI_7\DevOps\bookswap\backend
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m pytest -v --junitxml=reports/pytest.xml
```

Якщо `venv` ще немає, перед цими командами виконай `python -m venv venv`.

Очікується `17 passed`. XML-звіт: `backend/reports/pytest.xml`.

**Текст для звіту:**

> Розроблено автоматизовані тести backend BookSwap із використанням PyTest
> та FastAPI TestClient. Кожний тест отримує ізольовану SQLite-базу даних.
> Перевірено доступність API, отримання порожнього каталогу, створення та
> читання книг, видалення зайвих пробілів, граничну довжину полів і відхилення
> некоректних запитів. Перевірено, що помилковий запит не змінює вже збережені
> записи. Успішно виконано 17 тестів.

**Скриншот І.1:** результат PyTest зі списком перевірок та `17 passed`.
Підпис: «Автоматизоване тестування backend BookSwap за допомогою PyTest».

## 2. Cypress: вебінтерфейс і взаємодія з API

Файли: `frontend/cypress.config.ts`, `frontend/cypress/e2e/books.cy.ts`,
`compose.e2e.yaml`.

Встанови залежності frontend і Cypress:

```powershell
cd M:\UNI_7\DevOps\bookswap\frontend
npm ci
npx cypress install
npm run lint
npm run build
npm run test:e2e:types
```

Після запуску Docker Desktop підніми окремий тестовий стенд:

```powershell
cd M:\UNI_7\DevOps\bookswap
docker compose -p bookswap-e2e -f compose.e2e.yaml up --build -d --wait --wait-timeout 180
```

Цей стенд доступний на `http://127.0.0.1:8082`. Він має власну PostgreSQL
у тимчасовій пам'яті; його дані зникають після видалення контейнерів.

```powershell
cd M:\UNI_7\DevOps\bookswap\frontend
npm run test:e2e
```

Очікується 5 успішних сценаріїв. Перший використовує справжні API та
PostgreSQL: додає книгу через форму, оновлює сторінку й перевіряє збережений
запис. Інші перевіряють стани інтерфейсу зі змодельованими відповідями API.
Для ручного перегляду тестів можна виконати `npm run test:e2e:open`.

XML-результати: `frontend/cypress/results`; відео: `frontend/cypress/videos`;
скриншоти помилок: `frontend/cypress/screenshots`.

Після збереження результатів зупини саме тестовий стенд:

```powershell
cd M:\UNI_7\DevOps\bookswap
docker compose -p bookswap-e2e -f compose.e2e.yaml down --volumes --remove-orphans
```

**Текст для звіту:**

> Створено п'ять браузерних сценаріїв Cypress для BookSwap. Перевірено
> додавання книги через форму та збереження після перезавантаження сторінки
> з використанням реального backend і PostgreSQL. Окремо перевірено порожній
> каталог, відображення отриманих книг, блокування незаповненої форми,
> повідомлення про помилки завантаження й збереження та повторне надсилання
> форми після помилки. Стенд розгорнуто через окрему Docker Compose
> конфігурацію. Сценарії завершилися успішно.

**Скриншот І.2:** результат Cypress із п'ятьма успішними тестами.
Підпис: «Браузерне тестування BookSwap за допомогою Cypress».

**Скриншот І.3:** сторінка тестового BookSwap з книгою, створеною E2E-тестом.
Зроби його до зупинки тестового стенда.
Підпис: «Перевірка взаємодії вебінтерфейсу, API та PostgreSQL».

## 3. GitHub Actions

Файл: `.github/workflows/ci.yml`.

Конвеєр запускається для `push` і `pull_request` у `main`, а також вручну.
Він містить п'ять jobs: backend, frontend, e2e, terraform та containers.
Збірка контейнерів залежить від успішного завершення всіх перевірок.
Для перевірки Terraform у CI не потрібні ключі AWS: виконуються init без
backend та validate, а plan/apply автоматично не запускаються.

Перед публікацією переглянь зміни через `git diff` і `git status`.
Перебуваючи на гілці `main`, додай файли застосунку й індивідуального завдання:

```powershell
cd M:\UNI_7\DevOps\bookswap
git add backend frontend .github infra docs compose.e2e.yaml compose.production.yaml .gitignore .gitattributes
git commit -m "Add BookSwap automated tests and Terraform infrastructure"
git push origin main
```

У GitHub відкрий репозиторій Melnik-Maks/bookswap → Actions → BookSwap CI.
Дочекайся завершення всіх jobs. Перевір артефакти `pytest-results` та
`cypress-results`. Журнали й результати публікуються також при падінні тестів.

**Текст для звіту після успішного запуску в GitHub:**

> Оновлено конвеєр GitHub Actions. Під час push і pull request виконуються
> тести backend, перевірка й збірка frontend, браузерні сценарії Cypress
> та перевірка Terraform-конфігурації. Після успішного завершення цих етапів
> виконується збірка Docker-образів застосунку. XML-звіти, відео Cypress та
> журнали тестових контейнерів зберігаються як артефакти запуску.

**Скриншот І.4:** успішний запуск BookSwap CI з усіма п'ятьма jobs.
Підпис: «Автоматизовані перевірки BookSwap у GitHub Actions».

**Скриншот І.5:** артефакти `pytest-results` і `cypress-results`.
Підпис: «Збереження результатів тестування в артефактах CI».

## 4. Terraform: інфраструктура BookSwap

Файли в `infra/terraform`: `versions.tf`, `variables.tf`, `main.tf`,
`outputs.tf`, `templates/user-data.sh.tftpl`, `terraform.tfvars.example`.

Конфігурація описує сім AWS-ресурсів: VPC, Internet Gateway, публічну
підмережу, таблицю маршрутів, прив'язку таблиці, групу безпеки та EC2.
Amazon Linux 2023 x86_64 визначається автоматично в обраному регіоні.
Назви ресурсів і параметри середовища передаються через змінні.

Після першого запуску EC2 cloud-init встановлює Docker і Compose, завантажує
публічний репозиторій та запускає `compose.production.yaml` через systemd.
Пароль PostgreSQL генерується на сервері та зберігається у файлі `.env`
з правами 600. Він не є Terraform-змінною і не записується в state.
Назовні відкрито HTTP-порт 80; PostgreSQL і backend доступні через внутрішню
мережу Docker. Це навчальний стенд з HTTP, без TLS і резервування.

**Перед AWS apply обов'язково опублікуй актуальний код у GitHub.**
EC2 завантажує branch/tag із repository_ref; локальні неопубліковані файли
на сервер не потрапляють. Для фіксованої версії можна вказати опублікований
тег. Поточний публічний repository_url задано в variables.tf.

Виконай локальні перевірки:

```powershell
cd M:\UNI_7\DevOps\bookswap\infra\terraform
terraform init
terraform fmt -check -recursive
terraform validate
```

За потреби скопіюй `terraform.tfvars.example` у `terraform.tfvars` та зміни
регіон, тип екземпляра, branch/tag або http_cidr. Реальні ключі AWS сюди
не записуй: використовується вже налаштований профіль AWS CLI.

```powershell
terraform plan
```

Під час першого запуску очікується `Plan: 7 to add, 0 to change, 0 to destroy`.
Для планування потрібні чинні облікові дані AWS. Для розгортання потрібні
дозволи на EC2 та VPC. Створені ресурси можуть нараховувати оплату.

```powershell
terraform apply
```

Перевір план і підтвердь введенням `yes`. Після створення EC2 дочекайся
завершення cloud-init і збірки контейнерів (зазвичай кілька хвилин).
Відкрий значення `application_url`, додай книгу та перезавантаж сторінку.
Для перевірки API відкрий `health_url`: очікується `{"status":"ok"}`.
У разі помилки запуску перевір system log екземпляра в EC2 Console;
детальний журнал на сервері — `/var/log/cloud-init-output.log`.

**Текст для звіту про підготовку конфігурації:**

> Підготовлено Terraform-конфігурацію інфраструктури BookSwap у AWS.
> Описано VPC, публічну підмережу, маршрутизацію, групу безпеки та EC2.
> Вибір AMI автоматизовано через джерело даних. Під час початкового
> налаштування сервера Docker Compose запускає frontend, backend і
> PostgreSQL із публічного репозиторію проєкту. Доступні вихідні значення
> ідентифікаторів ресурсів, IP-адреси та URL застосунку. Конфігурація пройшла
> перевірку Terraform validate.

**Додай лише після успішного розгортання:**

> Командою terraform apply створено сім ресурсів AWS. Перевірено роботу
> вебінтерфейсу BookSwap, додавання книги, її збереження після оновлення
> сторінки та відповідь API health. Після збереження результатів інфраструктуру
> видалено командою terraform destroy.

**Скриншот І.6:** дерево Terraform-файлів і успішний validate.
Підпис: «Структура та перевірка Terraform-конфігурації BookSwap».

**Скриншот І.7:** план із сімома ресурсами.
Підпис: «План створення інфраструктури BookSwap у AWS».

**Скриншот І.8:** результат apply та вихідні значення.
Підпис: «Розгортання інфраструктури BookSwap».

**Скриншот І.9:** BookSwap за адресою application_url зі створеною книгою.
Підпис: «BookSwap, розгорнутий на EC2 за допомогою Terraform».

Після збереження скриншотів у цьому самому каталозі виконай:

```powershell
terraform destroy
```

Підтвердь введенням `yes`. Це видаляє також диск EC2 і навчальну базу даних
цього стенда. State зберігається локально: не видаляй його до очищення AWS.

**Скриншот І.10:** результат destroy.
Підпис: «Очищення ресурсів індивідуального завдання».

## Висновок

> Автоматизовано перевірку API та вебінтерфейсу BookSwap за допомогою
> PyTest і Cypress. Тести інтегровано в GitHub Actions разом зі збіркою
> frontend, перевіркою Terraform та збіркою контейнерів. Підготовлено
> параметризовані Terraform-конфігурації інфраструктури застосунку в AWS.

До висновку додай фактичний результат запуску CI та розгортання, коли
відповідні кроки буде виконано. Код тестів, workflow та Terraform-файли
додай як нумеровані листинги або додатки. Для оформлення використовуй
Times New Roman 14 пт, інтервал 1,5; код — моноширинним шрифтом.
