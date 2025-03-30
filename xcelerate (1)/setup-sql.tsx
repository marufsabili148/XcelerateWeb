"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function SetupSQL() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const copySQL = () => {
    navigator.clipboard.writeText(sqlScript)
    setCopied(true)
    toast({
      title: "SQL Copied",
      description: "The SQL script has been copied to your clipboard.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const sqlScript = `-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities
CREATE POLICY "Users can view their own activities"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON activities FOR DELETE
  USING (auth.uid() = user_id);`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Setup SQL</CardTitle>
        <CardDescription>Copy and run this SQL in your Supabase SQL Editor to set up the database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <pre className="bg-muted p-4 rounded-md text-xs mt-2 overflow-auto max-h-[400px]">{sqlScript}</pre>
          <Button className="absolute top-2 right-2" size="sm" onClick={copySQL}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted-foreground">
          After running this SQL, your database will be set up with the necessary tables and permissions.
        </p>
        <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
          <li>Go to your Supabase project dashboard</li>
          <li>Click on "SQL Editor" in the left sidebar</li>
          <li>Create a "New Query"</li>
          <li>Paste the SQL above</li>
          <li>Click "Run" to execute the SQL</li>
        </ol>
      </CardFooter>
    </Card>
  )
}

