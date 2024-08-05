'use client'
// pages/register.js
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle,auth } from '@/utils/firebase';
import AuthCard from '@/components/auth-card';
import { Container } from '@mui/material';

const Register = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <Container>
      <AuthCard title="Register" onGoogleSignIn={signInWithGoogle} />
    </Container>
  );
};

export default Register;
