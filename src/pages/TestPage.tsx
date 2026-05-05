// @ts-nocheck
// 简化测试页面 - 排除法定位 ReportWritePage 白屏问题
import { useState } from 'react'

export default function TestPage() {
  const [x] = useState('hello')
  return (
    <div style={{ padding: 20, fontSize: 24 }}>
      <h1>Test Page Works!</h1>
      <p>Value: {x}</p>
    </div>
  )
}
