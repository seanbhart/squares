import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyAdminAuth } from '@/lib/api/admin-auth';

// Mock the supabase server module
vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: vi.fn(),
}));

// Helper to create mock NextRequest
function createMockRequest(): NextRequest {
  return {} as unknown as NextRequest;
}

describe('verifyAdminAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('authentication required', () => {
    it('should return 401 when no user session exists', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
        from: vi.fn(),
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      const result = await verifyAdminAuth(request);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error).toBe('unauthorized');
      expect(body.message).toBe('Authentication required');
    });

    it('should return 401 when auth returns error', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid token' },
          }),
        },
        from: vi.fn(),
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      const result = await verifyAdminAuth(request);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(401);
    });

    it('should return 401 when user object is undefined', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {},
            error: null,
          }),
        },
        from: vi.fn(),
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      const result = await verifyAdminAuth(request);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(401);
    });
  });

  describe('non-admin user', () => {
    it('should return 403 when user has no roles', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');
      const userId = 'user-123';

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { roles: null },
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: userId } },
            error: null,
          }),
        },
        from: mockFrom,
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      const result = await verifyAdminAuth(request);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body.error).toBe('forbidden');
      expect(body.message).toBe('Admin access required');
    });

    it('should return 403 when user has roles but not admin', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');
      const userId = 'user-456';

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { roles: ['user', 'editor'] },
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: userId } },
            error: null,
          }),
        },
        from: mockFrom,
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      const result = await verifyAdminAuth(request);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body.message).toBe('Admin access required');
    });

    it('should return 403 when user has empty roles array', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');
      const userId = 'user-789';

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { roles: [] },
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: userId } },
            error: null,
          }),
        },
        from: mockFrom,
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      const result = await verifyAdminAuth(request);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(403);
    });
  });

  describe('user record not found', () => {
    it('should return 403 when user record does not exist', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');
      const userId = 'nonexistent-user';

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'No rows returned' },
            }),
          }),
        }),
      });

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: userId } },
            error: null,
          }),
        },
        from: mockFrom,
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      const result = await verifyAdminAuth(request);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body.error).toBe('forbidden');
      expect(body.message).toBe('Access denied');
    });

    it('should return 403 when database returns error', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');
      const userId = 'db-error-user';

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
            }),
          }),
        }),
      });

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: userId } },
            error: null,
          }),
        },
        from: mockFrom,
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      const result = await verifyAdminAuth(request);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(403);
    });
  });

  describe('admin user', () => {
    it('should return userId when user is admin', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');
      const userId = 'admin-user-123';

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { roles: ['admin'] },
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: userId } },
            error: null,
          }),
        },
        from: mockFrom,
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      const result = await verifyAdminAuth(request);

      expect(result).not.toBeInstanceOf(Response);
      expect(result).toEqual({ userId });
    });

    it('should return userId when user has admin among other roles', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');
      const userId = 'multi-role-admin';

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { roles: ['user', 'admin', 'editor'] },
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: userId } },
            error: null,
          }),
        },
        from: mockFrom,
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      const result = await verifyAdminAuth(request);

      expect(result).not.toBeInstanceOf(Response);
      expect(result).toEqual({ userId });
    });

    it('should query the correct table and fields', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');
      const userId = 'query-test-user';

      const mockSingle = vi.fn().mockResolvedValue({
        data: { roles: ['admin'] },
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: userId } },
            error: null,
          }),
        },
        from: mockFrom,
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      await verifyAdminAuth(request);

      // Verify correct table is queried
      expect(mockFrom).toHaveBeenCalledWith('users');

      // Verify correct fields are selected
      expect(mockSelect).toHaveBeenCalledWith('roles');

      // Verify correct user ID is used in query
      expect(mockEq).toHaveBeenCalledWith('id', userId);
    });
  });

  describe('edge cases', () => {
    it('should be case-sensitive for admin role check', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');
      const userId = 'case-test-user';

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { roles: ['Admin', 'ADMIN'] }, // Wrong case
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: userId } },
            error: null,
          }),
        },
        from: mockFrom,
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      const result = await verifyAdminAuth(request);

      // Should fail because 'admin' !== 'Admin' or 'ADMIN'
      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(403);
    });

    it('should handle roles as string instead of array gracefully', async () => {
      const { supabaseServer } = await import('@/lib/supabase/server');
      const userId = 'string-role-user';

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { roles: 'admin' }, // String instead of array
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabaseServer).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: userId } },
            error: null,
          }),
        },
        from: mockFrom,
      } as unknown as Awaited<ReturnType<typeof supabaseServer>>);

      const request = createMockRequest();
      const result = await verifyAdminAuth(request);

      // String.includes('admin') should work for 'admin' string
      // But the code uses .includes() which works on both arrays and strings
      // 'admin'.includes('admin') === true
      expect(result).not.toBeInstanceOf(Response);
      expect(result).toEqual({ userId });
    });
  });
});
