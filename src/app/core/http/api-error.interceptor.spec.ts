import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiRequestError, apiErrorInterceptor } from './api-error.interceptor';

describe('apiErrorInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiErrorInterceptor])), provideHttpClientTesting()]
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('preserva a mensagem padronizada e o correlation id da API', () => {
    let recebido: ApiRequestError | undefined;
    client.get('/api/unidades').subscribe({ error: (error) => recebido = error });
    const request = http.expectOne('/api/unidades');
    request.flush({ error: [{ erro: 'Acesso negado', codigoErro: 'UNIDADE-0001', campo: 'codigo' }], correlationId: 'corr-123' }, { status: 403, statusText: 'Forbidden' });

    expect(recebido?.message).toBe('Já existe uma unidade organizacional com este código.. Código de atendimento: corr-123.');
    expect(recebido?.correlationId).toBe('corr-123');
  });

  it('converte falha de conexão em mensagem compreensível', () => {
    let recebido: ApiRequestError | undefined;
    client.get('/api/unidades').subscribe({ error: (error) => recebido = error });
    http.expectOne('/api/unidades').error(new ProgressEvent('error'));

    expect(recebido?.message).toContain('Não foi possível conectar ao serviço');
    expect(recebido?.status).toBe(0);
  });

  it.each([
    [401, 'Sua sessão não está autenticada'],
    [403, 'Você não tem permissão'],
    [404, 'serviço de unidades organizacionais não foi encontrado'],
    [500, 'Não foi possível carregar as unidades organizacionais']
  ])('traduz o status HTTP %i para uma mensagem segura', (status, mensagem) => {
    let recebido: ApiRequestError | undefined;
    client.get('/api/unidades').subscribe({ error: (error) => recebido = error });
    http.expectOne('/api/unidades').flush(null, { status, statusText: 'Erro' });

    expect(recebido?.message).toContain(mensagem);
    expect(recebido?.status).toBe(status);
  });
});
