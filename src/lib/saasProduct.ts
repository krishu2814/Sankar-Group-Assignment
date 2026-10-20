export interface SaaSProductInfo {
  name: string;
  tagline: string;
  targetAudience: string;
  overview: string;
  pricing: {
    starter: string;
    growth: string;
    enterprise: string;
  };
  keyFeatures: string[];
  competitiveAdvantages: string[];
  commonObjections: {
    objection: string;
    rebuttal: string;
  }[];
  salesGoal: string;
}

export const CLOUDPULSE_PRODUCT: SaaSProductInfo = {
  name: "CloudPulse AI",
  tagline: "Autonomous Cloud Infrastructure Monitoring & Root-Cause Analysis",
  targetAudience: "CTOs, DevOps Leads, Engineering Managers, and Cloud Architects",
  overview:
    "CloudPulse AI is a modern B2B SaaS platform that continuously monitors AWS, GCP, and Kubernetes infrastructure. When anomalies occur, its proprietary AI correlates telemetry across metrics, logs, and traces to pinpoint root cause in under 60 seconds, sending actionable fix recommendations directly to Slack.",
  pricing: {
    starter: "$49 / month (up to 10 servers/nodes, real-time Slack alerts, 7-day retention)",
    growth: "$149 / month (up to 50 nodes, automated AI root-cause diagnosis, 30-day retention)",
    enterprise: "Custom (unlimited clusters, dedicated customer success, custom compliance)",
  },
  keyFeatures: [
    "Sub-60 second anomaly detection across CPU, memory, database latency, and network traffic",
    "Automated AI root cause analysis explaining exactly why downtime or latency spiked",
    "One-click integrations with Slack, Discord, PagerDuty, and Jira",
    "Zero-overhead eBPF lightweight agent that deploys in under 5 minutes",
    "SOC-2 Type II compliant — collects only telemetry, zero customer PII or raw payload data",
  ],
  competitiveAdvantages: [
    "70% lower cost than Datadog or New Relic with predictable flat pricing instead of surprise overages",
    "Proactive AI diagnosis rather than forcing engineers to dig through complicated dashboards during outages",
    "14-day fully featured free pilot with zero credit card required",
  ],
  commonObjections: [
    {
      objection: "We already use Datadog or AWS CloudWatch.",
      rebuttal:
        "That's very common! Most of our customers kept CloudWatch or Datadog initially. What they love about CloudPulse is that it cuts their Mean-Time-To-Resolution by 65% because our AI immediately identifies the exact code or database query causing the alert, rather than alerting on high CPU alone. Plus, it runs alongside your current setup in 5 minutes.",
    },
    {
      objection: "It's too expensive or we don't have budget.",
      rebuttal:
        "We completely understand budget constraints. CloudPulse starts at just $49 a month with flat pricing, which typically saves engineering teams thousands compared to traditional per-host pricing. Plus, we offer a 14-day zero-risk trial so you can see ROI before spending a single dollar.",
    },
    {
      objection: "Security and data compliance concerns.",
      rebuttal:
        "Security is our highest priority. CloudPulse is SOC-2 Type II certified and GDPR compliant. Our agent only reads performance telemetry and operational metrics — it never inspects application payloads or customer personal data.",
    },
    {
      objection: "I need to discuss this with my team or boss first.",
      rebuttal:
        "That makes total sense. How about I set you up with our quick 15-minute live demo or send over our 1-page architecture brief so your team can evaluate the numbers?",
    },
  ],
  salesGoal:
    "Guide the prospect toward agreeing to a 15-minute personalized demo or signing up for the 14-day free pilot.",
};

export const INITIAL_BOT_GREETING =
  "Hi there! This is Alex from CloudPulse AI. I noticed your team is managing cloud infrastructure. How are you currently handling server monitoring and unexpected downtime alerts?";
