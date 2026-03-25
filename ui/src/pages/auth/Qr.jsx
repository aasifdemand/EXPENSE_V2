import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useVerify2FAMutation } from "../../store/authApi";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { OTPInput } from "../../components/ui/OTPInput";

const QRVerification = () => {
    const navigate = useNavigate();
    const { qr, role } = useSelector((state) => state?.auth || {});

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [verify2FA, { isLoading }] = useVerify2FAMutation();

    const handleChange = (value) => {
        setOtp(value);
        if (error) setError("");
    };

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError("Please enter a 6-digit code.");
            return;
        }

        try {
            await verify2FA(otp).unwrap();
            
            // On success, navigate based on role
            if (role === "superadmin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/user/dashboard");
            }
        } catch (err) {
            setError(err?.data?.message || "Verification failed. Please try again.");
            console.error(err);
        }
    };

    return (
        <Card className="w-full max-w-md relative z-10 shadow-[0_20px_50px_rgba(124,58,237,0.12)] border-border/40 bg-surface/98 backdrop-blur-2xl rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-primary-400 via-primary-600 to-primary-800" />
            
            <CardHeader className="text-center pt-10 pb-6">
                <div className="mx-auto mb-6 bg-primary-50 max-w-fit rounded-2xl p-4 border border-primary-100 shadow-inner">
                    <ShieldCheck className="w-10 h-10 text-primary-600" />
                </div>
                <CardTitle className="text-3xl font-semibold tracking-tight text-slate-800 mb-1">
                    Security <span className="text-primary-600">Verification</span>
                </CardTitle>
                <p className="text-sm font-medium text-slate-500">
                    {qr ? "Scan the QR code with your authenticator app" : "Enter the 6-digit code from your authenticator app"}
                </p>
            </CardHeader>

            <CardContent className="flex flex-col items-center px-8 pb-10">
                {error && (
                    <div className="w-full mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3 animate-shake">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        {error}
                    </div>
                )}

                {qr && (
                    <div className="p-6 bg-white rounded-3xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border-2 border-slate-50 mb-10 group transition-all hover:scale-[1.02] duration-300">
                        <div className="relative">
                            <img
                                src={qr}
                                alt="2FA QR Code"
                                className="w-48 h-48 object-contain"
                            />
                            <div className="absolute inset-0 border-2 border-primary-500/10 rounded-xl pointer-events-none" />
                        </div>
                    </div>
                )}

                <div className="w-full text-center space-y-8">
                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-slate-600 uppercase tracking-widest block">
                            6-Digit Secure Code
                        </label>
                        <p className="text-xs text-slate-400">Enter the code from your device</p>
                    </div>
                    
                    <div className="py-2 scale-110">
                        <OTPInput value={otp} onChange={handleChange} length={6} />
                    </div>

                    <Button
                        className="w-full py-7 font-semibold text-lg rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300 relative group"
                        isLoading={isLoading}
                        disabled={otp.length !== 6 || isLoading}
                        onClick={handleVerify}
                    >
                        {!isLoading && (
                            <div className="flex items-center justify-center gap-3">
                                <span>Verify & Continue</span>
                                <ShieldCheck className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );


};

export default QRVerification;
