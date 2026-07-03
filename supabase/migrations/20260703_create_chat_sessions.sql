-- Create chat_sessions table for FirstMate AI chat history
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL DEFAULT 'New Chat',
    messages jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast user-scoped lookups ordered by recency
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated
    ON public.chat_sessions (user_id, updated_at DESC);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own chats
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'chat_sessions' AND policyname = 'Users can select own chats'
    ) THEN
        CREATE POLICY "Users can select own chats" ON public.chat_sessions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Users can insert their own chats
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'chat_sessions' AND policyname = 'Users can insert own chats'
    ) THEN
        CREATE POLICY "Users can insert own chats" ON public.chat_sessions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Users can update their own chats
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'chat_sessions' AND policyname = 'Users can update own chats'
    ) THEN
        CREATE POLICY "Users can update own chats" ON public.chat_sessions
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Users can delete their own chats
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'chat_sessions' AND policyname = 'Users can delete own chats'
    ) THEN
        CREATE POLICY "Users can delete own chats" ON public.chat_sessions
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
