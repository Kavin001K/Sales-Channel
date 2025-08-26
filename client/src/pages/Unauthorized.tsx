import React from 'react';
import { Link } from 'wouter';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-400">
            The page you're trying to access requires specific permissions that your account doesn't have.
          </p>
          
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link to="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>If you believe this is an error, please contact your administrator.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
