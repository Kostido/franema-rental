import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FaCamera, FaVideo, FaHeadphones, FaLightbulb, FaShieldAlt, FaCalendarCheck } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Franema Rental - Аренда видеотехники',
  description: 'Профессиональная видеотехника в аренду для ваших проектов. Камеры, объективы, свет, звук и аксессуары.',
};

export default function HomePage() {
  const features = [
    {
      icon: <FaCamera className="h-6 w-6 text-blue-500" />,
      title: 'Профессиональные камеры',
      description: 'Широкий выбор профессиональных камер от ведущих производителей.',
    },
    {
      icon: <FaVideo className="h-6 w-6 text-blue-500" />,
      title: 'Объективы и аксессуары',
      description: 'Объективы, стабилизаторы, штативы и другие аксессуары для съемки.',
    },
    {
      icon: <FaHeadphones className="h-6 w-6 text-blue-500" />,
      title: 'Звуковое оборудование',
      description: 'Микрофоны, рекордеры и другое звуковое оборудование для качественной записи.',
    },
    {
      icon: <FaLightbulb className="h-6 w-6 text-blue-500" />,
      title: 'Световое оборудование',
      description: 'Профессиональный свет для создания идеальных условий съемки.',
    },
    {
      icon: <FaShieldAlt className="h-6 w-6 text-blue-500" />,
      title: 'Надежная верификация',
      description: 'Безопасная верификация через Telegram для защиты оборудования.',
    },
    {
      icon: <FaCalendarCheck className="h-6 w-6 text-blue-500" />,
      title: 'Удобное бронирование',
      description: 'Простая система бронирования с уведомлениями и управлением заказами.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                Профессиональная видеотехника для ваших проектов
              </h1>
              <p className="text-xl text-blue-100">
                Аренда камер, объективов, света, звука и аксессуаров для профессиональной видеосъемки.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/equipment"
                  className="px-6 py-3 bg-white text-blue-700 font-medium rounded-md hover:bg-blue-50 transition-colors"
                >
                  Смотреть оборудование
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md border border-blue-400 hover:bg-blue-600 transition-colors"
                >
                  Зарегистрироваться
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative h-80">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
                <div className="relative h-full w-full">
                  {/* Placeholder for an image - in production, replace with actual image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg text-white/70">Изображение видеотехники</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Наши преимущества</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              Почему стоит выбрать именно нас для аренды видеотехники
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 dark:bg-blue-900 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Как это работает</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              Простой процесс аренды оборудования в несколько шагов
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Регистрация и верификация</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Создайте аккаунт и пройдите верификацию через Telegram для доступа к бронированию.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Выбор оборудования</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Выберите необходимое оборудование из каталога и укажите даты аренды.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Получение и возврат</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Получите оборудование в указанную дату и верните его по окончании срока аренды.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Начать сейчас
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы начать свой проект?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Арендуйте профессиональное оборудование для вашего следующего видеопроекта уже сегодня.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/equipment"
              className="px-6 py-3 bg-white text-blue-700 font-medium rounded-md hover:bg-blue-50 transition-colors"
            >
              Смотреть каталог
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md border border-blue-400 hover:bg-blue-600 transition-colors"
            >
              Войти в аккаунт
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
