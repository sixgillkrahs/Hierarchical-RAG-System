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
      routes: string[];
      success: boolean;
      user: {
        email: string;
        permissions: string[];
        roles: string[];
        routes: string[];
      };
    };
    const setCookie = loginResponse.headers['set-cookie'] as string[] | undefined;

    expect(loginBody.success).toBe(true);
    expect(loginBody.user.email).toBe('admin@company.com');
    expect(loginBody.user.roles).toContain('super_admin');
    expect(loginBody.user.permissions).toContain('roles.read');
    expect(loginBody.user.routes).toContain('/roles');
    expect(setCookie?.some((cookie) => cookie.includes('HttpOnly'))).toBe(true);

    await agent
      .get('/api/v1/auth/me')
      .expect(200)
      .expect(({ body }: { body: { email: string; routes: string[] } }) => {
        expect(body.email).toBe('admin@company.com');
        expect(body.routes).toContain('/permissions');
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

  it('rejects invalid login credentials', async () => {
    await agent
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@company.com',
        password: 'wrong-password',
      })
      .expect(401)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe('Invalid email or password.');
      });
  });

  it('supports permission CRUD for admins', async () => {
    await agent.post('/api/v1/auth/login').send({
      email: 'admin@company.com',
      password: 'ChangeMe123!',
    });

    const createResponse = await agent
      .post('/api/v1/permissions')
      .send({
        code: 'documents.approve',
        description: 'Approve documents before publishing.',
        route: '/documents',
      })
      .expect(200);

    const createdPermission = createResponse.body.permission as {
      code: string;
      description: string;
      id: string;
      route: string;
    };

    expect(createdPermission.code).toBe('documents.approve');
    expect(createdPermission.description).toBe(
      'Approve documents before publishing.',
    );
    expect(createdPermission.route).toBe('/documents');

    await agent
      .get(`/api/v1/permissions/${createdPermission.id}`)
      .expect(200)
      .expect(
        ({
          body,
        }: {
          body: { code: string; description: string; id: string; route: string };
        }) => {
          expect(body.id).toBe(createdPermission.id);
          expect(body.code).toBe('documents.approve');
          expect(body.route).toBe('/documents');
        },
      );

    await agent
      .patch(`/api/v1/permissions/${createdPermission.id}`)
      .send({
        description: 'Approve and publish documents.',
        route: '/documents/review',
      })
      .expect(200)
      .expect(
        ({
          body,
        }: {
          body: { permission: { description: string; route: string } };
        }) => {
          expect(body.permission.description).toBe(
            'Approve and publish documents.',
          );
          expect(body.permission.route).toBe('/documents/review');
        },
      );

    await agent
      .delete(`/api/v1/permissions/${createdPermission.id}`)
      .expect(200)
      .expect(
        ({
          body,
        }: {
          body: { permission: { id: string } };
        }) => {
          expect(body.permission.id).toBe(createdPermission.id);
        },
      );

    await agent.get(`/api/v1/permissions/${createdPermission.id}`).expect(404);
  });

  it('rejects deleting permissions assigned to roles', async () => {
    await agent.post('/api/v1/auth/login').send({
      email: 'admin@company.com',
      password: 'ChangeMe123!',
    });

    const listResponse = await agent.get('/api/v1/permissions').expect(200);
    const existingPermission = (
      listResponse.body as Array<{ code: string; id: string }>
    ).find((permission) => permission.code === 'permissions.read');

    expect(existingPermission).toBeDefined();

    await agent
      .delete(`/api/v1/permissions/${existingPermission?.id}`)
      .expect(409)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toContain('cannot be deleted');
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
