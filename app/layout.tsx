import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ViewportWrapper } from "@/components/ViewportWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import { NextAuthProvider } from "@/components/NextAuthProvider";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "DSAL - Data Structure and Algorithm Laboratory",
    description: "Next-Gen Algorithm Visualization & Research Gateway",
    icons: {
        icon: "/dsal-logo.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap"
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.addEventListener('error', (e) => {
                                if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
                                    const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
                                    const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
                                    if (resizeObserverErr) resizeObserverErr.setAttribute('style', 'display: none');
                                    if (resizeObserverErrDiv) resizeObserverErrDiv.setAttribute('style', 'display: none');
                                    e.stopImmediatePropagation();
                                }
                            });
                        `,
                    }}
                />
            </head>
            <body className={`${spaceGrotesk.className} bg-background-dark text-white`}>
                <NextAuthProvider>
                    <ErrorBoundary>
                        <ViewportWrapper>
                            {children}
                        </ViewportWrapper>
                    </ErrorBoundary>
                </NextAuthProvider>
            </body>
        </html>
    );
}
