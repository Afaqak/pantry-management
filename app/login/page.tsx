"use client";
// pages/login.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, signInWithGoogle } from "@/utils/firebase";
import AuthCard from "@/components/auth-card";
import { Container } from "@mui/material";

const Login = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <Container sx={{ height: "80vh" }}>
      <AuthCard
        title="Log in"
        isLogin={true}
        onGoogleSignIn={signInWithGoogle}
      />
    </Container>
  );
};

export default Login;
