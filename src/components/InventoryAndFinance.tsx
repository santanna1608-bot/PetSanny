import React, { useState, useEffect } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calculator,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  category: 'medicine' | 'vaccine' | 'product' | 'shampoo' | 'equipment';
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
  type: 'revenue' | 'expense';
  category: string;
  value: number;
  paymentMethod: 'pix' | 'credit_card' | 'cash' | 'boleto';
}

export const InventoryAndFinance: React.FC = () => {
  const { currentTenant, addToast, appointments } = useAppointments();
  
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'finance'>('inventory');
  
  // Estados de Estoque
  const [stock, setStock] = useState<StockItem[]>([]);
  const [searchStock, setSearchStock] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Estados de Nova Mercadoria
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<StockItem['category']>('product');
  const [newItemProvider, setNewItemProvider] = useState('');
  const [newItemBatch, setNewItemBatch] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemMinQty, setNewItemMinQty] = useState('');
  const [newItemExpiry, setNewItemExpiry] = useState('');
  const [newItemBuyPrice, setNewItemBuyPrice] = useState('');
  const [newItemSellPrice, setNewItemSellPrice] = useState('');

  // Estados Financeiros
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txDesc, setTxDesc] = useState('');
  const [txType, setTxType] = useState<'revenue' | 'expense'>('revenue');
  const [txCategory, setTxCategory] = useState('Serviços');
  const [txVal, setTxVal] = useState('');
  const [txMethod, setTxMethod] = useState<FinancialTransaction['paymentMethod']>('pix');

  // Carrega e Inicializa Dados do Estoque & Financeiro por Tenant
  useEffect(() => {
    const stockKey = `petsanny_stock_${currentTenant.id}`;
    const txKey = `petsanny_finance_${currentTenant.id}`;

    const cachedStock = localStorage.getItem(stockKey);
    const cachedTx = localStorage.getItem(txKey);

    if (cachedStock) {
      setStock(JSON.parse(cachedStock));
    } else {
      const defaultStock: StockItem[] = [
        {
          id: 's-1',
          name: 'Vacina V10 Importada (Zoetis)',
          category: 'vaccine',
          provider: 'Zoetis Brasil Ltda',
          batch: 'V10-998822',
          barcode: '7891234567890',
          qty: 18,
          minQty: 10,
          maxQty: 50,
          expiryDate: '2026-08-30', // vencendo em breve
          buyPrice: 45.00,
          sellPrice: 120.00
        },
        {
          id: 's-2',
          name: 'Shampoo Hipoalergênico Hexamidina',
          category: 'shampoo',
          provider: 'Virbac Saúde Animal',
          batch: 'SH-882211',
          barcode: '7899876543210',
          qty: 4, // abaixo do mínimo
          minQty: 8,
          maxQty: 30,
          expiryDate: '2027-12-15',
          buyPrice: 32.00,
          sellPrice: 85.00
        },
        {
          id: 's-3',
          name: 'Apoquel 16mg - Anti-alérgico',
          category: 'medicine',
          provider: 'Zoetis Brasil Ltda',
          batch: 'APQ-110022',
          barcode: '7894561230000',
          qty: 15,
          minQty: 5,
          maxQty: 20,
          expiryDate: '2026-07-28', // vencendo muito em breve
          buyPrice: 140.00,
          sellPrice: 280.00
        }
      ];
      setStock(defaultStock);
      localStorage.setItem(stockKey, JSON.stringify(defaultStock));
    }

    if (cachedTx) {
      setTransactions(JSON.parse(cachedTx));
    } else {
      const defaultTx: FinancialTransaction[] = [
        { id: 't-1', date: '2026-07-13', description: 'Atendimento Estética Mel', type: 'revenue', category: 'Serviços', value: 120.00, paymentMethod: 'pix' },
        { id: 't-2', date: '2026-07-13', description: 'Atendimento Veterinário Toby', type: 'revenue', category: 'Consultas', value: 180.00, paymentMethod: 'credit_card' },
        { id: 't-3', date: '2026-07-12', description: 'Aluguel do Imóvel Comercial', type: 'expense', category: 'Custos Fixos', value: 2500.00, paymentMethod: 'boleto' },
        { id: 't-4', date: '2026-07-10', description: 'Compra de Lote Vacinas Zoetis', type: 'expense', category: 'Insumos', value: 800.00, paymentMethod: 'credit_card' },
        { id: 't-5', date: '2026-07-08', description: 'Assinatura Plataforma PetSanny', type: 'expense', category: 'Software', value: 97.00, paymentMethod: 'credit_card' }
      ];
      setTransactions(defaultTx);
      localStorage.setItem(txKey, JSON.stringify(defaultTx));
    }
  }, [currentTenant]);

  // Salva no LocalStorage
  const saveStock = (newStock: StockItem[]) => {
    localStorage.setItem(`petsanny_stock_${currentTenant.id}`, JSON.stringify(newStock));
    setStock(newStock);
  };

  const saveTx = (newTx: FinancialTransaction[]) => {
    localStorage.setItem(`petsanny_finance_${currentTenant.id}`, JSON.stringify(newTx));
    setTransactions(newTx);
  };

  // Cadastra no Estoque
  const handleAddStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemQty || !newItemSellPrice) return;

    const newItem: StockItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: newItemName,
      category: newItemCategory,
      provider: newItemProvider || 'Não Informado',
      batch: newItemBatch || 'S/L',
      barcode: '789' + Math.floor(1000000000 + Math.random() * 9000000000),
      qty: parseInt(newItemQty),
      minQty: parseInt(newItemMinQty) || 5,
      maxQty: 50,
      expiryDate: newItemExpiry || '2028-12-31',
      buyPrice: parseFloat(newItemBuyPrice) || 0,
      sellPrice: parseFloat(newItemSellPrice)
    };

    const updated = [...stock, newItem];
    saveStock(updated);
    setIsAddStockOpen(false);

    setNewItemName('');
    setNewItemProvider('');
    setNewItemBatch('');
    setNewItemQty('');
    setNewItemMinQty('');
    setNewItemExpiry('');
    setNewItemBuyPrice('');
    setNewItemSellPrice('');

    addToast('Item de Estoque Adicionado', `O item "${newItemName}" foi cadastrado com sucesso.`, 'success');
  };

  // Cadastra Lançamento Financeiro
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc || !txVal) return;

    const newTransaction: FinancialTransaction = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      description: txDesc,
      type: txType,
      category: txCategory,
      value: parseFloat(txVal),
      paymentMethod: txMethod
    };

    const updated = [newTransaction, ...transactions];
    saveTx(updated);
    setIsAddTxOpen(false);

    setTxDesc('');
    setTxVal('');
    addToast('Transação Registrada', 'O lançamento de fluxo de caixa foi gravado com sucesso.', 'success');
  };

  // Excluir do Estoque
  const handleDeleteStock = (id: string, name: string) => {
    const updated = stock.filter(item => item.id !== id);
    saveStock(updated);
    addToast('Item Excluído', `"${name}" foi removido do inventário.`, 'info');
  };

  // Cálculos Financeiros
  const totalRevenue = transactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.value, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
  const netProfit = totalRevenue - totalExpense;

  // Filtros de Estoque
  const filteredStock = stock.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchStock.toLowerCase()) || 
                          item.provider.toLowerCase().includes(searchStock.toLowerCase()) ||
                          item.barcode.includes(searchStock);
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Alertas de Estoque e Validade
  const checkStockAlert = (item: StockItem) => {
    if (item.qty <= item.minQty) return 'qty_critical';
    const expDate = new Date(item.expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'expiry_expired';
    if (diffDays <= 30) return 'expiry_warning';
    
    return 'ok';
  };

  const getCategoryLabel = (cat: StockItem['category']) => {
    switch (cat) {
      case 'medicine': return 'Medicamento';
      case 'vaccine': return 'Vacina';
      case 'product': return 'Produto Geral';
      case 'shampoo': return 'Shampoo/Estética';
      case 'equipment': return 'Equipamento';
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-xs text-stone-850 dark:text-stone-150 overflow-hidden animate-fade-in">
      
      {/* Sub Menu de Navegação Superior */}
      <div className="flex border-b border-stone-150 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-950/20 px-6 pt-3">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex items-center gap-2 px-5 py-3 font-extrabold text-[10px] uppercase border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'inventory'
              ? 'border-olive-650 text-olive-650 dark:text-olive-400 bg-white dark:bg-stone-900'
              : 'border-transparent text-stone-450 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <Package className="w-4 h-4" />
          Controle de Estoque & Vacinas
        </button>
        <button
          onClick={() => setActiveSubTab('finance')}
          className={`flex items-center gap-2 px-5 py-3 font-extrabold text-[10px] uppercase border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'finance'
              ? 'border-olive-655 text-olive-655 dark:text-olive-400 bg-white dark:bg-stone-900'
              : 'border-transparent text-stone-450 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Fluxo de Caixa & Faturamento
        </button>
      </div>

      <div className="p-6">

        {/* ========================================================
            TABA 1: CONTROLE DE ESTOQUE
           ======================================================== */}
        {activeSubTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Header + Busca + Novo Item */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-150 dark:border-stone-850 pb-5">
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                
                {/* Input de Busca */}
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Buscar por insumo, fornecedor ou código..."
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
                    <option value="all">Todas Categorias</option>
                    <option value="medicine">Medicamentos</option>
                    <option value="vaccine">Vacinas</option>
                    <option value="product">Produtos Gerais</option>
                    <option value="shampoo">Shampoos/Acessórios</option>
                    <option value="equipment">Equipamentos</option>
                  </select>
                </div>

              </div>

              <button
                onClick={() => setIsAddStockOpen(!isAddStockOpen)}
                className="flex items-center justify-center gap-1.5 bg-olive-600 hover:bg-olive-750 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-olive-900/10 transition-all cursor-pointer self-start md:self-center"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Mercadoria</span>
              </button>
            </div>

            {/* Formulário de Novo Item de Estoque */}
            {isAddStockOpen && (
              <form onSubmit={handleAddStockItem} className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 space-y-4 animate-fade-in">
                <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">Cadastrar Insumo / Medicamento</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 font-bold uppercase">Nome do Insumo *</label>
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
                    <label className="block text-[9px] text-stone-550 font-bold uppercase">Categoria</label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value as any)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-850 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 outline-none"
                    >
                      <option value="product">Produto Geral</option>
                      <option value="medicine">Medicamento</option>
                      <option value="vaccine">Vacina</option>
                      <option value="shampoo">Shampoo/Acessório</option>
                      <option value="equipment">Equipamento</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 font-bold uppercase">Fornecedor</label>
                    <input
                      type="text"
                      placeholder="Ex: Zoetis Brasil"
                      value={newItemProvider}
                      onChange={(e) => setNewItemProvider(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 focus:border-olive-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 font-bold uppercase">Nº do Lote</label>
                    <input
                      type="text"
                      placeholder="Ex: L-992200"
                      value={newItemBatch}
                      onChange={(e) => setNewItemBatch(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 focus:border-olive-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 font-bold uppercase">Validade</label>
                    <input
                      type="date"
                      value={newItemExpiry}
                      onChange={(e) => setNewItemExpiry(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 outline-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 font-bold uppercase">Quantidade Inicial *</label>
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
                    <label className="block text-[9px] text-stone-550 font-bold uppercase">Estoque Mínimo (Alerta)</label>
                    <input
                      type="number"
                      placeholder="Ex: 5"
                      value={newItemMinQty}
                      onChange={(e) => setNewItemMinQty(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 border border-stone-250 dark:border-stone-800 focus:border-olive-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 font-bold uppercase">Preço de Compra (Custo R$)</label>
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
                    <label className="block text-[9px] text-stone-550 font-bold uppercase">Preço de Venda (Saída R$) *</label>
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
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-olive-650 hover:bg-olive-750 text-white font-bold px-4 py-2 rounded-xl"
                  >
                    Cadastrar Insumo
                  </button>
                </div>
              </form>
            )}

            {/* Listagem de Estoque */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-150 dark:border-stone-800 text-[10px] text-stone-500 uppercase font-bold bg-stone-50/50 dark:bg-stone-950/20">
                    <th className="py-3 px-3">Código/Insumo</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3">Fornecedor</th>
                    <th className="py-3 px-3">Lote</th>
                    <th className="py-3 px-3">Qtd / Mín</th>
                    <th className="py-3 px-3">Validade</th>
                    <th className="py-3 px-3 text-right">Compra / Venda</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 dark:divide-stone-850 font-medium">
                  {filteredStock.map((item) => {
                    const alertState = checkStockAlert(item);
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-stone-50/30 dark:hover:bg-stone-950/10 ${
                          alertState === 'qty_critical' 
                            ? 'bg-rose-50/20 dark:bg-rose-955/5' 
                            : alertState === 'expiry_expired'
                            ? 'bg-red-50/20 dark:bg-red-955/5'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-stone-800 dark:text-stone-200">{item.name}</div>
                          <div className="text-[9px] font-mono text-stone-400 mt-0.5">{item.barcode}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[9px] bg-stone-100 dark:bg-stone-950 text-stone-550 dark:text-stone-450 border border-stone-200 dark:border-stone-800 px-2 py-0.5 rounded-full font-bold">
                            {getCategoryLabel(item.category)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-stone-500">{item.provider}</td>
                        <td className="py-3 px-3 font-mono">{item.batch}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className={alertState === 'qty_critical' ? 'text-rose-600 dark:text-rose-400 animate-pulse' : ''}>
                              {item.qty}
                            </span>
                            <span className="text-[9px] text-stone-400 font-semibold">/ {item.minQty}</span>
                            {alertState === 'qty_critical' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" title="Estoque abaixo do mínimo!" />}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span className={`font-mono ${
                              alertState === 'expiry_expired' 
                                ? 'text-red-600 dark:text-red-400 line-through' 
                                : alertState === 'expiry_warning'
                                ? 'text-amber-600 dark:text-amber-500'
                                : ''
                            }`}>
                              {item.expiryDate.split('-').reverse().join('/')}
                            </span>
                            {alertState === 'expiry_expired' && <AlertCircle className="w-3.5 h-3.5 text-red-500" title="Item Vencido!" />}
                            {alertState === 'expiry_warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" title="Validade próxima!" />}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="text-[10px] text-stone-400 font-medium">Custo: R$ {item.buyPrice.toFixed(0)}</div>
                          <div className="font-extrabold text-stone-800 dark:text-stone-100">R$ {item.sellPrice.toFixed(0)}</div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteStock(item.id, item.name)}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Remover insumo"
                          >
                            Excluir
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
        {activeSubTab === 'finance' && (
          <div className="space-y-6">
            
            {/* 3 Cards de Resumo Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Receitas */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-650 dark:text-emerald-500 font-bold uppercase tracking-wider block mb-1">Entradas (Receitas)</span>
                  <h4 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight">R$ {totalRevenue.toFixed(2)}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: Despesas */}
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-rose-650 dark:text-rose-500 font-bold uppercase tracking-wider block mb-1">Saídas (Despesas)</span>
                  <h4 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight">R$ {totalExpense.toFixed(2)}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: Resultado Líquido */}
              <div className={`rounded-2xl p-5 flex items-center justify-between border ${
                netProfit >= 0 
                  ? 'bg-olive-500/5 border-olive-500/10 text-olive-650' 
                  : 'bg-rose-500/5 border-rose-500/10 text-rose-650'
              }`}>
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">Lucro Líquido</span>
                  <h4 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight">R$ {netProfit.toFixed(2)}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-olive-500/10 text-olive-650 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* DRE Simplificado + Lançamento Rápido */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* DRE Simplificado */}
              <div className="lg:col-span-2 bg-stone-50/50 dark:bg-stone-950/20 border border-stone-150 dark:border-stone-800 rounded-2xl p-5 space-y-4">
                <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100 pb-2 border-b border-stone-150 dark:border-stone-800">
                  DRE Simplificado (Demonstração do Resultado do Exercício)
                </h4>

                <div className="space-y-2 text-[11px] font-bold">
                  <div className="flex items-center justify-between py-1 border-b border-stone-150/60 dark:border-stone-800/40">
                    <span className="text-stone-600 dark:text-stone-300">Receita Operacional Bruta (Venda de Serviços/Produtos)</span>
                    <span className="text-stone-800 dark:text-stone-100">R$ {totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-150/60 dark:border-stone-800/40 text-rose-600 dark:text-rose-455">
                    <span>(-) Custos Variáveis (Mercadoria/Insumos)</span>
                    <span>- R$ {(totalRevenue * 0.25).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-150/60 dark:border-stone-800/40 text-emerald-600 dark:text-emerald-500">
                    <span>(=) Margem de Contribuição</span>
                    <span>R$ {(totalRevenue * 0.75).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-150/60 dark:border-stone-800/40 text-rose-650 dark:text-rose-455">
                    <span>(-) Despesas Fixas (Aluguel, Equipe, Software)</span>
                    <span>- R$ {totalExpense.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 text-sm font-black border-t border-dashed border-stone-250">
                    <span className="text-stone-800 dark:text-stone-100">(=) Lucro Líquido do Exercício</span>
                    <span className={netProfit >= 0 ? 'text-emerald-605 dark:text-emerald-555' : 'text-rose-600'}>
                      R$ {(totalRevenue * 0.75 - totalExpense).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lançamento Rápido */}
              <div className="lg:col-span-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-5 space-y-4">
                <h4 className="font-extrabold text-sm text-stone-800 dark:text-stone-100">Novo Lançamento</h4>
                <form onSubmit={handleAddTransaction} className="space-y-3.5">
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTxType('revenue')}
                      className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        txType === 'revenue' 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-450' 
                          : 'border-stone-200 dark:border-stone-800 text-stone-500'
                      }`}
                    >
                      Receita
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('expense')}
                      className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        txType === 'expense' 
                          ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-450' 
                          : 'border-stone-200 dark:border-stone-800 text-stone-500'
                      }`}
                    >
                      Despesa
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-stone-550 font-bold uppercase">Descrição *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Consulta Veterinária Mel"
                      value={txDesc}
                      onChange={(e) => setTxDesc(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-950 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800 outline-none text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-[9px] text-stone-550 font-bold uppercase">Valor (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="150.00"
                        value={txVal}
                        onChange={(e) => setTxVal(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-950 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800 outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] text-stone-550 font-bold uppercase">Forma de Pago</label>
                      <select
                        value={txMethod}
                        onChange={(e) => setTxMethod(e.target.value as any)}
                        className="w-full bg-stone-50 dark:bg-stone-950 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800 outline-none text-xs font-semibold"
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
                    className="w-full bg-olive-650 hover:bg-olive-750 text-white font-bold py-2 rounded-xl text-xs cursor-pointer shadow-md shadow-olive-900/10"
                  >
                    Confirmar Lançamento
                  </button>

                </form>
              </div>

            </div>

            {/* Listagem de Transações */}
            <div className="space-y-3 pt-4">
              <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100 pb-2 border-b border-stone-150 dark:border-stone-800">
                Histórico de Lançamentos do Caixa
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-150 dark:border-stone-800 text-[10px] text-stone-500 uppercase font-bold bg-stone-50/50 dark:bg-stone-950/20">
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Descrição</th>
                      <th className="py-2.5 px-3">Categoria</th>
                      <th className="py-2.5 px-3">Forma</th>
                      <th className="py-2.5 px-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 dark:divide-stone-850 font-medium">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-stone-50/30 dark:hover:bg-stone-950/10">
                        <td className="py-3 px-3 text-[10px] text-stone-400 font-mono">{tx.date.split('-').reverse().join('/')}</td>
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-stone-800 dark:text-stone-200">{tx.description}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[9px] bg-stone-100 dark:bg-stone-950 text-stone-500 px-2 py-0.5 rounded-full border dark:border-stone-800">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[9px] font-bold uppercase">{tx.paymentMethod}</span>
                        </td>
                        <td className={`py-3 px-3 text-right font-black ${tx.type === 'revenue' ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-455'}`}>
                          {tx.type === 'revenue' ? '+' : '-'} R$ {tx.value.toFixed(2)}
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
