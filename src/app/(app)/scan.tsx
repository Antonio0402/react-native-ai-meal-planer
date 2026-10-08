import { router } from "expo-router";
import ScreenScroll from "../../components/ScreenScroll";
import { useAppDataContext } from "../../providers/AppDataProvider";
import ScanFlow from "../../screens/ScanFlow";

export default function Scan() {
  const { addToInventory } = useAppDataContext();

  return (
    <ScreenScroll>
      <ScanFlow
        onConfirm={(items, scanId) => {
          if (addToInventory(items, scanId)) router.replace("/inventory");
        }}
        onCancel={() => router.replace("/inventory")}
      />
    </ScreenScroll>
  );
}
