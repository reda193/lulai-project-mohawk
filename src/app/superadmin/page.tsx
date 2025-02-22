'use server';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"

export default async function HomePage() {
    const session = await getServerSession(authOptions);
    return (
        <div style={{ padding: "24px", maxWidth: "960px", margin: "auto" }}>
        <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginTop: "16px", marginBottom: "16px" }}>
                Super Admin Dashboard
            </h1>
        </div>

        <section style={{ marginBottom: "32px" }}>
            <h1><strong>Client Overview</strong></h1>
            <p>View all registered businesses using LulAI.</p>
            <ul>
                <li>Sort/filter by industry, size, subscription plan, active status</li>
                <li>• Manage Clients</li>
                <li>Edit Client Details (name, contact info, plan, usage history)</li>
                <li>Deactivate / Suspend accounts</li>
                <li>Upgrade / Downgrade Subscription</li>
                <li>View Activity Logs (chatbot interactions, user logins, API usage)</li>
                <li>• Manage User Roles</li>
                <li>Assign or remove admin roles for users within a client’s organization</li>
                <li>Access Control: Restrict feature access based on subscription level</li>
            </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
            <h1><strong>Subscription & Billing Control</strong></h1>
            <ul>
                <li>Overview of active subscriptions, trials, payments, pending invoices</li>
                <li>Manual adjustments (apply discounts, cancel subscriptions, add credits)</li>
                <li>Payment Failures alert with retry options</li>
                <li>• Plan Customization</li>
                <li>Define custom pricing tiers for different clients</li>
                <li>Add/remove features based on the client’s agreement</li>
            </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
            <h1><strong>AI Model Management</strong></h1>
            <ul>
                <li>View all AI models integrated (ChatGPT, Cohere, Groq, Llama, etc.)</li>
                <li>Modify Default Model per client</li>
                <li>Push Updates to chatbot logic across all instances</li>
                <li>• Training Dataset Oversight</li>
                <li>Review client training datasets</li>
                <li>Approve/reject changes before models are updated</li>
                <li>Provide AI performance insights</li>
            </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
            <h1><strong>AI Model Management</strong></h1>
            <ul>
                <li>System-Wide Analytics</li>
                <li>Monitor global usage statistics (total interactions, peak times, engagement levels)</li>
                <li>Track error logs and failed requests across all clients</li>
                <li>Identify AI performance metrics</li>
                <li>• Incident & Error Reports</li>
                <li>Real-time alerts for system downtime, API failures, or chatbot misbehavior</li>
                <li>Quick rollback & recovery options</li>
            </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
            <h1><strong>Support & Intervention</strong></h1>
            <ul>
                <li>Support Ticket Dashboard</li>
                <li>Monitor all client support tickets in one place</li>
                <li>Assign tickets to internal team members</li>
                <li>Track response times & resolutions</li>
                <li>• Live Debugging</li>
                <li>Enter Live Debug Mode for troubleshooting client chatbots</li>
                <li>Simulate customer interactions to test AI responses</li>
                <li>Override AI-generated messages in real-time</li>
            </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
            <h1><strong>Feature Rollout & Management</strong></h1>
            <ul>
                <li>Feature Flags</li>
                <li>Enable/disable beta features for specific clients</li>
                <li>Roll out updates gradually instead of system-wide</li>
                <li>• Custom Feature Deployment</li>
                <li>Deploy tailored solutions for premium clients</li>
                <li>Test sandbox environments before pushing to production</li>
            </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
            <h1><strong>API & Integration Management</strong></h1>
            <ul>
                <li>API Access Control</li>
                <li>Issue/Revoke API keys for client integrations</li>
                <li>Monitor API usage limits and restrictions</li>
                <li>• Third-Party Integrations</li>
                <li>Manage WhatsApp, Instagram, Shopify, WooCommerce integrations</li>
                <li>Oversee API connections and troubleshoot issues</li>
            </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
            <h1><strong>Security & Compliance</strong></h1>
            <ul>
                <li>User Access Logs</li>
                <li>Monitor logins, IP addresses, and suspicious activity</li>
                <li>Enforce 2FA authentication for high-risk accounts</li>
                <li>• Compliance Dashboard</li>
                <li>Ensure GDPR, CCPA, and data privacy regulations are met</li>
                <li>Manage data deletion requests</li>
            </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
            <h1><strong>System-Wide Settings & Overrides</strong></h1>
            <ul>
                <li>Global Configurations</li>
                <li>Adjust default chatbot behavior settings</li>
                <li>Configure branding elements for enterprise clients</li>
                <li>• Emergency Overrides</li>
                <li>Force Restart AI Services in case of major failure</li>
                <li>Disable specific chatbots across multiple clients</li>
            </ul>
        </section>
    </div>
  
    )
}