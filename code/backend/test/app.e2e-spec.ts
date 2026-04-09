import * as cookieParser from 'cookie-parser';
import { VersioningType, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

jest.setTimeout(20000);

describe('Auth and RBAC (e2e)', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_TYPE = 'sqlite';
    process.env.DB_DATABASE = ':memory:';
    process.env.DB_SYNCHRONIZE = 'true';
    process.env.DB_RUN_MIGRATIONS = 'false';
    process.env.DB_LOGGING = 'false';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1d';
    process.env.ADMIN_EMAIL = 'admin@company.com';
    process.env.ADMIN_PASSWORD = 'ChangeMe123!';
    process.env.ADMIN_DISPLAY_NAME = 'System Administrator';

    const { AppModule } = await import('../src/app.module');
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    await app.init();

    const server = app.getHttpServer() as Parameters<typeof request>[0];
    agent = request.agent(server);
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns service health publicly', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server).get('/api/v1/health').expect(200);
    const body = response.body as {
      service: string;
      status: string;
    };

    expect(body.status).toBe('ok');
    expect(body.service).toBe('hierarchical-rag-backend');
  });

  it('rejects protected endpoints without a token', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server).get('/api/v1/roles').expect(401);
  });

  it('logs in and accesses RBAC-protected endpoints', async () => {
    const loginResponse = await agent
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@company.com',
        password: 'ChangeMe123!',
      })
      .expect(200);

    const loginBody = loginResponse.body as {
      success: boolean;
      user: {
        email: string;
        permissions: string[];
        roles: string[];
      };
    };
    const setCookie = loginResponse.headers['set-cookie'] as string[] | undefined;

    expect(loginBody.success).toBe(true);
    expect(loginBody.user.email).toBe('admin@company.com');
    expect(loginBody.user.roles).toContain('super_admin');
    expect(loginBody.user.permissions).toContain('roles.read');
    expect(setCookie?.some((cookie) => cookie.includes('HttpOnly'))).toBe(true);

    await agent
      .get('/api/v1/auth/me')
      .expect(200)
      .expect(({ body }: { body: { email: string } }) => {
        expect(body.email).toBe('admin@company.com');
      });

    await agent
      .get('/api/v1/roles')
      .expect(200)
      .expect(({ body }: { body: Array<{ name: string }> }) => {
        expect(body.some((role) => role.name === 'super_admin')).toBe(true);
      });

    await agent
      .post('/api/v1/rag/query')
      .send({
        question: 'What does RBAC protect here?',
        topK: 3,
      })
      .expect(201)
      .expect(({ body }: { body: { topK: number } }) => {
        expect(body.topK).toBe(3);
      });
  });

  it('clears the auth cookie on logout', async () => {
    const logoutResponse = await agent.post('/api/v1/auth/logout').expect(200);
    const setCookie = logoutResponse.headers['set-cookie'] as string[] | undefined;

    expect(setCookie?.some((cookie) => cookie.includes('access_token='))).toBe(
      true,
    );

    await agent.get('/api/v1/auth/me').expect(401);
  });
});
