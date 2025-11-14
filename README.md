# Portfolio (Next.js)

Простой стартовый проект на Next.js (App Router, TypeScript).

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Линтинг
npm run lint

# Проверка типов
npm run typecheck

# Сборка
npm run build

# Продакшн запуск (после сборки)
npm run start
```

## Структура

- `app/` — App Router, страницы и layout
- `app/api/health/route.ts` — простое API `GET /api/health` → `{ status: "ok" }`
- `next.config.ts` — конфигурация Next.js
- `tsconfig.json` — конфигурация TypeScript
- `.eslintrc.json`, `.prettierrc` — линтинг и форматирование

## Примечания

- Включен `reactStrictMode` и `experimental.typedRoutes` в `next.config.ts`.
- VSCode по умолчанию форматирует через Prettier (см. `.vscode/settings.json`).
