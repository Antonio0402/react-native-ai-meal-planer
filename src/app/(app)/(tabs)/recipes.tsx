import { router } from "expo-router";
import ScreenScroll from "../../../components/ScreenScroll";
import { useAppDataContext } from "../../../providers/AppDataProvider";
import RecipesTab from "../../../screens/RecipesTab";

export default function Recipes() {
  const { data, setData } = useAppDataContext();

  return (
    <ScreenScroll>
      <RecipesTab
        data={data}
        setData={setData}
        onScan={() => router.push("/scan")}
        onGoInventory={() => router.navigate("/inventory")}
        onGoWeek={() => router.navigate("/week")}
      />
    </ScreenScroll>
  );
}
