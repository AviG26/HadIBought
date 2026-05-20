import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ⚠️ After deploying to Railway, replace this with your Railway URL
// e.g. "https://sp500-tracker-backend.up.railway.app"
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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

function formatDate(dateStr) {
  const [y, m] = dateStr.split("-");
  return `${MONTHS[parseInt(m)-1]} ${y}`;
}

function thinArray(arr, maxPoints = 400) {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0 || i === arr.length - 1);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0a0e0c", border: "1px solid #1f3a28",
      borderRadius: 3, padding: "12px 16px", fontSize: 13, fontFamily: "'Georgia', serif",
    }}>
      <div style={{ color: "#5a8a6a", marginBottom: 8, fontSize: 12, letterSpacing: "0.1em" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: <strong>{formatCurrency(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

function StatCard({ label, value, sub, accent = "#5ab575", highlight = false }) {
  return (
    <div style={{
      background: highlight ? "#0e1f15" : "#0b1610",
      border: `1px solid ${highlight ? "#2a5c3a" : "#182e20"}`,
      borderRadius: 3, padding: "18px 20px",
    }}>
      <div style={{ fontSize: 10, letterSpacing: "0.2em", color: accent, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, color: highlight ? "#80e69a" : "#c5dccb", fontWeight: 400, letterSpacing: "-0.02em", fontFamily: "'Georgia', serif" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "#3a6045", marginTop: 4, fontStyle: "italic" }}>{sub}</div>}
    </div>
  );
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", borderRadius: 3, overflow: "hidden", border: "1px solid #182e20" }}>
      {options.map(([val, label], i) => (
        <button key={val} onClick={() => onChange(val)} style={{
          flex: 1, padding: "9px 0", border: "none", cursor: "pointer",
          background: value === val ? "#1a4028" : "#0b1610",
          color: value === val ? "#80e69a" : "#3a6045",
          fontSize: 12, fontFamily: "'Georgia', serif",
          borderRight: i < options.length - 1 ? "1px solid #182e20" : "none",
          transition: "all 0.15s", letterSpacing: "0.05em",
        }}>{label}</button>
      ))}
    </div>
  );
}

export default function SP500Tracker() {
  const [investment, setInvestment] = useState(10000);
  const [inputVal, setInputVal] = useState("10,000");
  const [startDate, setStartDate] = useState("2010-01");
  const [endDate, setEndDate] = useState("");
  const [granularity, setGranularity] = useState("monthly");
  const [dividendMode, setDividendMode] = useState("both");
  const [inflation, setInflation] = useState(false);

  const [rawMonthly, setRawMonthly] = useState(null);
  const [rawDaily, setRawDaily] = useState(null);
  const [cpiData, setCpiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState(null);
  const [availableDates, setAvailableDates] = useState({ min: "1993-02", max: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setLoadingMsg("Fetching S&P 500 monthly data...");
      const adjRes = await fetch(`${API_BASE}/api/monthly`);
      const adjJson = await adjRes.json();
      if (adjJson.error) throw new Error(adjJson.error);
      if (!adjJson["Monthly Adjusted Time Series"]) throw new Error("No data returned from server.");

      const monthlyAdj = adjJson["Monthly Adjusted Time Series"];
      const monthly = {};
      let minDate = "9999-99", maxDate = "0000-00";
      for (const [date, vals] of Object.entries(monthlyAdj)) {
        const ym = date.slice(0, 7);
        monthly[ym] = {
          adjClose: parseFloat(vals["5. adjusted close"]),
          close: parseFloat(vals["4. close"]),
          dividend: parseFloat(vals["7. dividend amount"]),
        };
        if (ym < minDate) minDate = ym;
        if (ym > maxDate) maxDate = ym;
      }
      setRawMonthly(monthly);
      setAvailableDates({ min: minDate, max: maxDate });
      if (!endDate) setEndDate(maxDate);

      setLoadingMsg("Fetching CPI inflation data...");
      const cpiRes = await fetch(`${API_BASE}/api/cpi`);
      const cpiJson = await cpiRes.json();
      if (cpiJson?.data) {
        const cpi = {};
        for (const { date, value } of cpiJson.data) cpi[date.slice(0, 7)] = parseFloat(value);
        setCpiData(cpi);
      }

      setDataLoaded(true);
    } catch (e) {
      setError(e.message || "Failed to fetch data. Is the backend server running?");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }, [endDate]);

  const fetchDaily = useCallback(async () => {
    if (rawDaily) return;
    setLoading(true);
    setLoadingMsg("Fetching daily price data (large dataset, please wait)...");
    try {
      const res = await fetch(`${API_BASE}/api/daily`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const series = json["Time Series (Daily)"];
      if (!series) throw new Error("No daily data returned.");
      const daily = {};
      for (const [date, vals] of Object.entries(series)) {
        daily[date] = {
          adjClose: parseFloat(vals["5. adjusted close"]),
          close: parseFloat(vals["4. close"]),
        };
      }
      setRawDaily(daily);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }, [rawDaily]);

  useEffect(() => {
    if (granularity === "daily" && dataLoaded && !rawDaily) fetchDaily();
  }, [granularity, dataLoaded, rawDaily, fetchDaily]);

  function getCpiAdj(fromDate, toDate) {
    if (!cpiData || !inflation) return 1;
    const fromCpi = cpiData[fromDate];
    const toCpi = cpiData[toDate];
    if (!fromCpi || !toCpi) return 1;
    return fromCpi / toCpi;
  }

  useEffect(() => {
    if (!rawMonthly || !startDate || !endDate) return;
    if (granularity === "daily" && !rawDaily) return;

    const result = granularity === "monthly" ? buildMonthly() : buildDaily();
    setChartData(thinArray(result.points, 500));
    setStats(result.stats);
  }, [rawMonthly, rawDaily, startDate, endDate, granularity, dividendMode, inflation, investment, cpiData]);

  function buildMonthly() {
    const dates = Object.keys(rawMonthly).sort().filter(d => d >= startDate && d <= endDate);
    if (dates.length < 2) return { points: [], stats: null };
    const firstAdj = rawMonthly[dates[0]].adjClose;
    const firstClose = rawMonthly[dates[0]].close;
    const points = dates.map(date => {
      const { adjClose, close } = rawMonthly[date];
      const cpiAdj = getCpiAdj(dates[0], date);
      return {
        label: formatDate(date),
        "Total Return (Div. Reinvested)": +(investment * (adjClose / firstAdj) * cpiAdj).toFixed(2),
        "Price Only (No Dividends)": +(investment * (close / firstClose) * cpiAdj).toFixed(2),
        "Initial Investment": +(investment * cpiAdj).toFixed(2),
      };
    });
    return calcStats(points, dates.length / 12);
  }

  function buildDaily() {
    const dates = Object.keys(rawDaily).sort().filter(d => d.slice(0,7) >= startDate && d.slice(0,7) <= endDate);
    if (dates.length < 2) return { points: [], stats: null };
    const firstAdj = rawDaily[dates[0]].adjClose;
    const firstClose = rawDaily[dates[0]].close;
    const points = dates.map(date => {
      const { adjClose, close } = rawDaily[date];
      const cpiAdj = getCpiAdj(dates[0].slice(0,7), date.slice(0,7));
      return {
        label: date,
        "Total Return (Div. Reinvested)": +(investment * (adjClose / firstAdj) * cpiAdj).toFixed(2),
        "Price Only (No Dividends)": +(investment * (close / firstClose) * cpiAdj).toFixed(2),
        "Initial Investment": +(investment * cpiAdj).toFixed(2),
      };
    });
    return calcStats(points, dates.length / 252);
  }

  function calcStats(points, years) {
    const last = points[points.length - 1];
    const finalTR = last["Total Return (Div. Reinvested)"];
    const finalPO = last["Price Only (No Dividends)"];
    return {
      points,
      stats: {
        finalTR, finalPO,
        pctTR: ((finalTR - investment) / investment) * 100,
        pctPO: ((finalPO - investment) / investment) * 100,
        cagrTR: (Math.pow(finalTR / investment, 1 / years) - 1) * 100,
        cagrPO: (Math.pow(finalPO / investment, 1 / years) - 1) * 100,
        divBoost: finalTR - finalPO,
        years: years.toFixed(1),
        inflationAdjusted: inflation,
      }
    };
  }

  const showTR = dividendMode === "reinvested" || dividendMode === "both";
  const showPO = dividendMode === "excluded" || dividendMode === "both";

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "#070d09", border: "1px solid #182e20", borderRadius: 3,
    color: "#c5dccb", padding: "10px 12px", fontSize: 14,
    fontFamily: "'Georgia', serif", outline: "none",
  };
  const labelStyle = {
    display: "block", fontSize: 10, letterSpacing: "0.2em",
    color: "#3a7050", textTransform: "uppercase", marginBottom: 8,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#070d09", color: "#c5dccb", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      {/* Header */}
      <div style={{ padding: "36px 40px 28px", borderBottom: "1px solid #182e20", background: "linear-gradient(160deg, #0c1a10 0%, #070d09 100%)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#3a7050", textTransform: "uppercase", marginBottom: 10 }}>
            S&P 500 · Historical Performance Calculator
          </div>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 400, margin: "0 0 8px", letterSpacing: "-0.03em", color: "#a8d8b4", lineHeight: 1.05 }}>
            Investment<br /><span style={{ color: "#5ed47a", fontStyle: "italic" }}>Time Machine</span>
          </h1>
          <p style={{ color: "#3a6045", fontSize: 13, margin: 0, fontStyle: "italic" }}>
            Real S&P 500 data · Actual dividend history · CPI inflation adjustment
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "32px 24px" }}>

        {!dataLoaded && !loading && (
          <div style={{ background: "#0c1a10", border: "1px solid #1f3a28", borderRadius: 3, padding: "40px", textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📈</div>
            <div style={{ color: "#a8d8b4", fontSize: 18, marginBottom: 8, fontStyle: "italic" }}>Ready to fetch real market data</div>
            <div style={{ color: "#3a6045", fontSize: 13, marginBottom: 24 }}>
              Pulls actual SPY ETF price history + dividend data going back to 1993
            </div>
            <button onClick={fetchData} style={{
              background: "#1a4028", border: "1px solid #2a6040", borderRadius: 3,
              color: "#5ed47a", padding: "14px 36px", fontSize: 15,
              fontFamily: "'Georgia', serif", cursor: "pointer", letterSpacing: "0.05em",
            }}>Load Historical Data →</button>
          </div>
        )}

        {loading && (
          <div style={{ background: "#0c1a10", border: "1px solid #1f3a28", borderRadius: 3, padding: "40px", textAlign: "center", marginBottom: 28 }}>
            <div style={{ color: "#5ed47a", fontSize: 15, marginBottom: 8 }}>⟳ Loading...</div>
            <div style={{ color: "#3a6045", fontSize: 13, fontStyle: "italic" }}>{loadingMsg}</div>
          </div>
        )}

        {error && (
          <div style={{ background: "#1a0a0a", border: "1px solid #4a1a1a", borderRadius: 3, padding: "16px 20px", marginBottom: 24, color: "#d4726a", fontSize: 13 }}>
            ⚠ {error}
            <button onClick={() => { setError(""); fetchData(); }} style={{
              marginLeft: 16, background: "none", border: "1px solid #4a2a2a",
              color: "#d4726a", padding: "4px 12px", borderRadius: 3, cursor: "pointer", fontFamily: "inherit", fontSize: 12,
            }}>Retry</button>
          </div>
        )}

        {dataLoaded && (
          <>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 14, background: "#0b1610", border: "1px solid #182e20",
              borderRadius: 3, padding: "24px", marginBottom: 24,
            }}>
              <div>
                <label style={labelStyle}>Initial Investment</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#5ed47a" }}>$</span>
                  <input type="text" value={inputVal} onChange={e => {
                    setInputVal(e.target.value);
                    const n = parseFloat(e.target.value.replace(/,/g, ""));
                    if (!isNaN(n) && n > 0) setInvestment(n);
                  }} style={{ ...inputStyle, paddingLeft: 26 }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input type="month" value={startDate} min={availableDates.min} max={endDate || availableDates.max}
                  onChange={e => setStartDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>End Date</label>
                <input type="month" value={endDate} min={startDate} max={availableDates.max}
                  onChange={e => setEndDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Granularity</label>
                <ToggleGroup options={[["monthly","Monthly"],["daily","Daily"]]} value={granularity} onChange={setGranularity} />
              </div>
              <div>
                <label style={labelStyle}>Dividends</label>
                <ToggleGroup options={[["reinvested","Reinvested"],["excluded","Excluded"],["both","Compare"]]} value={dividendMode} onChange={setDividendMode} />
              </div>
              <div>
                <label style={labelStyle}>Adjust for Inflation</label>
                <ToggleGroup options={[["no","Nominal"],["yes","Real (CPI)"]]} value={inflation ? "yes" : "no"} onChange={v => setInflation(v === "yes")} />
              </div>
            </div>

            {stats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 22 }}>
                <StatCard label="Invested" value={formatCurrency(investment)} accent="#3a7050" />
                {showTR && <>
                  <StatCard label={dividendMode === "both" ? "w/ Dividends" : "Final Value"} value={formatCurrency(stats.finalTR)} accent="#5ed47a" highlight />
                  <StatCard label="Total Return" value={formatPct(stats.pctTR)} accent="#5ed47a" />
                  <StatCard label="CAGR" value={formatPct(stats.cagrTR) + "/yr"} accent="#5ed47a" />
                </>}
                {showPO && !showTR && <>
                  <StatCard label="Final Value" value={formatCurrency(stats.finalPO)} accent="#d4a84b" highlight />
                  <StatCard label="Total Return" value={formatPct(stats.pctPO)} accent="#d4a84b" />
                  <StatCard label="CAGR" value={formatPct(stats.cagrPO) + "/yr"} accent="#d4a84b" />
                </>}
                {dividendMode === "both" && <>
                  <StatCard label="w/o Dividends" value={formatCurrency(stats.finalPO)} accent="#d4a84b" />
                  <StatCard label="Dividend Boost" value={formatCurrency(stats.divBoost)} sub={`+${((stats.divBoost / stats.finalPO)*100).toFixed(1)}% more`} accent="#a8d8b4" highlight />
                </>}
                <StatCard label="Period" value={`${stats.years} yrs`} sub={stats.inflationAdjusted ? "Inflation-adjusted" : "Nominal dollars"} accent="#3a6045" />
              </div>
            )}

            {chartData.length > 1 ? (
              <div style={{ background: "#0b1610", border: "1px solid #182e20", borderRadius: 3, padding: "24px 8px 16px" }}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData} margin={{ top: 5, right: 24, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#121f16" />
                    <XAxis dataKey="label" tick={{ fill: "#3a5a45", fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: "#3a5a45", fontSize: 11 }} tickLine={false} tickFormatter={v => formatCurrency(v)} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: "#5a8a6a", fontSize: 12, paddingTop: 14 }} />
                    {showTR && <Line type="monotone" dataKey="Total Return (Div. Reinvested)" stroke="#5ed47a" strokeWidth={2} dot={false} />}
                    {showPO && <Line type="monotone" dataKey="Price Only (No Dividends)" stroke="#d4a84b" strokeWidth={2} dot={false} />}
                    <Line type="monotone" dataKey="Initial Investment" stroke="#1f3a28" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#2a4a34", fontSize: 15, fontStyle: "italic" }}>
                {granularity === "daily" && !rawDaily ? "Loading daily data..." : "Adjust dates to see your investment's journey"}
              </div>
            )}

            <p style={{ color: "#1f3a28", fontSize: 11, marginTop: 14, fontStyle: "italic" }}>
              Data: SPY ETF via Alpha Vantage · Adjusted close prices include all dividends & splits · For illustrative purposes only — not financial advice
            </p>
          </>
        )}
      </div>
    </div>
  );
}
