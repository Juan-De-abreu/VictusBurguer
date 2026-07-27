import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../config/api";

const Facturas = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState({
    invoice: null,
    items: [],
    loading: false,
    error: "",
    extra: null,
  });
  const [bcvRate, setBcvRate] = useState(0);
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [filters, setFilters] = useState({
    orderType: "all",
    recordTypes: [],
    currencies: [],
    paymentStatuses: [],
    searchField: "",
    searchValue: "",
    dateFrom: "",
    dateTo: "",
  });

  const formatBs = (value) =>
    `Bs. ${Number(value || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatMoney = (value, currency = "USD") => {
    const num = Number(value || 0);
    return currency === "USD"
      ? `$${num.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `Bs. ${num.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const pick = (...values) => {
    const v = values.find(
      (x) => x !== undefined && x !== null && String(x).trim() !== ""
    );
    return v ?? "N/D";
  };

  const getRateForRecord = (item) => {
    const rate = Number(item?.exchange_rate || item?.bcv_rate || item?.rate || 0);
    return rate > 0 ? rate : bcvRate || 1;
  };

  const toBolivares = (value, currency, rate) => {
    const amount = Number(value || 0);
    return currency === "USD" ? amount * Number(rate || 1) : amount;
  };

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filters.orderType !== "all") params.append("order_type", filters.orderType);
    if (filters.recordTypes.length) params.append("record_types", filters.recordTypes.join(","));
    if (filters.currencies.length) params.append("currency", filters.currencies.join(","));
    if (filters.paymentStatuses.length) params.append("payment_status", filters.paymentStatuses.join(","));
    if (filters.dateFrom) params.append("date_from", filters.dateFrom);
    if (filters.dateTo) params.append("date_to", filters.dateTo);
    if (filters.searchField && filters.searchValue) params.append(filters.searchField, filters.searchValue);
    return params;
  };

  const fetchRate = async () => {
    try {
      const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial");
      const data = await res.json();
      const rate = Number(data?.promedio || data?.venta || 0);
      if (rate > 0) setBcvRate(rate);
    } catch (e) {
      console.error("Error obteniendo tasa BCV:", e);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");
      const params = buildQueryParams();
      const res = await fetch(`${API_BASE_URL}/dashboard_records?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Error cargando registros");
      setRecords(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(e.message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeShopOrder = (item) => {
    if (!item) return null;
    return {
      ...item,
      user_nombre: pick(item.user_nombre, item.nombre, item.name, item.full_name, item.users?.nombre, item.users?.name, item.user?.nombre, item.user?.name),
      user_email: pick(item.user_email, item.email, item.users?.email, item.user?.email),
      user_telefono: pick(item.user_telefono, item.telefono, item.users?.telefono, item.user?.telefono),
      user_rol: pick(item.user_rol, item.rol, item.users?.rol, item.user?.rol),
      order_number: pick(item.order_number, item.shop_order_id),
      payment_status: pick(item.payment_status, item.status, "pendiente"),
      currency: pick(item.currency, "USD"),
      total: Number(item.total || item.subtotal || 0),
    };
  };

  const fetchDetails = async (record) => {
    try {
      setSelectedDetails({ invoice: null, items: [], loading: true, error: "", extra: null });

      if (record.source_entity === "orders_clientes") {
        const [orderRes, itemsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/orders_clientes?order_id=${record.source_id}`),
          fetch(`${API_BASE_URL}/order_items_clientes?order_id=${record.source_id}`),
        ]);

        const orderData = await orderRes.json();
        const itemsData = await itemsRes.json();

        const invoiceId = orderData?.invoice_id || record.invoice_id;
        let invoiceData = null;

        if (invoiceId) {
          const invoiceRes = await fetch(`${API_BASE_URL}/invoices?invoice_id=${invoiceId}`);
          invoiceData = await invoiceRes.json();
        }

        setSelectedDetails({
          invoice: invoiceData || null,
          items: Array.isArray(itemsData) ? itemsData : [],
          loading: false,
          error: "",
          extra: orderData || null,
        });
        return;
      }

      if (record.source_entity === "payments_personal") {
        const payRes = await fetch(`${API_BASE_URL}/payments_personal?payment_id=${record.source_id}`);
        const payData = await payRes.json();
        setSelectedDetails({ invoice: null, items: [], loading: false, error: "", extra: payData || null });
        return;
      }

      if (record.source_entity === "orders_shop") {
        const [shopRes, itemsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/orders_shop?shop_order_id=${record.source_id}`),
          fetch(`${API_BASE_URL}/shop_order_items?shop_order_id=${record.source_id}`),
        ]);

        const shopRaw = await shopRes.json();
        const itemsData = await itemsRes.json();
        const shopData = normalizeShopOrder(Array.isArray(shopRaw) ? shopRaw[0] : shopRaw);

        setSelectedDetails({
          invoice: shopData?.invoice || null,
          items: Array.isArray(itemsData) ? itemsData : [],
          loading: false,
          error: "",
          extra: shopData || null,
        });
        return;
      }

      if (record.source_entity === "fixed_costs") {
        const costRes = await fetch(`${API_BASE_URL}/fixed_costs?cost_id=${record.source_id}`);
        const costData = await costRes.json();
        setSelectedDetails({ invoice: null, items: [], loading: false, error: "", extra: costData || null });
        return;
      }

      setSelectedDetails({ invoice: null, items: [], loading: false, error: "Sin detalle", extra: null });
    } catch (e) {
      setSelectedDetails({ invoice: null, items: [], loading: false, error: e.message, extra: null });
    }
  };

  const updateOriginStatus = async (record, newStatus) => {
    try {
      setSavingStatusId(record.source_id);

      const endpoint =
        record.source_entity === "orders_clientes"
          ? "orders_clientes"
          : record.source_entity === "payments_personal"
          ? "payments_personal"
          : record.source_entity === "orders_shop"
          ? "orders_shop"
          : record.source_entity === "fixed_costs"
          ? "fixed_costs"
          : null;

      if (!endpoint) return;

      const key =
        endpoint === "orders_clientes"
          ? "order_id"
          : endpoint === "payments_personal"
          ? "payment_id"
          : endpoint === "orders_shop"
          ? "shop_order_id"
          : "cost_id";

      const body = new URLSearchParams();
      body.append(key, record.source_id);
      body.append("payment_status", newStatus);

      const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "No se pudo actualizar");

      setRecords((prev) =>
        prev.map((r) =>
          r.source_entity === record.source_entity && r.source_id === record.source_id
            ? {
                ...r,
                payment_status: newStatus,
                status: newStatus,
                invoice_status: newStatus,
                paid_date: data?.paid_date || r.paid_date,
                due_date: data?.next_due_date || r.due_date,
              }
            : r
        )
      );

      setSelectedRecord((prev) =>
        prev && prev.source_entity === record.source_entity && prev.source_id === record.source_id
          ? {
              ...prev,
              payment_status: newStatus,
              status: newStatus,
              invoice_status: newStatus,
              paid_date: data?.paid_date || prev.paid_date,
              due_date: data?.next_due_date || prev.due_date,
            }
          : prev
      );

      if (record.source_entity === "fixed_costs") {
        await fetchDetails(record);
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingStatusId(null);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [
    filters.orderType,
    filters.recordTypes,
    filters.currencies,
    filters.paymentStatuses,
    filters.searchField,
    filters.searchValue,
    filters.dateFrom,
    filters.dateTo,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, rowsPerPage]);

  const totals = useMemo(() => {
    const validInvoices = records.filter((r) => (r.status || r.invoice_status || "").toLowerCase() === "pagada");
    const income = validInvoices
      .filter((r) => r.source_type === "income")
      .reduce((sum, r) => sum + toBolivares(r.total || r.amount || 0, r.currency || "USD", getRateForRecord(r)), 0);

    const expense = validInvoices
      .filter((r) => r.source_type === "expense")
      .reduce((sum, r) => sum + toBolivares(r.total || r.amount || 0, r.currency || "USD", getRateForRecord(r)), 0);

    return { income, expense, net: income - expense };
  }, [records, bcvRate]);

  const visibleFilterOptions = useMemo(() => {
    const active = [];
    if (filters.orderType !== "all") active.push({ key: "orderType", value: filters.orderType, label: filters.orderType });
    filters.recordTypes.forEach((t) => {
      const label =
        t === "orders" ? "Órdenes" : t === "inventory" ? "Inventario" : t === "fixed_costs" ? "Costos fijos" : "Empleados";
      active.push({ key: "recordTypes", value: t, label });
    });
    filters.currencies.forEach((c) => active.push({ key: "currencies", value: c, label: c }));
    filters.paymentStatuses.forEach((p) => active.push({ key: "paymentStatuses", value: p, label: p }));
    if (filters.searchField && filters.searchValue) active.push({ key: "search", value: `${filters.searchField}:${filters.searchValue}`, label: `${filters.searchField}: ${filters.searchValue}` });
    if (filters.dateFrom || filters.dateTo) active.push({ key: "date", value: `${filters.dateFrom || "..."} - ${filters.dateTo || "..."}`, label: `${filters.dateFrom || "..."} - ${filters.dateTo || "..."}` });
    return active;
  }, [filters]);

  const toggleCurrency = (currency) => {
    setFilters((prev) => ({
      ...prev,
      currencies: prev.currencies.includes(currency) ? prev.currencies.filter((x) => x !== currency) : [...prev.currencies, currency],
    }));
  };

  const togglePaymentStatus = (status) => {
    setFilters((prev) => ({
      ...prev,
      paymentStatuses: prev.paymentStatuses.includes(status) ? prev.paymentStatuses.filter((x) => x !== status) : [...prev.paymentStatuses, status],
    }));
  };

  const clearOne = (key, value) => {
    setFilters((prev) => {
      if (key === "orderType") return { ...prev, orderType: "all" };
      if (key === "recordTypes") return { ...prev, recordTypes: prev.recordTypes.filter((x) => x !== value) };
      if (key === "currencies") return { ...prev, currencies: prev.currencies.filter((x) => x !== value) };
      if (key === "paymentStatuses") return { ...prev, paymentStatuses: prev.paymentStatuses.filter((x) => x !== value) };
      if (key === "search") return { ...prev, searchField: "", searchValue: "" };
      if (key === "date") return { ...prev, dateFrom: "", dateTo: "" };
      return prev;
    });
  };

  const clearAll = () => {
    setFilters({
      orderType: "all",
      recordTypes: [],
      currencies: [],
      paymentStatuses: [],
      searchField: "",
      searchValue: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const entity = item.source_entity || "";

      const matchesOrderType =
        filters.orderType === "all" ||
        (filters.orderType === "income" && item.source_type === "income") ||
        (filters.orderType === "expense" && item.source_type === "expense");

      const matchesRecordType =
        filters.recordTypes.length === 0 ||
        filters.recordTypes.some((type) => {
          if (type === "empleados") return entity === "payments_personal";
          if (type === "fixed_costs") return entity === "fixed_costs";
          if (type === "orders") return entity === "orders_clientes";
          if (type === "inventory") return entity === "orders_shop";
          return false;
        });

      const matchesCurrency =
        filters.currencies.length === 0 ||
        filters.currencies.includes((item.currency || "USD").toUpperCase());

      const statusValue = (item.payment_status || item.status || item.invoice_status || "").toLowerCase();
      const matchesPaymentStatus =
        filters.paymentStatuses.length === 0 || filters.paymentStatuses.includes(statusValue);

      const recordDate = (item.record_date || item.issue_date || item.created_at || item.paid_at || item.due_date || "").slice(0, 10);
      const matchesDateFrom = !filters.dateFrom || recordDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || recordDate <= filters.dateTo;

      const fieldValue = (() => {
        if (!filters.searchField) return "";
        if (filters.searchField === "customer_name") return item.customer_name || item.client_name || item.order_name || "";
        if (filters.searchField === "customer_cedula") return item.customer_cedula || item.cedula || "";
        if (filters.searchField === "invoice_number") return item.invoice_number || "";
        if (filters.searchField === "order_number") return item.order_number || "";
        if (filters.searchField === "employee_name") return item.employee_name || "";
        if (filters.searchField === "cost_name") return item.cost_name || "";
        return "";
      })();

      const matchesSearch =
        !filters.searchField ||
        !filters.searchValue ||
        String(fieldValue).toLowerCase().includes(filters.searchValue.toLowerCase());

      return matchesOrderType && matchesRecordType && matchesCurrency && matchesPaymentStatus && matchesDateFrom && matchesDateTo && matchesSearch;
    });
  }, [records, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));

  const paginatedRecords = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage, totalPages]);

  const getSourceLabel = (item) => {
    if (item.source_entity === "orders_clientes") return "Orden";
    if (item.source_entity === "payments_personal") return "Empleado";
    if (item.source_entity === "orders_shop") return "Inventario";
    if (item.source_entity === "fixed_costs") return "Costo fijo";
    return item.source_entity || "N/D";
  };

  const getRowColor = (item) => {
    if (item.source_entity === "orders_clientes") return "border-l-4 border-green-500";
    if (item.source_entity === "payments_personal") return "border-l-4 border-amber-500";
    if (item.source_entity === "orders_shop") return "border-l-4 border-purple-500";
    if (item.source_entity === "fixed_costs") return "border-l-4 border-orange-500";
    return "";
  };

  const openDetail = async (item) => {
    setSelectedRecord(item);
    await fetchDetails(item);
  };

  const toggleRecordType = (type) => {
    setFilters((prev) => ({
      ...prev,
      recordTypes: prev.recordTypes.includes(type) ? prev.recordTypes.filter((x) => x !== type) : [...prev.recordTypes, type],
    }));
  };

  const getRowClientName = (item) => {
    if (item.source_entity === "orders_clientes") return item.customer_name || item.client_name || item.order_name || "N/D";
    if (item.source_entity === "payments_personal") return item.employee_name || "N/D";
    if (item.source_entity === "orders_shop") return item.user_nombre || item.nombre || item.name || item.supplier_name || "N/D";
    if (item.source_entity === "fixed_costs") return item.cost_name || "N/D";
    return item.customer_name || item.employee_name || item.cost_name || "N/D";
  };

  const getRowCedula = (item) => {
    if (item.source_entity === "orders_clientes") return item.customer_cedula || item.cedula || "N/D";
    if (item.source_entity === "payments_personal") return item.employee_cedula || item.cedula || "N/D";
    return item.customer_cedula || item.employee_cedula || item.cedula || "N/D";
  };

  const getModalTitle = () => {
    const e = selectedDetails.extra || {};
    if (selectedRecord?.source_entity === "orders_shop") {
      return pick(e.user_nombre, e.nombre, e.name, selectedRecord?.reference, selectedRecord?.order_number);
    }
    return pick(
      selectedRecord?.reference,
      selectedRecord?.invoice_number,
      selectedRecord?.order_number,
      selectedRecord?.cost_name,
      e.invoice_number
    );
  };

  return (
    <div className="space-y-8 w-full max-w-full overflow-x-hidden px-2 sm:px-4">
      <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight break-words">📋 Facturación y Movimientos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
        <div className="rounded-3xl bg-[var(--body)] p-5 shadow-xl border border-white/10 min-w-0">
          <p className="text-sm text-gray-300">Ingresos</p>
          <p className="text-2xl sm:text-3xl font-black text-green-400 truncate">{formatBs(totals.income)}</p>
        </div>
        <div className="rounded-3xl bg-[var(--body)] p-5 shadow-xl border border-white/10 min-w-0">
          <p className="text-sm text-gray-300">Egresos</p>
          <p className="text-2xl sm:text-3xl font-black text-red-400 truncate">{formatBs(totals.expense)}</p>
        </div>
        <div className="rounded-3xl bg-[var(--body)] p-5 shadow-xl border border-white/10 min-w-0">
          <p className="text-sm text-gray-300">Total neto</p>
          <p className={`text-2xl sm:text-3xl font-black truncate ${totals.net >= 0 ? "text-green-400" : "text-red-400"}`}>{formatBs(totals.net)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-[var(--body)] p-4 rounded-3xl shadow-lg flex-wrap gap-4 min-w-0">
        <div className="flex flex-wrap gap-3">
          {[
            { key: "all", label: "Ambos" },
            { key: "income", label: "Ingresos" },
            { key: "expense", label: "Egresos" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilters((prev) => ({ ...prev, orderType: btn.key }))}
              className={`px-4 py-3 rounded-2xl font-bold transition text-sm sm:text-base ${
                filters.orderType === btn.key ? "bg-red-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
          <button
            onClick={clearAll}
            className="px-4 py-3 rounded-2xl font-bold bg-red-100 text-red-700 hover:bg-red-200 transition text-sm sm:text-base"
          >
            Limpiar
          </button>
        </div>
        <div className="flex items-center gap-3 flex-wrap text-white font-semibold pr-4">
          <span>BCV USD/VES:</span>
          <span>{bcvRate}</span>
        </div>
      </div>

      {visibleFilterOptions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {visibleFilterOptions.map((item, idx) => (
            <span key={idx} className="flex items-center gap-2 bg-red-800/90 shadow-md shadow-black px-4 py-2 rounded-full text-sm font-semibold text-white max-w-full">
              <span className="truncate">{item.label}</span>
              <button onClick={() => clearOne(item.key, item.value)} className="text-red-300 font-black hover:text-white">
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="bg-[var(--body)] p-5 sm:p-6 rounded-3xl shadow-xl space-y-5 max-w-full overflow-hidden min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.searchField}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchField: e.target.value, searchValue: "" }))}
            className="px-4 py-3 rounded-2xl border border-gray-300 bg-[var(--body)] text-white w-full min-w-0"
          >
            <option value="">Elegir filtro de búsqueda</option>
            <option value="customer_name">Nombre</option>
            <option value="customer_cedula">Cédula</option>
            <option value="invoice_number">Número de factura</option>
            <option value="order_number">Número de orden</option>
            <option value="employee_name">Empleado</option>
            <option value="cost_name">Costo fijo</option>
          </select>

          {filters.searchField && (
            <input
              type="text"
              value={filters.searchValue}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchValue: e.target.value }))}
              placeholder="Escribe para buscar"
              className="px-4 py-3 rounded-2xl border border-gray-300 w-full min-w-0 text-gray-900"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:col-span-2">
            <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))} className="px-4 py-3 rounded-2xl border border-gray-300 w-full min-w-0 text-gray-900" />
            <input type="date" value={filters.dateTo} onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))} className="px-4 py-3 rounded-2xl border border-gray-300 w-full min-w-0 text-gray-900" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => toggleCurrency("USD")} className={`px-4 py-2 rounded-xl border text-sm ${filters.currencies.includes("USD") ? "bg-green-700 text-white" : "bg-[var(--body)] text-white"}`}>USD</button>
          <button onClick={() => toggleCurrency("VES")} className={`px-4 py-2 rounded-xl border text-sm ${filters.currencies.includes("VES") ? "bg-red-800 text-white" : "bg-[var(--body)] text-white"}`}>VES</button>

          <button onClick={() => togglePaymentStatus("pagada")} className={`px-4 py-2 rounded-xl border text-sm ${filters.paymentStatuses.includes("pagada") ? "bg-green-700 text-white" : "bg-[var(--body)] text-white"}`}>Pagada</button>
          <button onClick={() => togglePaymentStatus("pendiente")} className={`px-4 py-2 rounded-xl border text-sm ${filters.paymentStatuses.includes("pendiente") ? "bg-amber-700 text-white" : "bg-[var(--body)] text-white"}`}>Pendiente</button>
          <button onClick={() => togglePaymentStatus("anulada")} className={`px-4 py-2 rounded-xl border text-sm ${filters.paymentStatuses.includes("anulada") ? "bg-gray-700 text-white" : "bg-[var(--body)] text-white"}`}>Anulada</button>

          <button onClick={() => toggleRecordType("empleados")} className={`px-4 py-2 rounded-xl border text-sm ${filters.recordTypes.includes("empleados") ? "bg-blue-700 text-white" : "bg-[var(--body)] text-white"}`}>Empleados</button>
          <button onClick={() => toggleRecordType("fixed_costs")} className={`px-4 py-2 rounded-xl border text-sm ${filters.recordTypes.includes("fixed_costs") ? "bg-orange-700 text-white" : "bg-[var(--body)] text-white"}`}>Costos fijos</button>
          <button onClick={() => toggleRecordType("orders")} className={`px-4 py-2 rounded-xl border text-sm ${filters.recordTypes.includes("orders") ? "bg-red-700 text-white" : "bg-[var(--body)] text-white"}`}>Órdenes</button>
          <button onClick={() => toggleRecordType("inventory")} className={`px-4 py-2 rounded-xl border text-sm ${filters.recordTypes.includes("inventory") ? "bg-purple-700 text-white" : "bg-[var(--body)] text-white"}`}>Inventario</button>
        </div>
      </div>

      <div className="bg-[var(--body)] rounded-3xl shadow-2xl overflow-hidden max-w-full">
        {loading ? (
          <div className="p-8 text-center text-white">Cargando registros...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-white">No hay registros</div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[800px]">
                <thead className="bg-[var(--body)] text-white border-b border-white/20 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-left font-bold">Tipo</th>
                    <th className="p-4 text-left font-bold">Referencia</th>
                    <th className="p-4 text-left font-bold">Nombre / CI</th>
                    <th className="p-4 text-left font-bold">Fecha</th>
                    <th className="p-4 text-right font-bold">Total</th>
                    <th className="p-4 text-center font-bold">Estado</th>
                    <th className="p-4 text-center font-bold">Ver</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((item) => {
                    const editable = item.source_entity === "orders_clientes" || item.source_entity === "payments_personal";
                    const rowStatus = item.payment_status || item.status || item.invoice_status || "pendiente";
                    const amount = item.total || item.amount || 0;
                    const rate = getRateForRecord(item);
                    const amountBs = toBolivares(amount, item.currency || "USD", rate);

                    return (
                      <tr key={`${item.source_entity}-${item.source_id}`} className={`border-t border-white/10 hover:bg-white/5 transition text-white ${getRowColor(item)}`}>
                        <td className="p-4 text-sm sm:text-base">{getSourceLabel(item)}</td>
                        <td className="p-4 font-mono text-sm sm:text-base">{item.reference || item.invoice_number || item.order_number || item.cost_name || "N/D"}</td>
                        <td className="p-4 text-sm sm:text-base max-w-[200px]">
                          <div className="font-semibold truncate">{getRowClientName(item)}</div>
                          <div className="text-xs text-gray-400 truncate">CI/RIF: {getRowCedula(item)}</div>
                        </td>
                        <td className="p-4 text-sm sm:text-base">{(item.record_date || item.issue_date || item.created_at || item.paid_at || item.due_date || "").slice(0, 10)}</td>
                        <td className="p-4 text-right font-bold text-sm sm:text-base">
                          <div>{formatMoney(amount, item.currency || "USD")}</div>
                          <div className="text-xs text-gray-400 font-normal">{formatBs(amountBs)}</div>
                        </td>
                        <td className="p-4 text-center">
                          {editable ? (
                            <select value={rowStatus} onChange={(e) => updateOriginStatus(item, e.target.value)} disabled={savingStatusId === item.source_id} className="px-2 py-2 rounded-xl bg-[var(--body)] border border-white/20 text-white text-sm w-full max-w-[130px]">
                              <option value="pendiente">pendiente</option>
                              <option value="pagada">pagada</option>
                              <option value="rechazada">rechazada</option>
                              <option value="anulada">anulada</option>
                            </select>
                          ) : (
                            <span className="inline-flex px-3 py-2 rounded-full text-xs font-bold bg-white/10">
                              {item.status || item.invoice_status || item.payment_status || "emitida"}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => openDetail(item)} className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 text-sm">
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-t border-white/10 text-white">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-300">Filas por página:</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={rowsPerPage}
                  onChange={(e) => {
                    const value = Math.max(1, Number(e.target.value || 1));
                    setRowsPerPage(value);
                    setCurrentPage(1);
                  }}
                  className="w-20 px-3 py-2 rounded-xl bg-[var(--body)] border border-white/20 text-white"
                />
                <span className="text-sm text-gray-400">Total: {filteredRecords.length} registros</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-2 rounded-xl bg-[var(--body2)] border border-white/10 disabled:opacity-50">Inicio</button>
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 rounded-xl bg-[var(--body2)] border border-white/10 disabled:opacity-50">Anterior</button>
                <span className="px-3 py-2 text-sm">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 rounded-xl bg-[var(--body2)] border border-white/10 disabled:opacity-50">Siguiente</button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-2 rounded-xl bg-[var(--body2)] border border-white/10 disabled:opacity-50">Fin</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Detalle con Información Fiscal y Legal Completa */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[var(--body)] border border-white/20 rounded-3xl p-4 sm:p-6 w-full max-w-3xl text-white space-y-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            {/* Cabecera del Modal / Datos del Documento Legal */}
            <div className="flex justify-between items-start gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-red-400 font-bold block">
                  {getSourceLabel(selectedRecord)} - Documento Fiscal
                </span>
                <h2 className="text-xl sm:text-3xl font-black break-words">
                  {getModalTitle()}
                </h2>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-white text-3xl font-black p-1 leading-none"
              >
                ×
              </button>
            </div>

            {selectedDetails.loading ? (
              <div className="py-12 text-center text-gray-300 font-semibold">Cargando información fiscal...</div>
            ) : selectedDetails.error ? (
              <div className="py-12 text-center text-red-400 font-bold">{selectedDetails.error}</div>
            ) : (
              <div className="space-y-6 text-sm">
                
                {/* Bloque 1: Identificación Legal y Fiscal del Registro */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div>
                    <span className="text-gray-400 block text-xs font-semibold uppercase">Receptor / Razon Social</span>
                    <span className="font-bold text-base break-words">
                      {pick(
                        selectedRecord.customer_name,
                        selectedRecord.client_name,
                        selectedRecord.employee_name,
                        selectedRecord.user_nombre,
                        selectedRecord.cost_name,
                        selectedDetails.extra?.customer_name,
                        selectedDetails.extra?.user_nombre
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-xs font-semibold uppercase">RIF / Cédula Identidad</span>
                    <span className="font-mono font-bold text-base">
                      {pick(
                        selectedRecord.customer_cedula,
                        selectedRecord.employee_cedula,
                        selectedRecord.cedula,
                        selectedDetails.extra?.customer_cedula,
                        selectedDetails.extra?.cedula
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-xs font-semibold uppercase">Estado de Pago</span>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-white/10 border border-white/20">
                      {selectedRecord.payment_status || selectedRecord.status || "N/D"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-xs font-semibold uppercase">N° Factura / Control</span>
                    <span className="font-mono font-bold">
                      {pick(selectedRecord.invoice_number, selectedRecord.control_number, selectedRecord.reference)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-xs font-semibold uppercase">N° de Orden</span>
                    <span className="font-mono">
                      {pick(selectedRecord.order_number, selectedRecord.shop_order_id)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-xs font-semibold uppercase">Tasa de Cambio (BCV)</span>
                    <span className="font-semibold text-green-400">
                      Bs. {getRateForRecord(selectedRecord)} / USD
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-xs font-semibold uppercase">Fecha Emisión</span>
                    <span className="font-semibold">
                      {(selectedRecord.record_date || selectedRecord.issue_date || selectedRecord.created_at || "").slice(0, 10) || "N/D"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-xs font-semibold uppercase">Fecha Vencimiento</span>
                    <span className="font-semibold">
                      {(selectedRecord.due_date || selectedRecord.next_due_date || "").slice(0, 10) || "N/D"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-xs font-semibold uppercase">Método de Pago</span>
                    <span className="font-semibold capitalize">
                      {pick(selectedRecord.payment_method, selectedDetails.extra?.payment_method, "N/D")}
                    </span>
                  </div>

                  {(selectedRecord.address || selectedDetails.extra?.address) && (
                    <div className="sm:col-span-2 md:col-span-3">
                      <span className="text-gray-400 block text-xs font-semibold uppercase">Domicilio Fiscal</span>
                      <span className="font-medium break-words">
                        {pick(selectedRecord.address, selectedDetails.extra?.address)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bloque 2: Tabla de Detalles y Conceptos Facturados */}
                {selectedDetails.items && selectedDetails.items.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-bold text-base text-gray-200">Conceptos / Detalle de Ítems</h3>
                    <div className="overflow-x-auto border border-white/10 rounded-2xl">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead className="bg-white/10 text-xs font-bold uppercase tracking-wider text-gray-300">
                          <tr>
                            <th className="p-3">Descripción</th>
                            <th className="p-3 text-center">Cant.</th>
                            <th className="p-3 text-right">P. Unitario</th>
                            <th className="p-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {selectedDetails.items.map((item, idx) => {
                            const qty = Number(item.quantity || item.cantidad || 1);
                            const price = Number(item.price || item.precio_unitario || item.unit_price || 0);
                            const itemTotal = qty * price;
                            return (
                              <tr key={idx} className="hover:bg-white/5 transition">
                                <td className="p-3 break-words font-medium">{item.name || item.descripcion || item.product_name || "N/D"}</td>
                                <td className="p-3 text-center font-mono">{qty}</td>
                                <td className="p-3 text-right font-mono">{formatMoney(price, selectedRecord.currency || "USD")}</td>
                                <td className="p-3 text-right font-mono font-bold">{formatMoney(itemTotal, selectedRecord.currency || "USD")}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-gray-400 text-center italic">
                    Este movimiento no posee ítems individualizados registrados.
                  </div>
                )}

                {/* Bloque 3: Desglose Impositivo Legales y Totales Duales */}
                {(() => {
                  const rate = getRateForRecord(selectedRecord);
                  const currency = selectedRecord.currency || "USD";
                  const total = Number(selectedRecord.total || selectedRecord.amount || 0);
                  
                  // Asumiendo cálculo impositivo legal (IVA 16% Venezuela)
                  const taxRate = 0.16;
                  const baseAmount = total / (1 + taxRate);
                  const taxAmount = total - baseAmount;

                  const totalBs = toBolivares(total, currency, rate);
                  const baseBs = toBolivares(baseAmount, currency, rate);
                  const taxBs = toBolivares(taxAmount, currency, rate);

                  return (
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 border-b border-white/10 pb-2">
                        Resumen Fiscal y Totales Duales
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-xs text-gray-300">
                          <div className="flex justify-between">
                            <span>Base Imponible:</span>
                            <span className="font-mono font-semibold">{formatMoney(baseAmount, currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>IVA (16%):</span>
                            <span className="font-mono font-semibold">{formatMoney(taxAmount, currency)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-white/10">
                            <span>Total ({currency}):</span>
                            <span className="font-mono">{formatMoney(total, currency)}</span>
                          </div>
                        </div>

                        {/* Conversión Legal Obligatoria a Bolívares */}
                        <div className="space-y-1.5 text-xs text-gray-300 bg-black/20 p-3 rounded-xl border border-white/5">
                          <div className="flex justify-between">
                            <span>Base Imponible (VES):</span>
                            <span className="font-mono font-semibold">{formatBs(baseBs)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>IVA 16% (VES):</span>
                            <span className="font-mono font-semibold">{formatBs(taxBs)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-black text-green-400 pt-1 border-t border-white/10">
                            <span>Total en Bolívares:</span>
                            <span className="font-mono">{formatBs(totalBs)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

            {/* Acciones Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2.5 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold transition shadow-lg text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturas;