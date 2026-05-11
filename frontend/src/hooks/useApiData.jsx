import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import {
  getDashboardSummary, getTasks, getOrders, getProducts, getShipments,
} from '../api/client.js';

const DataContext = createContext(null);

const EMPTY = { summary: null, tasks: [], orders: [], products: [], shipments: [], loading: true };

export function DataProvider({ children }) {
  const [data, setData] = useState(EMPTY);
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    const [summary, tasks, orders, products, shipments] = await Promise.all([
      getDashboardSummary(),
      getTasks(),
      getOrders(),
      getProducts(),
      getShipments(),
    ]);
    setData({
      summary: summary || null,
      tasks: tasks || [],
      orders: orders || [],
      products: products || [],
      shipments: shipments || [],
      loading: false,
    });
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 120000);
    return () => clearInterval(timerRef.current);
  }, [load]);

  return (
    <DataContext.Provider value={{ ...data, refresh: load }}>
      {children}
    </DataContext.Provider>
  );
}

export function useApiData() {
  return useContext(DataContext);
}
