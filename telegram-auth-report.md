# Отчет о работе приложения с Telegram аутентификацией

## Общая архитектура

Данное приложение представляет собой веб-сайт на Next.js с интегрированной аутентификацией через Telegram. Основные компоненты системы:

1. **Next.js** - фреймворк для разработки React-приложений
2. **NextAuth.js** - библиотека для аутентификации в Next.js
3. **Telegram Login Widget** - виджет для аутентификации через Telegram

## Процесс аутентификации через Telegram

### 1. Настройка Telegram бота

Перед использованием Telegram аутентификации необходимо:

1. Создать бота через BotFather в Telegram
2. Получить токен бота (BOT_TOKEN)
3. Настроить имя пользователя бота (BOT_USERNAME)
4. Включить Login Widget для бота через BotFather
5. Добавить домен вашего сайта в список разрешенных доменов для виджета

### 2. Настройка окружения

В файле `.env` необходимо указать:

```
NEXTAUTH_SECRET=<секретный ключ для NextAuth>
NEXTAUTH_URL=<URL вашего сайта>
BOT_TOKEN=<токен Telegram бота>
BOT_USERNAME=<имя пользователя Telegram бота>
DATABASE_URL=<URL базы данных>
```

### 3. Компоненты аутентификации

#### Провайдер аутентификации (app/auth-provider.tsx)

```tsx
'use client';
import { SessionProvider } from 'next-auth/react';

type Props = {
    children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
    return <SessionProvider>{children}</SessionProvider>;
}
```

#### Конфигурация NextAuth (app/api/auth/[...nextauth]/route.ts)

```tsx
import { createUserOrUpdate } from "@/lib/prisma";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { objectToAuthDataMap, AuthDataValidator } from "@telegram-auth/server";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            image: string;
            email: string;
        };
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "telegram-login",
            name: "Telegram Login",
            credentials: {},
            async authorize(credentials, req) {
                const validator = new AuthDataValidator({
                    botToken: `${process.env.BOT_TOKEN}`,
                });

                const data = objectToAuthDataMap(req.query || {});
                const user = await validator.validate(data);

                if (user.id && user.first_name) {
                    const returned = {
                        id: user.id.toString(),
                        email: user.id.toString(),
                        name: [user.first_name, user.last_name || ""].join(" "),
                        image: user.photo_url,
                    };

                    try {
                        await createUserOrUpdate(user);
                    } catch {
                        console.log("Something went wrong while creating the user.");
                    }

                    return returned;
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, user, token }) {
            session.user.id = session.user.email;
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

#### Кнопка входа (components/navigation/auth-buttons.tsx)

```tsx
"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoginButton } from "@telegram-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ReloadIcon, ExitIcon } from "@radix-ui/react-icons";

import { useSession, signIn, signOut } from "next-auth/react";

