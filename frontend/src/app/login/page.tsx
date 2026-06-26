"use client";

import { Loader2, Mail } from 'lucide-react'
import React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'



const LoginPage = () => {
    const [email, setEmail] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async(e : React.FormEvent<HTMLElement>): Promise<void> => {
        e.preventDefault();
        setIsLoading(true);
        
        try{
            const data = await axios.post(`http://localhost:5000/api/v1/login`,{
                email
            });
            // alert(data.data.message);
            router.push(`/verify?email=${email}`);
        }catch(err : any){
            alert(err.response.data.message)
        }finally{
            setIsLoading(false);
        }

    }

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
        <div className="max-w-md w-full">
            <div className='bg-gray-800 border border-gray-500 rounded-lg p-8'>
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6 ">
                        <Mail size={40} className = "text-white" />
                    </div>
                    <h1 className='text-4xl font-bold text-white mb-3'> Welcome to ChatApp!!</h1>
                    <p className='text-gray-300 text-lg'> Enter your email</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Email
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="appearance-none block w-full px-4 py-4 bg-gray-700 border border-gray-500 rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                                placeholder="Enter your email address"
                            />
                        </div>
                        <button disabled={isLoading} type='submit' className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2'>
                            {
                                isLoading ? <div className="flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5"/>
                                                    Sending Otp...
                                            </div> :
                                            <div className="flex items-center justify-center">
                                                    Send Verification Code
                                            </div>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </div>
  )
}

export default LoginPage