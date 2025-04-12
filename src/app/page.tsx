"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { summarizeNote } from "@/ai/flows/summarize-note";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download } from "lucide-react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { Toaster } from "@/components/ui/toaster";
import React from "react";

// Firebase configuration (replace with your actual env vars)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app only once
let app;
let auth;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } else {
    app = getApps()[0];
    auth = getAuth(app);
  }
} catch (e: any) {
  console.error("Firebase initialization error:", e.message);
  console.error("Firebase configuration might be incomplete.");
}

export default function Home() {
  const [note, setNote] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setIsLoggedIn(!!user);
      });
      return () => unsubscribe();
    }
  }, []);

  const registerUser = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Account Created",
        description: `User ${userCredential.user.email} created successfully.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Error",
        description:
          error.code === "auth/email-already-in-use"
            ? "This email is already registered."
            : error.message,
      });
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Logged In",
        description: `Logged in as ${userCredential.user.email}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message,
      });
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
      toast({ description: "Logged out successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Logout Error", description: error.message });
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const result = await summarizeNote({ note });
      setSummary(result.summary || "Failed to Summarize");
      toast({
        title: "Summary Generated",
        description: "The summary has been successfully generated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDownload = () => {
    const file = new Blob([summary], { type: "text/plain" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = "summary.txt";
    document.body.appendChild(element);
    element.click();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast({ description: "Summary copied to clipboard" });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-12 bg-background space-y-8 w-screen">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground drop-shadow-md">
          Epitomize.AI Summarizer
        </h1>
      </div>

      {!isLoggedIn ? (
        <div className="space-y-4 text-foreground text-sm md:text-base">
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
          />
          <div className="flex space-x-2">
            <Button onClick={() => loginUser(email, password)} className="text-white">
              Login
            </Button>
            <Button variant="secondary" onClick={() => registerUser(email, password)}>
              Register
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8 w-screen max-w-5xl text-center">
          <p className="text-foreground">Logged in as: {user?.email}</p>

          <Card className="bg-card-background border border-border shadow-md w-3/4 m-32">
            <CardHeader>
              <CardTitle className="text-lg md:text-2xl">Enter your note</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your note here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none shadow-sm bg-white text-foreground w-5/6 mx-16 my-8"
              />
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={handleSummarize} disabled={isSummarizing || !note}>
              {isSummarizing ? "Summarizing..." : "Summarize"}
            </Button>
          </div>

          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-2xl">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{summary}</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={logoutUser}
            className="w-5/6 max-w-xs text-white hover:bg-red-600 active:bg-red-700 focus:ring-2 focus:ring-primary transition-all duration-200"
          >
            Logout
          </Button>
        </div>
      )}

      <Toaster />
    </div>
  );
}
