import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PSDashboard = () => {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => { loadRepairs(); }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("ps_token");
    return { Authorization: `Bearer ${token}` };
  };

  const loadRepairs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/phonesoftware/repairs`, { headers: getAuthHeaders() });
      setRepairs(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const today = new Date().toDateString();
  const todayR = repairs.filter(r => new Date(r.created_at).toDateString() === today);

  const statCards = [
    { label: "New", sub: "të gjitha", value: repairs.filter(r => r.status === "received").length, color: "bg-red-500" },
    { label: "në proces", sub: "të gjitha", value: repairs.filter(r => r.status === "in_progress").length, color: "bg-orange-400" },
    { label: "gatë", sub: "sot", value: todayR.filter(r => r.status === "completed").length, color: "bg-blue-500" },
    { label: "përfundukat", sub: "sot", value: todayR.filter(r => r.status === "delivered").length, color: "bg-green-500" },
    { label: "nuk miqulshat", sub: "sot", value: todayR.filter(r => r.status === "cancelled").length, color: "bg-gray-400" },
  ];

  const statusLabels = { received:"Pranuar", diagnosing:"Diagnostikim", waiting_parts:"Në pritje", in_progress:"Në proces", completed:"Përfunduar", delivered:"Dorëzuar", cancelled:"Anuluar" };
  const statusColors = { received:"bg-blue-100 text-blue-700", in_progress:"bg-yellow-100 text-yellow-700", waiting_parts:"bg-orange-100 text-orange-700", completed:"bg-green-100 text-green-700", delivered:"bg-gray-100 text-gray-700", cancelled:"bg-red-100 text-red-700" };

  const filtered = repairs.filter(r => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || r.customer_name?.toLowerCase().includes(s) || r.customer_phone?.includes(s) || r.model?.toLowerCase().includes(s) || r.imei?.includes(s);
    const matchToday = !showTodayOnly || new Date(r.created_at).toDateString() === today;
    const matchStatus = !statusFilter || r.status === statusFilter;
    const matchDate = !dateFilter || r.created_at?.startsWith(dateFilter);
    return matchSearch && matchToday && matchStatus && matchDate;
  }).slice(0, perPage);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner"/></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Ballina</h1>
        <button onClick={() => navigate("/phonesoftware/repairs?action=new")} className="bg-[#00a79d] hover:bg-[#008f86] text-white px-4 py-2 rounded-lg text-sm font-medium">
          Shto punë
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statCards.map((c, i) => (
          <div key={i} className={`${c.color} rounded-xl px-4 py-3 text-white flex-1 min-w-[110px] text-center`}>
            <p className="text-xs font-medium opacity-90">{c.label} / {c.sub}</p>
            <p className="text-3xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setShowTodayOnly(!showTodayOnly)} className={`px-3 py-1.5 text-sm rounded-lg border ${showTodayOnly ? "bg-[#00a79d] text-white border-[#00a79d]" : "bg-white text-gray-600 border-gray-200"}`}>
          Shfaq se sotit
        </button>
        <button onClick={() => { setShowTodayOnly(false); setSearchTerm(""); setStatusFilter(""); setDateFilter(""); }} className="px-3 py-1.5 text-sm rounded-lg border bg-white text-gray-600 border-gray-200">
          Largo filtrat
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
          <select value={perPage} onChange={e => setPerPage(Number(e.target.value))} className="border rounded-lg px-2 py-1.5 text-sm bg-white">
            {[10,25,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <div className="relative flex-1">
            <input type="text" placeholder="Kërko me emër, numer, telefon ose imei" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-sm pl-8" />
            <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
          </div>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm bg-white" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500 text-xs bg-gray-50">
                <th className="px-4 py-2.5 text-left font-medium">Klienti</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-left font-medium">Telefoni</th>
                <th className="px-4 py-2.5 text-left font-medium">IMEI</th>
                <th className="px-4 py-2.5 text-left font-medium">Përshkrimi</th>
                <th className="px-4 py-2.5 text-left font-medium">Puntori</th>
                <th className="px-4 py-2.5 text-left font-medium">Data pranimit</th>
                <th className="px-4 py-2.5 text-left font-medium">Action</th>
              </tr>
              <tr className="border-b">
                <td className="px-3 py-1.5"><input className="border rounded px-2 py-1 text-xs w-full" placeholder="Search" onChange={e => setSearchTerm(e.target.value)} /></td>
                <td className="px-3 py-1.5">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-2 py-1 text-xs w-full">
                    <option value="">Zgjedh Statusin</option>
                    <option value="received">Pranuar</option>
                    <option value="in_progress">Në proces</option>
                    <option value="completed">Përfunduar</option>
                    <option value="delivered">Dorëzuar</option>
                    <option value="cancelled">Anuluar</option>
                  </select>
                </td>
                <td className="px-3 py-1.5"><input className="border rounded px-2 py-1 text-xs w-full" placeholder="Search" /></td>
                <td /><td /><td />
                <td className="px-3 py-1.5"><input type="date" className="border rounded px-2 py-1 text-xs w-full" /></td>
                <td />
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(repair => (
                <tr key={repair.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{repair.customer_name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[repair.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabels[repair.status] || repair.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{repair.customer_phone || "-"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{repair.imei || "-"}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate text-xs">{repair.problem_description || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{repair.technician_name || "-"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(repair.created_at).toLocaleDateString("sq-AL")}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/phonesoftware/repairs?id=${repair.id}`)} className="text-[#00a79d] hover:underline text-xs font-medium">
                      Shiko
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Ska asnjë rezultat!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PSDashboard;
