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

export default function RegisterPage() {
    const router = useRouter();
    const { setTokens, setUser, setLoading } = useAuthStore();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Frontend validation
        if (formData.password !== formData.password_confirm) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setIsSubmitting(true);
        setLoading(true);

        try {
            // Register
            await authAPI.register(formData);

            // Auto-login
            const tokenResponse = await authAPI.login(formData.username, formData.password);
            setTokens(tokenResponse.access, tokenResponse.refresh);

            // Get user profile
            const profileResponse = await authAPI.getProfile();
            setUser(profileResponse.user);

            // Redirect to dashboard
            router.push('/');
        } catch (err: any) {
            const errorMessage = err.response?.data?.username?.[0]
                || err.response?.data?.email?.[0]
                || err.response?.data?.detail
                || 'Registration failed. Please try again.';
            setError(errorMessage);
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
                    <p className="text-center text-muted-foreground">Create your account to get started.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                type="text"
                                placeholder="John"
                                value={formData.first_name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, first_name: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                type="text"
                                placeholder="Doe"
                                value={formData.last_name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, last_name: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Username *</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={formData.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirm">Confirm Password *</Label>
                        <Input
                            id="password_confirm"
                            type="password"
                            placeholder="Re-enter password"
                            value={formData.password_confirm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password_confirm: e.target.value })}
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
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                {/* Footer */}
                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Button
                        variant="link"
                        className="p-0 h-auto font-semibold"
                        onClick={() => router.push('/auth/login')}
                    >
                        Login
                    </Button>
                </div>
            </Card>
        </div>
    );
}
