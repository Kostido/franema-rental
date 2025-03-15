# Приложение для бронирования видеотехники

Веб-приложение для бронирования видеооборудования с верификацией через Telegram.

## Технологический стек

### Фронтенд

- **Next.js** - React-фреймворк с возможностью серверного рендеринга
- **TypeScript** - Типизированная разработка кода
- **Tailwind CSS** - CSS-фреймворк, основанный на утилитарных классах
- **React Hook Form** - Управление формами с валидацией
- **date-fns** - Библиотека для работы с датами для календаря бронирования

### Бэкенд и база данных

- **Supabase** - Платформа Backend-as-a-Service
  - PostgreSQL база данных
  - Система аутентификации
  - Хранилище для изображений оборудования
  - Подписки в реальном времени для обновлений бронирования

### Хостинг и развертывание

- **Vercel** - Хостинг фронтенда и serverless-функции
- **Supabase** - Сервисы базы данных и аутентификации

### Интеграция с Telegram

- **Telegram Bot API** - Бот для процесса аутентификации и входа
- **Next.js API Routes** - Для обработки вебхуков
- **Telegram Web App SDK** - Возможность интеграции приложения в Telegram

## Основные функции

### Управление оборудованием

- Каталог оборудования с деталями и доступностью
- Загрузка и управление изображениями
- Категории оборудования и фильтрация

### Система бронирования

- Календарь доступности на основе дат
- Предотвращение конфликтов бронирования
- Отслеживание истории и статуса бронирования

### Аутентификация пользователей

- Регистрация по email/паролю
- Процесс верификации через Telegram
- Профили пользователей и история бронирования

### Панель администратора

- Управление инвентарем оборудования
- Рабочий процесс утверждения бронирования
- Аналитика использования и отчеты

## Процесс верификации через Telegram

1. Пользователь регистрируется в веб-приложении
2. Система генерирует уникальный код верификации
3. Пользователь отправляет код боту Telegram
4. Бот проверяет код и связывает аккаунт Telegram
5. Пользователь получает уведомления о бронировании через Telegram

## Настройка Telegram Login Widget

Для корректной работы виджета входа через Telegram необходимо выполнить следующие шаги:

1. Создайте бота через BotFather в Telegram (/newbot)
2. Получите токен бота и сохраните его в переменной окружения `TELEGRAM_BOT_TOKEN`
3. Получите числовой идентификатор бота:
   - Отправьте сообщение боту @userinfobot
   - Перешлите сообщение от вашего бота к @userinfobot
   - Сохраните полученный ID в переменной окружения `NEXT_PUBLIC_TELEGRAM_BOT_ID`
4. Имя бота (без символа @) сохраните в переменной окружения `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
5. **Важно**: Настройте доменные имена, на которых будет работать виджет:
   - Отправьте команду `/setdomain` в BotFather
   - Выберите нужного бота
   - Введите список доменов, где будет использоваться виджет (например, `localhost,your-domain.com`)
   - Для локальной разработки обязательно добавьте `localhost`
6. Настройте URL для вебхуков:
   - Запустите приложение
   - Откройте URL `/api/telegram/setup` для настройки вебхуков
   - Убедитесь, что вебхуки успешно настроены

Если вы видите ошибку "Origin required", это означает, что домен, на котором работает приложение, не добавлен в список разрешенных доменов в настройках бота.

## Отладка авторизации через Telegram

Если у вас возникают проблемы с авторизацией через Telegram, проверьте следующее:

1. Правильно ли настроены переменные окружения:
   - `TELEGRAM_BOT_TOKEN` - токен бота
   - `NEXT_PUBLIC_TELEGRAM_BOT_ID` - числовой идентификатор бота
   - `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - имя бота без символа @
   - `TELEGRAM_WEBHOOK_SECRET` - секретный ключ для вебхуков

2. Добавлен ли ваш домен в список разрешенных в BotFather

3. Проверьте логи в консоли браузера и на сервере для выявления ошибок

4. Убедитесь, что вебхуки правильно настроены, открыв URL `/api/telegram/setup`

5. Обработка отмены авторизации:
   - При нажатии кнопки "Отмена" в интерфейсе Telegram пользователь будет перенаправлен обратно на сайт
   - Для этого используется параметр `cancel_url` в URL авторизации
   - Маршрут `/api/auth/telegram-cancel` обрабатывает отмену и перенаправляет пользователя на исходную страницу

## Настройка среды разработки

```bash
# Клонировать репозиторий
git clone https://github.com/вашеимя/video-equipment-booking.git

# Перейти в директорию проекта
cd video-equipment-booking

# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env.local

# Запустить сервер разработки
npm run dev
```

## Переменные окружения

```
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=ваш_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=ваш_supabase_service_role_key

# Telegram
TELEGRAM_BOT_TOKEN=ваш_telegram_bot_token
TELEGRAM_WEBHOOK_SECRET=ваш_webhook_secret
```

## Структура проекта

```
/
├── src/
│   ├── app/                      # Основная директория App Router
│   │   ├── (routes)/             # Группировка маршрутов
│   │   │   ├── admin/            # Панель администратора
│   │   │   ├── auth/             # Аутентификация
│   │   │   ├── bookings/         # Бронирования
│   │   │   ├── equipment/        # Оборудование
│   │   │   └── profile/          # Профиль пользователя
│   │   ├── api/                  # API маршруты
│   │   │   ├── auth/             # API аутентификации
│   │   │   ├── bookings/         # API бронирований
│   │   │   ├── equipment/        # API оборудования
│   │   │   └── telegram/         # API для Telegram
│   ├── components/               # Компоненты React
│   │   ├── ui/                   # UI компоненты
│   │   ├── forms/                # Компоненты форм
│   │   ├── layout/               # Компоненты макета
│   │   └── shared/               # Общие компоненты
│   ├── hooks/                    # Пользовательские хуки
│   ├── lib/                      # Библиотеки и утилиты
│   │   ├── utils/                # Вспомогательные функции
│   │   ├── validation/           # Схемы валидации
│   │   ├── api/                  # API клиенты
│   │   ├── supabase/             # Интеграция с Supabase
│   │   └── telegram/             # Интеграция с Telegram
│   ├── types/                    # Определения типов
│   └── styles/                   # Глобальные стили
├── public/                       # Статические ресурсы
├── .env.local                    # Локальные переменные окружения
├── .prettierrc                   # Конфигурация Prettier
├── .prettierignore               # Игнорируемые файлы для Prettier
├── eslint.config.mjs             # Конфигурация ESLint
└── package.json                  # Зависимости и скрипты
```

## Развертывание

Приложение настроено для быстрого развертывания на Vercel с Supabase в качестве бэкенда.

1. Отправить код в GitHub
2. Подключить репозиторий к Vercel
3. Настроить переменные окружения
4. Развернуть

## Лицензия


## Документация которую ОБЯЗАТЕЛЬНО надо использовать при разработке
Node.js v22.14.0 documentation - https://nodejs.org/docs/latest-v22.x/api/index.html
Tailwindcss v3.4.17 documentation - https://v3.tailwindcss.com/docs/installation
Next.js v.15.2.2 documentation - https://nextjs.org/docs


MIT