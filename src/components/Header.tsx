'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { LayoutDashboard } from 'lucide-react';

export function Header() {
    const pathname = usePathname();
    const isDashboard = pathname === '/dashboard';

    return (
        <header className="fixed top-0 left-0 right-0 sm:top-4 sm:right-4 sm:left-auto z-[100] flex items-center justify-between sm:justify-end gap-2 px-4 py-3 sm:p-0 bg-white/50 backdrop-blur-lg sm:bg-transparent border-b border-white/20 sm:border-0">
            <Link href="/" className="sm:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">F</div>
                <span className="font-bold text-gray-900 tracking-tight">FormBuilder</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="whitespace-nowrap bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 active:scale-95 text-gray-900 rounded-full font-medium text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-5 transition-all">
                            Se connecter
                        </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <button className="whitespace-nowrap bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-95 rounded-full font-medium text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-5 transition-all">
                            S'inscrire
                        </button>
                    </SignUpButton>
                </SignedOut>
                <SignedIn>
                    {!isDashboard && (
                        <Link href="/dashboard">
                            <button className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 active:scale-95 text-gray-900 rounded-full font-medium text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4 transition-all">
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="hidden xs:inline">Tableau de bord</span>
                                <span className="xs:hidden">Dashboard</span>
                            </button>
                        </Link>
                    )}
                    <UserButton
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary/20 hover:border-primary/50 transition-all"
                            }
                        }}
                    />
                </SignedIn>
            </div>
        </header>
    );
}
