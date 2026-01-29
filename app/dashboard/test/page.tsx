'use client';

import { useState } from 'react';

export default function TestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
  };

  const runTests = async () => {
    setTesting(true);
    setLogs([]);

    // Test 1: Check localStorage
    addLog('=== Test 1: Check Authentication ===');
    const token = localStorage.getItem('authToken');
    const operator = localStorage.getItem('operator');

    if (!token) {
      addLog('❌ No auth token found in localStorage');
      addLog('👉 You need to login at /login');
      setTesting(false);
      return;
    }
    addLog(`✅ Auth token found: ${token.substring(0, 50)}...`);

    if (!operator) {
      addLog('❌ No operator data found');
      setTesting(false);
      return;
    }
    const operatorData = JSON.parse(operator);
    addLog(`✅ Operator: ${operatorData.companyName} (${operatorData.email})`);

    // Test 2: Check backend is reachable
    addLog('\n=== Test 2: Backend Health Check ===');
    try {
      const healthResponse = await fetch('http://localhost:5001/health');
      if (healthResponse.ok) {
        addLog('✅ Backend is reachable');
      } else {
        addLog(`⚠️ Backend returned: ${healthResponse.status}`);
      }
    } catch (err) {
      addLog('❌ Cannot reach backend at http://localhost:5001');
      addLog('👉 Make sure backend is running: cd backend && npm run dev');
      setTesting(false);
      return;
    }

    // Test 3: Test dashboard API with auth
    addLog('\n=== Test 3: Dashboard API Test ===');
    try {
      const response = await fetch('http://localhost:5001/api/v1/operator/dashboard/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      addLog(`Status: ${response.status} ${response.statusText}`);

      if (response.status === 401) {
        addLog('❌ Token expired or invalid');
        addLog('👉 Logout and login again');
        setTesting(false);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        addLog(`❌ API Error: ${errorText}`);
        setTesting(false);
        return;
      }

      const data = await response.json();
      addLog('✅ Dashboard API response received');
      addLog(`\nData structure: ${JSON.stringify(data, null, 2).substring(0, 500)}...`);

      if (data.success) {
        addLog('\n✅ Response is successful');
        addLog(`Active Routes: ${data.data.totals.activeRoutes}`);
        addLog(`Total Buses: ${data.data.totals.totalBuses}`);
        addLog(`Today's Revenue: ${data.data.today.revenue} UGX`);
        addLog(`Today's Bookings: ${data.data.today.bookings}`);
        addLog(`Recent Bookings: ${data.data.recentBookings?.length || 0}`);
      } else {
        addLog('❌ Response success=false');
      }
    } catch (err: any) {
      addLog(`❌ Network Error: ${err.message}`);
      addLog('👉 Check if backend is running on port 5001');
    }

    // Test 4: Test with Axios (what dashboard uses)
    addLog('\n=== Test 4: Test with Axios (Dashboard Method) ===');
    try {
      const api = (await import('@/lib/api')).default;
      const response = await api.get('/operator/dashboard/summary');

      addLog('✅ Axios request successful');
      addLog(`Active Routes via Axios: ${response.data.data.totals.activeRoutes}`);
      addLog(`Total Buses via Axios: ${response.data.data.totals.totalBuses}`);
    } catch (err: any) {
      addLog(`❌ Axios Error: ${err.message}`);
      if (err.response) {
        addLog(`   Status: ${err.response.status}`);
        addLog(`   Data: ${JSON.stringify(err.response.data)}`);
      }
    }

    addLog('\n=== Tests Complete ===');
    setTesting(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Diagnostics</h1>
        <p className="text-gray-600">Run tests to diagnose why the dashboard shows no data</p>
      </div>

      <button
        onClick={runTests}
        disabled={testing}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {testing ? 'Running Tests...' : 'Run Diagnostic Tests'}
      </button>

      {logs.length > 0 && (
        <div className="bg-gray-900 text-green-400 rounded-lg p-6 font-mono text-sm overflow-x-auto">
          {logs.map((log, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {log}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Quick Checks:</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>1. Open browser console (F12 → Console)</li>
          <li>2. Look for any red errors</li>
          <li>3. Go to Network tab and refresh dashboard</li>
          <li>4. Check if /operator/dashboard/summary returns 200</li>
          <li>5. If you see CORS errors, backend might not be running</li>
        </ul>
      </div>
    </div>
  );
}
