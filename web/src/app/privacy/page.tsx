import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Privacy Policy - Better Coaching',
  description: 'Privacy Policy for Better Coaching. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass">
        <div className="container-landing">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo-no-bg.png"
                alt="Better Coaching"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-semibold text-primary" style={{ letterSpacing: '-0.02em' }}>
                Better Coaching
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container-landing py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="heading-section text-3xl sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 meta-text">Last updated: February 9, 2026</p>

          <div className="mt-10 space-y-8 body-text" style={{ color: 'var(--text-secondary)' }}>
            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>1. Introduction</h2>
              <p>
                Better Coaching (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the Better Coaching mobile application and website at bettercoachingapp.com (collectively, the &quot;Service&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
              <p className="mt-3">
                By using the Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this Privacy Policy, please do not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>2. Information We Collect</h2>

              <h3 className="text-lg font-medium mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and password.</li>
                <li><strong>Profile Information:</strong> Information you provide for your creator or user profile, such as your biography, expertise areas, and profile photo.</li>
                <li><strong>Coaching Content:</strong> If you are a creator, we collect the knowledge base materials, methodologies, and coaching content you upload to build your AI coaching agents.</li>
                <li><strong>Conversation Data:</strong> Messages and interactions you have with AI coaching agents within the Service.</li>
                <li><strong>Payment Information:</strong> When you make purchases, payment information is processed securely by our third-party payment processor (Stripe). We do not store your full credit card details.</li>
              </ul>

              <h3 className="text-lg font-medium mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Data:</strong> We collect information about how you use the Service, including pages visited, features used, and interaction patterns.</li>
                <li><strong>Device Information:</strong> We collect device type, operating system, unique device identifiers, and mobile network information.</li>
                <li><strong>Analytics Data:</strong> We use analytics services (including Mixpanel) to understand usage patterns and improve the Service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Provide, maintain, and improve the Service</li>
                <li>Process transactions and send related information</li>
                <li>Create and manage your account</li>
                <li>Power AI coaching agents with creator-provided knowledge bases</li>
                <li>Personalize your coaching experience based on your context and preferences</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Monitor and analyze trends, usage, and activities in connection with the Service</li>
                <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>4. AI Processing and Your Data</h2>
              <p>
                Our Service uses artificial intelligence models (including models from Anthropic, OpenAI, and Google) to power coaching agents. When you interact with a coaching agent:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Your messages are processed by AI models to generate coaching responses.</li>
                <li>Conversation context may be retained within a session to provide coherent coaching.</li>
                <li>Creator-uploaded knowledge bases are used to inform AI responses but are not shared with other users or creators.</li>
                <li>We do not use your conversations to train AI models.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>5. Sharing of Information</h2>
              <p>We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf, such as payment processing (Stripe), analytics (Mixpanel), and cloud hosting.</li>
                <li><strong>AI Providers:</strong> With AI service providers (Anthropic, OpenAI, Google) to process your coaching interactions, subject to their respective privacy policies and data processing agreements.</li>
                <li><strong>Legal Compliance:</strong> When required by law, regulation, or legal process.</li>
                <li><strong>Safety:</strong> To protect the rights, property, or safety of Better Coaching, our users, or others.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
              </ul>
              <p className="mt-3">We do not sell your personal information to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>6. Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active or as needed to provide the Service. You can request deletion of your account and associated data at any time by contacting us. We may retain certain information as required by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>7. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information, including encryption of data in transit and at rest, secure authentication mechanisms, and regular security assessments. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>8. Your Rights and Choices</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate personal information.</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information.</li>
                <li><strong>Portability:</strong> Request a portable copy of your data.</li>
                <li><strong>Opt-Out:</strong> Opt out of certain data processing activities, including analytics tracking.</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, please contact us at <a href="mailto:max@zelusottomayor.com" className="font-medium underline" style={{ color: 'var(--text-primary)' }}>max@zelusottomayor.com</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>9. Children&apos;s Privacy</h2>
              <p>
                The Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information promptly. If you believe a child under 13 has provided us with personal information, please contact us at <a href="mailto:max@zelusottomayor.com" className="font-medium underline" style={{ color: 'var(--text-primary)' }}>max@zelusottomayor.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>10. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than the country in which you reside. These countries may have data protection laws that are different from your country. We take appropriate safeguards to ensure that your personal information remains protected.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after any changes constitutes your acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>12. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Better Coaching</strong><br />
                Email: <a href="mailto:max@zelusottomayor.com" className="font-medium underline" style={{ color: 'var(--text-primary)' }}>max@zelusottomayor.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container-landing pb-8">
        <div className="pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="meta-text">
              &copy; {new Date().getFullYear()} Better Coaching. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="meta-text hover:text-primary transition-colors font-medium">
                Privacy
              </Link>
              <Link href="/terms" className="meta-text hover:text-primary transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
