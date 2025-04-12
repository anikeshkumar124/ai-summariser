"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { summarizeNote } from "@/ai/flows/summarize-note";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download } from "lucide-react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";

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
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
} catch (e: any) {
  console.error('initializeApp-error', e);
}

// Initialize Firebase auth
let auth;
try {
  if (app) {
    auth = getAuth(app);
  }
} catch (e: any) {
  console.error('getAuth-error', e);
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

  useEffect(() => {
    let unsubscribe;
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsLoggedIn(true);
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
    <div className="flex flex-col items-center justify-start min-h-screen py-12 bg-background space-y-8">
      <h1 className="text-3xl font-semibold text-foreground">NoteFlow Summarizer</h1>

      {!isLoggedIn ? (
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
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
          <div className="w-full max-w-3xl space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enter your note</CardTitle>
                <CardDescription>Paste a long note or paragraph to summarize.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your note here..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="resize-none shadow-sm"
                />
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={handleSummarize}
                disabled={isSummarizing || !note}
                className="bg-accent text-accent-foreground hover:bg-teal-700 shadow-md"
              >
                {isSummarizing ? "Summarizing..." : "Summarize"}
              </Button>
            </div>

            {summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Concise summary generated by AI.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="whitespace-pre-line">{summary}</div>
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
          </div>
          <Button
            onClick={logoutUser}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md"
          >
            Logout
          </Button>
        </>
      )}
    </div>
  );
}
