'use client'
import { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function WaterQualityDashboard() {
  const [waterData, setWaterData] = useState({
    ph: 7.0,
    tds: 150,
    turbidity: 0.8,
    temperature: 22,
    lead: 0.005,
    arsenic: 0.005,
    nitrates: 5,
    fluoride: 0.7,
    bacteria: 0
  });

  const whoGuidelines = {
    ph: { min: 6.5, max: 8.5, unit: "" },
    tds: { max: 500, unit: "ppm" },
    turbidity: { max: 5, unit: "NTU" },
    temperature: { min: 10, max: 30, unit: "°C" },
    lead: { max: 0.01, unit: "mg/L" },
    arsenic: { max: 0.01, unit: "mg/L" },
    nitrates: { max: 50, unit: "mg/L" },
    fluoride: { max: 1.5, unit: "mg/L" },
    bacteria: { max: 0, unit: "CFU/100mL" }
  };

  const healthImpacts = {
    lead: "Lead exposure can cause neurological damage, developmental delays in children, and cardiovascular issues in adults.",
    arsenic: "Long-term exposure to arsenic can lead to skin lesions, cancer, cardiovascular disease, and diabetes.",
    nitrates: "High nitrate levels are particularly dangerous for infants, causing 'blue baby syndrome' (methemoglobinemia) which reduces oxygen in the blood.",
    fluoride: "Excessive fluoride can cause dental fluorosis (tooth discoloration) and skeletal fluorosis (bone stiffness and pain).",
    tds: "High TDS can indicate presence of harmful minerals that may cause kidney stones, gastrointestinal issues, and other health problems.",
    bacteria: "Bacterial contamination can cause gastrointestinal illnesses, diarrhea, cramps, and in severe cases, kidney failure or death.",
    ph: "Extreme pH levels can indicate corrosive water which may leach heavy metals from pipes and cause gastrointestinal irritation."
  };

  const handleInputChange = (param, value) => {
    setWaterData(prev => ({
      ...prev,
      [param]: parseFloat(value)
    }));
  };

  const getContaminantStatus = (param, value) => {
    const guideline = whoGuidelines[param];
    if (param === 'ph') {
      if (value < guideline.min) return { status: 'unsafe', message: 'Acidic water can corrode pipes and leach metals' };
      if (value > guideline.max) return { status: 'unsafe', message: 'Alkaline water can cause scaling and bitter taste' };
      return { status: 'safe', message: 'pH level is within optimal range' };
    } else if (param === 'bacteria') {
      return value > guideline.max 
        ? { status: 'danger', message: 'Bacterial contamination detected! Boil water before use' }
        : { status: 'safe', message: 'No bacterial contamination detected' };
    } else {
      return value > guideline.max 
        ? { status: 'unsafe', message: `Exceeds WHO safety limit of ${guideline.max}${guideline.unit}` }
        : { status: 'safe', message: 'Within WHO safety guidelines' };
    }
  };

  const getOverallStatus = () => {
    const unsafeParams = Object.keys(waterData).filter(param => {
      const guideline = whoGuidelines[param];
      const value = waterData[param];
      
      if (param === 'ph') {
        return value < guideline.min || value > guideline.max;
      } else {
        return value > guideline.max;
      }
    });

    if (unsafeParams.length === 0) return 'excellent';
    if (unsafeParams.includes('bacteria') || unsafeParams.includes('lead') || unsafeParams.includes('arsenic')) return 'critical';
    if (unsafeParams.length >= 3) return 'poor';
    return 'fair';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent': return '#4caf50';
      case 'fair': return '#ff9800';
      case 'poor': return '#f44336';
      case 'critical': return '#d32f2f';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'safe': return '✅';
      case 'unsafe': return '⚠️';
      case 'danger': return '🚨';
      default: return '';
    }
  };

  const overallStatus = getOverallStatus();
  const statusColor = getStatusColor(overallStatus);

  const chartData = Object.keys(waterData).map(param => ({
    parameter: param,
    value: waterData[param],
    max: whoGuidelines[param].max || 10,
    min: whoGuidelines[param].min || 0
  }));

  const radarData = Object.keys(waterData)
    .filter(param => !['temperature', 'ph'].includes(param))
    .map(param => ({
      subject: param.charAt(0).toUpperCase() + param.slice(1),
      A: waterData[param],
      B: whoGuidelines[param].max || 10,
      fullMark: Math.max(waterData[param], whoGuidelines[param].max || 10) * 1.2
    }));

  const contaminantData = ['lead', 'arsenic', 'nitrates', 'fluoride', 'bacteria', 'tds'].map(param => {
    const status = getContaminantStatus(param, waterData[param]);
    return {
      name: param.charAt(0).toUpperCase() + param.slice(1),
      value: waterData[param],
      guideline: whoGuidelines[param].max,
      unit: whoGuidelines[param].unit,
      status: status.status,
      message: status.message,
      healthImpact: healthImpacts[param]
    };
  });

  const historicalData = [
    { month: 'Jan', tds: 180, nitrates: 8, fluoride: 0.6 },
    { month: 'Feb', tds: 210, nitrates: 12, fluoride: 0.7 },
    { month: 'Mar', tds: 190, nitrates: 10, fluoride: 0.8 },
    { month: 'Apr', tds: 220, nitrates: 15, fluoride: 0.9 },
    { month: 'May', tds: 240, nitrates: 18, fluoride: 1.0 },
    { month: 'Jun', tds: 260, nitrates: 22, fluoride: 1.1 },
    { month: 'Jul', tds: waterData.tds, nitrates: waterData.nitrates, fluoride: waterData.fluoride }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", padding: "20px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: "30px", padding: "20px", background: "white", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#2c3e50", margin: "0" }}>
            💧 Professional Water Quality Analysis
          </h1>
          <p style={{ color: "#7f8c8d", margin: "10px 0 0 0" }}>
            Comprehensive water quality assessment with WHO safety guidelines and health impact analysis
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "1.5rem", color: "#2c3e50", marginBottom: "20px", borderBottom: "2px solid #ecf0f1", paddingBottom: "10px" }}>Water Parameters</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              {Object.keys(waterData).map(param => (
                <div key={param} style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: "#34495e", marginBottom: "5px" }}>
                    {param.charAt(0).toUpperCase() + param.slice(1)} ({whoGuidelines[param].unit})
                    {param !== 'ph' && param !== 'temperature' && (
                      <span style={{ fontSize: "0.8rem", color: "#7f8c8d", marginLeft: "5px" }}>
                        WHO: {whoGuidelines[param].max}{whoGuidelines[param].unit}
                      </span>
                    )}
                    {param === 'ph' && (
                      <span style={{ fontSize: "0.8rem", color: "#7f8c8d", marginLeft: "5px" }}>
                        WHO: {whoGuidelines[param].min}-{whoGuidelines[param].max}
                      </span>
                    )}
                  </label>
                  <input 
                    type="range" 
                    min={param === 'ph' ? 0 : 0}
                    max={param === 'ph' ? 14 : param === 'bacteria' ? 100 : param === 'nitrates' ? 100 : param === 'fluoride' ? 5 : param === 'tds' ? 1000 : 10}
                    step={param === 'lead' || param === 'arsenic' ? 0.001 : 0.1}
                    value={waterData[param]}
                    onChange={(e) => handleInputChange(param, e.target.value)}
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#2c3e50", fontSize: "0.9rem" }}>
                    <span>{param === 'ph' ? 0 : 0}</span>
                    <span style={{ fontWeight: "bold" }}>{waterData[param]}{whoGuidelines[param].unit}</span>
                    <span>{param === 'ph' ? 14 : param === 'bacteria' ? 100 : param === 'nitrates' ? 100 : param === 'fluoride' ? 5 : param === 'tds' ? 1000 : 10}</span>
                  </div>
                  <div style={{ marginTop: "5px", fontSize: "0.8rem", color: getContaminantStatus(param, waterData[param]).status === 'safe' ? '#4caf50' : getContaminantStatus(param, waterData[param]).status === 'unsafe' ? '#ff9800' : '#f44336' }}>
                    {getStatusIcon(getContaminantStatus(param, waterData[param]).status)} {getContaminantStatus(param, waterData[param]).message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "1.5rem", color: "#2c3e50", marginBottom: "20px", borderBottom: "2px solid #ecf0f1", paddingBottom: "10px" }}>Water Quality Status</h2>
            
            <div style={{ textAlign: "center", padding: "20px", background: statusColor, color: "white", borderRadius: "8px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.8rem", margin: "0 0 10px 0" }}>
                {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
              </h3>
              <p style={{ margin: "0", fontSize: "1rem" }}>
                {overallStatus === 'excellent' ? 'All parameters within WHO guidelines' : 
                 overallStatus === 'fair' ? 'Minor issues detected' : 
                 overallStatus === 'poor' ? 'Multiple parameters exceed safety limits' : 
                 'Critical contamination detected - Water may be unsafe for consumption'}
              </p>
            </div>

            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
                  <Radar name="Current" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Radar name="WHO Limit" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.5rem", color: "#2c3e50", marginBottom: "20px", borderBottom: "2px solid #ecf0f1", paddingBottom: "10px" }}>Health Impact Analysis</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {contaminantData.map(contaminant => (
              <div key={contaminant.name} style={{ 
                padding: "15px", 
                borderRadius: "8px", 
                background: contaminant.status === 'safe' ? '#e8f5e9' : contaminant.status === 'unsafe' ? '#fff3e0' : '#ffebee',
                border: `2px solid ${contaminant.status === 'safe' ? '#4caf50' : contaminant.status === 'unsafe' ? '#ff9800' : '#f44336'}`
              }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#2c3e50", display: "flex", alignItems: "center" }}>
                  <span style={{ marginRight: "10px" }}>
                    {contaminant.status === 'safe' ? '✅' : contaminant.status === 'unsafe' ? '⚠️' : '🚨'}
                  </span>
                  {contaminant.name}
                </h3>
                <p style={{ margin: "0 0 10px 0", color: "#34495e" }}>
                  Level: <strong>{contaminant.value}{contaminant.unit}</strong> / WHO Limit: <strong>{contaminant.guideline}{contaminant.unit}</strong>
                </p>
                <p style={{ margin: "0", fontSize: "0.9rem", color: "#7f8c8d" }}>
                  {contaminant.message}
                </p>
                <div style={{ marginTop: "10px", padding: "10px", background: "rgba(0,0,0,0.03)", borderRadius: "5px" }}>
                  <h4 style={{ margin: "0 0 5px 0", color: "#2c3e50", fontSize: "0.9rem" }}>Health Impact:</h4>
                  <p style={{ margin: "0", fontSize: "0.8rem", color: "#7f8c8d", fontStyle: "italic" }}>
                    {contaminant.healthImpact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "1.5rem", color: "#2c3e50", marginBottom: "20px", borderBottom: "2px solid #ecf0f1", paddingBottom: "10px" }}>Parameter Comparison</h2>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="parameter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Current Value" />
                  <Bar dataKey="max" fill="#82ca9d" name="WHO Max Limit" />
                  <Bar dataKey="min" fill="#ffc658" name="WHO Min Limit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "1.5rem", color: "#2c3e50", marginBottom: "20px", borderBottom: "2px solid #ecf0f1", paddingBottom: "10px" }}>Safety Status</h2>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Safe Parameters', value: Object.keys(waterData).filter(param => getContaminantStatus(param, waterData[param]).status === 'safe').length },
                      { name: 'Unsafe Parameters', value: Object.keys(waterData).filter(param => getContaminantStatus(param, waterData[param]).status === 'unsafe').length },
                      { name: 'Critical Parameters', value: Object.keys(waterData).filter(param => getContaminantStatus(param, waterData[param]).status === 'danger').length }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#4caf50" />
                    <Cell fill="#ff9800" />
                    <Cell fill="#f44336" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "1.5rem", color: "#2c3e50", marginBottom: "20px", borderBottom: "2px solid #ecf0f1", paddingBottom: "10px" }}>Historical Trends</h2>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="tds" stackId="1" stroke="#8884d8" fill="#8884d8" name="TDS (ppm)" />
                <Area type="monotone" dataKey="nitrates" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Nitrates (mg/L)" />
                <Area type="monotone" dataKey="fluoride" stackId="1" stroke="#ffc658" fill="#ffc658" name="Fluoride (mg/L)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}