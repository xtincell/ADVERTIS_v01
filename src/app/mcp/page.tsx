import { McpHero } from "./components/mcp-hero";
import { McpProblem } from "./components/mcp-problem";
import { McpServers } from "./components/mcp-servers";
import { McpDemo } from "./components/mcp-demo";
import { McpArchitecture } from "./components/mcp-architecture";
import { McpPricing } from "./components/mcp-pricing";
import { McpWaitlist } from "./components/mcp-waitlist";

export const metadata = {
  title: "ADVERTIS MCP — L'intelligence de ta marque, partout",
  description:
    "4 serveurs MCP pour connecter l'intelligence strategique ADVERTIS a n'importe quelle application. 80+ outils, 40+ resources, protocole ouvert.",
};

export default function McpLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <McpHero />
      <McpProblem />
      <McpServers />
      <McpDemo />
      <McpArchitecture />
      <McpPricing />
      <McpWaitlist />
    </div>
  );
}
