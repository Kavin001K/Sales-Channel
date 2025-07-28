import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getEmployees, setCurrentUser } from '@/lib/storage';

export default function Login() {
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!employeeId || !pin) {
      setError('Please enter both Employee ID and PIN.');
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    const employees = getEmployees();
    const employee = employees.find(emp => emp.id === employeeId && emp.pin === pin);
    if (!employee) {
      setError('Invalid Employee ID or PIN.');
      return;
    }
    setCurrentUser({ id: employee.id, employeeId: employee.id, isLoggedIn: true, loginTime: new Date() });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Employee Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="employeeId" className="block mb-1 font-medium">Employee ID</label>
              <Input id="employeeId" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required autoFocus />
            </div>
            <div>
              <label htmlFor="pin" className="block mb-1 font-medium">4-digit PIN</label>
              <Input id="pin" type="password" value={pin} onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))} maxLength={4} required />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 