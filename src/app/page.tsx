"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
import { summarizeNote } from "@/ai/flows/summarize-note";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download } from "lucide-react";
import {
  getAuth, User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import React from 'react';
import { Toaster } from "@/components/ui/toaster";

// Firebase configuration (replace with your own)
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
    if (auth === undefined) {
      auth = getAuth(app);
    }
  }
} catch (e: any) {
  console.error('initializeApp-error', e);
}

export default function Home() {
  const [note, setNote] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribe;
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsLoggedIn(true);
          setUser(user)
        } else {
          setIsLoggedIn(false);
        }
      });
    } else {
      console.error("Auth object is not available.");
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const registerUser = async (email, password) => {
    if (auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        toast({
          title: "Account Created",
          description: `User ${user.email} created successfully.`,
        });
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          toast({
            variant: "destructive",
            title: "Registration Error",
            description: "This email is already registered.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Registration Error",
            description: error.message || "Failed to create account.",
          });
        }
      }
    } else {
      console.error("Auth object is not available.");
      toast({
        variant: "destructive",
        title: "Firebase Auth Error",
        description: "Firebase Auth is not initialized.",
      });
    }
  };

  const loginUser = async (email, password) => {
    if (auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        toast({
          title: "Logged In",
          description: `Logged in as ${user.email}.`,
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Login Error",
          description: error.message || "Failed to login.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message || "Failed to login.",
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
      const textToSummarize = note;

      const result = await summarizeNote({ note: textToSummarize });
      setSummary(result.summary || "Failed to Summarize");
      toast({
        title: "Summary Generated",
        description: "The summary has been successfully generated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate summary.",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([summary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "summary.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast({
      description: "Summary copied to clipboard",
    });
  };

  return (
    <>
      
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-background space-y-8">

        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground drop-shadow-md">
            NoteFlow Summarizer
          </h1>
        </div>


        <div>
          {!isLoggedIn ? (
            <div className="space-y-4 text-foreground text-sm md:text-base">
              <input
                type="email"
                placeholder="Email"
                aria-label="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="password"
                placeholder="Password"
                aria-label="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded"
              />
              <div className="flex space-x-2">
                <Button onClick={() => loginUser(email, password)}>Login</Button>
                <Button variant="secondary" onClick={() => registerUser(email, password)}>
                  Register
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-6 md:space-y-8 w-full max-w-3xl">
                <div className="text-foreground">
                  <p>Logged in as: {user?.email}</p>
                </div>
                <Card className="bg-card-background border border-border shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-2xl">Enter your note</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Paste your note here..."
                      aria-label="Note Textarea"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="resize-none shadow-sm bg-card-foreground text-foreground"
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button
                    aria-label="Summarize"
                    onClick={handleSummarize}
                    disabled={isSummarizing || !note}
                  >
                    {isSummarizing ? "Summarizing..." : "Summarize"}
                  </Button>
                </div>

                {summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg md:text-2xl">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* <AnimatePresence>
                        {summary && (
                          <motion.div
                            key="summary-content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="whitespace-pre-line"
                          >
                            {summary}
                          </motion.div>
                        )}
                      </AnimatePresence> */}
                      {summary && (
                        
                          
                            {summary}
                          
                        
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopyToClipboard}
                          className="hover:bg-accent/10"
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy to clipboard</span>
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={handleDownload}
                          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}


                <Button
                  aria-label="Logout"
                  onClick={logoutUser}
                >
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>
        <Toaster />
      </div>
    </>
  );
}
