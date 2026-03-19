import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { api } from '../lib/api'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const hydrateProfile = useCallback(async (nextSession) => {
    if (!nextSession?.access_token) {
      setProfile(null)
      return null
    }

    const me = await api.getMe(nextSession.access_token)
    setProfile(me)
    return me
  }, [])

  useEffect(() => {
    let active = true

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return undefined
    }

    const bootstrap = async () => {
      try {
        const {
          data: { session: nextSession },
        } = await supabase.auth.getSession()

        if (!active) {
          return
        }

        setSession(nextSession)

        if (nextSession?.access_token) {
          await hydrateProfile(nextSession).catch(() => {
            if (active) {
              setProfile(null)
            }
          })
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return
      }

      setSession(nextSession)
      setLoading(false)

      if (nextSession?.access_token) {
        void hydrateProfile(nextSession).catch(() => {
          if (active) {
            setProfile(null)
          }
        })
      } else {
        setProfile(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [hydrateProfile])

  const signIn = useCallback(async (credentials) => {
    if (!supabase) {
      throw new Error('Supabase environment variables are missing.')
    }

    const response = await api.signIn(credentials)

    if (!response.session?.access_token || !response.session?.refresh_token) {
      throw new Error('The sign-in response did not include a valid session.')
    }

    const { error } = await supabase.auth.setSession({
      access_token: response.session.access_token,
      refresh_token: response.session.refresh_token,
    })

    if (error) {
      throw error
    }

    setProfile(response.profile)
    return response
  }, [])

  const signUp = useCallback(async (values) => {
    if (!supabase) {
      throw new Error('Supabase environment variables are missing.')
    }

    const response = await api.signUp(values)

    if (response.session?.access_token && response.session?.refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token: response.session.access_token,
        refresh_token: response.session.refresh_token,
      })

      if (error) {
        throw error
      }
    }

    if (response.profile && response.session) {
      setProfile(response.profile)
    } else {
      setProfile(null)
    }

    return response
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }

    setSession(null)
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      isAuthenticated: Boolean(session),
      isAdmin: profile?.role === 'admin',
      signIn,
      signUp,
      signOut,
    }),
    [loading, profile, session, signIn, signOut, signUp],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }

  return context
}
