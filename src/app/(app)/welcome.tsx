import React, { useState } from "react";
import { router } from "expo-router";
import ScreenScroll from "../../components/ScreenScroll";
import { useAppDataContext } from "../../providers/AppDataProvider";
import ScanFlow from "../../screens/ScanFlow";

export default function Welcome() {
  const { data, addToInventory } = useAppDataContext();
  const [landingKey, setLandingKey] = useState(0);

  return (
    <ScreenScroll>
      <ScanFlow
        key={landingKey}
        landing
        onConfirm={(items, scanId) => {
          if (addToInventory(items, scanId)) router.replace("/recipes");
        }}
        onCancel={() => setLandingKey((key) => key + 1)}
        onSkip={
          data.inventory.length > 0
            ? () => router.replace("/inventory")
            : undefined
        }
      />
    </ScreenScroll>
  );
}
