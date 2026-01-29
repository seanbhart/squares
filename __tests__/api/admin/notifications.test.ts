import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock admin-auth before importing the route
vi.mock('@/lib/api/admin-auth', () => ({
  verifyAdminAuth: vi.fn(),
}));

// Mock the admin notifications functions
vi.mock('@/lib/admin/notifications', () => ({
  getAllNotificationTokens: vi.fn(),
  getNotificationStats: vi.fn(),
  sendTestNotification: vi.fn(),
  sendBroadcastNotification: vi.fn(),
  deleteNotificationToken: vi.fn(),
  getNotificationTokensWithUserInfo: vi.fn(),
}));

import { GET, POST, DELETE } from '@/app/api/admin/notifications/route';
import { verifyAdminAuth } from '@/lib/api/admin-auth';
import {
  getNotificationStats,
  sendTestNotification,
  sendBroadcastNotification,
  deleteNotificationToken,
  getNotificationTokensWithUserInfo,
} from '@/lib/admin/notifications';

describe('Admin Notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication', () => {
    describe('GET /api/admin/notifications', () => {
      it('should return 401 when user is not authenticated', async () => {
        const unauthorizedResponse = new Response(
          JSON.stringify({ error: 'unauthorized', message: 'Authentication required' }),
          { status: 401 }
        );
        vi.mocked(verifyAdminAuth).mockResolvedValue(unauthorizedResponse);

        const request = new NextRequest('http://localhost/api/admin/notifications?action=stats');
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

        const request = new NextRequest('http://localhost/api/admin/notifications?action=stats');
        const response = await GET(request);

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe('forbidden');
      });
    });

    describe('POST /api/admin/notifications', () => {
      it('should return 401 when user is not authenticated', async () => {
        const unauthorizedResponse = new Response(
          JSON.stringify({ error: 'unauthorized', message: 'Authentication required' }),
          { status: 401 }
        );
        vi.mocked(verifyAdminAuth).mockResolvedValue(unauthorizedResponse);

        const request = new NextRequest('http://localhost/api/admin/notifications', {
          method: 'POST',
          body: JSON.stringify({ action: 'test', fid: 123 }),
        });
        const response = await POST(request);

        expect(response.status).toBe(401);
      });
    });

    describe('DELETE /api/admin/notifications', () => {
      it('should return 401 when user is not authenticated', async () => {
        const unauthorizedResponse = new Response(
          JSON.stringify({ error: 'unauthorized', message: 'Authentication required' }),
          { status: 401 }
        );
        vi.mocked(verifyAdminAuth).mockResolvedValue(unauthorizedResponse);

        const request = new NextRequest('http://localhost/api/admin/notifications?fid=123', {
          method: 'DELETE',
        });
        const response = await DELETE(request);

        expect(response.status).toBe(401);
      });
    });
  });

  describe('GET /api/admin/notifications', () => {
    beforeEach(() => {
      vi.mocked(verifyAdminAuth).mockResolvedValue({ userId: 'admin-user-id' });
    });

    it('should return notification stats when action=stats', async () => {
      const mockStats = {
        total: 100,
        enabled: 85,
        disabled: 15,
      };
      vi.mocked(getNotificationStats).mockResolvedValue(mockStats);

      const request = new NextRequest('http://localhost/api/admin/notifications?action=stats');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(mockStats);
      expect(getNotificationStats).toHaveBeenCalledTimes(1);
    });

    it('should return token list when action=list', async () => {
      const mockTokens = [
        { fid: 1, notification_token: 'token-1', enabled: true },
        { fid: 2, notification_token: 'token-2', enabled: true },
      ];
      vi.mocked(getNotificationTokensWithUserInfo).mockResolvedValue(mockTokens);

      const request = new NextRequest('http://localhost/api/admin/notifications?action=list');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.tokens).toEqual(mockTokens);
    });

    it('should return 400 for invalid action', async () => {
      const request = new NextRequest('http://localhost/api/admin/notifications?action=invalid');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid action');
    });

    it('should return 500 when an error occurs', async () => {
      vi.mocked(getNotificationStats).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/admin/notifications?action=stats');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Database error');
    });
  });

  describe('POST /api/admin/notifications', () => {
    beforeEach(() => {
      vi.mocked(verifyAdminAuth).mockResolvedValue({ userId: 'admin-user-id' });
    });

    describe('test action', () => {
      it('should send test notification to specified FID', async () => {
        vi.mocked(sendTestNotification).mockResolvedValue(true);

        const request = new NextRequest('http://localhost/api/admin/notifications', {
          method: 'POST',
          body: JSON.stringify({ action: 'test', fid: 12345 }),
        });
        const response = await POST(request);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(sendTestNotification).toHaveBeenCalledWith(12345);
      });

      it('should return 400 when FID is missing for test action', async () => {
        const request = new NextRequest('http://localhost/api/admin/notifications', {
          method: 'POST',
          body: JSON.stringify({ action: 'test' }),
        });
        const response = await POST(request);

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('FID required');
      });
    });

    describe('broadcast action', () => {
      it('should send broadcast notification with valid data', async () => {
        vi.mocked(sendBroadcastNotification).mockResolvedValue({ sent: 50, failed: 2 });

        const request = new NextRequest('http://localhost/api/admin/notifications', {
          method: 'POST',
          body: JSON.stringify({
            action: 'broadcast',
            title: 'Test Broadcast',
            body: 'This is a test message',
            targetUrl: 'https://squares.vote/test',
          }),
        });
        const response = await POST(request);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toEqual({ sent: 50, failed: 2 });
        expect(sendBroadcastNotification).toHaveBeenCalledWith(
          'Test Broadcast',
          'This is a test message',
          'https://squares.vote/test'
        );
      });

      it('should use default target URL when not provided', async () => {
        vi.mocked(sendBroadcastNotification).mockResolvedValue({ sent: 10, failed: 0 });

        const request = new NextRequest('http://localhost/api/admin/notifications', {
          method: 'POST',
          body: JSON.stringify({
            action: 'broadcast',
            title: 'Test',
            body: 'Test body',
          }),
        });
        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(sendBroadcastNotification).toHaveBeenCalledWith(
          'Test',
          'Test body',
          'https://farcaster.squares.vote/miniapp'
        );
      });

      it('should return 400 when title is missing for broadcast', async () => {
        const request = new NextRequest('http://localhost/api/admin/notifications', {
          method: 'POST',
          body: JSON.stringify({
            action: 'broadcast',
            body: 'Test body',
          }),
        });
        const response = await POST(request);

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Title and body required');
      });

      it('should return 400 when body is missing for broadcast', async () => {
        const request = new NextRequest('http://localhost/api/admin/notifications', {
          method: 'POST',
          body: JSON.stringify({
            action: 'broadcast',
            title: 'Test title',
          }),
        });
        const response = await POST(request);

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Title and body required');
      });
    });

    it('should return 400 for invalid action', async () => {
      const request = new NextRequest('http://localhost/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify({ action: 'invalid' }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid action');
    });
  });

  describe('DELETE /api/admin/notifications', () => {
    beforeEach(() => {
      vi.mocked(verifyAdminAuth).mockResolvedValue({ userId: 'admin-user-id' });
    });

    it('should delete notification token for specified FID', async () => {
      vi.mocked(deleteNotificationToken).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/admin/notifications?fid=12345', {
        method: 'DELETE',
      });
      const response = await DELETE(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(deleteNotificationToken).toHaveBeenCalledWith(12345);
    });

    it('should return 400 when FID is missing', async () => {
      const request = new NextRequest('http://localhost/api/admin/notifications', {
        method: 'DELETE',
      });
      const response = await DELETE(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('FID required');
    });

    it('should return 500 when deletion fails', async () => {
      vi.mocked(deleteNotificationToken).mockRejectedValue(new Error('Delete failed'));

      const request = new NextRequest('http://localhost/api/admin/notifications?fid=12345', {
        method: 'DELETE',
      });
      const response = await DELETE(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Delete failed');
    });
  });
});
