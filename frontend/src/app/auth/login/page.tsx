'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Dumbbell, ArrowLeft, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

export default function LoginPage() {
    const router = useRouter();
    const { setTokens, setUser, setLoading } = useAuthStore();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        setLoading(true);

        try {
            // Login
            const tokenResponse = await authAPI.login(formData.username, formData.password);
            setTokens(tokenResponse.access, tokenResponse.refresh);

            // Get user profile
            const profileResponse = await authAPI.getProfile();
            setUser(profileResponse.user);

            // Redirect to dashboard
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-background to-background/50">
            <Card className="w-full max-w-md p-8 space-y-6 border-white/10">
                {/* Header */}
                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/')}
                        className="mb-4 gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <div className="flex items-center gap-2 justify-center">
                        <Dumbbell className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">FitQuest</h1>
                    </div>
                    <p className="text-center text-muted-foreground">Welcome back! Login to continue.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </Button>
                </form>

                {/* Footer */}
                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Button
                        variant="link"
                        className="p-0 h-auto font-semibold"
                        onClick={() => router.push('/auth/register')}
                    >
                        Sign up
                    </Button>
                </div>
            </Card>
        </div>
    );
}
