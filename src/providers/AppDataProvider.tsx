import React, { createContext, useContext, useRef } from "react";
import { useAppData } from "../state";
import type { Ingredient } from "../types";

type AppDataContextValue = ReturnType<typeof useAppData> & {
  addToInventory: (items: Ingredient[], scanId: string) => boolean;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const appData = useAppData(userId);
  const applied = useRef(new Set<string>());

  const addToInventory = (items: Ingredient[], scanId: string) => {
    if (applied.current.has(scanId)) return false;
    applied.current.add(scanId);
    appData.setData((data) => {
      const inventory = [...data.inventory];
      for (const item of items) {
        const index = inventory.findIndex(
          (current) => current.name.trim().toLowerCase() === item.name.toLowerCase() && current.unit === item.unit
        );
        if (index >= 0) {
          inventory[index] = {
            ...inventory[index],
            quantity: (inventory[index].quantity ?? 0) + (item.quantity ?? 0),
            expiry: item.expiry ?? inventory[index].expiry,
          };
        } else {
          inventory.push(item);
        }
      }
      return { ...data, inventory };
    });
    return true;
  };

  return (
    <AppDataContext.Provider value={{ ...appData, addToInventory }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppDataContext() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("AppDataProvider chưa được khởi tạo.");
  return context;
}
