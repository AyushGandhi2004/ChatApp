"use client"

import Loading from "@/components/Loading";
import VerifyOtp from "@/components/verifyOtp";
import { Suspense } from "react";


const verifyPage = () => {

  return (
    <Suspense fallback={<Loading/>}>
        <VerifyOtp/>
    </Suspense>
  )
}

export default verifyPage;