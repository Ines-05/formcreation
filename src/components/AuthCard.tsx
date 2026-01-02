'use client';

import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export function AuthCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
        >
            <Card className="border-primary/20 bg-white/50 backdrop-blur-xl shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(147,51,234,0.5)]"></div>

                <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 leading-tight">Authentification Requise</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                        Pour sauvegarder vos formulaires et les déployer sur Google Forms, Tally ou Typeform, vous devez être connecté.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SignInButton mode="modal">
                            <Button
                                variant="outline"
                                className="w-full h-11 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all gap-2 rounded-xl"
                            >
                                <LogIn className="w-4 h-4" />
                                Se connecter
                            </Button>
                        </SignInButton>

                        <SignUpButton mode="modal">
                            <Button
                                className="w-full h-11 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all gap-2 rounded-xl"
                            >
                                <UserPlus className="w-4 h-4" />
                                S&apos;inscrire
                            </Button>
                        </SignUpButton>
                    </div>

                    <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-semibold pt-4 border-t border-gray-100">
                        C&apos;est gratuit et prend moins d&apos;une minute
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
