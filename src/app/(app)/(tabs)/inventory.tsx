import { router } from "expo-router";
import ScreenScroll from "../../../components/ScreenScroll";
import { useAppDataContext } from "../../../providers/AppDataProvider";
import InventoryTab from "../../../screens/InventoryTab";

export default function Inventory() {
  const { data, setData } = useAppDataContext();

  return (
    <ScreenScroll>
      <InventoryTab data={data} setData={setData} onScan={() => router.push("/scan")} />
    </ScreenScroll>
  );
}
