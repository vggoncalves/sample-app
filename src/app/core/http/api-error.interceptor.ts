import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface ApiFieldError { erro?: string; codigoErro?: string; campo?: string; }
interface ApiErrorBody { error?: ApiFieldError[]; correlationId?: string; }

export class ApiRequestError extends Error {
  constructor(message: string, readonly status?: number, readonly correlationId?: string, readonly errors: ApiFieldError[] = []) { super(message); }
}

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => next(request).pipe(catchError((error: unknown) => {
  if (!(error instanceof HttpErrorResponse)) return throwError(() => new ApiRequestError('Não foi possível concluir a solicitação. Tente novamente.'));
  const body = error.error as ApiErrorBody | null;
  const errors = body?.error ?? [];
  const message = errors[0]?.erro ?? messageForStatus(error.status);
  return throwError(() => new ApiRequestError(message, error.status, body?.correlationId, errors));
}));

function messageForStatus(status: number): string {
  if (status === 0) return 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.';
  if (status === 401) return 'Sua sessão não está autenticada. Faça login para consultar as unidades.';
  if (status === 403) return 'Você não tem permissão para consultar unidades organizacionais.';
  if (status === 404) return 'O serviço de unidades organizacionais não foi encontrado.';
  return 'Não foi possível carregar as unidades organizacionais. Tente novamente.';
}
