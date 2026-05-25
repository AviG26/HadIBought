import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const RAW_DATA_BASE = [
  ["1993-02",25.07,142.6],["1993-03",25.33,143.1],["1993-04",25.57,143.6],
  ["1993-05",25.96,144.0],["1993-06",25.68,144.4],["1993-07",26.26,144.4],
  ["1993-08",26.62,144.8],["1993-09",26.40,145.1],["1993-10",26.60,145.7],
  ["1993-11",26.97,145.8],["1993-12",27.37,145.8],["1994-01",26.70,146.2],
  ["1994-02",25.96,146.7],["1994-03",25.04,147.2],["1994-04",25.38,147.4],
  ["1994-05",25.68,147.5],["1994-06",25.41,148.0],["1994-07",26.07,148.4],
  ["1994-08",26.87,149.0],["1994-09",26.61,149.4],["1994-10",26.10,149.5],
  ["1994-11",25.55,149.7],["1994-12",26.08,149.7],["1995-01",26.83,150.3],
  ["1995-02",27.86,150.9],["1995-03",28.66,151.4],["1995-04",29.48,151.9],
  ["1995-05",30.65,152.2],["1995-06",31.20,152.5],["1995-07",32.28,152.5],
  ["1995-08",33.35,152.9],["1995-09",33.82,153.2],["1995-10",34.68,153.7],
  ["1995-11",35.94,153.6],["1995-12",37.23,153.5],["1996-01",38.51,154.4],
  ["1996-02",38.77,154.9],["1996-03",39.17,155.7],["1996-04",39.67,156.3],
  ["1996-05",40.62,156.6],["1996-06",39.87,156.7],["1996-07",38.13,157.0],
  ["1996-08",39.17,157.3],["1996-09",41.04,157.8],["1996-10",42.23,158.3],
  ["1996-11",45.41,158.6],["1996-12",46.72,158.6],["1997-01",48.31,159.1],
  ["1997-02",49.89,159.6],["1997-03",47.79,160.0],["1997-04",50.68,160.2],
  ["1997-05",53.91,160.1],["1997-06",56.28,160.3],["1997-07",60.69,160.5],
  ["1997-08",61.70,160.8],["1997-09",64.49,161.2],["1997-10",62.40,161.6],
  ["1997-11",65.37,161.5],["1997-12",66.10,161.3],["1998-01",68.93,161.6],
  ["1998-02",73.80,161.9],["1998-03",77.64,162.2],["1998-04",78.73,162.5],
  ["1998-05",80.70,162.8],["1998-06",82.47,163.0],["1998-07",82.18,163.2],
  ["1998-08",70.58,163.4],["1998-09",74.87,163.6],["1998-10",80.48,164.0],
  ["1998-11",86.03,164.0],["1998-12",88.89,163.9],["1999-01",92.28,164.3],
  ["1999-02",88.83,164.5],["1999-03",95.62,165.0],["1999-04",99.62,166.2],
  ["1999-05",96.59,166.2],["1999-06",100.17,166.2],["1999-07",98.68,166.7],
  ["1999-08",97.42,167.1],["1999-09",94.33,167.9],["1999-10",98.87,168.2],
  ["1999-11",100.06,168.3],["1999-12",106.94,168.3],["2000-01",103.62,168.8],
  ["2000-02",101.63,169.8],["2000-03",111.24,171.2],["2000-04",107.82,171.3],
  ["2000-05",105.45,171.5],["2000-06",107.95,172.4],["2000-07",106.17,172.8],
  ["2000-08",112.62,172.8],["2000-09",106.59,173.7],["2000-10",101.12,174.0],
  ["2000-11",97.56,174.1],["2000-12",97.96,174.0],["2001-01",101.35,175.1],
  ["2001-02",92.05,175.8],["2001-03",86.09,176.2],["2001-04",92.71,176.9],
  ["2001-05",93.21,177.7],["2001-06",90.93,178.0],["2001-07",89.93,177.5],
  ["2001-08",85.24,177.5],["2001-09",77.21,178.3],["2001-10",78.64,177.7],
  ["2001-11",84.55,177.4],["2001-12",85.29,176.7],["2002-01",83.91,177.1],
  ["2002-02",82.16,177.8],["2002-03",85.19,178.8],["2002-04",79.92,179.8],
  ["2002-05",79.25,179.8],["2002-06",73.47,179.9],["2002-07",67.66,180.1],
  ["2002-08",68.02,180.7],["2002-09",60.52,181.0],["2002-10",65.75,181.3],
  ["2002-11",69.52,181.3],["2002-12",65.38,180.9],["2003-01",63.57,181.7],
  ["2003-02",62.47,183.1],["2003-03",63.00,184.2],["2003-04",68.09,183.8],
  ["2003-05",71.55,183.5],["2003-06",72.39,183.7],["2003-07",73.52,183.9],
  ["2003-08",74.93,184.6],["2003-09",74.02,185.2],["2003-10",78.04,185.0],
  ["2003-11",78.63,184.5],["2003-12",82.62,184.3],["2004-01",84.07,185.2],
  ["2004-02",85.10,186.2],["2004-03",83.67,187.4],["2004-04",82.27,188.0],
  ["2004-05",83.36,189.1],["2004-06",84.87,189.7],["2004-07",81.98,189.4],
  ["2004-08",82.10,189.5],["2004-09",82.97,189.9],["2004-10",84.01,190.9],
  ["2004-11",87.38,191.0],["2004-12",90.15,190.3],["2005-01",87.80,190.7],
  ["2005-02",89.44,191.8],["2005-03",87.86,193.3],["2005-04",85.92,194.6],
  ["2005-05",88.56,194.4],["2005-06",88.55,194.5],["2005-07",91.74,195.4],
  ["2005-08",90.77,196.4],["2005-09",91.43,198.8],["2005-10",89.82,199.2],
  ["2005-11",92.88,197.6],["2005-12",92.87,196.8],["2006-01",95.20,198.3],
  ["2006-02",95.27,198.7],["2006-03",96.25,199.8],["2006-04",97.43,201.5],
  ["2006-05",94.47,202.5],["2006-06",94.49,202.9],["2006-07",94.95,203.5],
  ["2006-08",96.94,203.1],["2006-09",99.30,202.9],["2006-10",102.51,201.8],
  ["2006-11",104.19,201.5],["2006-12",105.57,201.8],["2007-01",107.15,202.4],
  ["2007-02",104.85,203.5],["2007-03",105.89,205.4],["2007-04",110.42,206.7],
  ["2007-05",114.07,207.9],["2007-06",111.98,208.4],["2007-07",108.45,208.3],
  ["2007-08",109.83,207.9],["2007-09",113.84,208.5],["2007-10",115.44,209.2],
  ["2007-11",110.35,210.2],["2007-12",109.23,210.0],["2008-01",102.82,211.1],
  ["2008-02",99.11,211.7],["2008-03",98.62,213.5],["2008-04",103.30,214.8],
  ["2008-05",104.50,216.6],["2008-06",95.50,218.8],["2008-07",94.46,220.0],
  ["2008-08",95.66,219.1],["2008-09",86.97,218.8],["2008-10",72.19,216.6],
  ["2008-11",66.80,212.4],["2008-12",67.27,210.2],["2009-01",61.58,211.1],
  ["2009-02",54.82,212.2],["2009-03",59.38,212.7],["2009-04",64.99,213.2],
  ["2009-05",68.41,213.9],["2009-06",68.40,215.7],["2009-07",73.51,215.4],
  ["2009-08",76.04,215.8],["2009-09",78.70,216.0],["2009-10",77.17,216.2],
  ["2009-11",81.66,216.3],["2009-12",83.09,215.9],["2010-01",80.00,216.7],
  ["2010-02",82.27,216.7],["2010-03",87.10,217.6],["2010-04",88.39,218.0],
  ["2010-05",81.22,218.2],["2010-06",76.97,217.6],["2010-07",82.13,218.0],
  ["2010-08",78.28,218.3],["2010-09",85.26,218.4],["2010-10",88.33,218.7],
  ["2010-11",88.19,218.8],["2010-12",94.04,219.2],["2011-01",96.16,220.2],
  ["2011-02",99.33,221.3],["2011-03",99.38,223.5],["2011-04",102.26,224.9],
  ["2011-05",100.92,225.4],["2011-06",99.13,225.7],["2011-07",97.06,225.9],
  ["2011-08",91.55,226.5],["2011-09",84.97,226.9],["2011-10",94.21,226.4],
  ["2011-11",93.69,226.2],["2011-12",94.43,225.7],["2012-01",98.53,226.7],
  ["2012-02",102.56,227.7],["2012-03",105.79,229.4],["2012-04",104.92,230.1],
  ["2012-05",98.52,229.8],["2012-06",102.23,229.5],["2012-07",103.52,229.1],
  ["2012-08",105.69,230.1],["2012-09",108.14,231.4],["2012-10",106.10,231.3],
  ["2012-11",106.44,230.2],["2012-12",107.11,229.6],["2013-01",112.60,230.3],
  ["2013-02",113.83,232.2],["2013-03",117.94,232.8],["2013-04",119.90,232.5],
  ["2013-05",122.54,232.9],["2013-06",120.58,233.7],["2013-07",126.64,233.6],
  ["2013-08",122.72,234.1],["2013-09",126.37,234.1],["2013-10",131.97,233.5],
  ["2013-11",135.71,233.1],["2013-12",138.72,233.0],["2014-01",133.90,233.9],
  ["2014-02",139.47,234.8],["2014-03",140.52,236.3],["2014-04",141.47,237.1],
  ["2014-05",144.39,237.9],["2014-06",147.16,238.3],["2014-07",145.01,238.2],
  ["2014-08",150.37,237.9],["2014-09",147.96,238.0],["2014-10",151.37,237.4],
  ["2014-11",155.18,236.2],["2014-12",154.55,234.8],["2015-01",149.58,233.7],
  ["2015-02",157.89,234.7],["2015-03",154.96,236.1],["2015-04",156.44,236.6],
  ["2015-05",158.01,237.8],["2015-06",154.78,238.6],["2015-07",157.80,238.7],
  ["2015-08",148.01,238.3],["2015-09",144.24,237.9],["2015-10",156.15,237.8],
  ["2015-11",156.22,237.3],["2015-12",153.50,236.5],["2016-01",145.62,236.9],
  ["2016-02",145.11,237.1],["2016-03",154.84,238.1],["2016-04",155.24,239.3],
  ["2016-05",157.59,240.2],["2016-06",157.78,241.0],["2016-07",163.34,240.6],
  ["2016-08",163.07,240.8],["2016-09",162.90,241.4],["2016-10",159.80,241.7],
  ["2016-11",165.30,241.4],["2016-12",168.23,241.4],["2017-01",171.37,242.8],
  ["2017-02",177.78,243.6],["2017-03",177.58,243.8],["2017-04",179.14,244.5],
  ["2017-05",181.36,244.7],["2017-06",182.14,244.9],["2017-07",185.67,244.8],
  ["2017-08",185.76,245.5],["2017-09",189.27,246.8],["2017-10",193.45,246.7],
  ["2017-11",198.87,246.7],["2017-12",200.93,246.5],["2018-01",212.00,247.9],
  ["2018-02",203.72,248.9],["2018-03",198.30,249.6],["2018-04",198.89,250.5],
  ["2018-05",203.18,251.6],["2018-06",204.07,251.9],["2018-07",211.38,252.0],
  ["2018-08",217.77,252.1],["2018-09",218.91,252.4],["2018-10",203.77,252.9],
  ["2018-11",207.44,252.0],["2018-12",188.27,251.2],["2019-01",203.20,251.7],
  ["2019-02",209.47,252.8],["2019-03",213.07,254.2],["2019-04",221.41,255.5],
  ["2019-05",206.71,256.1],["2019-06",221.03,256.1],["2019-07",223.80,256.6],
  ["2019-08",219.79,256.6],["2019-09",223.56,256.8],["2019-10",228.27,257.3],
  ["2019-11",236.00,257.2],["2019-12",242.75,256.9],["2020-01",242.36,257.9],
  ["2020-02",222.08,258.7],["2020-03",194.88,258.1],["2020-04",219.21,256.4],
  ["2020-05",228.77,256.4],["2020-06",232.90,257.8],["2020-07",245.71,259.1],
  ["2020-08",263.07,259.9],["2020-09",252.72,260.3],["2020-10",245.74,260.4],
  ["2020-11",272.36,260.2],["2020-12",282.49,260.5],["2021-01",279.31,261.6],
  ["2021-02",286.76,263.0],["2021-03",298.66,264.9],["2021-04",314.44,267.1],
  ["2021-05",315.98,269.2],["2021-06",322.97,271.7],["2021-07",330.33,273.0],
  ["2021-08",339.92,273.6],["2021-09",323.54,274.3],["2021-10",346.08,276.6],
  ["2021-11",343.26,278.8],["2021-12",358.41,280.1],["2022-01",339.50,281.9],
  ["2022-02",328.77,284.2],["2022-03",340.51,288.0],["2022-04",310.40,289.1],
  ["2022-05",310.56,291.5],["2022-06",284.54,296.3],["2022-07",310.40,296.3],
  ["2022-08",301.36,296.2],["2022-09",269.44,296.8],["2022-10",293.03,298.0],
  ["2022-11",306.56,297.7],["2022-12",288.86,296.8],["2023-01",306.29,299.2],
  ["2023-02",298.42,300.8],["2023-03",309.07,301.8],["2023-04",313.37,303.4],
  ["2023-05",314.16,304.1],["2023-06",334.55,305.1],["2023-07",345.16,305.7],
  ["2023-08",338.98,307.0],["2023-09",322.35,307.8],["2023-10",315.39,307.7],
  ["2023-11",343.51,307.0],["2023-12",358.99,306.7],["2024-01",364.49,308.4],
  ["2024-02",386.33,310.3],["2024-03",395.37,312.2],["2024-04",378.78,313.5],
  ["2024-05",397.28,314.1],["2024-06",411.00,314.2],["2024-07",415.98,314.5],
  ["2024-08",425.36,315.0],["2024-09",434.15,315.3],["2024-10",429.65,315.7],
  ["2024-11",448.85,315.5],["2024-12",443.22,315.6],
  ["2025-01",556.16,317.0],["2025-02",585.37,317.7],["2025-03",551.38,319.8],
  ["2025-04",541.52,320.5],["2025-05",590.84,320.9],["2025-06",605.26,321.2],
  ["2025-07",619.15,321.5],["2025-08",634.27,321.8],["2025-09",624.18,322.1],
  ["2025-10",648.33,322.4],["2025-11",662.51,322.7],["2025-12",681.92,323.0],
  ["2026-01",683.17,324.0],["2026-02",681.27,325.0],["2026-03",668.00,327.0],
  ["2026-04",718.66,330.2],["2026-05",718.01,330.2],
];

