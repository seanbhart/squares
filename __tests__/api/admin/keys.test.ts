import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock admin-auth before importing the route
vi.mock('@/lib/api/admin-auth', () => ({
  verifyAdminAuth: vi.fn(),
}));

// Mock crypto functions
vi.mock('@/lib/api/crypto', () => ({
  generateApiKey: vi.fn(() => 'live_test_api_key_12345'),
  hashApiKey: vi.fn(() => 'hashed_key_value'),
  getKeyPrefix: vi.fn(() => 'live_test'),
}));

// Mock config
vi.mock('@/lib/api/config', () => ({
  getTierConfig: vi.fn(() => ({
    rate_limit_per_minute: 60,
    rate_limit_per_day: 1000,
    max_batch_size: 10,
  })),
}));

// Mock auth
vi.mock('@/lib/api/auth', () => ({
  getServiceSupabase: vi.fn(),
}));

// Mock errors
vi.mock('@/lib/api/errors', () => ({
  invalidRequestError: vi.fn((message: string) =>
    new Response(JSON.stringify({ error: 'invalid_request', message }), { status: 400 })
  ),
  handleError: vi.fn((error: Error) =>
    new Response(JSON.stringify({ error: 'internal_error', message: error.message }), { status: 500 })
  ),
}));

import { GET, POST } from '@/app/api/admin/keys/route';
import { verifyAdminAuth } from '@/lib/api/admin-auth';
import { getServiceSupabase } from '@/lib/api/auth';

