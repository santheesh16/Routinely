import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const SignUp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-bold text-primary-600 mb-2">
            Routinely
          </h1>
          <p className="text-center text-gray-600">
            Create an account to start tracking
          </p>
        </div>
        <div className="flex justify-center">
          <ClerkSignUp
            appearance={{
              elements: {
                rootBox: 'mx-auto',
              },
            }}
          />
        </div>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
