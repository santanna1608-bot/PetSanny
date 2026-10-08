import { inventoryService, financeService } from "../lib/domainServices";
import { localDate } from "../lib/dates";
import React, { useState, useEffect } from "react";
import { useAppointments } from "../contexts/AppointmentsContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Package,
  DollarSign,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Search,
  AlertCircle,
} from "lucide-react";

interface StockItem {
  id: string;
  name: string;
  category: "medicine" | "vaccine" | "product" | "shampoo" | "equipment";
  provider: string;
  batch: string;
  barcode: string;
  qty: number;
  minQty: number;
  maxQty: number;
  expiryDate: string;
  buyPrice: number;
  sellPrice: number;
}

interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  type: "revenue" | "expense";
  category: string;
  value: number;
  paymentMethod: "pix" | "credit_card" | "cash" | "boleto";
}

export const InventoryAndFinance: React.FC = () => {
  const { currentTenant, addToast } = useAppointments();
  const { t } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<"inventory" | "finance">(
    "inventory",
  );

  // Estados de Estoque
  const [stock, setStock] = useState<StockItem[]>([]);
  const [searchStock, setSearchStock] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Estados de Nova Mercadoria
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] =
    useState<StockItem["category"]>("product");
  const [newItemProvider, setNewItemProvider] = useState("");
  const [newItemBatch, setNewItemBatch] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newItemMinQty, setNewItemMinQty] = useState("");
  const [newItemExpiry, setNewItemExpiry] = useState("");
  const [newItemBuyPrice, setNewItemBuyPrice] = useState("");
  const [newItemSellPrice, setNewItemSellPrice] = useState("");

  // Estados Financeiros
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [txDesc, setTxDesc] = useState("");
  const [txType, setTxType] = useState<"revenue" | "expense">("revenue");
  const txCategory = "Serviços";
  const [txVal, setTxVal] = useState("");
  const [txMethod, setTxMethod] =
    useState<FinancialTransaction["paymentMethod"]>("pix");

  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let canceled = false;
    setStock([]);
    setTransactions([]);
    setLoadError("");
    void Promise.all([
      inventoryService.list(currentTenant.id),
      financeService.list(currentTenant.id),
    ])
      .then(([items, tx]) => {
        if (canceled) return;
        setStock(
          items.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            provider: i.provider || "",
            batch: i.batch || "",
            barcode: i.barcode || "",
            qty: i.qty,
            minQty: i.min_qty,
            maxQty: i.max_qty,
            expiryDate: i.expiry_date || "",
            buyPrice: Number(i.buy_price),
            sellPrice: Number(i.sell_price),
          })),
        );
        setTransactions(
          tx.map((i) => ({
            id: i.id,
            date: i.transaction_date,
            description: i.description,
            type: i.transaction_type,
            category: i.category,
            value: Number(i.value),
            paymentMethod: i.payment_method,
          })),
        );
      })
      .catch(() => {
        if (!canceled)
          setLoadError(
            "Não foi possível carregar estoque e financeiro. Atualize a página para tentar novamente.",
          );
      });
    return () => {
      canceled = true;
    };
  }, [currentTenant.id]);
  const handleAddStockItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const qty = Number(newItemQty),
      minQty = Number(newItemMinQty || 0),
      buyPrice = Number(newItemBuyPrice || 0),
      sellPrice = Number(newItemSellPrice);
    if (
      !newItemName.trim() ||
      !Number.isInteger(qty) ||
      qty < 0 ||
      !Number.isInteger(minQty) ||
      minQty < 0 ||
      !Number.isFinite(buyPrice) ||
      buyPrice < 0 ||
      !Number.isFinite(sellPrice) ||
      sellPrice < 0 ||
      !newItemSellPrice
    ) {
      addToast(
        "Confira os dados",
        "Informe quantidades inteiras e preços válidos.",
        "warning",
      );
      return;
    }
    setBusy(true);
    try {
      const i = await inventoryService.create({
        tenant_id: currentTenant.id,
        name: newItemName.trim(),
        category: newItemCategory,
        provider: newItemProvider || null,
        batch: newItemBatch || null,
        barcode: null,
        qty,
        min_qty: minQty,
        max_qty: Math.max(100, minQty),
        expiry_date: newItemExpiry || null,
        buy_price: buyPrice,
        sell_price: sellPrice,
      });
      setStock((prev) => [
        ...prev,
        {
          id: i.id,
          name: i.name,
          category: i.category,
          provider: i.provider || "",
          batch: i.batch || "",
          barcode: i.barcode || "",
          qty: i.qty,
          minQty: i.min_qty,
          maxQty: i.max_qty,
          expiryDate: i.expiry_date || "",
          buyPrice: Number(i.buy_price),
          sellPrice: Number(i.sell_price),
        },
      ]);
      setIsAddStockOpen(false);
      setNewItemName("");
      setNewItemProvider("");
      setNewItemBatch("");
      setNewItemQty("");
      setNewItemMinQty("");
      setNewItemExpiry("");
      setNewItemBuyPrice("");
      setNewItemSellPrice("");
      addToast("Item salvo", "O item foi cadastrado no estoque.");
    } catch {
      addToast(
        "Erro ao salvar",
        "O item não foi salvo. Confira suas permissões e tente novamente.",
        "warning",
      );
    } finally {
      setBusy(false);
    }
  };
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const value = Number(txVal);
    if (!txDesc.trim() || !Number.isFinite(value) || value <= 0) {
      addToast(
        "Confira os dados",
        "Informe a descrição e um valor maior que zero.",
        "warning",
      );
      return;
    }
    setBusy(true);
    try {
      const i = await financeService.create({
        tenant_id: currentTenant.id,
        transaction_date: localDate(),
        description: txDesc.trim(),
        transaction_type: txType,
        category: txCategory,
        value,
        payment_method: txMethod,
      });
      setTransactions((prev) => [
        {
          id: i.id,
          date: i.transaction_date,
          description: i.description,
          type: i.transaction_type,
          category: i.category,
          value: Number(i.value),
          paymentMethod: i.payment_method,
        },
        ...prev,
      ]);
      setTxDesc("");
      setTxVal("");
      addToast(
        "Lançamento salvo",
        "O lançamento foi registrado no financeiro.",
      );
    } catch {
      addToast(
        "Erro ao salvar",
        "O lançamento não foi salvo. Confira suas permissões e tente novamente.",
        "warning",
      );
    } finally {
      setBusy(false);
    }
  };
  const handleDeleteStock = async (id: string, _name: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await inventoryService.delete(id, currentTenant.id);
      setStock((prev) => prev.filter((i) => i.id !== id));
      addToast("Item removido", "Registro excluído do estoque.", "info");
    } catch {
      addToast(
        "Erro ao excluir",
        "Não foi possível excluir o item.",
        "warning",
      );
    } finally {
      setBusy(false);
    }
  };

  // Cálculos Financeiros
  const totalRevenue = transactions
    .filter((t) => t.type === "revenue")
    .reduce((sum, t) => sum + t.value, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.value, 0);
  const netProfit = totalRevenue - totalExpense;

  // Filtros de Estoque
  const filteredStock = stock.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchStock.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchStock.toLowerCase()) ||
      item.barcode.includes(searchStock);
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Alertas de Estoque e Validade
  const checkStockAlert = (item: StockItem) => {
    if (item.qty <= item.minQty) return "qty_critical";
    if (!item.expiryDate) return "ok";
    const expDate = new Date(item.expiryDate + "T23:59:59");
    const today = new Date();
    const diffDays = Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 0) return "expiry_expired";
    if (diffDays <= 30) return "expiry_warning";

    return "ok";
  };

  const getCategoryLabel = (cat: StockItem["category"]) => {
    switch (cat) {
      case "medicine":
        return t("inventory.cat_medicine");
      case "vaccine":
        return t("inventory.cat_vaccine");
      case "product":
        return t("inventory.cat_product");
      case "shampoo":
        return t("inventory.cat_shampoo");
      case "equipment":
        return t("inventory.cat_equipment");
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-xs text-stone-850 dark:text-stone-150 overflow-hidden animate-fade-in">
      <div className="flex border-b border-stone-150 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-955/20 px-6 pt-3">
        <button
          onClick={() => setActiveSubTab("inventory")}
          className={`flex items-center gap-2 px-5 py-3 font-extrabold text-[10px] uppercase border-b-2 transition-all cursor-pointer ${
            activeSubTab === "inventory"
              ? "border-olive-650 text-olive-650 dark:text-olive-400 bg-white dark:bg-stone-900"
              : "border-transparent text-stone-450 hover:text-stone-700 dark:hover:text-stone-200"
          }`}
        >
          <Package className="w-4 h-4" />
          {t("inventory.tab_stock")}
        </button>
        <button
          onClick={() => setActiveSubTab("finance")}
          className={`flex items-center gap-2 px-5 py-3 font-extrabold text-[10px] uppercase border-b-2 transition-all cursor-pointer ${
            activeSubTab === "finance"
              ? "border-olive-655 text-olive-655 dark:text-olive-400 bg-white dark:bg-stone-900"
              : "border-transparent text-stone-450 hover:text-stone-700 dark:hover:text-stone-200"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          {t("inventory.tab_finance")}
        </button>
      </div>

      <div className="p-6">
        {loadError && (
          <p role="alert" className="mb-4 text-rose-600">
            {loadError}
          </p>
        )}

        {/* ========================================================
            TABA 1: CONTROLE DE ESTOQUE
           ======================================================== */}
        {activeSubTab === "inventory" && (
          <div className="space-y-6">
            {/* Header + Busca + Novo Item */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-150 dark:border-stone-850 pb-5">
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                {/* Input de Busca */}
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder={t("inventory.search_placeholder")}
                    value={searchStock}
                    onChange={(e) => setSearchStock(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-stone-200 dark:border-stone-800 focus:border-olive-500 outline-none transition-all"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Filtro de Categoria */}
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 font-semibold rounded-xl px-4 py-2.5 outline-none cursor-pointer text-xs"
                  >
                    <option value="all">{t("inventory.all_categories")}</option>
                    <option value="medicine">
                      {t("inventory.cat_medicine")}
                    </option>
                    <option value="vaccine">
                      {t("inventory.cat_vaccine")}
                    </option>
                    <option value="product">
                      {t("inventory.cat_product")}
                    </option>
                    <option value="shampoo">
                      {t("inventory.cat_shampoo")}
                    </option>
                    <option value="equipment">
                      {t("inventory.cat_equipment")}
                    </option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setIsAddStockOpen(!isAddStockOpen)}
                className="flex items-center justify-center gap-1.5 bg-olive-600 hover:bg-olive-750 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-olive-900/10 transition-all cursor-pointer self-start md:self-center"
              >
                <Plus className="w-4 h-4" />
                <span>{t("inventory.add_item")}</span>
              </button>
            </div>

            {/* Formulário de Novo Item de Estoque */}
            {isAddStockOpen && (
              <form
                onSubmit={handleAddStockItem}
                className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 space-y-4 animate-fade-in"
              >
                <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">
                  {t("inventory.form_title")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 dark:text-stone-400 font-bold uppercase">
                      {t("inventory.lbl_name")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Apoquel 16mg"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 focus:border-olive-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 dark:text-stone-400 font-bold uppercase">
                      {t("inventory.lbl_category")}
                    </label>
                    <select
                      value={newItemCategory}
                      onChange={(e) =>
                        setNewItemCategory(e.target.value as any)
                      }
                      className="w-full bg-white dark:bg-stone-900 text-stone-850 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 outline-none"
                    >
                      <option value="product">
                        {t("inventory.cat_product")}
                      </option>
                      <option value="medicine">
                        {t("inventory.cat_medicine")}
                      </option>
                      <option value="vaccine">
                        {t("inventory.cat_vaccine")}
                      </option>
                      <option value="shampoo">
                        {t("inventory.cat_shampoo")}
                      </option>
                      <option value="equipment">
                        {t("inventory.cat_equipment")}
                      </option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 dark:text-stone-400 font-bold uppercase">
                      {t("inventory.lbl_provider")}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Zoetis Brasil"
                      value={newItemProvider}
                      onChange={(e) => setNewItemProvider(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 focus:border-olive-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 dark:text-stone-400 font-bold uppercase">
                      {t("inventory.lbl_batch")}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: L-992200"
                      value={newItemBatch}
                      onChange={(e) => setNewItemBatch(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 focus:border-olive-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 dark:text-stone-400 font-bold uppercase">
                      {t("inventory.lbl_expiry")}
                    </label>
                    <input
                      type="date"
                      value={newItemExpiry}
                      onChange={(e) => setNewItemExpiry(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 outline-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 dark:text-stone-400 font-bold uppercase">
                      {t("inventory.lbl_qty_initial")}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Ex: 20"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 focus:border-olive-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 dark:text-stone-400 font-bold uppercase">
                      {t("inventory.lbl_qty_min")}
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 5"
                      value={newItemMinQty}
                      onChange={(e) => setNewItemMinQty(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 focus:border-olive-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 dark:text-stone-400 font-bold uppercase">
                      {t("inventory.lbl_price_buy")}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 25.00"
                      value={newItemBuyPrice}
                      onChange={(e) => setNewItemBuyPrice(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 focus:border-olive-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 dark:text-stone-400 font-bold uppercase">
                      {t("inventory.lbl_price_sell")}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 60.00"
                      value={newItemSellPrice}
                      onChange={(e) => setNewItemSellPrice(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 focus:border-olive-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddStockOpen(false)}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 font-bold px-4 py-2 rounded-xl"
                  >
                    {t("inventory.btn_cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="bg-olive-650 hover:bg-olive-750 text-white font-bold px-4 py-2 rounded-xl"
                  >
                    {t("inventory.btn_submit")}
                  </button>
                </div>
              </form>
            )}

            {/* Listagem de Estoque */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-150 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold bg-stone-50/50 dark:bg-stone-955/20">
                    <th className="py-3 px-3">{t("inventory.th_name")}</th>
                    <th className="py-3 px-3">{t("inventory.lbl_category")}</th>
                    <th className="py-3 px-3">{t("inventory.lbl_provider")}</th>
                    <th className="py-3 px-3">{t("inventory.lbl_batch")}</th>
                    <th className="py-3 px-3">{t("inventory.th_qty")}</th>
                    <th className="py-3 px-3">{t("inventory.lbl_expiry")}</th>
                    <th className="py-3 px-3 text-right">
                      {t("inventory.th_price")}
                    </th>
                    <th className="py-3 px-3 text-right">
                      {t("saas.th_actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 dark:divide-stone-850 font-medium">
                  {filteredStock.map((item) => {
                    const alertState = checkStockAlert(item);
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-stone-50/30 dark:hover:bg-stone-950/10 ${
                          alertState === "qty_critical"
                            ? "bg-rose-50/20 dark:bg-rose-955/5"
                            : alertState === "expiry_expired"
                              ? "bg-red-50/20 dark:bg-red-955/5"
                              : ""
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-stone-800 dark:text-stone-200">
                            {item.name}
                          </div>
                          <div className="text-[9px] font-mono text-stone-450 dark:text-stone-400 mt-0.5">
                            {item.barcode}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[9px] bg-stone-100 dark:bg-stone-950 text-stone-550 dark:text-stone-300 border border-stone-200 dark:border-stone-800 px-2 py-0.5 rounded-full font-bold">
                            {getCategoryLabel(item.category)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-stone-500 dark:text-stone-305">
                          {item.provider || t("inventory.not_informed")}
                        </td>
                        <td className="py-3 px-3 font-mono">{item.batch}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span
                              className={
                                alertState === "qty_critical"
                                  ? "text-rose-600 dark:text-rose-400 animate-pulse"
                                  : ""
                              }
                            >
                              {item.qty}
                            </span>
                            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-semibold">
                              / {item.minQty}
                            </span>
                            {alertState === "qty_critical" && (
                              <span title={t("inventory.alert_min")}>
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-mono ${
                                alertState === "expiry_expired"
                                  ? "text-red-600 dark:text-red-400 line-through"
                                  : alertState === "expiry_warning"
                                    ? "text-amber-600 dark:text-amber-500"
                                    : ""
                              }`}
                            >
                              {item.expiryDate.split("-").reverse().join("/")}
                            </span>
                            {alertState === "expiry_expired" && (
                              <span title={t("inventory.alert_expired")}>
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                              </span>
                            )}
                            {alertState === "expiry_warning" && (
                              <span title={t("inventory.alert_near_expiry")}>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                            {t("inventory.lbl_cost")} R${" "}
                            {item.buyPrice.toFixed(0)}
                          </div>
                          <div className="font-extrabold text-stone-800 dark:text-stone-100">
                            R$ {item.sellPrice.toFixed(0)}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() =>
                              handleDeleteStock(item.id, item.name)
                            }
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-stone-440 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title={t("inventory.btn_delete_title")}
                          >
                            {t("inventory.btn_delete")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TABA 2: FLUXO DE CAIXA & FINANCEIRO
           ======================================================== */}
        {activeSubTab === "finance" && (
          <div className="space-y-6">
            {/* 3 Cards de Resumo Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Receitas */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-650 dark:text-emerald-500 font-bold uppercase tracking-wider block mb-1">
                    {t("inventory.lbl_revenues")}
                  </span>
                  <h4 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight">
                    R$ {totalRevenue.toFixed(2)}
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: Despesas */}
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-rose-650 dark:text-rose-500 font-bold uppercase tracking-wider block mb-1">
                    {t("inventory.lbl_expenses")}
                  </span>
                  <h4 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight">
                    R$ {totalExpense.toFixed(2)}
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: Resultado Líquido */}
              <div
                className={`rounded-2xl p-5 flex items-center justify-between border ${
                  netProfit >= 0
                    ? "bg-olive-500/5 border-olive-500/10 text-olive-650"
                    : "bg-rose-500/5 border-rose-500/10 text-rose-650"
                }`}
              >
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">
                    {t("inventory.lbl_net_profit")}
                  </span>
                  <h4 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight">
                    R$ {netProfit.toFixed(2)}
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-olive-500/10 text-olive-650 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* DRE Simplificado + Lançamento Rápido */}
            <div className="grid grid-cols-3 gap-6">
              {/* DRE Simplificado */}
              <div className="lg:col-span-2 bg-stone-50/50 dark:bg-stone-950/20 border border-stone-150 dark:border-stone-800 rounded-2xl p-5 space-y-4">
                <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100 pb-2 border-b border-stone-150 dark:border-stone-800">
                  Resumo dos lançamentos registrados
                </h4>

                <div className="space-y-2 text-[11px] font-bold">
                  <div className="flex items-center justify-between py-1 border-b border-stone-150/60 dark:border-stone-800/40">
                    <span className="text-stone-600 dark:text-stone-300">
                      Receitas registradas
                    </span>
                    <span className="text-stone-800 dark:text-stone-100">
                      R$ {totalRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-150/60 dark:border-stone-800/40 text-rose-650 dark:text-rose-455">
                    <span>Despesas registradas</span>
                    <span>- R$ {totalExpense.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 text-sm font-black border-t border-dashed border-stone-250">
                    <span className="text-stone-800 dark:text-stone-100">
                      Saldo dos lançamentos
                    </span>
                    <span
                      className={
                        netProfit >= 0
                          ? "text-emerald-605 dark:text-emerald-555"
                          : "text-rose-600"
                      }
                    >
                      R$ {netProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lançamento Rápido */}
              <div className="lg:col-span-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-5 space-y-4">
                <h4 className="font-extrabold text-sm text-stone-800 dark:text-stone-100">
                  {t("inventory.tx_new")}
                </h4>
                <form onSubmit={handleAddTransaction} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTxType("revenue")}
                      className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        txType === "revenue"
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-450"
                          : "border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400"
                      }`}
                    >
                      {t("inventory.tx_revenue")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType("expense")}
                      className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        txType === "expense"
                          ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-455"
                          : "border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400"
                      }`}
                    >
                      {t("inventory.tx_expense")}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 dark:text-stone-400 font-bold uppercase">
                      {t("inventory.lbl_desc")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t("inventory.placeholder_desc")}
                      value={txDesc}
                      onChange={(e) => setTxDesc(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-955 text-stone-800 dark:text-stone-100 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800 outline-none text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-[9px] text-stone-550 dark:text-stone-400 font-bold uppercase">
                        {t("inventory.lbl_val")}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="150.00"
                        value={txVal}
                        onChange={(e) => setTxVal(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-955 text-stone-800 dark:text-stone-100 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800 outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] text-stone-550 dark:text-stone-400 font-bold uppercase">
                        {t("inventory.lbl_method")}
                      </label>
                      <select
                        value={txMethod}
                        onChange={(e) => setTxMethod(e.target.value as any)}
                        className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800 outline-none text-xs font-semibold"
                      >
                        <option value="pix">Pix</option>
                        <option value="credit_card">Cartão</option>
                        <option value="cash">Dinheiro</option>
                        <option value="boleto">Boleto</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full bg-olive-650 hover:bg-olive-750 text-white font-bold py-2 rounded-xl text-xs cursor-pointer shadow-md shadow-olive-900/10"
                  >
                    {t("inventory.btn_confirm_tx")}
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100 pb-2 border-b border-stone-150 dark:border-stone-800">
                {t("inventory.tx_history")}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-150 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold bg-stone-50/50 dark:bg-stone-955/20">
                      <th className="py-2.5 px-3">{t("inventory.th_date")}</th>
                      <th className="py-2.5 px-3">
                        {t("inventory.lbl_desc").replace(" *", "")}
                      </th>
                      <th className="py-2.5 px-3">
                        {t("inventory.lbl_category")}
                      </th>
                      <th className="py-2.5 px-3">
                        {t("inventory.lbl_method").replace(" de Pago", "")}
                      </th>
                      <th className="py-2.5 px-3 text-right">
                        {t("inventory.lbl_val")
                          .replace(" (R$) *", "")
                          .replace(" ($) *", "")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 dark:divide-stone-850 font-medium">
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-stone-50/30 dark:hover:bg-stone-955/10"
                      >
                        <td className="py-3 px-3 text-[10px] text-stone-400 font-mono">
                          {tx.date.split("-").reverse().join("/")}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-stone-800 dark:text-stone-200">
                            {tx.description}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[9px] bg-stone-100 dark:bg-stone-950 text-stone-500 dark:text-stone-300 px-2 py-0.5 rounded-full border dark:border-stone-800">
                            {tx.category === "Serviços"
                              ? t("dashboard.vet_consultations").toLowerCase()
                              : tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[9px] font-bold uppercase">
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-black ${tx.type === "revenue" ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-455"}`}
                        >
                          {tx.type === "revenue" ? "+" : "-"} R${" "}
                          {tx.value.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
