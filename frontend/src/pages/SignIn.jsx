import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const SignIn = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-bold text-primary-600 mb-2">
            Routinely
          </h1>
          <p className="text-center text-gray-600">
            Sign in to track your habits
          </p>
        </div>
        <div className="flex justify-center">
          <ClerkSignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
              },
            }}
          />
        </div>
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/sign-up" className="text-primary-600 hover:text-primary-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
