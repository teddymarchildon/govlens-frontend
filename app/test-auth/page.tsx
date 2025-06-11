'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-helpers';
import { useAuth } from '@/contexts/AuthContext';

export default function TestAuthPage() {
  const { user, loading } = useAuth();
  const [cookies, setCookies] = useState<string>('');
  const [sessionData, setSessionData] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');
  
  useEffect(() => {
    // Get cookies
    setCookies(document.cookie);
    
    // Get session
    const checkSession = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      setSessionData({ data, error });
    };
    
    checkSession();
  }, []);
  
  const testAuthenticatedRequest = async () => {
    try {
      setTestResult('Testing...');
      const supabase = createClient();
      
      // Try to fetch user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      // Try to fetch from a protected table
      const { data: tableData, error: tableError } = await supabase
        .from('user_usage')
        .select('*')
        .limit(1);
      
      setTestResult(JSON.stringify({
        userData,
        userError,
        tableData,
        tableError,
        cookies: document.cookie.split(';').filter(c => c.includes('sb-'))
      }, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error}`);
    }
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Auth Context User:</h2>
          <pre className="text-sm overflow-auto">
            {loading ? 'Loading...' : JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Cookies:</h2>
          <pre className="text-sm overflow-auto">
            {cookies.split(';').map(c => c.trim()).join('\n')}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Session Data:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>
        
        <button
          onClick={testAuthenticatedRequest}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Authenticated Request
        </button>
        
        {testResult && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Test Result:</h2>
            <pre className="text-sm overflow-auto">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}