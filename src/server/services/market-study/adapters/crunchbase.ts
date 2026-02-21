// =============================================================================
// MODULE 25F — Crunchbase Adapter
// =============================================================================
// Fetches competitor company data (description, founding date, employee count,
// total funding, last funding round, HQ location, categories) from the
// Crunchbase Basic API v4. Searches by competitor name via autocomplete,
// then fetches detailed organization fields.
// Requires env CRUNCHBASE_API_KEY.
//
// Implements: DataSourceAdapter { isConfigured(), collect(params) }
// sourceId: "crunchbase"
//
// Public API (exported):
//   CrunchbaseAdapter class
//
// Dependencies:
//   ~/lib/types/market-study         — CollectionParams, CollectionResult, Crunchbase* types
//   ./base-adapter                   — getEnvVar
//
// Called by:
//   market-study/collection-orchestrator.ts (instantiated + collect())
// =============================================================================

import type {
  CollectionParams,
  CollectionResult,
  DataSourceAdapter,
  CrunchbaseData,
  CrunchbaseCompany,
} from "~/lib/types/market-study";
import { getEnvVar } from "./base-adapter";

const API_BASE = "https://api.crunchbase.com/api/v4";

export class CrunchbaseAdapter implements DataSourceAdapter {
  name = "Crunchbase";
  sourceId = "crunchbase" as const;

  isConfigured(): boolean {
    return !!getEnvVar("CRUNCHBASE_API_KEY");
  }

  async collect(params: CollectionParams): Promise<CollectionResult> {
    const apiKey = getEnvVar("CRUNCHBASE_API_KEY");
    if (!apiKey) {
      return {
        success: false,
        data: null,
        dataPointCount: 0,
        error: "CRUNCHBASE_API_KEY not configured",
      };
    }

    const competitors: CrunchbaseCompany[] = [];

    // Search for each competitor
    for (const compName of params.competitors.slice(0, 5)) {
      try {
        // Search for the organization
        const searchUrl = `${API_BASE}/autocompletes?query=${encodeURIComponent(compName)}&collection_ids=organizations&limit=1&user_key=${apiKey}`;
        const searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) {
          console.warn(`[Crunchbase] Search failed for "${compName}" (${searchResponse.status})`);
          continue;
        }

        const searchData = (await searchResponse.json()) as {
          entities?: Array<{
            identifier?: {
              permalink?: string;
              value?: string;
            };
            short_description?: string;
          }>;
        };

        const entity = searchData.entities?.[0];
        if (!entity?.identifier?.permalink) continue;

        const permalink = entity.identifier.permalink;

        // Fetch organization details
        const orgUrl = `${API_BASE}/entities/organizations/${permalink}?card_ids=fields&field_ids=short_description,founded_on,num_employees_enum,funding_total,last_funding_type,last_funding_at,location_identifiers,categories&user_key=${apiKey}`;
        const orgResponse = await fetch(orgUrl);

        if (!orgResponse.ok) {
          console.warn(`[Crunchbase] Org fetch failed for "${permalink}" (${orgResponse.status})`);
          // Still add basic info
          competitors.push({
            name: compName,
            description: entity.short_description ?? "",
          });
          continue;
        }

        const orgData = (await orgResponse.json()) as {
          properties?: {
            short_description?: string;
            founded_on?: string;
            num_employees_enum?: string;
            funding_total?: { value_usd?: number; currency?: string; value?: number };
            last_funding_type?: string;
            last_funding_at?: string;
            location_identifiers?: Array<{ value?: string }>;
            categories?: Array<{ value?: string }>;
          };
        };

        const props = orgData.properties ?? {};

        const fundingTotal = props.funding_total?.value_usd;
        const formattedFunding = fundingTotal
          ? formatFunding(fundingTotal)
          : undefined;

        competitors.push({
          name: entity.identifier.value ?? compName,
          description: props.short_description ?? "",
          foundedDate: props.founded_on,
          employeeCount: props.num_employees_enum,
          totalFunding: formattedFunding,
          lastFundingRound: props.last_funding_type,
          lastFundingDate: props.last_funding_at,
          headquartersLocation: props.location_identifiers?.[0]?.value,
          categories: props.categories?.map((c) => c.value ?? "").filter(Boolean),
          url: `https://www.crunchbase.com/organization/${permalink}`,
        });

        // Rate limit
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.warn(`[Crunchbase] Error for "${compName}":`, error);
      }
    }

    const crunchbaseData: CrunchbaseData = {
      competitors,
      collectedAt: new Date().toISOString(),
    };

    return {
      success: competitors.length > 0,
      data: crunchbaseData,
      dataPointCount: competitors.length,
    };
  }
}

function formatFunding(usd: number): string {
  if (usd >= 1_000_000_000) {
    return `$${(usd / 1_000_000_000).toFixed(1)}B`;
  }
  if (usd >= 1_000_000) {
    return `$${(usd / 1_000_000).toFixed(1)}M`;
  }
  if (usd >= 1_000) {
    return `$${(usd / 1_000).toFixed(0)}K`;
  }
  return `$${usd}`;
}
