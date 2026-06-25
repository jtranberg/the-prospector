import { useMemo, useState } from "react";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";

import { getCountryCode } from "../lib/countryFlags";

const WIDTH = 960;
const HEIGHT = 500;

// world-atlas uses ISO numeric country IDs.
// The Prospector database/flag helper uses alpha-2 codes like CA, US, SE.
// This map converts numeric country IDs into alpha-2 codes.
const numericToAlpha2 = {
  "012": "DZ",
  "020": "AD",
  "032": "AR",
  "036": "AU",
  "040": "AT",
  "048": "BH",
  "051": "AM",
  "056": "BE",
  "070": "BA",
  "076": "BR",
  100: "BG",
  112: "BY",
  124: "CA",
  136: "KY",
  152: "CL",
  156: "CN",
  158: "TW",
  170: "CO",
  180: "CD",
  191: "HR",
  196: "CY",
  203: "CZ",
  208: "DK",
  233: "EE",
  246: "FI",
  250: "FR",
  268: "GE",
  276: "DE",
  300: "GR",
  344: "HK",
  348: "HU",
  352: "IS",
  356: "IN",
  360: "ID",
  364: "IR",
  372: "IE",
  376: "IL",
  380: "IT",
  392: "JP",
  398: "KZ",
  408: "KP",
  410: "KR",
  414: "KW",
  417: "KG",
  422: "LB",
  438: "LI",
  440: "LT",
  442: "LU",
  446: "MO",
  458: "MY",
  484: "MX",
  496: "MN",
  498: "MD",
  504: "MA",
  528: "NL",
  554: "NZ",
  578: "NO",
  586: "PK",
  604: "PE",
  608: "PH",
  616: "PL",
  620: "PT",
  630: "PR",
  642: "RO",
  643: "RU",
  682: "SA",
  688: "RS",
  702: "SG",
  703: "SK",
  704: "VN",
  705: "SI",
  710: "ZA",
  716: "ZW",
  724: "ES",
  752: "SE",
  756: "CH",
  764: "TH",
  784: "AE",
  788: "TN",
  792: "TR",
  795: "TM",
  800: "UG",
  804: "UA",
  807: "MK",
  818: "EG",
  826: "GB",
  840: "US",
  860: "UZ",
  862: "VE",
};

function getFill(count) {
  if (count > 50000) return "rgba(40, 255, 170, 0.95)";
  if (count > 10000) return "rgba(40, 255, 170, 0.75)";
  if (count > 1000) return "rgba(40, 255, 170, 0.55)";
  if (count > 100) return "rgba(40, 255, 170, 0.35)";
  if (count > 0) return "rgba(40, 255, 170, 0.22)";

  return "rgba(255, 255, 255, 0.08)";
}

function getGeoCode(geo) {
  const rawId = geo.id != null ? String(geo.id).padStart(3, "0") : null;

  return (
    numericToAlpha2[rawId] ||
    geo.properties?.iso_a2 ||
    geo.properties?.ISO_A2 ||
    geo.properties?.adm0_a3 ||
    geo.properties?.ADM0_A3 ||
    null
  );
}

function getCountryName(stat) {
  return (
    stat?._id ||
    stat?.nationality ||
    stat?.name ||
    stat?.country ||
    stat?.label ||
    ""
  );
}

function getCountryCount(stat) {
  return Number(stat?.count ?? stat?.value ?? stat?.total ?? 0);
}

function isTinyOverseasFragment(pathGenerator, geo) {
  const bounds = pathGenerator.bounds(geo);

  const width = bounds[1][0] - bounds[0][0];
  const height = bounds[1][1] - bounds[0][1];

  // Filters tiny territories/fragments that create confusing hover results.
  // Example: French Guiana being treated as France near South America.
  return width < 18 && height < 18;
}

export default function WorldProspectMap({ countries = [], onCountryClick }) {
  const [hovered, setHovered] = useState(null);

  // Convert TopoJSON into GeoJSON features.
  const geographies = useMemo(() => {
    return feature(world, world.objects.countries).features;
  }, []);

  function isOverseasFrance(geo, pathGenerator) {
    const code = getGeoCode(geo);

    if (code !== "FR") return false;

    const [x, y] = pathGenerator.centroid(geo);

    // Mainland France sits roughly around this area in the Equal Earth projection.
    // French Guiana and other overseas fragments project elsewhere.
    const isMainlandFrance = x > 440 && x < 520 && y > 190 && y < 260;

    return !isMainlandFrance;
  }

  // Build the projection and SVG path generator once.
  const pathGenerator = useMemo(() => {
    const projection = geoEqualEarth().fitSize([WIDTH, HEIGHT], {
      type: "FeatureCollection",
      features: geographies,
    });

    return geoPath(projection);
  }, [geographies]);

  // Convert nationality stats into a lookup by alpha-2 country code.
  const countByCode = useMemo(() => {
    const map = new Map();

    countries.forEach((country) => {
      const name = getCountryName(country);
      const count = getCountryCount(country);
      const code = getCountryCode(name);

      if (!name || !code) return;

      map.set(code.toUpperCase(), {
        name,
        count,
      });
    });

    return map;
  }, [countries]);

  return (
    <section className="dashboard-card world-map-card">
      <div className="section-header">
        <div>
          <h2>Global Hockey Intelligence</h2>
          <p>
            {countries.length} countries represented in the prospect database.
          </p>
        </div>

        <div className="map-hover-card">
          <strong>{hovered?.name || "Hover a country"}</strong>
          <span>
            {hovered
              ? `${Number(hovered.count || 0).toLocaleString()} prospects`
              : "Click a highlighted country to search"}
          </span>
        </div>
      </div>

      <div className="world-map-wrap">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="World map of prospect database coverage"
        >
          {geographies.map((geo) => {
            const rawCode = getGeoCode(geo);
            const code = rawCode ? String(rawCode).toUpperCase() : null;
            const match = code ? countByCode.get(code) : null;

            const name = match?.name || geo.properties?.name || "Unknown";
            const count = match?.count || 0;
            const path = pathGenerator(geo);

            if (!path) return null;

            if (
              isTinyOverseasFragment(pathGenerator, geo) ||
              isOverseasFrance(geo, pathGenerator)
            ) {
              return null;
            }

            return (
              <path
                key={geo.id}
                d={path}
                fill={getFill(count)}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="0.6"
                className={count ? "map-country active" : "map-country"}
                onMouseEnter={() => {
                  console.log({
                    geoId: geo.id,
                    code,
                    mapName: geo.properties?.name,
                    matched: match?.name,
                  });

                  setHovered({ name, count });
                }}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  if (count) onCountryClick?.(name);
                }}
              />
            );
          })}
        </svg>
      </div>
    </section>
  );
}
