"use client"
import React, { useState,useRef, useEffect } from 'react'
import { ChevronLeft, Loader2, Lock } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import {user_service} from '@/context/AppContext';

const verifyPage = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const searchParams = useSearchParams();
    const email:string = searchParams.get('email') || "";
    const [otp, setOtp] = useState<string[]>(["","","","","",""]);
    const [error, setError] = useState<string>('');
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef<Array<HTMLInputElement>>([]);
    const router = useRouter();

    useEffect(()=>{
        if(timer >0){
            const interval = setInterval(()=>{
                setTimer(prev => prev-1);
            },1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleInputChange = (index : number, value : string):void => {
        if(value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if(value && index<5){
            inputRefs.current[index+1]?.focus();
        }
    }

    const handleKeyDown = (index : number, e : React.KeyboardEvent<HTMLInputElement>):void => {
        if(e.key === 'Backspace' && !otp[index] && index>0){
            inputRefs.current[index-1]?.focus();
        }
    }

    const handlePaste = (e : React.ClipboardEvent<HTMLInputElement>):void => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0,6);
        const digits = pastedData.replace(/\D/g, '');
        if(digits.length === 6){
            const newOtp = digits.split('');
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
        }
    }

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const otpString = otp.join("");
        if(otpString.length !== 6){
            setError('Please enter a valid 6-digit OTP');
            return;
        }
        setError('');
        setIsLoading(true);

        try{
            const {data} = await axios.post(`http://localhost:5000/api/v1/verify`,{
                email,
                otp: otpString
            });
            alert(data.message);
            Cookies.set('token', data.token, {
                expires : 15,
                secure : false,
                sameSite : 'lax',
                path : '/'
            });
            setOtp(["","","","","",""]);
            inputRefs.current[0]?.focus();

        }catch(err : any){
            setError(err.response.data.message);
        }finally{
            setIsLoading(false);
        }
    };

    const handleResendOtp = async()=>{
        setResendLoading(true);
        setError("");
        try{
            const data = await axios.post(`${user_service}/api/v1/login`,{
                email
            });

            alert(data.data.message);
            setTimer(60);
        }catch(err : any){
            setError(err.response.data.message);
        }finally{
            setResendLoading(false);
        }
    };

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
        <div className="max-w-md w-full">
            <div className='bg-gray-800 border border-gray-500 rounded-lg p-8'>
                <div className="text-center mb-8 relative">
                    
                    <button className="absolute top-0 left-0 p-2 text-gray-300 hover:text-white " onClick={()=> router.push("/login")}>
                        <ChevronLeft className="w-6 h-6"/>
                    </button>
                    
                    <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                        <Lock size={40} className = "text-white" />
                    </div>
                    
                    <h1 className='text-4xl font-bold text-white mb-3'> Verify Your Email</h1>
                    <p className='text-gray-300 text-lg'> We have sent a 6 digit OTP to</p>
                    <p className="text-blue-400 font-medium">{email}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                            Enter your 6-digit OTP
                        </label>
                        <div className="flex justify-center in-checked: space-x-3">
                            {
                                otp.map((digit,index) => (
                                    <input key={index} ref={(el : HTMLInputElement | null)=>{
                                        inputRefs.current[index] = el as HTMLInputElement;
                                    }} 
                                    type='text' 
                                    maxLength={1} 
                                    value={digit} 
                                    onChange={e=>handleInputChange(index, e.target.value)}
                                    onKeyDown={e=> handleKeyDown(index, e)}
                                    onPaste={index===0?handlePaste : undefined}
                                    className = "w-12 h-12 text-center text-xl font-bold border-2 border-gray-600 rounded-lg bg-gray-700 text-white"></input>
                                ))
                            }
                        </div>
                        {
                            error && <div className="bg-red-900 border border-red-500 rounded-lg p-3">
                                <p className="text-red-300 text-sm text-center">{error}</p>
                            </div>
                        }
                        <button disabled={isLoading} type='submit' className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2'>
                            {
                                isLoading ? <div className="flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5"/>
                                                    Verifying...
                                            </div> :
                                            <div className="flex items-center justify-center">
                                                    Verify
                                            </div>
                            }
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm mb-4">Didn't receive the code?</p>
                    {
                        timer > 0 ? <p className="text-blue-400">Resend code after {timer} seconds</p> : (<button className="text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50" disabled={resendLoading} onClick={handleResendOtp}>
                            {
                                resendLoading ? "Sending OTP..." : "Resend OTP"
                            }
                        </button>)
                    }
                </div>
            </div>
        </div>

    </div>
  )
}

export default verifyPage;