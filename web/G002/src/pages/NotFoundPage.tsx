import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 400,
      gap: 16,
      color: '#374151',
    }}>
      <AlertCircle size={64} color="#9ca3af" />
      <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: '#4b5563' }}>
        404 — 页面不存在
      </h2>
      <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
        您访问的页面路径不存在，请检查 URL 或返回首页
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: 8,
          padding: '8px 24px',
          background: '#1677ff',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Home size={16} />
        返回首页
      </button>
    </div>
  );
}
