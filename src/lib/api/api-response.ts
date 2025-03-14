import { NextResponse } from 'next/server';

/**
 * Типы ответов API
 */
export type ApiResponse<T = unknown> = {
    data?: T;
    error?: {
        message: string;
        code?: string;
        status?: number;
    };
};

/**
 * Создает успешный ответ API
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ data }, { status });
}

/**
 * Создает ответ с ошибкой API
 */
export function errorResponse(
    message: string,
    status = 400,
    code?: string
): NextResponse<ApiResponse<never>> {
    return NextResponse.json(
        {
            error: {
                message,
                code,
                status,
            },
        },
        { status }
    );
}

/**
 * Обрабатывает ошибки API и возвращает соответствующий ответ
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse<never>> {
    console.error('API Error:', error);

    if (error instanceof Error) {
        return errorResponse(error.message);
    }

    return errorResponse('Произошла неизвестная ошибка');
}

/**
 * Проверяет, авторизован ли пользователь, и возвращает ошибку, если нет
 */
export function unauthorizedResponse(): NextResponse<ApiResponse<never>> {
    return errorResponse('Не авторизован', 401, 'UNAUTHORIZED');
}

/**
 * Проверяет, имеет ли пользователь доступ к ресурсу, и возвращает ошибку, если нет
 */
export function forbiddenResponse(): NextResponse<ApiResponse<never>> {
    return errorResponse('Доступ запрещен', 403, 'FORBIDDEN');
}

/**
 * Возвращает ответ, что ресурс не найден
 */
export function notFoundResponse(resource = 'Ресурс'): NextResponse<ApiResponse<never>> {
    return errorResponse(`${resource} не найден`, 404, 'NOT_FOUND');
}

/**
 * Возвращает ответ с ошибкой валидации
 */
export function validationErrorResponse(
    message = 'Ошибка валидации данных'
): NextResponse<ApiResponse<never>> {
    return errorResponse(message, 422, 'VALIDATION_ERROR');
} 