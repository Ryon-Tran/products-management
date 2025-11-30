const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;

export const openapiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Product Management API',
    version: '1.0.0',
    description: 'API for products, users, carts and orders',
  },
  servers: [
    {
      url: baseUrl,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number', format: 'float' },
          category_id: { type: 'integer', nullable: true },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' },
        },
      },
      MeResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          roles: { type: 'array', items: { type: 'string' } },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          product_id: { type: 'integer' },
          quantity: { type: 'integer' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          total: { type: 'number', format: 'float' },
          status: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } } },
            },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user info',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/MeResponse' } } } },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List or search products',
        parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Create product',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/categories': {
      get: { tags: ['Categories'], summary: 'List categories', responses: { '200': { description: 'OK' } } },
      post: { tags: ['Categories'], summary: 'Create category (admin)', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } }, responses: { '201': { description: 'Created' } } },
    },
    '/products/{id}': {
      get: { tags: ['Products'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
      put: { tags: ['Products'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Products'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/cart': {
      get: { tags: ['Cart'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/cart/items': {
      post: { tags: ['Cart'], security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { product_id: { type: 'integer' }, quantity: { type: 'integer' } } } } } }, responses: { '200': { description: 'OK' } } },
    },
    '/cart/items/{id}': {
      delete: { tags: ['Cart'], security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/orders': {
      post: { tags: ['Orders'], security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
      get: { tags: ['Orders'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/orders/{id}': {
      get: { tags: ['Orders'], security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
    },
  },
};

export default openapiSpec;
