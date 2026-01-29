import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the supabaseServer before importing the module
vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: vi.fn(),
}));

import { sendNotification, sendBatchNotification, hasNotificationsEnabled } from '@/lib/notifications';
import { supabaseServer } from '@/lib/supabase/server';

// Helper to create mock supabase client
function createMockSupabase(selectResult: { data: unknown; error: Error | null }) {
  const mockSingle = vi.fn().mockResolvedValue(selectResult);
  const mockEq = vi.fn().mockReturnValue({ single: mockSingle, eq: vi.fn().mockReturnValue({ single: mockSingle }) });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq, in: vi.fn() });
  const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

  return {
    from: mockFrom,
    _mocks: { mockFrom, mockSelect, mockEq, mockSingle },
  };
}

describe('sendNotification', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when user has valid notification token', () => {
    it('should send notification successfully and return true', async () => {
      const tokenData = {
        notification_url: 'https://relay.farcaster.xyz/v1/notify',
        notification_token: 'test-token-123',
        enabled: true,
      };

      const mockSupabase = createMockSupabase({ data: tokenData, error: null });
      vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof supabaseServer>);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          result: {
            successfulTokens: ['test-token-123'],
            rateLimitedTokens: [],
            invalidTokens: [],
          },
        }),
      });

      const result = await sendNotification({
        fid: 12345,
        title: 'Test Title',
        body: 'Test body message',
        targetUrl: 'https://squares.vote/test',
        notificationId: 'test-notification-id',
      });

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://relay.farcaster.xyz/v1/notify',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationId: 'test-notification-id',
            title: 'Test Title',
            body: 'Test body message',
            targetUrl: 'https://squares.vote/test',
            tokens: ['test-token-123'],
          }),
        })
      );
    });
  });

  describe('when user has no notification token', () => {
    it('should return false when no token found in database', async () => {
      const mockSupabase = createMockSupabase({ data: null, error: new Error('No rows') });
      vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof supabaseServer>);

      const result = await sendNotification({
        fid: 99999,
        title: 'Test Title',
        body: 'Test body',
        targetUrl: 'https://squares.vote/test',
        notificationId: 'test-id',
      });

      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('when Farcaster relay returns an error', () => {
    it('should return false when fetch response is not ok', async () => {
      const tokenData = {
        notification_url: 'https://relay.farcaster.xyz/v1/notify',
        notification_token: 'test-token',
        enabled: true,
      };

      const mockSupabase = createMockSupabase({ data: tokenData, error: null });
      vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof supabaseServer>);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      const result = await sendNotification({
        fid: 12345,
        title: 'Test Title',
        body: 'Test body',
        targetUrl: 'https://squares.vote/test',
        notificationId: 'test-id',
      });

      expect(result).toBe(false);
    });
  });

  describe('when an exception occurs', () => {
    it('should catch errors and return false', async () => {
      const tokenData = {
        notification_url: 'https://relay.farcaster.xyz/v1/notify',
        notification_token: 'test-token',
        enabled: true,
      };

      const mockSupabase = createMockSupabase({ data: tokenData, error: null });
      vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof supabaseServer>);

      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await sendNotification({
        fid: 12345,
        title: 'Test Title',
        body: 'Test body',
        targetUrl: 'https://squares.vote/test',
        notificationId: 'test-id',
      });

      expect(result).toBe(false);
    });
  });
});

