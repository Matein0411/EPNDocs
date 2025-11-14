"use server"

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getSupabase(){
    const cookieStore = await cookies()
    return createServerActionClient({
        cookies: () => cookieStore 
    })
}

// SIGN-UP
export async function signUp({ formData }) {
    const email = formData.get('email').toLowerCase().trim()
    const password = formData.get('password').trim()
    const full_name = formData.get('full_name').trim()
    const career = formData.get('career').trim()

    //validations
    if(!email || !password || !full_name || !career){
        return {error: 'All fields are required'}
    }

    if(!email.endsWith('@epn.edu.ec')){
        return {error: 'Email must be an EPN email address'}
    }

    if(password.length < 9){
        return {error: 'Password must be at least 9 characters long'}
    }

    if(!/[A-Z]/.test(password)){    
        return {error: 'Password must contain at least one uppercase letter'}
    }

    if(!/[0-9]/.test(password)){
        return {error: 'Password must contain at least one number'}
    }

    if(!/[!@#$%^&*]/.test(password)){
        return {error: 'Password must contain at least one special character (!@#$%^&*)'}
    }

    if(!/[a-z]/.test(password)){
        return {error: 'Password must contain at least one lowercase letter'}
    }

    try{
        const supabase = await getSupabase()

        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                    career
                },
                emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
            }
        })
        
        if(error){
            if(error.message.includes("already registered")){
                return {error: "Email is already registered"}
            }
            return {error: error.message}
        }
        
        return {
            success: true,
            message: 'Check your email to confirm your account'
        }
    }catch(error){
        return {
            error: error.message || "Error signing up. Please try again."
        }
    }
}

//LOGIN
export async function login(formData){
    const email = formData.get('email').toLowerCase().trim()
    const password = formData.get('password').trim()

    //validations
    if(!email || !password){
        return {error: 'All fields are required'}
    }

    try{
        const supabase = await getSupabase()

        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password
        })
        
        if(error){
            if(error.message.includes("invalid login credentials") || error.message.includes("Invalid login credentials")){
                return {error: "Invalid email or password"}
            }
            if(error.message.includes("email not confirmed") || error.message.includes("Email not confirmed")){
                return {error: "Email not confirmed. Please check your inbox."}
            }
            return {error: error.message}
        }

        revalidatePath('/')
        return {success: true}

    }catch(error){
        return {
            error: "Error logging in. Please try again."
        }
    }
}

export async function logout(){
    const supabase = await getSupabase()
    const {error} = await supabase.auth.signOut()  // ← AGREGUÉ const {error}
    
    if(error){
        return {error: "Error logging out. Please try again."}
    }
    revalidatePath('/')
    redirect('/login')
}

export async function getUser(){
    try{
        const supabase = await getSupabase()
        const {data: {user}, error} = await supabase.auth.getUser()
        if(error || !user){
            return null
        }

        //obtain all user data :)
        const{data: profile} = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        return {
            ...user,
            profile
        } 
    }  catch(error){
        return null 
    }
}

export async function resendEmailConfirmation(email){
    if(!email){
        return {error: 'Email is required'}
    }
    
    try{
        const supabase = await getSupabase()
        const {error} = await supabase.auth.resend({
            type: 'signup',
            email: email.toLowerCase().trim(),
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
            }
        })
        if(error){
            return {error: error.message}
        }
        return {success: true, message: 'Confirmation email resent. Please check your inbox.'}
    }catch(error){
        return {error: "Error resending confirmation email. Please try again."}
    }
}