import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full text-center space-y-8">
                <h1 className="font-serif text-8xl font-light text-muted-foreground/30">404</h1>
                <div className="hairline w-16 mx-auto" />
                <div className="space-y-3">
                    <h2 className="font-serif text-2xl italic font-light text-foreground">Page Not Found</h2>
                    <p className="font-body text-sm text-muted-foreground">
                        The page <span className="font-medium">"{pageName}"</span> doesn't exist.
                    </p>
                </div>
                {isFetched && authData?.isAuthenticated && authData.user?.role === 'admin' && (
                    <div className="p-4 bg-muted rounded border border-border text-left">
                        <p className="font-mono text-[10px] tracking-wider uppercase text-accent mb-1">Admin Note</p>
                        <p className="text-sm text-muted-foreground">This page may not be implemented yet.</p>
                    </div>
                )}
                <button 
                    onClick={() => window.location.href = '/'} 
                    className="font-mono text-xs tracking-[0.3em] uppercase px-8 py-3 border border-foreground/20 hover:border-accent hover:text-accent transition-all duration-500"
                >
                    Return Home
                </button>
            </div>
        </div>
    )
}