describe('sendBatchNotification', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when tokens exist for multiple users', () => {
    it('should send notifications and return success count', async () => {
      const tokens = [
        { fid: 1, notification_url: 'https://relay.farcaster.xyz/v1/notify', notification_token: 'token-1' },
        { fid: 2, notification_url: 'https://relay.farcaster.xyz/v1/notify', notification_token: 'token-2' },
        { fid: 3, notification_url: 'https://relay.farcaster.xyz/v1/notify', notification_token: 'token-3' },
      ];

      // Create a more detailed mock for batch queries
      const mockEq = vi.fn().mockResolvedValue({ data: tokens, error: null });
      const mockIn = vi.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      const mockSupabase = { from: mockFrom };

      vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof supabaseServer>);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          result: {
            successfulTokens: ['token-1', 'token-2', 'token-3'],
            rateLimitedTokens: [],
            invalidTokens: [],
          },
        }),
      });

      const result = await sendBatchNotification({
        fids: [1, 2, 3],
        title: 'Batch Title',
        body: 'Batch body message',
        targetUrl: 'https://squares.vote/broadcast',
        notificationId: 'batch-notification-id',
      });

      expect(result).toBe(3);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should group tokens by notification_url and send separate requests', async () => {
      const tokens = [
        { fid: 1, notification_url: 'https://relay1.farcaster.xyz/notify', notification_token: 'token-1' },
        { fid: 2, notification_url: 'https://relay2.farcaster.xyz/notify', notification_token: 'token-2' },
      ];

      const mockEq = vi.fn().mockResolvedValue({ data: tokens, error: null });
      const mockIn = vi.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      const mockSupabase = { from: mockFrom };

      vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof supabaseServer>);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          result: {
            successfulTokens: ['token-1'],
            rateLimitedTokens: [],
            invalidTokens: [],
          },
        }),
      });

      const result = await sendBatchNotification({
        fids: [1, 2],
        title: 'Test',
        body: 'Test body',
        targetUrl: 'https://squares.vote/test',
        notificationId: 'test-id',
      });

      // Should make 2 fetch calls (one per unique URL)
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toBe(2); // 1 success per call
    });
  });

  describe('when no tokens exist', () => {
    it('should return 0 when no valid tokens found', async () => {
      const mockEq = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockIn = vi.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      const mockSupabase = { from: mockFrom };

      vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof supabaseServer>);

      const result = await sendBatchNotification({
        fids: [999, 998],
        title: 'Test',
        body: 'Test body',
        targetUrl: 'https://squares.vote/test',
        notificationId: 'test-id',
      });

      expect(result).toBe(0);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return 0 when database returns an error', async () => {
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') });
      const mockIn = vi.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      const mockSupabase = { from: mockFrom };

      vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof supabaseServer>);

      const result = await sendBatchNotification({
        fids: [1, 2],
        title: 'Test',
        body: 'Test body',
        targetUrl: 'https://squares.vote/test',
        notificationId: 'test-id',
      });

      expect(result).toBe(0);
    });
  });

  describe('when fetch fails for some requests', () => {
    it('should continue processing and return partial success count', async () => {
      const tokens = [
        { fid: 1, notification_url: 'https://relay1.farcaster.xyz/notify', notification_token: 'token-1' },
        { fid: 2, notification_url: 'https://relay2.farcaster.xyz/notify', notification_token: 'token-2' },
      ];

      const mockEq = vi.fn().mockResolvedValue({ data: tokens, error: null });
      const mockIn = vi.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      const mockSupabase = { from: mockFrom };

      vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof supabaseServer>);

      // First call succeeds, second call fails
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            result: {
              successfulTokens: ['token-1'],
              rateLimitedTokens: [],
              invalidTokens: [],
            },
          }),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await sendBatchNotification({
        fids: [1, 2],
        title: 'Test',
        body: 'Test body',
        targetUrl: 'https://squares.vote/test',
        notificationId: 'test-id',
      });

      expect(result).toBe(1); // Only first call succeeded
    });
  });

  describe('when an exception occurs at top level', () => {
    it('should catch errors and return 0', async () => {
      vi.mocked(supabaseServer).mockRejectedValue(new Error('Connection failed'));

      const result = await sendBatchNotification({
        fids: [1, 2],
        title: 'Test',
        body: 'Test body',
        targetUrl: 'https://squares.vote/test',
        notificationId: 'test-id',
      });

      expect(result).toBe(0);
    });
  });
});

describe('hasNotificationsEnabled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when user has enabled notifications', async () => {
    const mockSupabase = createMockSupabase({ data: { enabled: true }, error: null });
    vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof supabaseServer>);

    const result = await hasNotificationsEnabled(12345);

    expect(result).toBe(true);
  });

  it('should return false when user has no notification token', async () => {
    const mockSupabase = createMockSupabase({ data: null, error: new Error('No rows') });
    vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof supabaseServer>);

    const result = await hasNotificationsEnabled(99999);

    expect(result).toBe(false);
  });

  it('should return false when database query fails', async () => {
    const mockSupabase = createMockSupabase({ data: null, error: new Error('Database error') });
    vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof supabaseServer>);

    const result = await hasNotificationsEnabled(12345);

    expect(result).toBe(false);
  });

  it('should return false when an exception is thrown', async () => {
    vi.mocked(supabaseServer).mockRejectedValue(new Error('Connection failed'));

    const result = await hasNotificationsEnabled(12345);

    expect(result).toBe(false);
  });
});