const DIV_YIELD_BY_YEAR = {
  1993:2.7,1994:2.8,1995:2.5,1996:2.2,1997:2.0,1998:1.7,1999:1.3,2000:1.2,
  2001:1.4,2002:1.6,2003:1.6,2004:1.6,2005:1.7,2006:1.7,2007:1.8,2008:2.2,
  2009:2.5,2010:1.9,2011:2.0,2012:2.1,2013:2.0,2014:1.9,2015:2.1,2016:2.1,
  2017:1.9,2018:1.8,2019:1.8,2020:1.6,2021:1.4,2022:1.6,2023:1.6,2024:1.3,
  2025:1.2,2026:1.1,
};

const RAW_DATA = (() => {
  let divMultiplier = 1.0;
  return RAW_DATA_BASE.map(([ym, close, cpi], i) => {
    const year = parseInt(ym.slice(0, 4));
    const monthlyYield = ((DIV_YIELD_BY_YEAR[year] || 1.8) / 100) / 12;
    if (i > 0) divMultiplier *= (1 + monthlyYield);
    return [ym, +(close * divMultiplier).toFixed(4), close, cpi];
  });
})();

const API_BASE = "https://hadibought-production.up.railway.app";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ALL_DATES = RAW_DATA.map(d => d[0]);
const MIN_DATE = ALL_DATES[0];
const MAX_DATE = ALL_DATES[ALL_DATES.length - 1];

