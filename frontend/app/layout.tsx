import type { Metadata } from 'next';
import './globals.css';
import React from 'react';

export const metadata: Metadata = {
  title: 'AI-Powered Job Portal with Intelligent Resume Builder',
  description:
    'Comprehensive job portal featuring AI/ML-based job-fit prediction, TF-IDF skill-gap analysis, personalized recommendations, and an intelligent ATS-friendly resume builder.',
  openGraph: {
    title: 'AI-Powered Job Portal with Intelligent Resume Builder',
    description:
      'Comprehensive job portal featuring AI/ML-based job-fit prediction, TF-IDF skill-gap analysis, personalized recommendations, and an intelligent ATS-friendly resume builder.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50/70 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