export default function SignInButton({ botUsername }: { botUsername: string }) {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <ReloadIcon className="h-6 w-6 animate-spin" />;
    }

    if (status === "authenticated") {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div>
                        <Avatar>
                            <AvatarImage
                                src={session.user?.image ?? "/default.webp"}
                                alt="@shadcn"
                            />
                            <AvatarFallback>
                                {session.user?.name}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Test 1</DropdownMenuItem>
                    <DropdownMenuItem disabled>Test 2</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                        <ExitIcon className="mr-2 h-4 w-4" />
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <LoginButton
            botUsername={botUsername}
            onAuthCallback={(data) => {
                signIn("telegram-login", { callbackUrl: "/" }, data as any);
            }}
        />
    );
}
```

### 4. Детальное описание процесса аутентификации

1. **Инициирование аутентификации**:
   - Пользователь нажимает на кнопку входа через Telegram (`<LoginButton />` из `@telegram-auth/react`)
   - Открывается Telegram Login Widget, который запрашивает у пользователя разрешение на доступ к его данным

2. **Обработка данных аутентификации**:
   - После подтверждения пользователем, Telegram отправляет данные пользователя обратно на сайт
   - Данные включают: id пользователя, имя, фамилию, фото профиля и хеш для проверки подлинности
   - Компонент `LoginButton` вызывает функцию `onAuthCallback` с полученными данными
   - Функция `signIn("telegram-login", { callbackUrl: "/" }, data)` вызывается с данными пользователя

3. **Валидация данных на сервере**:
   - NextAuth.js перенаправляет запрос к провайдеру "telegram-login"
   - В функции `authorize` провайдера:
     - Данные преобразуются в формат, понятный для `AuthDataValidator` с помощью `objectToAuthDataMap`
     - `AuthDataValidator` проверяет подлинность данных с использованием токена бота
     - Проверка включает верификацию хеша, чтобы убедиться, что данные действительно пришли от Telegram

4. **Создание/обновление пользователя**:
   - После успешной валидации, вызывается функция `createUserOrUpdate`
   - Эта функция создает нового пользователя в базе данных или обновляет существующего
   - Данные пользователя сохраняются в базе данных через Prisma ORM

5. **Создание сессии**:
   - NextAuth.js создает сессию для пользователя
   - Данные пользователя (id, имя, фото) сохраняются в сессии
   - Пользователь перенаправляется на главную страницу (или другую указанную в `callbackUrl`)

6. **Отображение состояния аутентификации**:
   - Компонент `SignInButton` использует хук `useSession()` для получения данных о текущей сессии
   - Если пользователь аутентифицирован (`status === "authenticated"`), отображается аватар пользователя и выпадающее меню
   - Если пользователь не аутентифицирован, отображается кнопка входа через Telegram

## Технические особенности и требования

1. **HTTPS**: Telegram Login Widget требует HTTPS для работы. Для локальной разработки необходимо использовать туннелирование через ngrok или аналогичный сервис.

2. **Версия Node.js**: Для работы с Next.js 14.1.1 требуется Node.js версии >= 18.17.0.

3. **Зависимости**: Основные библиотеки:
   - `next-auth`: Для управления аутентификацией
   - `@telegram-auth/react`: Для компонента кнопки входа через Telegram
   - `@telegram-auth/server`: Для валидации данных аутентификации на сервере
   - `@prisma/client`: Для работы с базой данных

## Применение в других проектах

Для интеграции Telegram аутентификации в другие проекты:

1. **Настройка Telegram бота**:
   - Создайте бота через BotFather
   - Получите токен бота
   - Включите Login Widget
   - Добавьте домен вашего сайта в список разрешенных

2. **Установка зависимостей**:
   ```bash
   npm install next-auth @telegram-auth/react @telegram-auth/server
   ```

3. **Настройка переменных окружения**:
   - Создайте файл `.env` с необходимыми переменными

4. **Настройка NextAuth.js**:
   - Создайте файл конфигурации NextAuth с провайдером для Telegram
   - Настройте валидацию данных и создание пользователей

5. **Добавление компонентов UI**:
   - Добавьте компонент кнопки входа через Telegram
   - Настройте отображение состояния аутентификации

6. **Защита маршрутов**:
   - Используйте `getServerSession` или `useSession` для проверки аутентификации пользователя
   - Ограничьте доступ к защищенным маршрутам для неаутентифицированных пользователей

## Преимущества Telegram аутентификации

1. **Безопасность**: Telegram обеспечивает надежную аутентификацию с проверкой подлинности данных.
2. **Удобство**: Пользователям не нужно создавать новые учетные записи или запоминать пароли.
3. **Скорость**: Процесс аутентификации занимает всего несколько секунд.
4. **Доступ к данным**: Вы получаете доступ к имени пользователя и фото профиля без дополнительных запросов.
5. **Популярность**: Telegram широко используется, особенно в определенных регионах и сообществах.

## Заключение

Интеграция Telegram аутентификации в веб-приложение на Next.js предоставляет удобный и безопасный способ аутентификации пользователей. Используя NextAuth.js вместе с библиотеками `@telegram-auth/react` и `@telegram-auth/server`, вы можете легко добавить эту функциональность в свои проекты. 