function formatCurrency(val) {
  if (val == null || isNaN(val)) return "—";
  if (Math.abs(val) >= 1_000_000) return `$${(val/1_000_000).toFixed(2)}M`;
  if (Math.abs(val) >= 1_000) return `$${(val/1_000).toFixed(1)}K`;
  return `$${val.toFixed(2)}`;
}

function formatPct(val) {
  if (val == null || isNaN(val)) return "—";
  return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;
}

function formatLabel(ym) {
  const [y, m] = ym.split("-");
  return `${MONTHS[parseInt(m)-1]} ${y}`;
}

function thinArray(arr, max = 400) {
  if (arr.length <= max) return arr;
  const step = Math.ceil(arr.length / max);
  return arr.filter((_, i) => i % step === 0 || i === arr.length - 1);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "12px 16px",
      fontSize: 13,
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    }}>
      <div style={{ color: "#6b7280", marginBottom: 8, fontSize: 12, fontWeight: 500 }}>{label}</div>
      {payload.map((p, i) => p.name !== "Initial Investment" && (
        <div key={i} style={{ color: p.color, marginBottom: 3, fontWeight: 600 }}>
          {p.name}: {formatCurrency(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function HadIBought() {
  const [investment, setInvestment] = useState(10000);
  const [inputVal, setInputVal] = useState("10,000");
  const [startDate, setStartDate] = useState("2010-01");
  const [endDate, setEndDate] = useState(MAX_DATE);
  const [dividendMode, setDividendMode] = useState("both");
  const [inflation, setInflation] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [dataSource, setDataSource] = useState("static"); // "static" | "live"

  // Try to fetch live data from Railway backend on mount
  useState(() => {
    fetch(`${API_BASE}/api/monthly`)
      .then(r => r.json())
      .then(json => {
        const series = json["Monthly Adjusted Time Series"];
        if (!series) return;
        const parsed = {};
        for (const [date, vals] of Object.entries(series)) {
          const ym = date.slice(0, 7);
          parsed[ym] = {
            adjClose: parseFloat(vals["5. adjusted close"]),
            close: parseFloat(vals["4. close"]),
          };
        }
        setLiveData(parsed);
        setDataSource("live");
      })
      .catch(() => {}); // silently fall back to static data
  }, []);

  // Build lookup — use live data if available, otherwise static
  const dataLookup = useMemo(() => {
    if (liveData) {
      const dates = Object.keys(liveData).sort();
      const lookup = {};
      for (const ym of dates) {
        const { adjClose, close } = liveData[ym];
        lookup[ym] = { adj: adjClose, close, cpi: 1 };
      }
      for (const [ym, , , cpi] of RAW_DATA) {
        if (lookup[ym]) lookup[ym].cpi = cpi;
      }
      return { lookup, dates };
    }
    // Static fallback
    const lookup = {};
    for (const [ym, adj, close, cpi] of RAW_DATA) lookup[ym] = { adj, close, cpi };
    return { lookup, dates: ALL_DATES };
  }, [liveData]);

  const { chartData, stats } = useMemo(() => {
    const { lookup, dates: allDates } = dataLookup;
    const dates = allDates.filter(d => d >= startDate && d <= endDate);
    if (dates.length < 2) return { chartData: [], stats: null };
    const first = lookup[dates[0]];
    if (!first) return { chartData: [], stats: null };
    const firstCpi = first.cpi || 1;
    const points = dates.map(date => {
      const { adj, close, cpi } = lookup[date] || first;
      const cpiAdj = inflation ? (firstCpi / (cpi || firstCpi)) : 1;
      return {
        label: formatLabel(date),
        "With Dividends": +(investment * (adj / first.adj) * cpiAdj).toFixed(2),
        "Price Only": +(investment * (close / first.close) * cpiAdj).toFixed(2),
        "Initial Investment": +(investment * cpiAdj).toFixed(2),
      };
    });
    const last = points[points.length - 1];
    const years = dates.length / 12;
    const finalTR = last["With Dividends"];
    const finalPO = last["Price Only"];
    return {
      chartData: thinArray(points),
      stats: {
        finalTR, finalPO,
        pctTR: ((finalTR - investment) / investment) * 100,
        pctPO: ((finalPO - investment) / investment) * 100,
        cagrTR: (Math.pow(finalTR / investment, 1 / years) - 1) * 100,
        cagrPO: (Math.pow(finalPO / investment, 1 / years) - 1) * 100,
        divBoost: finalTR - finalPO,
        years: years.toFixed(1),
      }
    };
  }, [dataLookup, investment, startDate, endDate, inflation]);

  const showTR = dividendMode === "reinvested" || dividendMode === "both";
  const showPO = dividendMode === "excluded" || dividendMode === "both";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f9fafb",
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#111827",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type="month"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
        .toggle-btn { transition: all 0.2s ease; }
        .toggle-btn:hover { opacity: 0.8; }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
      `}</style>

      {/* Nav */}
      <nav style={{
        background: "white",
        borderBottom: "1px solid #f3f4f6",
        padding: "0 40px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "white",
          }}>H</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px" }}>
            HadIBought
          </span>
        </div>
        <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
          S&P 500 Performance Calculator
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #f3f4f6",
        padding: "56px 40px 48px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: dataSource === "live" ? "#f0fdf4" : "#fefce8",
            border: `1px solid ${dataSource === "live" ? "#bbf7d0" : "#fde68a"}`,
            borderRadius: 100, padding: "4px 12px",
            fontSize: 12, fontWeight: 600,
            color: dataSource === "live" ? "#16a34a" : "#92400e",
            marginBottom: 20, letterSpacing: "0.02em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dataSource === "live" ? "#16a34a" : "#f59e0b", display: "inline-block" }} />
            {dataSource === "live" ? "Live S&P 500 Data" : "Historical Data (1993–2026)"}
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(36px, 6vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-1px",
            color: "#111827",
            marginBottom: 16,
          }}>
            What if you'd invested<br />
            <span style={{ fontStyle: "italic", color: "#6366f1" }}>in the S&P 500?</span>
          </h1>
          <p style={{
            fontSize: 17, color: "#6b7280", lineHeight: 1.6, fontWeight: 400,
          }}>
            Enter any amount and date range to see exactly how your money would have grown — with real historical data, dividends, and inflation adjustment.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Controls Card */}
        <div style={{
          background: "white",
          borderRadius: 20,
          border: "1px solid #f3f4f6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)",
          padding: "32px",
          marginBottom: 24,
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 20,
          }}>
            {/* Investment */}
            <div>
              <label style={labelStyle}>Investment Amount</label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)", color: "#9ca3af",
                  fontSize: 15, fontWeight: 500,
                }}>$</span>
                <input
                  type="text"
                  value={inputVal}
                  onChange={e => {
                    setInputVal(e.target.value);
                    const n = parseFloat(e.target.value.replace(/,/g, ""));
                    if (!isNaN(n) && n > 0) setInvestment(n);
                  }}
                  style={{ ...inputStyle, paddingLeft: 28 }}
                />
              </div>
            </div>

            {/* Start */}
            <div>
              <label style={labelStyle}>Start Date</label>
              <input type="month" value={startDate} min={MIN_DATE} max={endDate}
                onChange={e => setStartDate(e.target.value)} style={inputStyle} />
            </div>

            {/* End */}
            <div>
              <label style={labelStyle}>End Date</label>
              <input type="month" value={endDate} min={startDate} max={MAX_DATE}
                onChange={e => setEndDate(e.target.value)} style={inputStyle} />
            </div>

            {/* Dividends */}
            <div>
              <label style={labelStyle}>Dividends</label>
              <div style={toggleGroupStyle}>
                {[["reinvested","Reinvested"],["excluded","Excluded"],["both","Compare"]].map(([val, label], i, arr) => (
                  <button key={val} className="toggle-btn" onClick={() => setDividendMode(val)} style={{
                    flex: 1, padding: "9px 0", border: "none", cursor: "pointer",
                    background: dividendMode === val ? "#6366f1" : "transparent",
                    color: dividendMode === val ? "white" : "#6b7280",
                    fontSize: 12, fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    borderRadius: dividendMode === val ? 8 : 0,
                    letterSpacing: "0.01em",
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {/* Inflation */}
            <div>
              <label style={labelStyle}>Dollar Terms</label>
              <div style={toggleGroupStyle}>
                {[["no","Nominal"],["yes","Real (CPI)"]].map(([val, label]) => (
                  <button key={val} className="toggle-btn" onClick={() => setInflation(val === "yes")} style={{
                    flex: 1, padding: "9px 0", border: "none", cursor: "pointer",
                    background: (inflation ? "yes" : "no") === val ? "#6366f1" : "transparent",
                    color: (inflation ? "yes" : "no") === val ? "white" : "#6b7280",
                    fontSize: 12, fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    borderRadius: (inflation ? "yes" : "no") === val ? 8 : 0,
                  }}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ marginBottom: 24 }}>

            {/* Two partitioned panels — side by side when comparing */}
            {dividendMode === "both" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                {/* With Dividends Panel */}
                <div style={{
                  background: "white",
                  border: "1.5px solid #c7d2fe",
                  borderRadius: 20,
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(99,102,241,0.06)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#6366f1" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      With Dividends Reinvested
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <MiniStat label="Final Value" value={formatCurrency(stats.finalTR)} color="#6366f1" big />
                    <MiniStat label="Total Return" value={formatPct(stats.pctTR)} color="#6366f1" />
                    <MiniStat label="CAGR / IRR" value={formatPct(stats.cagrTR) + "/yr"} color="#6366f1" />
                  </div>
                </div>

                {/* Price Only Panel */}
                <div style={{
                  background: "white",
                  border: "1.5px solid #fde68a",
                  borderRadius: 20,
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(245,158,11,0.06)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Price Only — No Dividends
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <MiniStat label="Final Value" value={formatCurrency(stats.finalPO)} color="#f59e0b" big />
                    <MiniStat label="Total Return" value={formatPct(stats.pctPO)} color="#f59e0b" />
                    <MiniStat label="CAGR / IRR" value={formatPct(stats.cagrPO) + "/yr"} color="#f59e0b" />
                  </div>
                </div>
              </div>
            ) : (
              /* Single panel when not comparing */
              <div style={{
                background: "white",
                border: `1.5px solid ${showTR ? "#c7d2fe" : "#fde68a"}`,
                borderRadius: 20,
                padding: "24px",
                marginBottom: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: showTR ? "#6366f1" : "#f59e0b" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: showTR ? "#6366f1" : "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {showTR ? "With Dividends Reinvested" : "Price Only — No Dividends"}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <MiniStat label="Final Value" value={formatCurrency(showTR ? stats.finalTR : stats.finalPO)} color={showTR ? "#6366f1" : "#f59e0b"} big />
                  <MiniStat label="Total Return" value={formatPct(showTR ? stats.pctTR : stats.pctPO)} color={showTR ? "#6366f1" : "#f59e0b"} />
                  <MiniStat label="CAGR / IRR" value={formatPct(showTR ? stats.cagrTR : stats.cagrPO) + "/yr"} color={showTR ? "#6366f1" : "#f59e0b"} />
                </div>
              </div>
            )}

            {/* Shared Investor Metrics Row */}
            <div style={{
              background: "white",
              border: "1.5px solid #f3f4f6",
              borderRadius: 20,
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
                Key Investment Metrics
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
                <MiniStat
                  label="You Invested"
                  value={formatCurrency(investment)}
                  color="#6b7280"
                />
                <MiniStat
                  label="IRR (Annualized)"
                  value={formatPct(stats.cagrTR) + "/yr"}
                  color="#6366f1"
                  tooltip="Internal Rate of Return — your annualized total return including dividends"
                />
                <MiniStat
                  label="Equity Multiple"
                  value={`${(stats.finalTR / investment).toFixed(2)}x`}
                  color="#8b5cf6"
                  tooltip="Total value returned divided by amount invested"
                />
                <MiniStat
                  label="Avg Cash on Cash"
                  value={formatPct((stats.divBoost / investment) / parseFloat(stats.years)) + "/yr"}
                  color="#10b981"
                  tooltip="Average annual dividend income as a % of your initial investment"
                />
                <MiniStat
                  label="Dividend Boost"
                  value={formatCurrency(stats.divBoost)}
                  sub={`+${((stats.divBoost/stats.finalPO)*100).toFixed(1)}% more`}
                  color="#10b981"
                />
                <MiniStat
                  label="Time Period"
                  value={`${stats.years} yrs`}
                  sub={inflation ? "Inflation-adjusted" : "Nominal dollars"}
                  color="#6b7280"
                />
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 1 && (
          <div style={{
            background: "white",
            borderRadius: 20,
            border: "1px solid #f3f4f6",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)",
            padding: "32px 16px 24px",
          }}>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={chartData} margin={{ top: 5, right: 24, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} tickLine={false} axisLine={false} tickFormatter={v => formatCurrency(v)} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "#6b7280", fontSize: 13, paddingTop: 16, fontFamily: "'DM Sans', sans-serif" }} />
                {showTR && <Line type="monotone" dataKey="With Dividends" stroke="#6366f1" strokeWidth={2.5} dot={false} />}
                {showPO && <Line type="monotone" dataKey="Price Only" stroke="#f59e0b" strokeWidth={2.5} dot={false} />}
                <Line type="monotone" dataKey="Initial Investment" stroke="#e5e7eb" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{
          marginTop: 20,
          padding: "14px 20px",
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 12,
          fontSize: 12,
          color: "#92400e",
          lineHeight: 1.6,
        }}>
          <strong>⚠ Note:</strong> Dividend reinvestment calculations use estimated historical yields, not actual payment records. Price-only data reflects real SPY closing prices. Not financial advice. HadIBought.com is for educational and illustrative purposes only.
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, textAlign: "center", color: "#d1d5db", fontSize: 12 }}>
          HadIBought.com · Data via Alpha Vantage · SPY ETF Historical Prices
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 8,
  letterSpacing: "0.01em",
};

const inputStyle = {
  width: "100%",
  background: "#f9fafb",
  border: "1.5px solid #e5e7eb",
  borderRadius: 10,
  color: "#111827",
  padding: "10px 14px",
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  outline: "none",
  transition: "border-color 0.2s",
};

const toggleGroupStyle = {
  display: "flex",
  background: "#f3f4f6",
  borderRadius: 10,
  padding: 3,
  gap: 2,
};

function MiniStat({ label, value, sub, color, big, tooltip }) {
  return (
    <div style={{ padding: "4px 0" }} title={tooltip || ""}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: big ? 22 : 18, color: color || "#111827", fontWeight: 700, letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}