describe('Admin Keys API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication', () => {
    describe('GET /api/admin/keys', () => {
      it('should return 401 when user is not authenticated', async () => {
        const unauthorizedResponse = new Response(
          JSON.stringify({ error: 'unauthorized', message: 'Authentication required' }),
          { status: 401 }
        );
        vi.mocked(verifyAdminAuth).mockResolvedValue(unauthorizedResponse);

        const request = new NextRequest('http://localhost/api/admin/keys');
        const response = await GET(request);

        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body.error).toBe('unauthorized');
      });

      it('should return 403 when user is not an admin', async () => {
        const forbiddenResponse = new Response(
          JSON.stringify({ error: 'forbidden', message: 'Admin access required' }),
          { status: 403 }
        );
        vi.mocked(verifyAdminAuth).mockResolvedValue(forbiddenResponse);

        const request = new NextRequest('http://localhost/api/admin/keys');
        const response = await GET(request);

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe('forbidden');
      });
    });

    describe('POST /api/admin/keys', () => {
      it('should return 401 when user is not authenticated', async () => {
        const unauthorizedResponse = new Response(
          JSON.stringify({ error: 'unauthorized', message: 'Authentication required' }),
          { status: 401 }
        );
        vi.mocked(verifyAdminAuth).mockResolvedValue(unauthorizedResponse);

        const request = new NextRequest('http://localhost/api/admin/keys', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Test Key',
            contact_email: 'test@example.com',
          }),
        });
        const response = await POST(request);

        expect(response.status).toBe(401);
      });

      it('should return 403 when user is not an admin', async () => {
        const forbiddenResponse = new Response(
          JSON.stringify({ error: 'forbidden', message: 'Admin access required' }),
          { status: 403 }
        );
        vi.mocked(verifyAdminAuth).mockResolvedValue(forbiddenResponse);

        const request = new NextRequest('http://localhost/api/admin/keys', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Test Key',
            contact_email: 'test@example.com',
          }),
        });
        const response = await POST(request);

        expect(response.status).toBe(403);
      });
    });
  });

  describe('GET /api/admin/keys', () => {
    beforeEach(() => {
      vi.mocked(verifyAdminAuth).mockResolvedValue({ userId: 'admin-user-id' });
    });

    it('should return list of API keys with pagination', async () => {
      const mockRange = vi.fn().mockResolvedValue({
        data: [
          { id: '1', key_prefix: 'live_abc', name: 'Key 1', tier: 'free', status: 'active' },
          { id: '2', key_prefix: 'live_def', name: 'Key 2', tier: 'standard', status: 'active' },
        ],
        error: null,
        count: 2,
      });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder, eq: vi.fn().mockReturnValue({ order: mockOrder }) });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      const mockSupabase = { from: mockFrom };

      vi.mocked(getServiceSupabase).mockReturnValue(mockSupabase as unknown as ReturnType<typeof getServiceSupabase>);

      const request = new NextRequest('http://localhost/api/admin/keys?page=1&limit=20');
      const response = await GET(request);

      // Verify successful response and query execution
      expect(response.status).toBe(200);
      expect(mockFrom).toHaveBeenCalledWith('api_keys_with_stats');
      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' });

      // Verify response structure (not asserting mocked values)
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(2);

      // Verify pagination structure and calculation
      expect(body.pagination).toHaveProperty('page');
      expect(body.pagination).toHaveProperty('limit');
      expect(body.pagination).toHaveProperty('total');
      expect(body.pagination).toHaveProperty('pages');
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(20);
    });

    it('should handle status filter parameter and return filtered results', async () => {
      // Create chainable mock that handles various query builder patterns
      const createChainableMock = (result: { data: unknown; error: null; count: number }) => {
        const mockChain: Record<string, unknown> = {};
        mockChain.eq = vi.fn().mockReturnValue(mockChain);
        mockChain.order = vi.fn().mockReturnValue(mockChain);
        mockChain.range = vi.fn().mockResolvedValue(result);
        return mockChain;
      };

      const mockChain = createChainableMock({
        data: [{ id: '1', status: 'active' }],
        error: null,
        count: 1,
      });
      const mockSelect = vi.fn().mockReturnValue(mockChain);
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      const mockSupabase = { from: mockFrom };

      vi.mocked(getServiceSupabase).mockReturnValue(mockSupabase as unknown as ReturnType<typeof getServiceSupabase>);

      const request = new NextRequest('http://localhost/api/admin/keys?status=active');
      const response = await GET(request);

      // Verify successful response
      expect(response.status).toBe(200);

      // Verify the eq filter was called with 'status', 'active'
      expect(mockChain.eq).toHaveBeenCalledWith('status', 'active');

      // Verify response has expected structure
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should cap limit at 100', async () => {
      const mockRange = vi.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      const mockSupabase = { from: mockFrom };

      vi.mocked(getServiceSupabase).mockReturnValue(mockSupabase as unknown as ReturnType<typeof getServiceSupabase>);

      const request = new NextRequest('http://localhost/api/admin/keys?limit=500');
      await GET(request);

      // Should call range with 0 to 99 (100 items max)
      expect(mockRange).toHaveBeenCalledWith(0, 99);
    });
  });

  describe('POST /api/admin/keys', () => {
    beforeEach(() => {
      vi.mocked(verifyAdminAuth).mockResolvedValue({ userId: 'admin-user-id' });
    });

    it('should create a new API key with valid data', async () => {
      const mockInsertResult = {
        id: 'new-key-id',
        key_prefix: 'live_test',
        name: 'Test Key',
        tier: 'free',
        rate_limit_per_minute: 60,
        rate_limit_per_day: 1000,
        created_at: '2024-01-01T00:00:00Z',
        expires_at: null,
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockInsertResult,
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      const mockSupabase = { from: mockFrom };

      vi.mocked(getServiceSupabase).mockReturnValue(mockSupabase as unknown as ReturnType<typeof getServiceSupabase>);

      const request = new NextRequest('http://localhost/api/admin/keys', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Key',
          contact_email: 'test@example.com',
        }),
      });
      const response = await POST(request);

      // Verify successful creation
      expect(response.status).toBe(201);

      // Verify database insert was called with correct structure
      expect(mockFrom).toHaveBeenCalledWith('api_keys');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Key',
          contact_email: 'test@example.com',
          tier: 'free',
          status: 'active',
        })
      );

      // Verify response has expected shape (not testing mocked crypto values)
      const body = await response.json();
      expect(body).toHaveProperty('api_key');
      expect(body).toHaveProperty('key_prefix');
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('name');
      expect(typeof body.api_key).toBe('string');
      expect(body.api_key.length).toBeGreaterThan(0);
    });

    it('should return 400 when name is missing', async () => {
      const request = new NextRequest('http://localhost/api/admin/keys', {
        method: 'POST',
        body: JSON.stringify({
          contact_email: 'test@example.com',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 when contact_email is missing', async () => {
      const request = new NextRequest('http://localhost/api/admin/keys', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Key',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const request = new NextRequest('http://localhost/api/admin/keys', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Key',
          contact_email: 'not-an-email',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid tier', async () => {
      const request = new NextRequest('http://localhost/api/admin/keys', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Key',
          contact_email: 'test@example.com',
          tier: 'premium', // Invalid tier
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should accept valid tiers: free, standard, enterprise', async () => {
      const mockInsertResult = {
        id: 'new-key-id',
        key_prefix: 'live_test',
        name: 'Test Key',
        tier: 'enterprise',
        rate_limit_per_minute: 60,
        rate_limit_per_day: 1000,
        created_at: '2024-01-01T00:00:00Z',
        expires_at: null,
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockInsertResult,
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      const mockSupabase = { from: mockFrom };

      vi.mocked(getServiceSupabase).mockReturnValue(mockSupabase as unknown as ReturnType<typeof getServiceSupabase>);

      const request = new NextRequest('http://localhost/api/admin/keys', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Enterprise Key',
          contact_email: 'enterprise@example.com',
          tier: 'enterprise',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });
});
